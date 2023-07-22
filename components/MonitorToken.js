import React from "react";
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";
import { ethers } from "ethers";
import { Network, Alchemy } from "alchemy-sdk";
import keccak256 from "keccak256";
import { Buffer } from "buffer";
import moment from "moment";
import {
  Divider,
  Chip,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useRecoilStateLoadable } from "recoil";
import {
  shortenAddress,
  AlertSeverity,
  writeToastMessageState,
  getChainName,
} from "@/components/RentContentUtil";
import rentmarketABI from "@/contracts/rentMarket.json";

export default function MonitorToken() {
  const [tokenEventArray, setTokenEventArray] = React.useState([]);

  //*---------------------------------------------------------------------------
  //* Define alchemy configuration.
  //*---------------------------------------------------------------------------
  const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
    network: Network.MATIC_MUMBAI,
  };
  const alchemy = new Alchemy(settings);

  //*---------------------------------------------------------------------------
  //* Handle toast message.
  //*---------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);
  const writeToastMessage = React.useMemo(() => {
    return writeToastMessageLoadable?.state === "hasValue"
      ? writeToastMessageLoadable.contents
      : {
          snackbarSeverity: AlertSeverity.info,
          snackbarMessage: "",
          snackbarTime: new Date(),
          snackbarOpen: true,
        };
  });

  //*---------------------------------------------------------------------------
  //* Wagmi hook functions.
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;

  const {
    data: dataAllToken,
    isError: isErrorAllToken,
    isLoading: isLoadingAllToken,
    status: statusAllToken,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI.abi,
    functionName: "getAllToken",
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
    },
    onError(error) {
      // console.log("call onError()");
      // console.log("error: ", error);
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
    },
  });
  // console.log("dataAllToken: ", dataAllToken);

  React.useEffect(() => {
    // console.log("call useEffect()");

    const eventHash = keccak256("RegisterToken(address,name)");
    const topicHash = `0x${Buffer.from(eventHash).toString("hex")}`;
    alchemy.core
      .getLogs({
        fromBlock: 27956165,
        toBlock: "latest",
        address: RENT_MARKET_CONTRACT_ADDRESS,
        topics: [topicHash],
      })
      .then((response) => {
        // console.log("response: ", response);
        const eventArray = response.map((event) => {
          // console.log("event: ", event);
          // data has 514 bytes with "0x"
          const startIndex = 2;
          const endIndex = 66;

          const tokenAddress = `0x${event.topics[1].slice(
            startIndex + 24,
            endIndex
          )}`;

          const name = event.data.slice(startIndex, endIndex);
          // console.log("tokenAddress: ", tokenAddress);
          // console.log("name: ", name);

          return {
            key: `${event.blockNumber}${tokenAddress}`,
            tokenAddress,
            name,
          };
        });

        setTokenEventArray(eventArray);
      });
  }, []);

  return (
    <div>
      {/*//*-----------------------------------------------------------------*/}
      {/*//* Token                                                           */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ marginTop: "20px", marginBottom: "20px" }}>
        <Chip label="Token List" />
      </Divider>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataAllToken?.map((token, idx) => {
              console.log("token: ", token);
              return (
                <TableRow
                  key={idx}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center">{token.name}</TableCell>
                  <TableCell align="center">
                    {shortenAddress({
                      address: token.tokenAddress,
                      withLink: "scan",
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Event                                                           */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ marginTop: "20px", marginBottom: "20px" }}>
        <Chip label="Token Event" />
      </Divider>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Token Address</TableCell>
              <TableCell align="center">Token Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokenEventArray.map((row, idx) => {
              return (
                <TableRow
                  key={idx}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center">{row.tokenAddress}</TableCell>
                  <TableCell align="center">{row.name}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
