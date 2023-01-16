import React from "react";
import RentContent from "../components/RentContent";

function App() {
  return (
    <>
      <RentContent
        rentMarketAddress={process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS}
        testNftAddress={process.env.NEXT_PUBLIC_TEST_NFT_CONTRACT_ADDRESS}
        blockchainNetwork={process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}
        serviceAddress={process.env.NEXT_PUBLIC_SERVICE_OWNER_ADDRESS}
      />
    </>
  );
}

export default App;
