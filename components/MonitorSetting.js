import { useAccount, useNetwork, useContractRead } from "wagmi";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { shortenAddress } from "@/components/RentContentUtil";
import rentmarketABI from "@/contracts/rentMarket.json";

export default function MonitorSetting() {
  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;

  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected, isConnected } = useAccount();

  //* getMarketShareAddress function
  const {
    data: dataGetMarketShareAddress,
    isError: isErrorGetMarketShareAddress,
    isLoading: isLoadingGetMarketShareAddress,
    status: statusGetMarketShareAddress,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "getMarketShareAddress",
    watch: true,
  });

  //* getFeeQuota function
  const {
    data: dataGetFeeQuota,
    isError: isErrorGetFeeQuota,
    isLoading: isLoadingGetFeeQuota,
    status: statusGetFeeQuota,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "getFeeQuota",
    watch: true,
  });
  // console.log("dataGetFeeQuota: ", dataGetFeeQuota);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Key</TableCell>
            <TableCell align="center">Value</TableCell>
            <TableCell align="center">Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">WALLET CONNECTED</TableCell>
            <TableCell align="left">{isConnected.toString()}</TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              Check metamask wallet is connected to this service
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">WALLET ACCOUNT ADDRESS</TableCell>
            <TableCell align="left">{address}</TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The connected metamask wallet account address
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">WALLET CHAIN</TableCell>
            <TableCell align="left">{chain?.name}</TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The connected metamask wallet network chain
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">BLOCKCHAIN_NETWORK</TableCell>
            <TableCell align="left">
              {process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}
            </TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The blockchain network which this service should use
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
            <TableCell align="left" sx={{ color: "grey" }}>
              The rent market contract address
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
            <TableCell align="left" sx={{ color: "grey" }}>
              The service owner account address. The service owner will get 10%
              from NFT rent fee.
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
            <TableCell align="left" sx={{ color: "grey" }}>
              This project utility token
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
            <TableCell align="left" sx={{ color: "grey" }}>
              The distribution contract of utility token
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
            <TableCell align="left" sx={{ color: "grey" }}>
              The NFT contract address which is used for service usage
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">PAYMENT_NFT_TOKEN</TableCell>
            <TableCell align="left">
              {process.env.NEXT_PUBLIC_PAYMENT_NFT_TOKEN}
            </TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The NFT id which is used for service usage
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">RENTER_FEE_QUOTA</TableCell>
            <TableCell align="left">{dataGetFeeQuota[0].toString()}%</TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The proportion of NFT owner from rent fee
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">SERVICE_FEE_QUOTA</TableCell>
            <TableCell align="left">{dataGetFeeQuota[1].toString()}%</TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The proportion of service owner from rent fee
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">MARKET_FEE_QUOTA</TableCell>
            <TableCell align="left">{dataGetFeeQuota[2].toString()}%</TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The proportion of market owner from rent fee
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">MARKET_SHARE_ADDRESS</TableCell>
            <TableCell align="left">
              {shortenAddress({
                address: dataGetMarketShareAddress.toString(),
                withLink: "scan",
                number: 20,
              })}
            </TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The market owner address
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
