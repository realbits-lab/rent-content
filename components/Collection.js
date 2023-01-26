import React from "react";
import axios from "axios";
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
import { useRecoilStateLoadable } from "recoil";
import {
  AlertSeverity,
  writeToastMessageState,
  shortenAddress,
} from "./RentContentUtil";

const Collection = ({
  inputCollectionArray,
  inputRentMarket,
  blockchainNetwork,
}) => {
  // * -------------------------------------------------------------------------
  // * Handle text input change.
  // * -------------------------------------------------------------------------
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

  // * -------------------------------------------------------------------------
  // * Handle toast mesage.
  // * -------------------------------------------------------------------------
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

  // * -------------------------------------------------------------------------
  // * Define rent market class.
  // * -------------------------------------------------------------------------
  const rentMarket = React.useRef();

  // * -------------------------------------------------------------------------
  // * Data list.
  // * -------------------------------------------------------------------------
  const [collectionArray, setCollectionArray] = React.useState([]);

  // * -------------------------------------------------------------------------
  // * Initialize data.
  // * -------------------------------------------------------------------------
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

  return (
    <div>
      {/* // * --------------------------------------------------------------*/}
      {/* // * Show request register collection.                             */}
      {/* // * --------------------------------------------------------------*/}
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

            // TODO: Show a success toast message.
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

      {/* // * --------------------------------------------------------------*/}
      {/* // * Show collection array.                                        */}
      {/* // * --------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px" }}>
        <Chip label="Collection" />
      </Divider>

      <Grid container spacing={2}>
        {collectionArray.map(function (element) {
          // console.log("element: ", element);

          return (
            <Grid item sx={2} key={element.key}>
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
