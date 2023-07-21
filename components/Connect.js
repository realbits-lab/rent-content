import { useAccount, useNetwork, useConnect } from "wagmi";
import Button from "@mui/material/Button";

export default function Connect() {
  //*---------------------------------------------------------------------------
  //* Wagmi
  //*---------------------------------------------------------------------------
  const { address, connector: activeConnector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { chain, chains } = useNetwork();

  if (isConnected === true) {
    return (
      <>
        {address} {chain}
      </>
    );
  }

  return <Button>CONNECT</Button>;
}
