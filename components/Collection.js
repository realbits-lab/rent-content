import React from "react";
import axios from "axios";
import { ethers } from "ethers";
import {
  useAccount,
  useSigner,
  useNetwork,
  useContract,
  useContractRead,
  useContractEvent,
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

const Collection = ({
  inputCollectionArray,
  inputRentMarket,
  blockchainNetwork,
}) => {
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
  const UPDATE_METADATA_API_URL = "/api/update-metadata";
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;

  const { data: signer, isError, isLoading } = useSigner();
  const { chain, chains } = useNetwork();
  const { address, isConnected } = useAccount();

  const {
    data: dataGetAllRegisterData,
    isError: isErrorGetAllRegisterData,
    isLoading: isLoadingGetAllRegisterData,
    status: statusGetAllRegisterData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllRegisterData",
    cacheOnBlock: true,
    // watch: true,
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
    // console.log("React.useEffect");

    if (inputRentMarket) {
      getCollectionMetadata(inputCollectionArray);
      rentMarket.current = inputRentMarket;
    }
  }, [
    inputCollectionArray,
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
        const response = await axios.get(collection.uri);
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
    console.log("params: ", params);
    console.log("method: ", method);

    const requestResult = await ethereum.request({
      method,
      params,
    });
    console.log("requestResult: ", requestResult);

    return requestResult;
  }

  async function updateMetadataDatabase() {
    console.log("dataGetAllRegisterData: ", dataGetAllRegisterData);
    //* Check data validation.
    if (!dataGetAllRegisterData) {
      console.log("Not yet received all registered nft data.");
      return;
    }

    //* Get metadata from each nft token uri.
    let metadataArray = [];
    const promises = dataGetAllRegisterData.map(async (element) => {
      console.log("element: ", element);

      //* Get nft contract.
      const nftContract = new ethers.Contract(
        element.nftAddress,
        rentNFTABI.abi,
        signer
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
    console.log("metadataArray: ", metadataArray);

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
    console.log("responseUpdateMetadata: ", responseUpdateMetadata);
  }

  return (
    <div>
      {/* //*----------------------------------------------------------------*/}
      {/* //* Show request register collection.                              */}
      {/* //*----------------------------------------------------------------*/}
      {/* //* Don't use database for fetching metadata, use alchemy API or SDK instead of database. */}
      {/* <Divider sx={{ margin: "5px" }}>
        <Chip label="Update" />
      </Divider>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button
          variant="contained"
          sx={{ m: 1 }}
          onClick={async () => {
            setWriteToastMessage({
              snackbarSeverity: AlertSeverity.info,
              snackbarMessage: "Start to updata metadata database.",
              snackbarTime: new Date(),
              snackbarOpen: true,
            });

            await updateMetadataDatabase();

            setWriteToastMessage({
              snackbarSeverity: AlertSeverity.info,
              snackbarMessage: "Done to updata metadata database.",
              snackbarTime: new Date(),
              snackbarOpen: true,
            });
          }}
        >
          Update DB
        </Button>
      </Box> */}

      <Divider sx={{ margin: "5px" }}>
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
          onClick={async () => {
            try {
              await rentMarket.current.registerCollection(
                collectionAddress,
                collectionUri
              );
            } catch (error) {
              console.error(error);
              setWriteToastMessage({
                snackbarSeverity: AlertSeverity.error,
                snackbarMessage: error.reason,
                snackbarTime: new Date(),
                snackbarOpen: true,
              });
            }

            //* TODO: Show a success toast message.
            //* TODO: Show a transaction hash value and status.
            // setWriteToastMessage({
            //   snackbarSeverity: AlertSeverity.info,
            //   snackbarMessage: "Make transaction for registering collection.",
            //   snackbarTime: new Date(),
            //   snackbarOpen: true,
            // });
          }}
        >
          Register
        </Button>
      </Box>

      {/* //*----------------------------------------------------------------*/}
      {/* //* Show collection array.                                         */}
      {/* //*----------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px" }}>
        <Chip label="Collection" />
      </Divider>

      <Grid container spacing={2}>
        {collectionArray.map(function (element) {
          // console.log("element: ", element);

          return (
            <Grid item width={"180px"} key={getUniqueKey()}>
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
                    onClick={async () => {
                      try {
                        await rentMarket.current.unregisterCollection(
                          element.collectionAddress
                        );
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
};

export default Collection;
