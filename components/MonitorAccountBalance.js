import React from "react";
import { ethers } from "ethers";
import { Network, Alchemy } from "alchemy-sdk";
import keccak256 from "keccak256";
import { Buffer } from "buffer";
import moment from "moment";
import {
  Divider,
  Chip,
  Button,
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
const MonitorAccountBalance = ({
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
  const rentMarketRef = React.useRef();
  const [accountBalanceArray, setAccountBalanceArray] = React.useState([]);

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
    // struct accountBalance {
    //     address accountAddress;
    //     address tokenAddress;
    //     uint256 amount;
    // }
    window.Buffer = window.Buffer || Buffer;

    // console.log("inputRentMarket: ", inputRentMarket);
    if (
      inputRentMarket !== undefined &&
      inputRentMarket?.rentMarketContract !== undefined
    ) {
      // console.log("inputRentMarket: ", inputRentMarket);
      rentMarketRef.current = inputRentMarket;
      rentMarketRef.current.getAllAccountBalance().then(
        (resultAccountBalanceArray) =>
          setAccountBalanceArray(resultAccountBalanceArray),
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

  function buildWithdrawButton({ recipient, tokenAddress }) {
    return (
      <Button
        variant="contained"
        onClick={async () => {
          try {
            // console.log("rentMarketRef.current: ", rentMarketRef.current);
            // console.log("recipient: ", recipient);
            // console.log("tokenAddress: ", tokenAddress);
            await rentMarketRef.current.withdrawMyBalance(
              recipient,
              tokenAddress
            );
            // console.log("withdrawMyBalance done.");
          } catch (error) {
            console.error(error);
            setWriteToastMessage({
              snackbarSeverity: AlertSeverity.error,
              snackbarMessage: error?.reason,
              snackbarTime: new Date(),
              snackbarOpen: true,
            });
          }
        }}
      >
        WITHDRAW
      </Button>
    );
  }

  return (
    <div>
      {/*--------------------------------------------------------------------*/}
      {/* 1. Show current all account balance data. */}
      {/*--------------------------------------------------------------------*/}

      <p />
      <Divider>
        <Chip label="Account Balance Data" />
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
              <TableCell align="right">Account Address</TableCell>
              <TableCell align="right">Token Address</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Withdraw</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accountBalanceArray.map((row) => {
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
                    {shortenAddress({ address: row.accountAddress, number: 4 })}
                  </TableCell>
                  <TableCell align="right">
                    {shortenAddress({ address: row.tokenAddress, number: 4 })}
                  </TableCell>
                  <TableCell align="right">
                    {row.amount / Math.pow(10, 18)}
                  </TableCell>
                  <TableCell align="center">
                    {buildWithdrawButton({
                      recipient: row.accountAddress,
                      tokenAddress: row.tokenAddress,
                    })}
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

export default MonitorAccountBalance;
