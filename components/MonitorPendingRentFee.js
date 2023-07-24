import React from "react";
import { formatEther } from "viem";
import { useContractRead } from "wagmi";
import Divider from "@mui/material/Divider";
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
  writeToastMessageState,
} from "@/components/RentContentUtil";
import rentmarketABI from "@/contracts/rentMarket.json";

// https://docs.alchemy.com/docs/deep-dive-into-eth_getlogs
export default function MonitorPendingRentFee() {
  //*---------------------------------------------------------------------------
  //* Wagmi
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;

  //* getAllPendingRentFee function
  const {
    data: dataAllPendingRentFee,
    isError: isErrorAllPendingRentFee,
    isLoading: isLoadingAllPendingRentFee,
    status: statusAllPendingRentFee,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "getAllPendingRentFee",
    watch: true,
  });

  //*---------------------------------------------------------------------------
  //* Message snackbar.
  //*---------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);

  return (
    <div>
      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show current all pending rent fee data.                         */}
      {/*//*-----------------------------------------------------------------*/}
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
          {/*//*-------------------------------------------------------------*/}
          {/*//* Current pending data table head.                            */}
          {/*//*-------------------------------------------------------------*/}
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

          {/*//*-------------------------------------------------------------*/}
          {/*//* Current pending data table body.                            */}
          {/*//*-------------------------------------------------------------*/}
          <TableBody>
            {dataAllPendingRentFee?.map((data) => {
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
                    {formatEther(data.amount)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
