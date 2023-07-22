import { useAccount, useNetwork } from "wagmi";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { shortenAddress } from "@/components/RentContentUtil";

export default function MonitorSetting() {
  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected, isConnected } = useAccount();

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Key</TableCell>
            <TableCell align="center">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">WALLET CONNECTED</TableCell>
            <TableCell align="left">{isConnected.toString()}</TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">WALLET ACCOUNT ADDRESS</TableCell>
            <TableCell align="left">{address}</TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">WALLET CHAIN</TableCell>
            <TableCell align="left">{chain?.name}</TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">BLOCKCHAIN_NETWORK</TableCell>
            <TableCell align="left">
              {process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">RENT_MARKET_CONTRACT_ADDRESS</TableCell>
            <TableCell align="left">
              {shortenAddress({
                address: process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS,
                withLink: "scan",
                number: 20,
              })}
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">SERVICE_OWNER_ADDRESS</TableCell>
            <TableCell align="left">
              {shortenAddress({
                address: process.env.NEXT_PUBLIC_SERVICE_OWNER_ADDRESS,
                withLink: "scan",
                number: 20,
              })}
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">REWARD_TOKEN_CONTRACT_ADDRESS</TableCell>
            <TableCell align="left">
              {shortenAddress({
                address: process.env.NEXT_PUBLIC_REWARD_TOKEN_CONTRACT_ADDRESS,
                withLink: "scan",
                number: 20,
              })}
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">
              REWARD_TOKEN_SHARE_CONTRACT_ADDRESS
            </TableCell>
            <TableCell align="left">
              {shortenAddress({
                address:
                  process.env.NEXT_PUBLIC_REWARD_TOKEN_SHARE_CONTRACT_ADDRESS,
                withLink: "scan",
                number: 20,
              })}
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">PAYMENT_NFT_ADDRESS</TableCell>
            <TableCell align="left">
              {shortenAddress({
                address: process.env.NEXT_PUBLIC_PAYMENT_NFT_ADDRESS,
                withLink: "scan",
                number: 20,
              })}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
