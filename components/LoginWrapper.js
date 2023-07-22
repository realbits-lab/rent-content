import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";

export default function LoginWrapper({ children }) {
  //*---------------------------------------------------------------------------
  //* Wagmi
  //*---------------------------------------------------------------------------
  const { connector: activeConnector, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    connect,
    connectors,
    error: errorConnect,
    isLoading: isLoadingConnect,
    pendingConnector,
  } = useConnect();
  const [openConnectorsDialog, setOpenConnectorsDialog] = useState(false);

  //* Listen account change.
  // useEffect(() => {
  //   console.log("call useEffect()");
  //   // console.log("activeConnector: ", activeConnector);

  //   async function handleConnectorUpdate({ account, chain }) {
  //     console.log("call handleConnectorUpdate()");
  //     // console.log("account: ", account);
  //     // console.log("chain: ", chain);

  //     if (isConnected === true) {
  //       disconnect();
  //     }
  //   }

  //   if (activeConnector) {
  //     activeConnector.on("change", handleConnectorUpdate);
  //   }

  //   return () => {
  //     console.log("call activeConnector?.off()");

  //     activeConnector?.off("change", handleConnectorUpdate);
  //   };
  // }, []);

  if (isConnected === true) {
    return <>{children}</>;
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Button
          variant="contained"
          onClick={() => {
            setOpenConnectorsDialog(true);
          }}
        >
          CONNECT
        </Button>
      </Box>

      <Dialog
        onClose={() => setOpenConnectorsDialog(false)}
        open={openConnectorsDialog}
      >
        <DialogTitle>Select connectors</DialogTitle>
        <List sx={{ pt: 0 }}>
          {connectors.map((connector, idx) => (
            <ListItem disableGutters key={connector.id}>
              <ListItemButton
                disabled={!connector.ready}
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  setOpenConnectorsDialog(false);
                }}
              >
                {connector.name}
                {!connector.ready && " (unsupported)"}
                {isLoadingConnect &&
                  connector.id === pendingConnector?.id &&
                  " (connecting)"}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Dialog>
    </>
  );
}