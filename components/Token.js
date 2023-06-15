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
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import rentmarketABI from "@/contracts/rentMarket.json";
import faucetTokenABI from "@/contracts/faucetToken.json";
import {
  AlertSeverity,
  writeToastMessageState,
  shortenAddress,
  getUniqueKey,
} from "@/components/RentContentUtil";

export default function Token() {
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const BLOCKCHAIN_NETWORK = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;

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

  const { data: dataFaucetToken, write: writeFaucetToken } = useContractWrite({
    abi: faucetTokenABI.abi,
    functionName: "faucet",
  });
  const {
    isLoading: isLoadingTransactionFaucetToken,
    isSuccess: isSuccessTransactionFaucetToken,
  } = useWaitForTransaction({
    hash: dataFaucetToken?.hash,
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: "Fauceting token transaction is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
  });

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
  const ZERO_ADDRESS_STRING = "0x0000000000000000000000000000000000000000";
  const [formValue, setFormValue] = React.useState({
    tokenAddress: "",
    tokenName: "",
    inputFeeTokenAddress: ZERO_ADDRESS_STRING,
  });
  const { tokenAddress, tokenName, inputFeeTokenAddress } = formValue;

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
      {/*//* Faucet content token for test network.                          */}
      {/*//*-----------------------------------------------------------------*/}
      {BLOCKCHAIN_NETWORK === "maticmum" && (
        <div>
          <Divider sx={{ margin: "5px", marginTop: "20px" }}>
            <Chip label="Faucet" />
          </Divider>
          <TextField
            select
            fullWidth
            required
            id="outlined"
            label="Token Address"
            name="inputFeeTokenAddress"
            value={inputFeeTokenAddress}
            onChange={handleChange}
            sx={{ marginTop: "10px", marginBottom: "10px" }}
          >
            <MenuItem key={getUniqueKey()} value={ZERO_ADDRESS_STRING}>
              None
            </MenuItem>
            {dataAllToken?.map((token, idx) => (
              <MenuItem key={idx} value={token.tokenAddress}>
                {token.name}
              </MenuItem>
            ))}
          </TextField>
          <Button
            fullWidth
            margin={"normal"}
            sx={{ marginTop: "10px" }}
            disabled={isLoadingTransactionFaucetToken}
            variant="contained"
            onClick={async () => {
              if (inputFeeTokenAddress === ZERO_ADDRESS_STRING) return;

              try {
                writeFaucetToken?.({
                  address: inputFeeTokenAddress,
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
                snackbarMessage: "Make transaction for fauceting token.",
                snackbarTime: new Date(),
                snackbarOpen: true,
              });
            }}
          >
            {isLoadingTransactionFaucetToken ? (
              <Typography>Fauceting...</Typography>
            ) : (
              <Typography>Faucet</Typography>
            )}
          </Button>
        </div>
      )}

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Input token address and name.                                   */}
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
          sx={{ marginTop: "10px" }}
          disabled={isLoadingTransactionRegisterToken}
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
          {isLoadingTransactionRegisterToken ? (
            <Typography>Registering...</Typography>
          ) : (
            <Typography>Register</Typography>
          )}
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
              <Card>
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
                    disabled={
                      token.tokenAddress === unregisterTokenAddress &&
                      isLoadingTransactionUnregisterToken
                    }
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
                    {token.tokenAddress === unregisterTokenAddress &&
                    isLoadingTransactionUnregisterToken ? (
                      <Typography>Unregistering...</Typography>
                    ) : (
                      <Typography>Unregister</Typography>
                    )}
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
