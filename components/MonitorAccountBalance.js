import React from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { isMobile } from "react-device-detect";
import { Buffer } from "buffer";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useRecoilStateLoadable } from "recoil";
import {
  shortenAddress,
  getUniqueKey,
  AlertSeverity,
  writeToastMessageState,
} from "./RentContentUtil";

// https://docs.alchemy.com/docs/deep-dive-into-eth_getlogs
const MonitorAccountBalance = ({
  inputRentMarket,
  rentMarketAddress,
  inputBlockchainNetwork,
}) => {
  // * -------------------------------------------------------------------------
  // * Define rent market class.
  // * -------------------------------------------------------------------------
  const rentMarketRef = React.useRef();
  const [accountBalanceArray, setAccountBalanceArray] = React.useState();

  // * -------------------------------------------------------------------------
  // * Handle toast message.
  // * -------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);
  const writeToastMessage =
    writeToastMessageLoadable?.state === "hasValue"
      ? writeToastMessageLoadable.contents
      : {
          snackbarSeverity: AlertSeverity.info,
          snackbarMessage: "",
          snackbarTime: new Date(),
          snackbarOpen: true,
        };

  async function initializeRentMarket() {
    // console.log("inputRentMarket: ", inputRentMarket);
    if (
      inputRentMarket !== undefined &&
      inputRentMarket?.rentMarketContract !== undefined
    ) {
      // console.log("inputRentMarket: ", inputRentMarket);

      rentMarketRef.current = inputRentMarket;
      // struct accountBalance {
      //     address accountAddress;
      //     address tokenAddress;
      //     uint256 amount;
      // }

      try {
        const resultAccountBalanceArray =
          await rentMarketRef.current.getAllAccountBalance();
        setAccountBalanceArray((prevState) => resultAccountBalanceArray);
      } catch (error) {
        // console.log("getAllAccountBalance error: ", error);
        setWriteToastMessage({
          snackbarSeverity: AlertSeverity.error,
          snackbarMessage: error?.message,
          snackbarTime: new Date(),
          snackbarOpen: true,
        });
      }
    } else {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: "Getting rent market contract.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    }
  }

  React.useEffect(() => {
    window.Buffer = window.Buffer || Buffer;
    async function initialize() {
      initializeRentMarket();
    }
    initialize();
  }, [
    inputRentMarket,
    inputRentMarket.rentMarketContract,
    rentMarketAddress,
    inputBlockchainNetwork,
  ]);

  function buildWithdrawButton({ recipient, tokenAddress }) {
    return (
      <Button
        variant="outlined"
        onClick={async () => {
          // * Create WalletConnect Provider.
          let provider;
          if (isMobile === true) {
            provider = new WalletConnectProvider({
              rpc: {
                137: "https://rpc-mainnet.maticvigil.com",
                80001: "https://rpc-mumbai.maticvigil.com/",
              },
              infuraId: process.env.NEXT_PUBLIC_INFURA_KEY,
            });

            // * Enable session (triggers QR Code modal).
            await provider.enable();
            // console.log("provider: ", provider);
          }

          try {
            // console.log("rentMarketRef.current: ", rentMarketRef.current);
            // console.log("recipient: ", recipient);
            // console.log("tokenAddress: ", tokenAddress);
            await rentMarketRef.current.withdrawMyBalance({
              provider: provider,
              recipient: recipient,
              tokenAddress: tokenAddress,
            });
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

  if (accountBalanceArray === undefined) {
    return (
      <div>
        <Divider sx={{ margin: "5px" }}>
          <Chip label="Account Balance Data" />
        </Divider>

        <Box
          sx={{
            marginTop: "20px",
            display: "flex",
            width: "100vw",
            height: "100vh",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </div>
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
