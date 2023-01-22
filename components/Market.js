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
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import { Metamask } from "rent-market";
import {
  changeIPFSToGateway,
  AlertSeverity,
  RBSnackbar,
  RBSize,
  shortenAddress,
  getUniqueKey,
  getErrorDescription,
  getChainName,
} from "./RentContentUtil";

const Market = ({
  inputRentMarketClass,
  inputCollectionArray,
  inputServiceAddress,
  inputRegisterNFTArray,
  inputBlockchainNetwork,
}) => {
  const theme = useTheme();

  // * -------------------------------------------------------------------------
  // * Define copied local varialbe from input data.
  // * -------------------------------------------------------------------------
  const rentMarketClassRef = React.useRef();
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
  // * Define pagination data.
  // * -------------------------------------------------------------------------
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // * -------------------------------------------------------------------------
  // * Initialize data.
  // * -------------------------------------------------------------------------
  React.useEffect(() => {
    // console.log("call React.useEffect()");
    // console.log("inputRentMarketClass: ", inputRentMarketClass);
    // console.log("inputCollectionArray: ", inputCollectionArray);
    // console.log("inputServiceAddress: ", inputServiceAddress);
    // console.log("inputRegisterNFTArray: ", inputRegisterNFTArray);
    // console.log("inputBlockchainNetwork: ", inputBlockchainNetwork);

    if (inputRentMarketClass) {
      rentMarketClassRef.current = inputRentMarketClass;
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
    inputRentMarketClass,
    inputCollectionArray,
    inputServiceAddress,
    inputRegisterNFTArray,
    inputBlockchainNetwork,
  ]);

  function buildRowList({ element }) {
    // console.log("call buildRowList()");
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
        <TableCell align="center">{element.rentDuration.toNumber()}</TableCell>
        <TableCell align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={async () => {
              // console.log("call onClick()");
              // console.log(
              //   "rentMarketClassRef.current: ",
              //   rentMarketClassRef.current
              // );
              // console.log("serviceAddress: ", serviceAddress);
              try {
                await rentMarketClassRef.current.rentNFT(
                  element,
                  serviceAddress
                );
              } catch (error) {
                // console.log("error: ", error);

                let message = error.data
                  ? error.data.message
                  : error.reason || error.message || error || "";

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
              // console.log("done onClick()");
            }}
          >
            RENT
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  function buildCollectionMetadataCard() {
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
      // console.log("inputBlockchainNetwork: ", inputBlockchainNetwork);
      let openseaMode;
      if (getChainName({ chainId: inputBlockchainNetwork }) === "matic") {
        openseaMode = "opensea_matic";
      } else if (
        getChainName({ chainId: inputBlockchainNetwork }) === "maticmum"
      ) {
        openseaMode = "opensea_maticmum";
      } else {
        openseaMode = "";
      }

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
                OpenSea:{" "}
                {shortenAddress({
                  address: collectionAddress,
                  number: 5,
                  withLink: openseaMode,
                })}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                component="div"
              >
                PolygonScan :{" "}
                {shortenAddress({
                  address: collectionAddress,
                  number: 5,
                  withLink: "maticscan",
                })}
              </Typography>
            </CardContent>
          </Box>
        </Card>
      );
    }
  }

  function buildNFTDataTableSkeleton() {
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
  }

  function buildNFTDataTable() {
    if (collectionArray.length === 0) {
      return buildNFTDataTableSkeleton();
    } else {
      const selectedRegisterNFTArray = registerNFTArray.filter(
        (element) =>
          element.nftAddress === collectionAddress &&
          element.renterAddress === "0"
      );

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

          <TableBody key={getUniqueKey()}>
            {selectedRegisterNFTArray
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((element) => {
                // console.log("element: ", element);
                return buildRowList({
                  element,
                });
              })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePageComponent
                selectedRegisterNFTArray={selectedRegisterNFTArray}
              />
            </TableRow>
          </TableFooter>
        </Table>
      );
    }
  }

  function buildCollectionDataTable() {
    return (
      <Grid item xs={10}>
        {buildCollectionMetadataCard()}
        {buildNFTDataTable()}
      </Grid>
    );
  }

  function buildCollectionGrid() {
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
  }

  function buildAllCollectionTable() {
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
  }

  function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
      onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
      onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
      onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
      // <Box sx={{ flexShrink: 1, ml: 2.5 }}>
      <Box sx={{ display: "inline-flex" }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </Box>
    );
  }

  function TablePageComponent({ selectedRegisterNFTArray }) {
    // console.log("call TablePageComponent()");
    // console.log("page: ", page);
    // console.log("rowsPerPage: ", rowsPerPage);

    return (
      <TablePagination
        key={getUniqueKey()}
        rowsPerPageOptions={[5, 10, 25]}
        count={selectedRegisterNFTArray.length}
        page={page}
        rowsPerPage={rowsPerPage}
        SelectProps={{
          inputProps: {
            "aria-label": "rows per page",
          },
          native: true,
        }}
        onPageChange={(event, newPage) => {
          setPage((prevState) => {
            return newPage;
          });
        }}
        onRowsPerPageChange={(event) => {
          setRowsPerPage((prevState) => {
            return parseInt(event.target.value, 10);
          });
          setPage((prevState) => {
            return 0;
          });
        }}
        ActionsComponent={TablePaginationActions}
      />
    );
  }

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
