import React from "react";
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
import { RentMarket } from "rent-market";
import { Metamask } from "rent-market";
import { ConnectStatus } from "rent-market";

const Token = ({
  rentMarketAddress,
  nftAddress,
  inputTokenArray,
  inputRentMarket,
  inputBlockchainNetwork,
}) => {
  //----------------------------------------------------------------------------
  // Handle text input change.
  //----------------------------------------------------------------------------
  const [formValue, setFormValue] = React.useState({
    tokenAddress: "",
    tokenName: "",
  });
  const { tokenAddress, tokenName } = formValue;

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
  const rentMarket = React.useRef();

  //----------------------------------------------------------------------------
  // Data list.
  //----------------------------------------------------------------------------
  const [tokenArray, setTokenArray] = React.useState([]);

  //----------------------------------------------------------------------------
  // Initialize data.
  //----------------------------------------------------------------------------
  React.useEffect(() => {
    console.log("React.useEffect");
    if (inputTokenArray && inputRentMarket) {
      console.log("Set from argument");
      setTokenArray(inputTokenArray);
      rentMarket.current = inputRentMarket;
    } else {
      // TODO: Handle later.
      // console.log("Set from new class");
      // const initRentMarket = async () => {
      //   rentMarket.current = new RentMarket(
      //     rentMarketAddress,
      //     nftAddress,
      //     inputBlockchainNetwork,
      //     onEventFunc
      //   );
      //   await rentMarket.current.initializeAll();
      //   await onEventFunc();
      // };
      // // 1. Fetch token, service, request/register data, and rent data to interconnect them.
      // initRentMarket().catch(console.error);
    }
  }, [inputTokenArray, inputRentMarket]);

  const onEventFunc = async () => {
    // Set data list.
    setTokenArray(rentMarket.current.tokenArray);
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
      <Metamask blockchainNetwork={inputBlockchainNetwork} />

      {/*--------------------------------------------------------------------*/}
      {/* 2. Show request register token. */}
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
          label="Token Address"
          name="tokenAddress"
          value={tokenAddress}
          onChange={handleChange}
        />
        <p />
        <TextField
          fullWidth
          required
          id="outlined"
          label="Token Name"
          variant="outlined"
          name="tokenName"
          value={tokenName}
          onChange={handleChange}
        />
      </Box>
      <p />
      <Button
        variant="contained"
        onClick={() => {
          rentMarket.current.registerToken(tokenAddress, tokenName);
        }}
      >
        Register
      </Button>

      {/*--------------------------------------------------------------------*/}
      {/* 3. Show tokenArray. */}
      {/*--------------------------------------------------------------------*/}
      <p />
      <Divider>
        <Chip label="Token" />
      </Divider>
      <p />
      <Grid container spacing={2}>
        {tokenArray.map(function (element) {
          // console.log("element: ", element);

          return (
            <Grid item key={element.key}>
              <Card sx={{ maxWidth: 345 }}>
                {/* <CardMedia
                  component="img"
                  alt="image"
                  height="140"
                  image={element.image}
                /> */}
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {element.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {element.tokenAddress.substring(0, 5)}…
                    {element.tokenAddress.substring(
                      element.tokenAddress.length - 4
                    )}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => {
                      rentMarket.current.unregisterToken(element);
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
      {/*--------------------------------------------------------------------*/}
    </div>
  );
};

export default Token;
