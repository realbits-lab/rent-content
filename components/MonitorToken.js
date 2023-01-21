import React from "react";
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
} from "./RentContentUtil";

// https://docs.alchemy.com/docs/deep-dive-into-eth_getlogs
const MonitorToken = ({
  inputRentMarket,
  rentMarketAddress,
  inputBlockchainNetwork,
}) => {
  //----------------------------------------------------------------------------
  // Define rent market class.
  //----------------------------------------------------------------------------
  const rentMarket = React.useRef();
  const [tokenArray, setTokenArray] = React.useState([]);
  const [tokenEventArray, setTokenEventArray] = React.useState([]);

  const POLYGON_SCAN_URL = "https://mumbai.polygonscan.com/address/";

  //----------------------------------------------------------------------------
  // Define alchemy configuration.
  //----------------------------------------------------------------------------
  const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
    network: Network.MATIC_MUMBAI,
  };
  const alchemy = new Alchemy(settings);

  //----------------------------------------------------------------------------
  // Handle toast message.
  //----------------------------------------------------------------------------
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

  React.useEffect(() => {
    // console.log("call React.useEffect()");

    // console.log("inputRentMarket: ", inputRentMarket);
    // console.log(
    //   "inputRentMarket.rentMarketContract: ",
    //   inputRentMarket?.rentMarketContract
    // );

    window.Buffer = window.Buffer || Buffer;

    if (
      inputRentMarket !== undefined &&
      inputRentMarket?.rentMarketContract !== undefined
    ) {
      rentMarket.current = inputRentMarket;
      rentMarket.current.getAllToken().then(
        (resultTokenArray) => setTokenArray(resultTokenArray),
        (error) => {
          setWriteToastMessage({
            snackbarSeverity: AlertSeverity.error,
            snackbarMessage: error?.message,
            snackbarTime: new Date(),
            snackbarOpen: true,
          });
        }
      );
    } else {
      const chainName = getChainName({ chainId: inputBlockchainNetwork });
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.error,
        snackbarMessage: `Metamask is not connect or not connected to ${chainName}.`,
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    }

    const eventHash = keccak256("RegisterToken(address,name)");
    const topicHash = `0x${Buffer.from(eventHash).toString("hex")}`;
    alchemy.core
      .getLogs({
        fromBlock: 27956165,
        toBlock: "latest",
        address: rentMarketAddress,
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
  }, [inputRentMarket]);

  return (
    <div>
      {/*--------------------------------------------------------------------*/}
      {/* Show registered tokens.                                            */}
      {/*--------------------------------------------------------------------*/}

      <p />
      <Divider>
        <Chip label="Registered Token" />
      </Divider>
      <p />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="right">Name</TableCell>
              <TableCell align="right">Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokenArray.map((row) => {
              const polygonScanUrl = `${POLYGON_SCAN_URL}${row.tokenAddress}`;

              return (
                <TableRow
                  key={`registeredToken-${row.tokenAddress}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="right">{row.name}</TableCell>
                  <TableCell align="right">
                    {shortenAddress(tow.tokenAddress, 4)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/*--------------------------------------------------------------------*/}
      {/* Show register token event.                                         */}
      {/*--------------------------------------------------------------------*/}

      <p />
      <Divider>
        <Chip label="RegisterToken Event" />
      </Divider>
      <p />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="right">Token Address</TableCell>
              <TableCell align="right">Token Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokenEventArray.map((row) => {
              return (
                <TableRow
                  key={row.key}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="right">{row.tokenAddress}</TableCell>
                  <TableCell align="right">{row.name}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MonitorToken;
