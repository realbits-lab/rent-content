import { Network, Alchemy } from "alchemy-sdk";
import { ethers } from "ethers";
import rentmarketABI from "@/contracts/rentMarket.json";

export default async function handler(req, res) {
  // console.log("call /api/change-payment-nft-rent-price");

  const NEXT_PUBLIC_SETTLE_AUTH_KEY = process.env.NEXT_PUBLIC_SETTLE_AUTH_KEY;
  const NEXT_PUBLIC_ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
  const NEXT_PUBLIC_BLOCKCHAIN_NETWORK =
    process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;
  const NEXT_PUBLIC_SETTLE_PRIVATE_KEY =
    process.env.NEXT_PUBLIC_SETTLE_PRIVATE_KEY;
  const NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const PAYMENT_NFT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_NFT_ADDRESS;
  const PAYMENT_NFT_TOKEN = process.env.NEXT_PUBLIC_PAYMENT_NFT_TOKEN;
  const COIN_MARKET_CAP_API_KEY =
    process.env.NEXT_PUBLIC_COIN_MARKET_CAP_API_KEY;
  const COIN_MARKET_CAP_PRICE_CONVERSION_API_URL =
    "https://pro-api.coinmarketcap.com/v2/tools/price-conversion";
  const USD_ID = 2781;
  const USD_AMOUNT = 0.01;
  const MATIC_SYMBOL = "MATIC";

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

  //* Get MATIC converted price of 1 USD from coin market cap.
  // curl -H "X-CMC_PRO_API_KEY: c8fdab07-18b2-4c2b-8a4c-a7acd1f360af" -H "Accept: application/json" -d
  // "id=2781&amount=1&convert=MATIC" -G https://pro-api.coinmarketcap.com/v2/tools/price-conversion
  let response;
  try {
    response = await fetch(
      `${COIN_MARKET_CAP_PRICE_CONVERSION_API_URL}?id=${USD_ID}&amount=${USD_AMOUNT}&convert=${MATIC_SYMBOL}`,
      {
        method: "GET",
        headers: {
          "X-CMC_PRO_API_KEY": COIN_MARKET_CAP_API_KEY,
          Accept: "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
  const responseJson = await response.json();
  console.log("responseJson: ", responseJson);

  const maticPricePerUSD = responseJson.data.quote.MATIC.price;
  console.log("maticPricePerUSD: ", maticPricePerUSD);

  if (maticPricePerUSD) {
    //* Change NFT price.
    const registerData = await rentMarketContract.getRegisterData(
      PAYMENT_NFT_ADDRESS,
      PAYMENT_NFT_TOKEN
    );
    console.log("registerData: ", registerData);

    //* Change NFT price.
    // address nftAddress
    // uint256 tokenId
    // uint256 rentFee
    // address feeTokenAddress
    // uint256 rentFeeByToken
    // uint256 rentDuration
    const tx = await rentMarketContract.changeNFT(
      PAYMENT_NFT_ADDRESS,
      PAYMENT_NFT_TOKEN,
      ethers.utils.parseUnits(maticPricePerUSD.toFixed(2), 18),
      registerData.feeTokenAddress,
      registerData.rentFeeByToken,
      registerData.rentDuration
    );
    console.log("tx: ", tx);
    const receipt = await tx.wait();
    console.log("receipt: ", receipt);
  } else {
    return res
      .status(500)
      .json({ error: "Can't get matic price from coin market cap." });
  }

  //* Send 200 status.
  return res.status(200).json({ data: responseJson.data });
}
