import React from "react";
import axios from "axios";
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";
import { useRecoilStateLoadable } from "recoil";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
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
import CircularProgress from "@mui/material/CircularProgress";
import {
  AlertSeverity,
  writeToastMessageState,
  shortenAddress,
} from "@/components/RentContentUtil";
import rentmarketABI from "@/contracts/rentMarket.json";
import rentNFTABI from "@/contracts/rentNFT.json";

export default function Collection() {
  //*---------------------------------------------------------------------------
  //* Handle text input change.
  //*---------------------------------------------------------------------------
  const [formValue, setFormValue] = React.useState({
    collectionAddress: "",
    collectionUri: "",
  });
  const { collectionAddress, collectionUri } = formValue;

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

  //*---------------------------------------------------------------------------
  //* Data list.
  //*---------------------------------------------------------------------------
  const [collectionArray, setCollectionArray] = React.useState([]);

  //*---------------------------------------------------------------------------
  //* Wagmi hook functions.
  //*---------------------------------------------------------------------------
  const [unregisterCollectionAddress, setUnregisterCollectionAddress] =
    React.useState();
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;

  const { data: walletClient } = useWalletClient();
  const { chain, chains } = useNetwork();
  const { address, isConnected } = useAccount();

  const { data: dataRegisterCollection, write: writeRegisterCollection } =
    useContractWrite({
      address: RENT_MARKET_CONTRACT_ADDRES,
      abi: rentmarketABI.abi,
      functionName: "registerCollection",
    });
  const {
    isLoading: isLoadingTransactionRegisterCollection,
    isSuccess: isSuccessTransactionRegisterCollection,
  } = useWaitForTransaction({
    hash: dataRegisterCollection?.hash,
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage:
          "Registering collection transaction is made successfully.",
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
          collectionAddress: "",
          collectionUri: "",
        };
      });
    },
  });

  const { data: dataUnregisterCollection, write: writeUnregisterCollection } =
    useContractWrite({
      address: RENT_MARKET_CONTRACT_ADDRES,
      abi: rentmarketABI.abi,
      functionName: "unregisterCollection",
    });
  const {
    isLoading: isLoadingTransactionUnregisterCollection,
    isSuccess: isSuccessTransactionUnregisterCollection,
  } = useWaitForTransaction({
    hash: dataUnregisterCollection?.hash,
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage:
          "Unregistering collection transaction is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
  });

  const {
    data: dataAllCollection,
    isError: isErrorAllCollection,
    isLoading: isLoadingAllCollection,
    status: statusAllCollection,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllCollection",
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      Promise.all(
        data.map(async (collection) => {
          // console.log("collection: ", collection);
          let response;
          try {
            response = await axios.get(collection.uri, {
              headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Expires: "0",
              },
            });
          } catch (error) {
            console.error(error);
          }
          // console.log("response: ", response);

          return {
            key: collection.key,
            collectionAddress: collection.collectionAddress,
            uri: collection.uri,
            name: response.data.name,
            description: response.data.description,
            image: response.data.image,
          };
        })
      ).then((collectionArray) => {
        // console.log("collectionArray: ", collectionArray);
        setCollectionArray(collectionArray);
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
  // console.log("isLoadingAllCollection: ", isLoadingAllCollection);

  return (
    <div>
      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show request register collection.                               */}
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
          label="Collection Address"
          name="collectionAddress"
          value={collectionAddress}
          onChange={handleChange}
        />
        <TextField
          margin={"normal"}
          fullWidth
          required
          id="outlined"
          label="Collection Uri"
          variant="outlined"
          name="collectionUri"
          value={collectionUri}
          onChange={handleChange}
        />
        <Button
          margin={"normal"}
          variant="contained"
          disabled={isLoadingTransactionRegisterCollection}
          onClick={async () => {
            try {
              writeRegisterCollection?.({
                args: [collectionAddress, collectionUri],
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
          {isLoadingTransactionRegisterCollection ? (
            <Typography>Registering...</Typography>
          ) : (
            <Typography>Register</Typography>
          )}
        </Button>
      </Box>

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show collection array.                                          */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px", marginTop: "20px", marginBottom: "20px" }}>
        <Chip label="Collection" />
      </Divider>
      {isLoadingAllCollection ? (
        <Box
          sx={{
            marginTop: "20px",
            display: "flex",
            width: "100vw",
            height: "10vh",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {collectionArray?.map(function (element, idx) {
            // console.log("element: ", element);

            return (
              <Grid item key={idx} xs={6}>
                <Card>
                  <CardMedia
                    component="img"
                    alt="image"
                    height="140px"
                    image={element.image}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {element.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PolygonScan:{" "}
                      {shortenAddress({
                        address: element.collectionAddress,
                        number: 4,
                        withLink: "scan",
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Opensea:{" "}
                      {shortenAddress({
                        address: element.collectionAddress,
                        number: 4,
                        withLink: "opensea",
                      })}
                    </Typography>
                    <Typography noWrap variant="body2" color="text.secondary">
                      Uri:{" "}
                      <Link href={element.uri} target="_blank">
                        {element.uri}
                      </Link>
                    </Typography>
                  </CardContent>
                  <CardActions
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ m: 1 }}
                      disabled={
                        element.collectionAddress ===
                          unregisterCollectionAddress &&
                        isLoadingTransactionUnregisterCollection
                      }
                      onClick={async () => {
                        try {
                          setUnregisterCollectionAddress(
                            element.collectionAddress
                          );
                          writeUnregisterCollection?.({
                            args: [element.collectionAddress],
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
                            "Make transaction for unregistering collection.",
                          snackbarTime: new Date(),
                          snackbarOpen: true,
                        });
                      }}
                    >
                      {element.collectionAddress ===
                        unregisterCollectionAddress &&
                      isLoadingTransactionUnregisterCollection ? (
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
      )}
    </div>
  );
}
