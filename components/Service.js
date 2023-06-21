import React from "react";
import axios from "axios";
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
  RBSnackbar,
  AlertSeverity,
  shortenAddress,
  writeToastMessageState,
  getUniqueKey,
} from "@/components/RentContentUtil";

export default function Service({
  inputServiceArray,
  inputRentMarket,
  blockchainNetwork,
}) {
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
  //* Define rent market class.
  //*---------------------------------------------------------------------------
  const rentMarketRef = React.useRef();

  //*---------------------------------------------------------------------------
  //* Data list.
  //*---------------------------------------------------------------------------
  const [serviceArray, setServiceArray] = React.useState([]);

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
  //* Initialize data.
  //*---------------------------------------------------------------------------
  React.useEffect(() => {
    // console.log("React.useEffect");
    if (inputServiceArray && inputRentMarket) {
      // console.log("Set from argument");
      // setServiceArray(inputServiceArray);
      getServiceMetadata(inputServiceArray);
      rentMarketRef.current = inputRentMarket;
    }
  }, [inputServiceArray, inputRentMarket]);

  async function getServiceMetadata(services) {
    if (services == undefined) {
      return;
    }

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
  }

  return (
    <div>
      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show request register service.                                  */}
      {/*//*-----------------------------------------------------------------*/}
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
              setWriteToastMessage({
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

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show service array.                                             */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px" }}>
        <Chip label="Service" />
      </Divider>

      <Grid container spacing={2}>
        {serviceArray.map(function (element) {
          // console.log("element: ", element);

          return (
            <Grid item width={"45%"} key={getUniqueKey()}>
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
                  <Typography variant="body2" color="text.secondary">
                    <Typography noWrap>
                      Uri:
                      <Link href={element.uri} target="_blank">
                        {element.uri}
                      </Link>
                    </Typography>
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
                        setWriteToastMessage({
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
    </div>
  );
}
