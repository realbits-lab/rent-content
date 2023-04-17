import React from "react";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygon, polygonMumbai, localhost } from "wagmi/chains";
import RentContent from "../components/RentContent";
import { getChainName } from "../components/RentContentUtil";

function App() {
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

  //* Wagmi client
  //* Use wallet connect configuration.
  const { chains, provider, webSocketProvider } = configureChains(
    wagmiBlockchainNetworks,
    [
      w3mProvider({
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "",
      }),
    ]
  );
  //* Use alchemy configuration.
  // const { chains, provider, webSocketProvider } = configureChains(
  //   wagmiBlockchainNetworks,
  //   [
  //     alchemyProvider({
  //       apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY ?? "",
  //     }),
  //   ]
  // );
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: w3mConnectors({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "",
      version: 2,
      chains: wagmiBlockchainNetworks,
    }),
    provider,
    webSocketProvider,
  });

  // * Web3Modal Ethereum Client
  const ethereumClient = new EthereumClient(
    wagmiClient,
    wagmiBlockchainNetworks
  );

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <RentContent
          rentMarketAddress={
            process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS
          }
          testNftAddress={process.env.NEXT_PUBLIC_LOCAL_NFT_CONTRACT_ADDRESS}
          blockchainNetwork={process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}
          serviceAddress={process.env.NEXT_PUBLIC_SERVICE_OWNER_ADDRESS}
        />
      </WagmiConfig>

      <Web3Modal
        projectId={process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID}
        ethereumClient={ethereumClient}
      />
    </>
  );
}

export default App;
