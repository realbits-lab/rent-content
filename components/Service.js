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
} from "@mui/material";
import {
  RentMarket,
  Metamask,
  ConnectStatus,
  RBSnackbar,
  AlertSeverity,
  shortenAddress,
} from "rent-market";

const Service = ({
  rentMarketAddress,
  nftAddress,
  inputServiceArray,
  inputRentMarket,
  blockchainNetwork,
}) => {
  //----------------------------------------------------------------------------
  // Handle text input change.
  //----------------------------------------------------------------------------
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

  //----------------------------------------------------------------------------
  // Define rent market class.
  //----------------------------------------------------------------------------
  const rentMarketRef = React.useRef();

  //----------------------------------------------------------------------------
  // Data list.
  //----------------------------------------------------------------------------
  const [serviceArray, setServiceArray] = React.useState([]);

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
  // Initialize data.
  //----------------------------------------------------------------------------
  React.useEffect(() => {
    // console.log("React.useEffect");
    if (inputServiceArray && inputRentMarket) {
      // console.log("Set from argument");
      // setServiceArray(inputServiceArray);
      getServiceMetadata(inputServiceArray);
      rentMarketRef.current = inputRentMarket;
    } else {
      // TODO: Handle later.
      // // console.log("Set from new class");
      // const initRentMarket = async () => {
      //   rentMarketRef.current = new RentMarket(
      //     rentMarketAddress,
      //     nftAddress,
      //     blockchainNetwork,
      //     onEventFunc
      //   );
      //   await rentMarketRef.current.initializeAll();
      //   await onEventFunc();
      // };
      // // 1. Fetch token, service, request/register data, and rent data to interconnect them.
      // initRentMarket().catch(console.error);
    }
  }, [inputServiceArray, inputRentMarket]);

  const onEventFunc = async () => {
    // Set data list.
    // setServiceArray(rentMarketRef.current.serviceArray);
    await getServiceMetadata(rentMarketRef.current.serviceArray);
  };

  const getServiceMetadata = async (services) => {
    const serviceArray = await Promise.all(
      services.map(async (service) => {
        // console.log("service: ", service);
        const response = await axios.get(service.uri);
        // console.log("response: ", response);
        return {
          key: service.key,
          serviceAddress: service.serviceAddress,
          uri: service.uri,
          name: response.data.name,
          description: response.data.description,
          image: response.data.image,
        };
      })
    );
    // console.log("serviceArray: ", serviceArray);
    setServiceArray(serviceArray);
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
      {/* 2. Show request register service. */}
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
          label="Service Address"
          name="serviceAddress"
          value={serviceAddress}
          onChange={handleChange}
        />
        <p />
        <TextField
          fullWidth
          required
          id="outlined"
          label="Service Uri"
          variant="outlined"
          name="serviceUri"
          value={serviceUri}
          onChange={handleChange}
        />
      </Box>
      <p />
      <Button
        variant="contained"
        onClick={async () => {
          try {
            await rentMarketRef.current.registerService(
              serviceAddress,
              serviceUri
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
        }}
      >
        Register
      </Button>

      {/*--------------------------------------------------------------------*/}
      {/* 3. Show serviceArray. */}
      {/*--------------------------------------------------------------------*/}
      <p />
      <Divider>
        <Chip label="Service" />
      </Divider>
      <p />
      <Grid container spacing={2}>
        {serviceArray.map(function (element) {
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
                    {shortenAddress(element.serviceAddress)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={async () => {
                      try {
                        await rentMarketRef.current.unregisterService(element);
                      } catch (error) {
                        console.error(error);
                        setSnackbarValue({
                          snackbarSeverity: AlertSeverity.error,
                          snackbarMessage: error.reason,
                          snackbarTime: new Date(),
                          snackbarOpen: true,
                        });
                      }
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

export default Service;
