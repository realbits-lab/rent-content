import { Network, Alchemy } from "alchemy-sdk";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import rentmarketABI from "@/contracts/rentMarket.json";

export default async function handler(req, res) {
  // console.log("call /api/settle-rent-data");

  const NEXT_PUBLIC_SETTLE_AUTH_KEY = process.env.NEXT_PUBLIC_SETTLE_AUTH_KEY;
  const NEXT_PUBLIC_ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
  const NEXT_PUBLIC_BLOCKCHAIN_NETWORK =
    process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;
  const NEXT_PUBLIC_SETTLE_PRIVATE_KEY =
    process.env.NEXT_PUBLIC_SETTLE_PRIVATE_KEY;
  const NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;

  //* Get alchemy provider.
  const alchemyProvider = new ethers.providers.AlchemyProvider(
    NEXT_PUBLIC_BLOCKCHAIN_NETWORK,
    NEXT_PUBLIC_ALCHEMY_KEY
  );

  //* Get signer.
  const signer = new ethers.Wallet(
    NEXT_PUBLIC_SETTLE_PRIVATE_KEY,
    alchemyProvider
  );

  //* Get rent market contract instance.
  const rentMarketContract = new ethers.Contract(
    NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS,
    rentmarketABI.abi,
    signer
  );
  console.log("rentMarketContract: ", rentMarketContract);

  //* Get alchemy instance.
  const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
    network:
      process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK === "maticmum"
        ? Network.MATIC_MUMBAI
        : Network.MATIC_MAINNET,
  };
  const alchemy = new Alchemy(settings);

  //* Check method.
  if (req.method !== "POST") {
    // console.log("req.method: ", req.method);
    res.status(500).json({ error: "Invalid method. Support only POST." });
    return;
  }

  //* Check auth key.
  const { auth_key } = req.body;
  console.log("auth_key: ", auth_key);
  if (auth_key !== NEXT_PUBLIC_SETTLE_AUTH_KEY) {
    res.status(500).json({ error: "Invalid auth key." });
    return;
  }

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
  const rentDataArray = await rentMarketContract.getAllRentData();
  console.log("rentDataArray: ", rentDataArray);

  //* TODO: Handle error: replacement fee too low.
  //* TODO: Handle gas prices.
  //* If we found rent-finished one, settle that.
  const promises = rentDataArray.map(async function (rentData) {
    console.log("rentData: ", rentData);

		//* Get current time.
    const currentSeconds = new Date().getTime() / 1000;
    console.log("currentSeconds: ", currentSeconds);

		//* Get rent finish time.
    const rentEndSeconds = rentData.rentStartTimestamp
      .add(rentData.rentDuration)
      .toNumber();
    console.log("rentEndSeconds: ", rentEndSeconds);

    if (currentSeconds > rentEndSeconds) {
      console.log("try to call settleRentData()");

      //* Call settleRentData function.
      const tx = await rentMarketContract.settleRentData(
        rentData.nftAddress,
        rentData.tokenId
      );
      console.log("tx: ", tx);
      const receipt = await tx.wait();
      console.log("receipt: ", receipt);
    }
  });
  // console.log("try to call Promise.all()");

  await Promise.all(promises);
  // console.log("finish to call Promise.all()");

  //* Send 200 status.
  res.status(200).json({ data: "ok" });
}
