import React from "react";
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";
import { useRecoilStateLoadable } from "recoil";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import rentmarketABI from "@/contracts/rentMarket.json";
import {
  AlertSeverity,
  writeToastMessageState,
  shortenAddress,
} from "@/components/RentContentUtil";

export default function Token() {
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;

  //*---------------------------------------------------------------------------
  //* Wagmi hook functions.
  //*---------------------------------------------------------------------------
  const [unregisterTokenAddress, setUnregisterTokenAddress] = React.useState();

  const {
    data: dataAllToken,
    isError: isErrorAllToken,
    isLoading: isLoadingAllToken,
    status: statusAllToken,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllToken",
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
    },
    onError(error) {
      // console.log("call onError()");
      // console.log("error: ", error);
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
    },
  });
  // console.log("dataAllToken: ", dataAllToken);

  const { data: dataRegisterToken, write: writeRegisterToken } =
    useContractWrite({
      address: RENT_MARKET_CONTRACT_ADDRES,
      abi: rentmarketABI.abi,
      functionName: "registerToken",
    });
  const {
    isLoading: isLoadingTransactionRegisterToken,
    isSuccess: isSuccessTransactionRegisterToken,
  } = useWaitForTransaction({
    hash: dataRegisterToken?.hash,
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: "Registering token transaction is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
  });

  const { data: dataUnregisterToken, write: writeUnregisterToken } =
    useContractWrite({
      address: RENT_MARKET_CONTRACT_ADDRES,
      abi: rentmarketABI.abi,
      functionName: "unregisterToken",
    });
  const {
    isLoading: isLoadingTransactionUnregisterToken,
    isSuccess: isSuccessTransactionUnregisterToken,
  } = useWaitForTransaction({
    hash: dataUnregisterToken?.hash,
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage:
          "Unregistering token transaction is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
  });

  //*---------------------------------------------------------------------------
  //* Handle text input change.
  //*---------------------------------------------------------------------------
  const [formValue, setFormValue] = React.useState({
    tokenAddress: "",
    tokenName: "",
  });
  const { tokenAddress, tokenName } = formValue;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValue((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  //*---------------------------------------------------------------------------
  //* Handle toast mesage.
  //*---------------------------------------------------------------------------
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

  return (
    <div>
      {/*//*-----------------------------------------------------------------*/}
      {/*//* Request register token.                                         */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px", marginTop: "20px" }}>
        <Chip label="Input" />
      </Divider>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TextField
          margin={"normal"}
          fullWidth
          required
          id="outlined"
          label="Token Address"
          name="tokenAddress"
          value={tokenAddress}
          onChange={handleChange}
        />
        <TextField
          margin={"normal"}
          fullWidth
          required
          id="outlined"
          label="Token Name"
          variant="outlined"
          name="tokenName"
          value={tokenName}
          onChange={handleChange}
        />
        <Button
          margin={"normal"}
          variant="contained"
          onClick={async () => {
            try {
              writeRegisterToken?.({
                args: [tokenAddress, tokenName],
              });
            } catch (error) {
              console.error(error);
              setWriteToastMessage({
                snackbarSeverity: AlertSeverity.error,
                snackbarMessage: error.reason,
                snackbarTime: new Date(),
                snackbarOpen: true,
              });
            }

            setWriteToastMessage({
              snackbarSeverity: AlertSeverity.info,
              snackbarMessage: "Make transaction for registering token.",
              snackbarTime: new Date(),
              snackbarOpen: true,
            });
          }}
        >
          <Typography>Register</Typography>
        </Button>
      </Box>

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show token list.                                                */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px", marginTop: "20px", marginBottom: "20px" }}>
        <Chip label="Token" />
      </Divider>
      <Grid container spacing={2}>
        {dataAllToken.map(function (token, idx) {
          // console.log("token: ", token);

          return (
            <Grid item key={idx}>
              <Card sx={{ maxWidth: 345 }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {token.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PolygonScan:{" "}
                    {shortenAddress({
                      address: token.tokenAddress,
                      number: 4,
                      withLink: "scan",
                    })}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={async () => {
                      try {
                        setUnregisterTokenAddress(token.tokenAddress);
                        writeUnregisterToken?.({
                          args: [token.tokenAddress],
                        });
                      } catch (error) {
                        console.error(error);
                        setWriteToastMessage({
                          snackbarSeverity: AlertSeverity.error,
                          snackbarMessage: error.reason,
                          snackbarTime: new Date(),
                          snackbarOpen: true,
                        });
                      }

                      setWriteToastMessage({
                        snackbarSeverity: AlertSeverity.info,
                        snackbarMessage:
                          "Make transaction for unregistering token.",
                        snackbarTime: new Date(),
                        snackbarOpen: true,
                      });
                    }}
                  >
                    Unregister
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
