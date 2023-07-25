import { useAccount, useNetwork } from "wagmi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { shortenAddress } from "@/components/RentContentUtil";

export default function WalletProfile() {
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();

  return (
    <>
      <Box display="flex" flexDirection="row">
        <Button>{shortenAddress({ address, number: 20 })}</Button>
        <Button>{chain.network}</Button>
        <Button>
          {isConnected
            ? "connected"
            : isConnecting
            ? "connecting"
            : "n/a connection"}
        </Button>
      </Box>
    </>
  );
}
