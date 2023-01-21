import React from "react";
import { Link, Portal, Snackbar, Alert as MuiAlert } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
// https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
export const humanFileSize = (bytes, si = false, dp = 1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
};

//----------------------------------------------------------------------------
// Switch to localhost network.
//----------------------------------------------------------------------------
export const switchNetworkLocalhost = async (provider) => {
  console.log("call switchNetworkLocalhost()");

  let response;
  // TODO: Why localhost can't be changed in metamask?
  try {
    response = await provider.request({
      method: "wallet_switchEthereumChain",
      // 1337 decimal.
      params: [{ chainId: "0x539" }],
    });
    console.log("response: ", response);

    if (response === null) {
      // Switch chain success.
      console.log("wallet_switchEthereumChain success");
      return null;
    } else {
      return response;
    }
  } catch (switchError) {
    // Switch chain fail.
    console.log("wallet_switchEthereumChain fail");
    console.log("wallet_switchEthereumChain response: ", response);
    console.log("wallet_switchEthereumChain switchError: ", switchError);

    // https://github.com/MetaMask/metamask-mobile/issues/2944
    if (switchError.code === 4902 || switchError.code === -32603) {
      console.log("Try to wallet_addEthereumChain");

      try {
        response = await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x539",
              chainName: "localhost",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });

        if (response === null) {
          // Add chain success.
          console.log("wallet_addEthereumChain success");
          return null;
        } else {
          // Add chain fail.
          console.log("wallet_addEthereumChain fail");
          console.log("wallet_addEthereumChain response: ", response);
          return response;
        }
      } catch (addError) {
        throw addError;
      }
    }

    throw switchError;
  }
};

//----------------------------------------------------------------------------
// Switch to mumbai network.
//----------------------------------------------------------------------------
export const switchNetworkMumbai = async (provider) => {
  console.log("switchNetworkMumbai");
  console.log("Try to wallet_switchEthereumChain");

  let response;
  try {
    response = await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13881" }],
    });
    if (response === null) {
      // Switch chain success.
      console.log("wallet_switchEthereumChain success");
      return null;
    } else {
      return response;
    }
  } catch (switchError) {
    // Switch chain fail.
    console.log("wallet_switchEthereumChain fail.");
    console.log("wallet_switchEthereumChain response: ", switchError);

    if (switchError.code === 4902 || switchError.code === -32603) {
      console.log("Try to wallet_addEthereumChain");

      try {
        response = await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x13881",
              chainName: "Mumbai",
              rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
              nativeCurrency: {
                // https://etherscan.io/token/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0#readContract
                name: "Matic Token",
                symbol: "MATIC",
                decimals: 18,
              },
              blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com"],
            },
          ],
        });

        if (response === null) {
          // Add chain success.
          console.log("wallet_addEthereumChain success");
          return null;
        } else {
          // Add chain fail.
          console.log("wallet_addEthereumChain fail");
          console.log("wallet_addEthereumChain response: ", response);
          return response;
        }
      } catch (addError) {
        throw addError;
      }
    }

    throw switchError;
  }
};

//----------------------------------------------------------------------------
// Change ipfs url to gateway url.
//----------------------------------------------------------------------------
export const changeIPFSToGateway = (ipfsUrl) => {
  if (
    typeof ipfsUrl === "string" &&
    ipfsUrl.length > 6 &&
    ipfsUrl.substring(0, 7) === "ipfs://"
  ) {
    const cidUrl = ipfsUrl.substring(7, ipfsUrl.length);
    // const gatewayUrl = "https://gateway.pinata.cloud/ipfs/" + cidUrl;
    const gatewayUrl = "https://nftstorage.link/ipfs/" + cidUrl;
    // console.log("gatewayUrl: ", gatewayUrl);

    return gatewayUrl;
  } else {
    return ipfsUrl;
  }
};

export const checkMobile = () => {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor);
  return check;
};

export const shortenAddress = (address, number = 4, withLink = true) => {
  const POLYGON_SCAN_URL = "https://mumbai.polygonscan.com/address/";
  const polygonScanUrl = `${POLYGON_SCAN_URL}${address}`;
  let stringLength = 0;
  let middleString = "";

  // Check number maximum.
  if (number > 19 || number < 1) {
    stringLength = 20;
    middleString = "";
  } else {
    stringLength = number;
    middleString = "...";
  }

  if (
    (typeof address === "string" || address instanceof String) &&
    address.length > 0
  ) {
    if (withLink === true) {
      return (
        <Link href={polygonScanUrl} target="_blank">
          {`${address.substring(
            0,
            number + 2
          )}${middleString}${address.substring(address.length - number)}`}
        </Link>
      );
    } else {
      return `${address.substring(
        0,
        number + 2
      )}${middleString}${address.substring(address.length - number)}`;
    }
  } else {
    return "";
  }
};

export const ConnectStatus = {
  connect: "connect",
  loading: "loading",
  disconnect: "disconnect",
};

export const MyMenu = {
  own: "own",
  rent: "rent",
};

export const RBSize = {
  small: 24,
  middle: 40,
  big: 56,
  double: 112,
  triple: 168,
};

export const AlertSeverity = {
  error: "error",
  warning: "warning",
  info: "info",
  success: "success",
};

export const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// TODO: Stack the queue message.
// RealBits Snackbar message component.
export function RBSnackbar({ open, message, severity, currentTime }) {
  const [openToast, setOpenToast] = React.useState(false);
  const handleToastClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenToast(false);
  };

  React.useEffect(() => {
    // console.log("useEffect open: ", open);
    // console.log("useEffect message: ", message);
    // console.log("useEffect severity: ", severity);
    // console.log("useEffect currentTime: ", currentTime);
    if (
      (typeof message === "string" || message instanceof String) &&
      message.length > 0
    ) {
      setOpenToast(open);
    }
  }, [currentTime]);

  return (
    <Portal>
      <Snackbar
        open={openToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        autoHideDuration={5000}
        onClose={handleToastClose}
      >
        <Alert
          onClose={handleToastClose}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Portal>
  );
}

export const getUniqueKey = () => {
  // return Math.random().toString(16).slice(2);
  return uuidv4();
};

export const getErrorDescription = ({ errorString }) => {
  const errorCode = {
    RM1: "The same element is already request.",
    RM2: "The same element is already register.",
    RM3: "No element in register.",
    RM4: "Sender is not the owner of NFT.",
    RM5: "Sender is not the owner of NFT or the owner of rentMarket.",
    RM6: "No register for this service address.",
    RM7: "No register eata for this NFT.",
    RM8: "Transaction value is not same as the rent fee.",
    RM9: "Already rented.",
    RM10: "No rent data in renteeDataMap for this NFT.",
    RM11: "msg.sender should be same as renteeAddress.",
    RM12: "Sum should be 100.",
    RM13: "msg.sender should be zero, because of erc20 payment.",
    RM14: "Failed to recipient.call.",
    RM15: "msg.sender should be same as renteeAddress or the owner of rentMarket.",
    RM16: "The current block number is under rent start + rent duraiont block.",
    RM17: "Sender is not the recipient or the owner of rentMarket.",
    RM18: "IERC20 approve function call failed.",
    RM19: "IERC20 transferFrom function call failed.",
    RM20: "Fee token address is not registered.",
  };

  return errorCode[errorString];
};

export const getChainName = ({ chainId }) => {
  // https://github.com/DefiLlama/chainlist/blob/main/constants/chainIds.js
  const chainIds = {
    0: "kardia",
    1: "ethereum",
    5: "goerli",
    6: "kotti",
    8: "ubiq",
    10: "optimism",
    19: "songbird",
    20: "elastos",
    25: "cronos",
    30: "rsk",
    40: "telos",
    50: "xdc",
    52: "csc",
    55: "zyx",
    56: "binance",
    57: "syscoin",
    60: "gochain",
    61: "ethereumclassic",
    66: "okexchain",
    70: "hoo",
    82: "meter",
    87: "nova network",
    88: "tomochain",
    100: "xdai",
    106: "velas",
    108: "thundercore",
    122: "fuse",
    128: "heco",
    137: "matic",
    200: "xdaiarb",
    246: "energyweb",
    250: "fantom",
    269: "hpb",
    288: "boba",
    321: "kucoin",
    336: "shiden",
    361: "theta",
    416: "sx",
    534: "candle",
    592: "astar",
    820: "callisto",
    888: "wanchain",
    1088: "metis",
    1231: "ultron",
    1284: "moonbeam",
    1285: "moonriver",
    1337: "localhost",
    2000: "dogechain",
    2020: "ronin",
    2222: "kava",
    4689: "iotex",
    5050: "xlc",
    5551: "nahmii",
    6969: "tombchain",
    8217: "klaytn",
    9001: "evmos",
    10000: "smartbch",
    31337: "localhost",
    32659: "fusion",
    42161: "arbitrum",
    42170: "arb-nova",
    42220: "celo",
    42262: "oasis",
    43114: "avalanche",
    47805: "rei",
    55555: "reichain",
    71402: "godwoken",
    80001: "maticmum",
    333999: "polis",
    888888: "vision",
    1313161554: "aurora",
    1666600000: "harmony",
    11297108109: "palm",
    836542336838601: "curio",
  };

  // console.log("chainId: ", chainId);
  if (typeof chainId === "string" || chainId instanceof String) {
    if (chainId.startsWith("0x") === true) {
      return chainIds[Number(chainId)];
    } else {
      return chainId;
    }
  } else if (isInt(chainId) === true) {
    return chainIds[chainId];
  }
};

// https://levelup.gitconnected.com/how-to-check-for-an-object-in-javascript-object-null-check-3b2632330296
export const isObject = (value) => typeof value === "object" && value !== null;

export const writeToastMessageState = atom({
  key: "writeToastMessageState",
  snackbarSeverity: AlertSeverity.info,
  snackbarMessage: "",
  // snackbarTime: new Date(),
  snackbarTime: "time",
  snackbarOpen: true,
});

export const readToastMessageState = selector({
  key: "readToastMessageState",
  get: ({ get }) => {
    const toastMessageState = get(writeToastMessageState);
    return toastMessageState;
  },
});

export const LOCAL_CHAIN_ID = "0x539";
