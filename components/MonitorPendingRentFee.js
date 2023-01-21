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
  getUniqueKey,
  AlertSeverity,
  writeToastMessageState,
  getChainName,
} from "./RentContentUtil";

// https://docs.alchemy.com/docs/deep-dive-into-eth_getlogs
const MonitorPendingRentFee = ({
  inputRentMarket,
  rentMarketAddress,
  inputBlockchainNetwork,
}) => {
  //----------------------------------------------------------------------------
  // Define constant varialbe.
  //----------------------------------------------------------------------------
  const TABLE_MIN_WIDTH = 400;

  //----------------------------------------------------------------------------
  // Define rent market class.
  //----------------------------------------------------------------------------
  const rentMarket = React.useRef();
  const [pendingRentFeeArray, setPendingRentFeeArray] = React.useState([]);

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
    // struct pendingRentFee {
    //     address renterAddress;
    //     address serviceAddress;
    //     address feeTokenAddress;
    //     uint256 amount;
    // }
    window.Buffer = window.Buffer || Buffer;

    if (
      inputRentMarket !== undefined &&
      inputRentMarket.rentMarketContract !== undefined
    ) {
      // console.log("inputRentMarket: ", inputRentMarket);
      rentMarket.current = inputRentMarket;
      rentMarket.current.getAllPendingRentFee().then(
        (resultPendingRentFeeArray) =>
          setPendingRentFeeArray(resultPendingRentFeeArray),
        (error) => {
          // console.log("getAllAccountBalance error: ", error);
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
  }, [inputRentMarket]);

  return (
    <div>
      {/*--------------------------------------------------------------------*/}
      {/* 1. Show current all pending rent fee data. */}
      {/*--------------------------------------------------------------------*/}

      <p />
      <Divider>
        <Chip label="Pending Rent Fee Data" />
      </Divider>
      <p />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: TABLE_MIN_WIDTH }} aria-label="simple table">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "grey",
                borderBottom: "2px solid black",
                "& td": {
                  fontSize: "0.8rem",
                  color: "rgba(96, 96, 96)",
                },
              }}
            >
              <TableCell align="right">Renter Address</TableCell>
              <TableCell align="right">Service Address</TableCell>
              <TableCell align="right">Fee Token Address</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingRentFeeArray.map((row) => {
              // console.log("row: ", row);
              return (
                <TableRow
                  key={getUniqueKey()}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    // backgroundColor: "yellow",
                    // borderBottom: "2px solid black",
                    "& td": {
                      fontSize: "0.7rem",
                      color: "rgba(96, 96, 96)",
                    },
                  }}
                >
                  <TableCell align="right">
                    {shortenAddress(row.renterAddress, 4)}
                  </TableCell>
                  <TableCell align="right">
                    {shortenAddress(row.serviceAddress, 4)}
                  </TableCell>
                  <TableCell align="right">
                    {shortenAddress(row.feeTokenAddress, 4)}
                  </TableCell>
                  <TableCell align="right">
                    {row.amount / Math.pow(10, 18)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MonitorPendingRentFee;
