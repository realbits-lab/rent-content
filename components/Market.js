import * as React from "react";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Avatar from "@mui/material/Avatar";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import useTheme from "@mui/material/useTheme";
import { Metamask } from "rent-market";
import {
  changeIPFSToGateway,
  AlertSeverity,
  RBSnackbar,
  RBSize,
  shortenAddress,
  getUniqueKey,
  getErrorDescription,
} from "./RentContentUtil";

const Market = ({
  inputRentMarket,
  inputCollectionArray,
  inputServiceAddress,
  inputRegisterNFTArray,
  inputBlockchainNetwork,
}) => {
  const theme = useTheme();

  // * -------------------------------------------------------------------------
  // * Define copied local varialbe from input data.
  // * -------------------------------------------------------------------------
  const rentMarketRef = React.useRef();
  const [collectionArray, setCollectionArray] = React.useState([]);
  const [serviceAddress, setServiceAddress] = React.useState("");
  const [registerNFTArray, setRegisterNFTArray] = React.useState([]);
  const [blockchainNetwork, setBlockchainNetwork] = React.useState("");

  // * -------------------------------------------------------------------------
  // * Define collection array data.
  // * -------------------------------------------------------------------------
  const [collectionMetadata, setCollectionMetadata] = React.useState({
    collectionAddress: "",
    collectionName: "",
    collectionDescription: "",
    collectionImage: "",
  });
  const {
    collectionAddress,
    collectionName,
    collectionDescription,
    collectionImage,
  } = collectionMetadata;
  const handleListCollectionClick = (element) => {
    setCollectionMetadata({
      collectionAddress: element.collectionAddress,
      collectionName: element.metadata ? element.metadata.name : "n/a",
      collectionDescription: element.metadata
        ? element.metadata.description
        : "n/a",
      collectionImage: element.metadata ? element.metadata.image : "",
    });
  };

  // * -------------------------------------------------------------------------
  // * Define toast data.
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
    // console.log("call React.useEffect()");
    // console.log("inputRentMarket: ", inputRentMarket);
    // console.log("inputCollectionArray: ", inputCollectionArray);
    // console.log("inputServiceAddress: ", inputServiceAddress);
    // console.log("inputRegisterNFTArray: ", inputRegisterNFTArray);
    // console.log("inputBlockchainNetwork: ", inputBlockchainNetwork);

    if (inputRentMarket) {
      rentMarketRef.current = inputRentMarket;
    }
    if (Array.isArray(inputCollectionArray) === true) {
      setCollectionArray(inputCollectionArray);
      if (inputCollectionArray.length > 0) {
        handleListCollectionClick(inputCollectionArray[0]);
      }
    }
    if (
      typeof inputServiceAddress === "string" ||
      inputServiceAddress instanceof String
    ) {
      setServiceAddress(inputServiceAddress);
    }
    if (Array.isArray(inputRegisterNFTArray) === true) {
      setRegisterNFTArray(inputRegisterNFTArray);
    }
    if (
      typeof inputBlockchainNetwork === "string" ||
      inputBlockchainNetwork instanceof String
    ) {
      setBlockchainNetwork(inputBlockchainNetwork);
    }
  }, [
    inputRentMarket,
    inputCollectionArray,
    inputServiceAddress,
    inputRegisterNFTArray,
    inputBlockchainNetwork,
  ]);

  const buildRowList = ({ element }) => {
    // console.log("rowKey: ", rowKey);
    // console.log("element: ", element);

    return (
      <TableRow
        key={getUniqueKey()}
        sx={{
          "&:hover": {
            backgroundColor: theme.palette.success.light,
          },
          "&:hover .MuiTableCell-root": {
            color: "white",
          },
        }}
      >
        <TableCell align="center">
          <Avatar
            alt="image"
            src={
              element.metadata
                ? changeIPFSToGateway(element.metadata.image)
                : ""
            }
            sx={{ width: RBSize.big, height: RBSize.big }}
          />
        </TableCell>
        <TableCell align="center">
          {element.metadata ? element.metadata.name : "n/a"}
        </TableCell>
        <TableCell align="center">
          {element.rentFee / Math.pow(10, 18)}
        </TableCell>
        <TableCell align="center">{element.rentDuration}</TableCell>
        <TableCell align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={async () => {
              console.log("call onClick()");
              // const testMessage =
              //   '[ethjs-query] while formatting outputs from RPC \'{"value":{"code":-32603,"data":{"code":-32603,"message":"Error: VM Exception while processing transaction: reverted with reason string \'RM9\'","data":{"message":"Error: VM Exception while processing transaction: reverted with reason string \'RM9\'","txHash":"0x14cdec3dbaaa5ab97fcf2524c28bc0acd482a4e1131deedc53ef441c1ba4a8a1","data":"0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003524d390000000000000000000000000000000000000000000000000000000000"}}}}\'';
              // let regex = new RegExp(
              //   "while formatting outputs from RPC '(.*)'"
              // );
              // let match = regex.exec(testMessage);
              // console.log("match[1]: ", match[1]);
              // let messageJson = JSON.parse(match[1]);
              // console.log("messageJson: ", messageJson);
              // console.log(
              //   "messageJson.value.data.message: ",
              //   messageJson.value.data.message
              // );

              // regex = new RegExp(
              //   "Error: VM Exception while processing transaction: reverted with reason string '(.*)'"
              // );
              // match = regex.exec(messageJson.value.data.message);
              // console.log("match[1]: ", match[1]);
              // return;

              // console.log("serviceAddress: ", serviceAddress);
              // TODO: Handle metamask internal error and rent market contract error code.
              try {
                await rentMarketRef.current.rentNFT(element, serviceAddress);
              } catch (error) {
                // console.log("catch error: ", error);
                let message = error.reason || error.message || error;

                if (error.message) {
                  // const testMessage =
                  //   '[ethjs-query] while formatting outputs from RPC \'{"value":{"code":-32603,"data":{"code":-32603,"message":"Error: VM Exception while processing transaction: reverted with reason string \'RM9\'","data":{"message":"Error: VM Exception while processing transaction: reverted with reason string \'RM9\'","txHash":"0x14cdec3dbaaa5ab97fcf2524c28bc0acd482a4e1131deedc53ef441c1ba4a8a1","data":"0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003524d390000000000000000000000000000000000000000000000000000000000"}}}}\'';
                  let regex = new RegExp(
                    "while formatting outputs from RPC '(.*)'"
                  );
                  let match = regex.exec(error.message);
                  // console.log("match: ", match);

                  if (match !== null && match.length == 2) {
                    // console.log("match[1]: ", match[1]);
                    let messageJson = JSON.parse(match[1]);
                    // console.log("messageJson: ", messageJson);
                    // console.log(
                    //   "messageJson.value.data.message: ",
                    //   messageJson.value.data.message
                    // );

                    regex = new RegExp(
                      "Error: VM Exception while processing transaction: reverted with reason string '(.*)'"
                    );
                    match = regex.exec(messageJson.value.data.message);
                    if (match !== null && match.length == 2) {
                      // console.log("match[1]: ", match[1]);
                      message = getErrorDescription({ errorString: match[1] });
                      // console.log("message: ", message);
                    }
                  }
                }

                // console.error(error);
                setSnackbarValue({
                  snackbarSeverity: AlertSeverity.error,
                  snackbarMessage: message,
                  snackbarTime: new Date(),
                  snackbarOpen: true,
                });
              }
              console.log("done onClick()");
            }}
          >
            RENT
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  const buildCollectionMetadataCard = () => {
    if (collectionArray.length === 0) {
      return (
        <Card sx={{ display: "flex" }}>
          <Skeleton
            variant="rounded"
            width={RBSize.double}
            height={RBSize.double}
          />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flex: "1 0 auto" }}>
              <Typography component="div" variant="h6">
                <Skeleton variant="rounded" width={200} height={10} />
              </Typography>
              <p />
              <Typography>
                <Skeleton variant="rounded" width={200} height={10} />
              </Typography>
              <p />
              <Typography>
                <Skeleton variant="rounded" width={200} height={10} />
              </Typography>
            </CardContent>
          </Box>
        </Card>
      );
    } else {
      const url = changeIPFSToGateway(collectionImage);
      // console.log("url: ", url);
      return (
        <Card sx={{ display: "flex" }}>
          <CardMedia
            component="img"
            sx={{ width: RBSize.double }}
            image={url}
          />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flex: "1 0 auto" }}>
              <Typography component="div" variant="h6">
                {collectionName}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                component="div"
              >
                {collectionDescription}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                component="div"
              >
                {shortenAddress(collectionAddress, 5)}
              </Typography>
            </CardContent>
          </Box>
        </Card>
      );
    }
  };

  const buildNFTDataTableSkeleton = () => {
    return (
      <Table size="small" aria-label="purchases">
        <TableHead>
          <TableRow key={getUniqueKey()}>
            <TableCell align="center">Avatar</TableCell>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">
              Fee <br />
              (matic)
            </TableCell>
            <TableCell align="center">
              Duration
              <br /> (blocks)
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow key={getUniqueKey()}>
            <TableCell component="th" scope="row">
              <Skeleton
                variant="circular"
                width={RBSize.big}
                height={RBSize.big}
              />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  };

  const buildNFTDataTable = () => {
    if (collectionArray.length === 0) {
      return buildNFTDataTableSkeleton();
    } else {
      const selectedRegisterNFTArray = registerNFTArray
        .filter(
          (element) =>
            element.nftAddress === collectionAddress &&
            element.renterAddress === "0"
        )
        .map((element) => {
          // console.log("element: ", element);
          return buildRowList({
            element,
          });
        });

      return (
        <Table size="small" aria-label="purchases">
          <TableHead>
            <TableRow key={getUniqueKey()}>
              <TableCell align="center">Avatar</TableCell>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">
                Fee <br />
                (matic)
              </TableCell>
              <TableCell align="center">
                Duration
                <br /> (blocks)
              </TableCell>
              <TableCell align="center">Rent</TableCell>
            </TableRow>
          </TableHead>

          <TableBody key={getUniqueKey()}>{selectedRegisterNFTArray}</TableBody>
        </Table>
      );
    }
  };

  const buildCollectionDataTable = () => {
    return (
      <Grid item xs={10}>
        {buildCollectionMetadataCard()}
        {buildNFTDataTable()}
      </Grid>
    );
  };

  const buildCollectionGrid = () => {
    return (
      <Grid
        item
        xs={2}
        display="flex"
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Chip label="Collection" color="primary" />
        <List>
          {collectionArray.length !== 0 ? (
            collectionArray.map((element) => {
              // console.log("list collectionArray element: ", element);
              // console.log("ListItem key element.key: ", element.key);
              return (
                <ListItem key={element.key} disablePadding>
                  <ListItemButton
                    selected={collectionAddress === element.collectionAddress}
                    onClick={(event) => handleListCollectionClick(element)}
                  >
                    <Tooltip
                      title={element.metadata ? element.metadata.name : "n/a"}
                    >
                      <Avatar
                        src={element.metadata ? element.metadata.image : "n/a"}
                        variant="rounded"
                        sx={{ width: RBSize.middle, height: RBSize.middle }}
                      />
                    </Tooltip>
                  </ListItemButton>
                  <p />
                </ListItem>
              );
            })
          ) : (
            <Skeleton
              variant="rounded"
              width={RBSize.middle}
              height={RBSize.middle}
            />
          )}
        </List>
      </Grid>
    );
  };

  const buildAllCollectionTable = () => {
    // https://mui.com/material-ui/react-grid/
    // Set the direct alignment based on direction.
    // justifyContent="flex-start"
    // Set the cross alignment based on direction.
    // alignItems="flex-start"
    return (
      <Grid
        container
        spacing={2}
        display="flex"
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        {buildCollectionGrid()}
        {buildCollectionDataTable()}
      </Grid>
    );
  };

  // console.log("Build Market component.");

  return (
    <>
      {/* // * --------------------------------------------------------------*/}
      {/* // * Show metamask component.                                      */}
      {/* // * --------------------------------------------------------------*/}
      <Divider>
        <Metamask blockchainNetwork={blockchainNetwork} />
      </Divider>
      <p />

      {/* // * --------------------------------------------------------------*/}
      {/* // * Show collection array data.                                   */}
      {/* // * --------------------------------------------------------------*/}
      {buildAllCollectionTable()}

      {/* // * --------------------------------------------------------------*/}
      {/* // * Show toast message.                                           */}
      {/* // * --------------------------------------------------------------*/}
      <RBSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        currentTime={snackbarTime}
      />
    </>
  );
};

export default Market;
