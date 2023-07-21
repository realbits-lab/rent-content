import React from "react";
import dynamic from "next/dynamic";
import { configureChains, WagmiConfig, createConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { polygon, polygonMumbai, localhost } from "wagmi/chains";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
const RentContent = dynamic(() => import("../components/RentContent"), {
  ssr: false,
});

function App() {
  const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || "";
  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const LOCAL_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_LOCAL_NFT_CONTRACT_ADDRESS;
  const BLOCKCHAIN_NETWORK = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;
  const SERVICE_OWNER_ADDRESS = process.env.NEXT_PUBLIC_SERVICE_OWNER_ADDRESS;

  let chains = [];
  switch (BLOCKCHAIN_NETWORK) {
    case "localhost":
      chains = [localhost];
      break;

    case "matic":
      chains = [polygon];
      break;

    case "maticmum":
      chains = [polygonMumbai];
      break;

    default:
      chains = [];
      break;
  }
  // console.log("wagmiBlockchainNetworks: ", wagmiBlockchainNetworks);

  //* Set wagmi config.
  const {
    publicClient: wagmiPublicClient,
    webSocketPublicClient: wagmiWebSocketPublicClient,
  } = configureChains(chains, [
    alchemyProvider({ apiKey: ALCHEMY_API_KEY }),
    publicProvider(),
  ]);
  // console.log("wagmiChains: ", wagmiChains);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [new MetaMaskConnector({ chains })],
    publicClient: wagmiPublicClient,
    webSocketPublicClient: wagmiWebSocketPublicClient,
  });
  // console.log("wagmiConfig: ", wagmiConfig);

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <RentContent
          rentMarketAddress={RENT_MARKET_CONTRACT_ADDRESS}
          testNftAddress={LOCAL_NFT_CONTRACT_ADDRESS}
          blockchainNetwork={BLOCKCHAIN_NETWORK}
          serviceAddress={SERVICE_OWNER_ADDRESS}
        />
      </WagmiConfig>
    </>
  );
}

export default App;
