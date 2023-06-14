import React from "react";
import axios from "axios";
import { ethers } from "ethers";
import {
  useAccount,
  useNetwork,
  useContract,
  useContractRead,
  useContractEvent,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";
import { useRecoilStateLoadable } from "recoil";
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
import {
  AlertSeverity,
  writeToastMessageState,
  shortenAddress,
  getUniqueKey,
} from "@/components/RentContentUtil";
import rentmarketABI from "@/contracts/rentMarket.json";
import rentNFTABI from "@/contracts/rentNFT.json";

const Collection = ({ inputRentMarket, blockchainNetwork }) => {
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
  //* Define rent market class.
  //*---------------------------------------------------------------------------
  const rentMarket = React.useRef();

  //*---------------------------------------------------------------------------
  //* Data list.
  //*---------------------------------------------------------------------------
  const [collectionArray, setCollectionArray] = React.useState([]);

  //*---------------------------------------------------------------------------
  //* Wagmi hook functions.
  //*---------------------------------------------------------------------------
  const [unregisterCollectionAddress, setUnregisterCollectionAddress] =
    React.useState();
  const UPDATE_METADATA_API_URL = "/api/update-metadata";
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

  const {
    data: dataAllRegisterData,
    isError: isErrorAllRegisterData,
    isLoading: isLoadingAllRegisterData,
    status: statusAllRegisterData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllRegisterData",
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

  //*---------------------------------------------------------------------------
  //* Initialize data.
  //*---------------------------------------------------------------------------
  React.useEffect(() => {
    // console.log("call useEffect()");

    if (inputRentMarket) {
      rentMarket.current = inputRentMarket;
    }
    if (dataAllCollection) {
      getCollectionMetadata(dataAllCollection);
    }
  }, [
    dataAllCollection,
    inputRentMarket,
    inputRentMarket.rentMarketContract,
    blockchainNetwork,
  ]);

  async function getCollectionMetadata(collections) {
    if (collections === undefined) {
      return;
    }

    const collectionArray = await Promise.all(
      collections.map(async (collection) => {
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
    );
    // console.log("collectionArray: ", collectionArray);
    setCollectionArray(collectionArray);
  }

  async function handleSignMessage() {
    // console.log("call handleSignMessage()");
    // console.log("chain: ", chain);
    // console.log("chain.id: ", chain.id);
    // console.log("address: ", address);

    const msgParams = JSON.stringify({
      domain: {
        chainId: chain.id,
        name: "Realbits",
      },

      //* Defining the message signing data content.
      message: {
        contents: "Authenticate user with signature.",
      },
      //* Refers to the keys of the *types* object below.
      primaryType: "Login",

      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "chainId", type: "uint256" },
        ],
        //* Refer to PrimaryType
        Login: [{ name: "contents", type: "string" }],
      },
    });

    const params = [address, msgParams];
    const method = "eth_signTypedData_v4";
    // console.log("params: ", params);
    // console.log("method: ", method);

    const requestResult = await ethereum.request({
      method,
      params,
    });
    // console.log("requestResult: ", requestResult);

    return requestResult;
  }

  async function updateMetadataDatabase() {
    // console.log("dataAllRegisterData: ", dataAllRegisterData);
    //* Check data validation.
    if (!dataAllRegisterData) {
      // console.log("Not yet received all registered nft data.");
      return;
    }

    //* Get metadata from each nft token uri.
    let metadataArray = [];
    const promises = dataAllRegisterData.map(async (element) => {
      // console.log("element: ", element);

      //* Get nft contract.
      const nftContract = new ethers.Contract(
        element.nftAddress,
        rentNFTABI.abi,
        walletClient
      );

      //* Get token uri.
      let tokenUri;
      try {
        tokenUri = await nftContract.tokenURI(element.tokenId.toNumber());
      } catch (error) {
        console.error(error);
      }

      //* Get metadata.
      let metadata;
      try {
        metadata = await axios.get(tokenUri);
      } catch (error) {
        console.error(error);
      }

      if (metadata.status === 200) {
        metadataArray.push({
          ...metadata.data,
          nftAddress: element.nftAddress,
          tokenId: element.tokenId.toNumber(),
        });
      }
    });
    await Promise.all(promises);
    // console.log("metadataArray: ", metadataArray);

    //* Get signature.
    const signMessageResult = await handleSignMessage();
    // console.log("signMessageResult: ", signMessageResult);

    //* Update metadata database.
    const responseUpdateMetadata = await fetch(UPDATE_METADATA_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonList: metadataArray,
        signature: signMessageResult,
      }),
    });
    // console.log("responseUpdateMetadata: ", responseUpdateMetadata);
  }

  return (
    <div>
      {/* //*----------------------------------------------------------------*/}
      {/* //* Show request register collection.                              */}
      {/* //*----------------------------------------------------------------*/}
      {/* //* Don't use database for fetching metadata, use alchemy API or SDK instead of database. */}
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

      {/* //*----------------------------------------------------------------*/}
      {/* //* Show collection array.                                         */}
      {/* //*----------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px", marginTop: "20px", marginBottom: "20px" }}>
        <Chip label="Collection" />
      </Divider>

      <Grid container spacing={2}>
        {collectionArray.map(function (element) {
          // console.log("element: ", element);

          return (
            <Grid item width={"45%"} key={getUniqueKey()}>
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
                </CardContent>
                <CardActions
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{ m: 1, width: "80%" }}
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
    </div>
  );
};

export default Collection;
