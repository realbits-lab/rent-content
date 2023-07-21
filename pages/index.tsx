import React from "react";
import dynamic from "next/dynamic";
import { configureChains, WagmiConfig, createConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { polygon, polygonMumbai, localhost } from "wagmi/chains";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
const RentContent = dynamic(() => import("../components/RentContent"), {
  ssr: false,
});
import { getChainName } from "@/components/RentContentUtil";

function App() {
  const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || "";
  const WALLET_CONNECT_PROJECT_ID =
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const LOCAL_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_LOCAL_NFT_CONTRACT_ADDRESS;
  const BLOCKCHAIN_NETWORK = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;
  const SERVICE_OWNER_ADDRESS = process.env.NEXT_PUBLIC_SERVICE_OWNER_ADDRESS;

  // console.log(
  //   "process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS: ",
  //   process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS
  // );
  // console.log(
  //   "process.env.NEXT_PUBLIC_LOCAL_NFT_CONTRACT_ADDRESS: ",
  //   process.env.NEXT_PUBLIC_LOCAL_NFT_CONTRACT_ADDRESS
  // );
  // console.log(
  //   "process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK: ",
  //   process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK
  // );
  // console.log(
  //   "process.env.NEXT_PUBLIC_SERVICE_OWNER_ADDRESS: ",
  //   process.env.NEXT_PUBLIC_SERVICE_OWNER_ADDRESS
  // );

  let wagmiBlockchainNetworks = [];
  if (
    getChainName({ chainId: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK }) ===
    "matic"
  ) {
    wagmiBlockchainNetworks = [polygon];
  } else if (
    getChainName({ chainId: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK }) ===
    "maticmum"
  ) {
    wagmiBlockchainNetworks = [polygonMumbai];
  } else if (
    getChainName({ chainId: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK }) ===
    "localhost"
  ) {
    wagmiBlockchainNetworks = [localhost];
  } else {
    wagmiBlockchainNetworks = [];
  }
  // console.log("wagmiBlockchainNetworks: ", wagmiBlockchainNetworks);

  //* Set wagmi config.
  const {
    chains: wagmiChains,
    publicClient: wagmiPublicClient,
    webSocketPublicClient: wagmiWebSocketPublicClient,
  } = configureChains(wagmiBlockchainNetworks, [
    // w3mProvider({
    //   projectId: WALLET_CONNECT_PROJECT_ID,
    // }),
    alchemyProvider({ apiKey: ALCHEMY_API_KEY }),
  ]);
  // console.log("wagmiChains: ", wagmiChains);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [
      // ...w3mConnectors({
      //   projectId: WALLET_CONNECT_PROJECT_ID,
      //   chains: wagmiBlockchainNetworks,
      // }),
      new MetaMaskConnector({ chains: wagmiBlockchainNetworks }),
    ],
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
