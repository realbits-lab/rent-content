import React, { Suspense } from "react";
import { RecoilRoot } from "recoil";
import RentContent from "../components/RentContent";

// TODO: Apply debug package for log.
function App() {
  let RENT_MARKET_ADDRESS;
  let TEST_NFT_ADDRESS;
  let BLOCKCHAIN_NETWORK;
  let SERVICE_ADDRESS;
  // service url : https://realbits-snapshot.s3.ap-northeast-2.amazonaws.com/realbits-snapshot.json

  // Sample collection data.
  // collectionAddress: 0xE5C46238c2Cf9CD7A36a51274f04958A59daB161
  // collectionUri: https://js-nft.s3.ap-northeast-2.amazonaws.com/collection.json

  // console.log("App process.env.NEXT_PUBLIC_NETWORK: ", process.env.NEXT_PUBLIC_NETWORK);
  // TODO: Apply all variables from .env file.
  switch (process.env.NEXT_PUBLIC_NETWORK) {
    case "localhost":
    default:
      RENT_MARKET_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
      TEST_NFT_ADDRESS = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
      SERVICE_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      BLOCKCHAIN_NETWORK = "0x539";
      break;

    case "matic":
      RENT_MARKET_ADDRESS = "0x90f20cB6A0665B12c4f2B62796Ff183bF192F55c";
      TEST_NFT_ADDRESS = "0x82087ff39e079c44b98c3abd053f734b351d5b20";
      SERVICE_ADDRESS = "0x3851dacd8fA9F3eB64D69151A3597F33E5960A2F";
      BLOCKCHAIN_NETWORK = "0x137";
      break;

    case "maticmum":
      RENT_MARKET_ADDRESS = "0x1b5054C7931b18Ec8E0d5e5F5D0cBD845F3485b8";
      TEST_NFT_ADDRESS = "0x82087ff39e079c44b98c3abd053f734b351d5b20";
      SERVICE_ADDRESS = "0x3851dacd8fA9F3eB64D69151A3597F33E5960A2F";
      BLOCKCHAIN_NETWORK = "0x13881";
      break;
  }

  return (
    <>
      <RentContent
        rentMarketAddress={RENT_MARKET_ADDRESS}
        testNftAddress={TEST_NFT_ADDRESS}
        blockchainNetwork={BLOCKCHAIN_NETWORK}
        serviceAddress={SERVICE_ADDRESS}
      />
    </>
  );
}

export default App;
