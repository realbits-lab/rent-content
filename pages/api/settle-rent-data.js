import { PrismaClient } from "@prisma/client";
import rentmarketABI from "../contracts/rentMarket.json";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // console.log("call /api/settle-rent-data");

  const API_KEY = process.env.API_KEY;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  //* Get alchemy provider.
  const alchemyProvider = new ethers.providers.AlchemyProvider(
    (network = "goerli"),
    API_KEY
  );

  //* Get signer.
  const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

  //* Get rent market contract instance.
  const rentMarketContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    rentmarketABI.abi,
    signer
  );

  //* Check method.
  if (req.method !== "POST") {
    // console.log("req.method: ", req.method);
    res.status(500).json({ error: "Invalid method. Support only POST." });
    return;
  }

  //* Check auth key.
  const { auth_key } = req.body;

	//* Check 1 hour passed since the last check with database.

  //* Get all rent data.
  // struct rentData {
  //     address nftAddress;
  //     uint256 tokenId;
  //     uint256 rentFee;
  //     address feeTokenAddress;
  //     uint256 rentFeeByToken;
  //     bool isRentByToken;
  //     uint256 rentDuration;
  //     address renterAddress;
  //     address renteeAddress;
  //     address serviceAddress;
  //     uint256 rentStartTimestamp;
  // }
  const resultRentArray = await rentMarketContract.getAllRentData();

  //* If we found one of which rent duration is finished, settle that.
  const promises = resultRentArray.map(async function (element) {
    const currentSeconds = new Date().getTime() / 1000;
    if (element.rentStartTimestamp + element.rentDuration > currentSeconds) {
      //* Call settleRentData function.
      const tx = await rentMarketContract.settleRentData(
        element.nftAdderss,
        element.tokenId
      );
      await tx.wait();
    }
  });
  await Promise.all(promises);

  //* Send ok.
  res.status(200).json({ data: "ok" });
}
