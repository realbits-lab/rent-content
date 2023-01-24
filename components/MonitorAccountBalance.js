import React from "react";
import { Network, Alchemy } from "alchemy-sdk";
import { Buffer } from "buffer";
import moment from "moment";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
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
        variant="outlined"
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

  // TODO: Add account address search or filter.
  return (
    <div>
      {/* // * --------------------------------------------------------------*/}
      {/* // * Show current all account balance data.                        */}
      {/* // * --------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px" }}>
        <Chip label="Account Balance Data" />
      </Divider>

      <Table
        sx={{
          width: "max-content",
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "lightgrey",
              borderBottom: "2px solid black",
              "& td": {
                fontSize: "10px",
              },
            }}
          >
            <TableCell align="center">Account Address</TableCell>
            <TableCell align="center">Token Address</TableCell>
            <TableCell align="center">Amount</TableCell>
            <TableCell align="center">Withdraw</TableCell>
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
                }}
              >
                <TableCell align="center">
                  {shortenAddress({
                    address: row.accountAddress,
                    number: 5,
                    withLink: "scan",
                  })}
                </TableCell>
                <TableCell align="center">
                  {shortenAddress({
                    address: row.tokenAddress,
                    number: 5,
                    withLink: "scan",
                  })}
                </TableCell>
                <TableCell align="center">
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
    </div>
  );
};

export default MonitorAccountBalance;
