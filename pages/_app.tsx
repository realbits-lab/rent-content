import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material";
import { CacheProvider, EmotionCache } from "@emotion/react";
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

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RecoilRoot>
          <Component {...pageProps} />
        </RecoilRoot>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default MyApp;
