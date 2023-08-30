import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { configureChains, WagmiConfig, createConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { polygon, polygonMumbai, localhost } from "wagmi/chains";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import "@/styles/globals.css";
import "@/styles/globals.css";
import { theme } from "@/utils/theme";
import createEmotionCache from "@/utils/createEmotionCache";

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

// Add emotion cache.
const clientSideEmotionCache = createEmotionCache();

// Add more properties.
const MyApp: React.FunctionComponent<MyAppProps> = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || "";
  const BLOCKCHAIN_NETWORK = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;

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
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <WagmiConfig config={wagmiConfig}>
          <RecoilRoot>
            <Component {...pageProps} />
          </RecoilRoot>
        </WagmiConfig>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default MyApp;
