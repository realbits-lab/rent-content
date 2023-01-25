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
import { RBSnackbar, AlertSeverity, shortenAddress } from "rent-market";

const Service = ({ inputServiceArray, inputRentMarket, blockchainNetwork }) => {
  // * -------------------------------------------------------------------------
  // * Handle text input change.
  // * -------------------------------------------------------------------------
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

  // * -------------------------------------------------------------------------
  // * Define rent market class.
  // * -------------------------------------------------------------------------
  const rentMarketRef = React.useRef();

  // * -------------------------------------------------------------------------
  // * Data list.
  // * -------------------------------------------------------------------------
  const [serviceArray, setServiceArray] = React.useState([]);

  // * -------------------------------------------------------------------------
  // * Handle toast mesage.
  // * -------------------------------------------------------------------------
  const [snackbarValue, setSnackbarValue] = React.useState({
    snackbarSeverity: AlertSeverity.info,
    snackbarMessage: "",
    snackbarTime: new Date(),
    snackbarOpen: true,
  });
  const { snackbarSeverity, snackbarMessage, snackbarTime, snackbarOpen } =
    snackbarValue;

  // * -------------------------------------------------------------------------
  // * Initialize data.
  // * -------------------------------------------------------------------------
  React.useEffect(() => {
    // console.log("React.useEffect");
    if (inputServiceArray && inputRentMarket) {
      // console.log("Set from argument");
      // setServiceArray(inputServiceArray);
      getServiceMetadata(inputServiceArray);
      rentMarketRef.current = inputRentMarket;
    }
  }, [inputServiceArray, inputRentMarket]);

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
      {/* // * --------------------------------------------------------------*/}
      {/* // * Show request register service.                                */}
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
          margin={"normal"}
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
      </Box>

      {/* // * --------------------------------------------------------------*/}
      {/* // * Show service array.                                           */}
      {/* // * --------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px" }}>
        <Chip label="Service" />
      </Divider>

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
                    {shortenAddress({ address: element.serviceAddress })}
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
