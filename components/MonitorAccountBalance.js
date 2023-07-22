import React from "react";
import {
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useRecoilStateLoadable } from "recoil";
import {
  shortenAddress,
  getUniqueKey,
  AlertSeverity,
  writeToastMessageState,
} from "@/components/RentContentUtil";
import rentmarketABI from "@/contracts/rentMarket.json";

// https://docs.alchemy.com/docs/deep-dive-into-eth_getlogs
export default function MonitorAccountBalance() {
  //*---------------------------------------------------------------------------
  //* Wagmi
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;

  //* getAllAccountBalance function
  const {
    data: dataAllAccountBalance,
    isError: isErrorAllAccountBalance,
    isLoading: isLoadingAllAccountBalance,
    status: statusAllAccountBalance,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "getAllAccountBalance",
    watch: true,
  });

  //* withdrawMyBalance function
  const {
    data: dataWithdrawMyBalance,
    isError: isErrorWithdrawMyBalance,
    isLoading: isLoadingWithdrawMyBalance,
    write: writeWithdrawMyBalance,
  } = useContractWrite({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "withdrawMyBalance",
  });
  const {
    data: dataWithdrawMyBalanceTx,
    isError: isErrorWithdrawMyBalanceTx,
    isLoading: isLoadingWithdrawMyBalanceTx,
  } = useWaitForTransaction({
    hash: dataWithdrawMyBalance?.hash,
  });

  //*-------------------------------------------------------------------------
  //* Snackbar message.
  //*-------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);

  function buildWithdrawButton({ recipient, tokenAddress }) {
    return (
      <Button
        variant="outlined"
        onClick={() => {
          try {
            writeWithdrawMyBalance?.({ args: [recipient, tokenAddress] });
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
      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show current all account balance data.                          */}
      {/*//*-----------------------------------------------------------------*/}
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
          {dataAllAccountBalance.map((row) => {
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
                  {Number(row.amount / BigInt(10 ** 18))}
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
}
