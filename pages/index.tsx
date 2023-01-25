import React from "react";
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygon, polygonMumbai } from "wagmi/chains";
import RentContent from "../components/RentContent";

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

  const chains = [polygon, polygonMumbai];

  // * Wagmi client
  const { provider } = configureChains(chains, [
    walletConnectProvider({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    }),
  ]);
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: modalConnectors({ appName: "web3Modal", chains }),
    provider,
  });

  // * Web3Modal Ethereum Client
  const ethereumClient = new EthereumClient(wagmiClient, chains);

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
        projectId="<YOUR_PROJECT_ID>"
        ethereumClient={ethereumClient}
      />
    </>
  );
}

export default App;
