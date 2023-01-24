import React from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Divider,
  Chip,
  TextField,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  RentMarket,
  Metamask,
  AlertSeverity,
  ConnectStatus,
  shortenAddress,
  RBSnackbar,
} from "rent-market";

const Collection = ({
  inputCollectionArray,
  inputRentMarket,
  blockchainNetwork,
}) => {
  //----------------------------------------------------------------------------
  // Handle text input change.
  //----------------------------------------------------------------------------
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

  //----------------------------------------------------------------------------
  // Handle toast mesage.
  //----------------------------------------------------------------------------
  const [snackbarValue, setSnackbarValue] = React.useState({
    snackbarSeverity: AlertSeverity.info,
    snackbarMessage: "",
    snackbarTime: new Date(),
    snackbarOpen: true,
  });
  const { snackbarSeverity, snackbarMessage, snackbarTime, snackbarOpen } =
    snackbarValue;

  //----------------------------------------------------------------------------
  // Define rent market class.
  //----------------------------------------------------------------------------
  const rentMarket = React.useRef();

  //----------------------------------------------------------------------------
  // Data list.
  //----------------------------------------------------------------------------
  const [collectionArray, setCollectionArray] = React.useState([]);

  //----------------------------------------------------------------------------
  // Initialize data.
  //----------------------------------------------------------------------------
  React.useEffect(() => {
    // console.log("React.useEffect");
    if (inputRentMarket) {
      // console.log(
      //   "rentMarket.current is made from input inputRentMarket: ",
      //   inputRentMarket
      // );
      getCollectionMetadata(inputCollectionArray);
      rentMarket.current = inputRentMarket;
    } else {
      // TODO: Handle later.
      // const initRentMarket = async () => {
      //   rentMarket.current = new RentMarket(
      //     rentMarketAddress,
      //     nftAddress,
      //     blockchainNetwork,
      //     onEventFunc
      //   );
      //   await rentMarket.current.initializeAll();
      //   await onEventFunc();
      // };
      // // 1. Fetch token, collection, request/register data, and rent data to interconnect them.
      // initRentMarket().catch(console.error);
    }
  }, [inputCollectionArray, inputRentMarket]);

  const onEventFunc = async () => {
    // Set data list.
    await getCollectionMetadata(rentMarket.current.collectionArray);
  };

  const getCollectionMetadata = async (collections) => {
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
  };

  return (
    <div>
      {/*--------------------------------------------------------------------*/}
      {/* 1. Show metamask. */}
      {/*--------------------------------------------------------------------*/}
      <p />
      <Divider>
        <Chip label="Metamask" />
      </Divider>
      <p />
      <Metamask blockchainNetwork={blockchainNetwork} />

      {/*--------------------------------------------------------------------*/}
      {/* 2. Show request register collection. */}
      {/*--------------------------------------------------------------------*/}
      <p />
      <Divider>
        <Chip label="Input" />
      </Divider>
      <p />
      <Box
        sx={{
          width: 500,
          maxWidth: "100%",
        }}
      >
        <TextField
          fullWidth
          required
          id="outlined"
          label="Collection Address"
          name="collectionAddress"
          value={collectionAddress}
          onChange={handleChange}
        />
        <p />
        <TextField
          fullWidth
          required
          id="outlined"
          label="Collection Uri"
          variant="outlined"
          name="collectionUri"
          value={collectionUri}
          onChange={handleChange}
        />
      </Box>
      <p />
      <Button
        variant="contained"
        onClick={async () => {
          try {
            await rentMarket.current.registerCollection(
              collectionAddress,
              collectionUri
            );
          } catch (error) {
            console.error(error);
            setSnackbarValue({
              snackbarSeverity: AlertSeverity.error,
              snackbarMessage: error.reason,
              snackbarTime: new Date(),
              snackbarOpen: true,
            });
          }

          // TODO: Show a success toast message.
          // setSnackbarValue({
          //   snackbarSeverity: AlertSeverity.info,
          //   snackbarMessage: "Make transaction for registering collection.",
          //   snackbarTime: new Date(),
          //   snackbarOpen: true,
          // });
        }}
      >
        Register
      </Button>

      {/*--------------------------------------------------------------------*/}
      {/* 3. Show collectionArray. */}
      {/*--------------------------------------------------------------------*/}
      <p />
      <Divider>
        <Chip label="Collection" />
      </Divider>
      <p />
      <Grid container spacing={2}>
        {collectionArray.map(function (element) {
          // console.log("element: ", element);

          return (
            <Grid item key={element.key}>
              <Card sx={{ maxWidth: 345 }}>
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
                    {shortenAddress({
                      address: element.collectionAddress,
                      number: 4,
                    })}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={async () => {
                      try {
                        await rentMarket.current.unregisterCollection(
                          element.collectionAddress
                        );
                      } catch (error) {
                        console.error(error);
                        setSnackbarValue({
                          snackbarSeverity: AlertSeverity.error,
                          snackbarMessage: error.reason,
                          snackbarTime: new Date(),
                          snackbarOpen: true,
                        });
                      }

                      setSnackbarValue({
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
      <RBSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        currentTime={snackbarTime}
      />
    </div>
  );
};

export default Collection;
