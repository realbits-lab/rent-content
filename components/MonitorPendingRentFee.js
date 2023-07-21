import React from "react";
import { Buffer } from "buffer";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useRecoilStateLoadable } from "recoil";
import {
  shortenAddress,
  getUniqueKey,
  AlertSeverity,
  writeToastMessageState,
} from "@/components/RentContentUtil";

// https://docs.alchemy.com/docs/deep-dive-into-eth_getlogs
const MonitorPendingRentFee = ({
  inputRentMarket,
  rentMarketAddress,
  inputBlockchainNetwork,
}) => {
  const rentMarket = React.useRef();
  const [pendingRentFeeArray, setPendingRentFeeArray] = React.useState();

  //----------------------------------------------------------------------------
  // Handle toast message.
  //----------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);

  async function initializeRentMarket() {
    if (
      inputRentMarket !== undefined &&
      inputRentMarket.rentMarketContract !== undefined
    ) {
      // console.log("inputRentMarket: ", inputRentMarket);
      rentMarket.current = inputRentMarket;

      // struct pendingRentFee {
      //     address renterAddress;
      //     address serviceAddress;
      //     address feeTokenAddress;
      //     uint256 amount;
      // }
      try {
        const resultPendingRentFeeArray =
          await rentMarket.current.getAllPendingRentFee();
        setPendingRentFeeArray((prevState) => resultPendingRentFeeArray);
      } catch (error) {
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

  if (pendingRentFeeArray === undefined) {
    return (
      <div>
        <Divider sx={{ margin: "5px" }}>
          <Chip label="Pending Rent Fee Data" />
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

  return (
    <div>
      {/* // * --------------------------------------------------------------*/}
      {/* // * Show current all pending rent fee data.                       */}
      {/* // * --------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px" }}>
        <Chip label="Pending Rent Fee Data" />
      </Divider>

      <TableContainer component={Paper}>
        <Table
          size="small"
          sx={{
            width: "max-content",
          }}
        >
          {/* // * ----------------------------------------------------------*/}
          {/* // * Current pending data table head.                          */}
          {/* // * ----------------------------------------------------------*/}
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "lightgrey",
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

          {/* // * ----------------------------------------------------------*/}
          {/* // * Current pending data table body.                          */}
          {/* // * ----------------------------------------------------------*/}
          <TableBody>
            {pendingRentFeeArray.map((data) => {
              // console.log("data: ", data);

              return (
                <TableRow
                  key={getUniqueKey()}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell align="center">
                    {shortenAddress({
                      address: data.renterAddress,
                      number: 4,
                      withLink: "scan",
                    })}
                  </TableCell>
                  <TableCell align="center">
                    {shortenAddress({
                      address: data.serviceAddress,
                      number: 4,
                      withLink: "scan",
                    })}
                  </TableCell>
                  <TableCell align="center">
                    {shortenAddress({
                      address: data.feeTokenAddress,
                      number: 4,
                      withLink: "scan",
                    })}
                  </TableCell>
                  <TableCell align="center">
                    {data.amount / Math.pow(10, 18)}
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
