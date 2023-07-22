import React from "react";
import axios from "axios";
import {
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { useRecoilStateLoadable } from "recoil";
import {
  AlertSeverity,
  shortenAddress,
  writeToastMessageState,
} from "@/components/RentContentUtil";
import rentmarketABI from "@/contracts/rentMarket.json";

export default function Service() {
  //*---------------------------------------------------------------------------
  //* Handle text input change.
  //*---------------------------------------------------------------------------
  const [formValue, setFormValue] = React.useState({
    serviceAddress: "",
    serviceUri: "",
  });
  const { serviceAddress, serviceUri } = formValue;

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
  //* Data list.
  //*---------------------------------------------------------------------------
  const [serviceArray, setServiceArray] = React.useState([]);
  const [unregisterServiceAddress, setUnregisterServiceAddress] =
    React.useState();

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

  //*---------------------------------------------------------------------------
  //* Wagmi
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;

  const {
    data: dataRegisterService,
    write: writeRegisterService,
    isLoading: isLoadingRegisterService,
  } = useContractWrite({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI.abi,
    functionName: "registerService",
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: "Registering service is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onError(error) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.error,
        snackbarMessage: "Registering service is failed.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
      setFormValue((prevState) => {
        return {
          serviceAddress: "",
          serviceUri: "",
        };
      });
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
    },
  });
  const {
    isLoading: isLoadingTransactionRegisterService,
    isSuccess: isSuccessTransactionRegisterService,
  } = useWaitForTransaction({
    hash: dataRegisterService?.hash,
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage:
          "Registering service transaction is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onError(error) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.error,
        snackbarMessage: "Registering service transaction is failed.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
      setFormValue((prevState) => {
        return {
          serviceAddress: "",
          serviceUri: "",
        };
      });
    },
  });

  const {
    data: dataUnregisterService,
    write: writeUnregisterService,
    isLoading: isLoadingUnregisterService,
  } = useContractWrite({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI.abi,
    functionName: "unregisterService",
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: "Unregistering service is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onError(error) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.error,
        snackbarMessage: "Unregistering service is failed.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
      setUnregisterServiceAddress(undefined);
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
    },
  });
  const {
    isLoading: isLoadingTransactionUnregisterService,
    isSuccess: isSuccessTransactionUnregisterService,
  } = useWaitForTransaction({
    hash: dataUnregisterService?.hash,
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage:
          "Unregistering service transaction is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onError(error) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.error,
        snackbarMessage: "Unregistering service transaction is failed.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
      setUnregisterServiceAddress(undefined);
    },
  });

  const {
    data: dataAllService,
    isError: isErrorAllService,
    isLoading: isLoadingAllService,
    status: statusAllService,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI.abi,
    functionName: "getAllService",
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      Promise.all(
        data.map(async (service) => {
          // console.log("service: ", service);
          const response = await axios.get(service.uri);
          // console.log("response: ", response);
          return {
            serviceAddress: service.serviceAddress,
            uri: service.uri,
            name: response.data.name,
            description: response.data.description,
            image: response.data.image,
          };
        })
      ).then((serviceArray) => {
        // console.log("serviceArray: ", serviceArray);
        setServiceArray(serviceArray);
      });
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

  return (
    <div>
      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show request register service.                                  */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px", marginTop: "20px", marginBottom: "20px" }}>
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
          label="Service Address"
          name="serviceAddress"
          value={serviceAddress}
          onChange={handleChange}
        />
        <TextField
          margin={"normal"}
          fullWidth
          required
          id="outlined"
          label="Service Uri"
          variant="outlined"
          name="serviceUri"
          value={serviceUri}
          onChange={handleChange}
        />
        <Button
          disabled={
            isLoadingRegisterService || isLoadingTransactionRegisterService
          }
          margin={"normal"}
          variant="contained"
          onClick={async () => {
            try {
              writeRegisterService?.({ args: [serviceAddress, serviceUri] });
            } catch (error) {
              console.error(error);
              setWriteToastMessage({
                snackbarSeverity: AlertSeverity.error,
                snackbarMessage: error.reason,
                snackbarTime: new Date(),
                snackbarOpen: true,
              });
            }
          }}
        >
          {isLoadingRegisterService || isLoadingTransactionRegisterService ? (
            <Typography>Registering...</Typography>
          ) : (
            <Typography>Register</Typography>
          )}
        </Button>
      </Box>

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show service array.                                             */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px", marginTop: "20px", marginBottom: "20px" }}>
        <Chip label="Service" />
      </Divider>

      <Grid container spacing={2}>
        {serviceArray?.map(function (element, idx) {
          // console.log("element: ", element);

          return (
            <Grid item key={idx} xs={6}>
              <Card>
                <CardMedia
                  component="img"
                  alt="image"
                  height="140"
                  image={element.image}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {element.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PolygonScan:{" "}
                    {shortenAddress({
                      address: element.serviceAddress,
                      withLink: "scan",
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    Uri:
                    <Link href={element.uri} target="_blank">
                      {element.uri}
                    </Link>
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    disabled={
                      unregisterServiceAddress === element.serviceAddress &&
                      (isLoadingUnregisterService ||
                        isLoadingTransactionUnregisterService)
                    }
                    fullWidth
                    sx={{ m: 1 }}
                    onClick={async () => {
                      try {
                        setUnregisterServiceAddress(element.serviceAddress);
                        writeUnregisterService?.({
                          args: [element.serviceAddress],
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
                    }}
                  >
                    {unregisterServiceAddress === element.serviceAddress &&
                    (isLoadingUnregisterService ||
                      isLoadingTransactionUnregisterService) ? (
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
