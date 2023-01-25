import React from "react";
import moment from "moment";
import { useWeb3ModalNetwork } from "@web3modal/react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TablePagination from "@mui/material/TablePagination";
import Avatar from "@mui/material/Avatar";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";
import { useTheme } from "@mui/material/styles";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import {
  changeIPFSToGateway,
  MyMenu,
  AlertSeverity,
  RBSnackbar,
  RBSize,
  shortenAddress,
  getUniqueKey,
  getChainName,
} from "./RentContentUtil";

const My = ({
  selectAvatarFunc,
  inputRentMarket,
  inputCollectionArray,
  inputServiceAddress,
  inputMyRegisteredNFTArray,
  inputMyRentNFTArray,
  inputBlockchainNetwork,
}) => {
  // * -------------------------------------------------------------------------
	// * Hook variables.
  // * -------------------------------------------------------------------------
  const theme = useTheme();
  const { selectedChain, setSelectedChain } = useWeb3ModalNetwork();
  // console.log("selectedChain: ", selectedChain);

  // * -------------------------------------------------------------------------
  // * Define copied local varialbe from input data.
  // * -------------------------------------------------------------------------
  const rentMarketRef = React.useRef();
  const [collectionArray, setCollectionArray] = React.useState([]);
  const [serviceAddress, setServiceAddress] = React.useState("");
  const [myRegisteredNFTArray, setMyRegisteredNFTArray] = React.useState([]);
  const [myRentNFTArray, setMyRentNFTArray] = React.useState([]);
  const [blockchainNetwork, setBlockchainNetwork] = React.useState("");

  // * -------------------------------------------------------------------------
  // * Handle selected collection.
  // * Default is own menu.
  // * -------------------------------------------------------------------------
  const [selectedItem, setSelectedItem] = React.useState(MyMenu.own);
  const [myNftStatus, setMyNftStatus] = React.useState({
    myNftType: MyMenu.own,
    myNftDescription: "These are my own NFTs.",
  });
  const { myNftType, myNftDescription } = myNftStatus;
  const handleListItemClick = (event, item) => {
    setSelectedItem(item);
    if (item === MyMenu.own) {
      setMyNftStatus({
        myNftType: MyMenu.own,
        myNftDescription: "These are my own NFTs.",
      });
    } else {
      setMyNftStatus({
        myNftType: MyMenu.rent,
        myNftDescription: "These are my rent NFTs.",
      });
    }
  };

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
  // * Table pagination data.
  // * -------------------------------------------------------------------------
  const [page, setPage] = React.useState([]);
  const [rowsPerPage, setRowsPerPage] = React.useState([]);

  // * -------------------------------------------------------------------------
  // * Initialize data.
  // * -------------------------------------------------------------------------
  React.useEffect(() => {
    // console.log("call React.useEffect()");
    // console.log("inputRentMarket: ", inputRentMarket);
    // console.log("inputCollectionArray: ", inputCollectionArray);
    // console.log("inputServiceAddress: ", inputServiceAddress);
    // console.log("inputMyRegisteredNFTArray: ", inputMyRegisteredNFTArray);
    // console.log("inputMyRentNFTArray: ", inputMyRentNFTArray);
    // console.log("inputBlockchainNetwork: ", inputBlockchainNetwork);

    if (inputRentMarket) {
      setMyRentNFTArray(inputMyRentNFTArray);
      rentMarketRef.current = inputRentMarket;
    }

    if (Array.isArray(inputCollectionArray) === true) {
      // TODO: Handle the collection.metadata undefined case.
      setCollectionArray(inputCollectionArray);
    }

    if (
      typeof inputServiceAddress === "string" ||
      inputServiceAddress instanceof String
    ) {
      setServiceAddress(inputServiceAddress);
    }

    if (Array.isArray(inputMyRegisteredNFTArray) === true) {
      setMyRegisteredNFTArray(inputMyRegisteredNFTArray);
    }

    if (Array.isArray(inputMyRentNFTArray) === true) {
      setMyRentNFTArray(inputMyRentNFTArray);
    }

    if (
      typeof inputBlockchainNetwork === "string" ||
      inputBlockchainNetwork instanceof String
    ) {
      setBlockchainNetwork(inputBlockchainNetwork);
    }

    // * Initialize page and rowsPerPage array.
    page.splice(0, page.length);
    rowsPerPage.splice(0, rowsPerPage.length);

    page.push({
      mode: MyMenu.own,
      page: 0,
    });
    page.push({
      mode: MyMenu.rent,
      page: 0,
    });
    rowsPerPage.push({
      mode: MyMenu.own,
      rowsPerPage: 5,
    });
    rowsPerPage.push({
      mode: MyMenu.rent,
      rowsPerPage: 5,
    });
  }, [
    selectAvatarFunc,
    inputRentMarket,
    inputRentMarket.rentMarketContract,
    inputCollectionArray,
    inputServiceAddress,
    inputMyRegisteredNFTArray,
    inputMyRentNFTArray,
    inputBlockchainNetwork,
    selectedChain,
  ]);

  function buildNftTableRowBody({ elementArray, type }) {
    // console.log("call buildNftTableRowBody()");

    const tablePage = page.find((e) => e.mode === myNftStatus.myNftType).page;
    const tableRowsPerPage = rowsPerPage.find(
      (e) => e.mode === myNftStatus.myNftType
    ).rowsPerPage;
    // console.log("tablePagae: ", tablePage);
    // console.log("tableRowsPerPage: ", tableRowsPerPage);

    return (
      <TableBody key={getUniqueKey()}>
        {elementArray
          .slice(
            tablePage * tableRowsPerPage,
            tablePage * tableRowsPerPage + tableRowsPerPage
          )
          .map((element) => {
            const rentStartTimestamp = element.rentStartTimestamp
              ? element.rentStartTimestamp.toNumber()
              : 0;

            // * Get rent duration display string for own case.
            const durationTimestampDisplay = `${moment
              .unix(element.rentDuration.toNumber())
              .diff(0, "days", true)} day`;
            // console.log("durationTimestampDisplay: ", durationTimestampDisplay);

            // * Get end rent time display string for rent case.
            const endRentTimestamp =
              rentStartTimestamp + element.rentDuration.toNumber();
            // console.log("endRentTimestamp: ", endRentTimestamp);
            const currentTimestamp = new Date().getTime() / 1000;
            let endRentTimestampDisplay;
            if (currentTimestamp >= endRentTimestamp) {
              endRentTimestampDisplay = "finished";
            } else {
              endRentTimestampDisplay = moment
                .unix(endRentTimestamp)
                .fromNow(true);
            }
            // console.log("currentTimestamp: ", currentTimestamp);
            // console.log("endRentTimestampDisplay: ", endRentTimestampDisplay);

            return (
              <TableRow
                key={getUniqueKey()}
                onClick={(event) => {
                  if (selectAvatarFunc) {
                    selectAvatarFunc(element);
                  }

                  setSnackbarValue({
                    snackbarSeverity: AlertSeverity.info,
                    snackbarMessage: `You select ${
                      element.metadata ? element.metadata.name : "..."
                    } avatar.`,
                    snackbarTime: new Date(),
                    snackbarOpen: true,
                  });
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: theme.palette.success.light,
                  },
                  "&:hover .MuiTableCell-root": {
                    color: "white",
                  },
                }}
                style={{
                  cursor: "pointer",
                }}
              >
                <TableCell align="center" style={{ borderColor: "#FFF7ED" }}>
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
                <TableCell align="center" style={{ borderColor: "#FFF7ED" }}>
                  {element.metadata ? element.metadata.name : "N/A"}
                </TableCell>
                <TableCell align="center" style={{ borderColor: "#FFF7ED" }}>
                  {element.rentFee / Math.pow(10, 18)}
                </TableCell>
                <TableCell align="center" style={{ borderColor: "#FFF7ED" }}>
                  {type === MyMenu.own
                    ? durationTimestampDisplay
                    : endRentTimestampDisplay}
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    );
  }

  function buildNftTableRowHead({ collection, type }) {
    return (
      <TableHead>
        <TableRow key={getUniqueKey()}>
          <TableCell align="center">Avatar</TableCell>
          <TableCell align="center">Name</TableCell>
          <TableCell align="center">Fee</TableCell>
          <TableCell align="center">Duration</TableCell>
        </TableRow>
      </TableHead>
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
      <Box spacing={0} sx={{ display: "flex", flexDirection: "row" }}>
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

  function buildNFTTableRow({ collection, elementArray, type }) {
    // console.log("call buildNFTTableRow()");
    // console.log("page: ", page);
    // console.log("rowsPerPage: ", rowsPerPage);

    const tablePage = page.find((e) => e.mode === myNftStatus.myNftType).page;
    const tableRowsPerPage = rowsPerPage.find(
      (e) => e.mode === myNftStatus.myNftType
    ).rowsPerPage;
    // console.log("tablePagae: ", tablePage);
    // console.log("tableRowsPerPage: ", tableRowsPerPage);

    return (
      <TableRow key={getUniqueKey()}>
        <TableCell
          style={{
            padding: 0,
          }}
        >
          <Table size="small">
            {buildNftTableRowHead({ collection, type })}
            {buildNftTableRowBody({ elementArray, type })}
            <TableFooter>
              <TableRow>
                <TablePagination
                  key={getUniqueKey()}
                  rowsPerPageOptions={[5, 10, 20]}
                  count={elementArray.length}
                  page={tablePage}
                  rowsPerPage={tableRowsPerPage}
                  labelRowsPerPage={""}
                  SelectProps={{
                    inputProps: {
                      "aria-label": "rows per page",
                    },
                    native: true,
                  }}
                  onPageChange={(event, newPage) => {
                    // * Discern own and rent case.
                    setPage((prevState) => {
                      const newState = prevState.map((e) => {
                        if (e.mode === myNftStatus.myNftType) {
                          return {
                            mode: e.mode,
                            page: newPage,
                          };
                        } else {
                          return e;
                        }
                      });
                      return newState;
                    });
                  }}
                  onRowsPerPageChange={(event) => {
                    // * Discern own and rent case.
                    setRowsPerPage((prevState) => {
                      const newState = prevState.map((e) => {
                        if (e.mode === myNftStatus.myNftType) {
                          return {
                            mode: e.mode,
                            rowsPerPage: parseInt(event.target.value, 10),
                          };
                        } else {
                          return e;
                        }
                      });
                      return newState;
                    });
                    setPage((prevState) => {
                      const newState = prevState.map((e) => {
                        if (e.mode === myNftStatus.myNftType) {
                          return {
                            mode: e.mode,
                            page: 0,
                          };
                        } else {
                          return e;
                        }
                      });
                      return newState;
                    });
                  }}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableCell>
      </TableRow>
    );
  }

  function buildCollectionTableRow({ collection }) {
    // console.log("call buildCollectionTableRow()");
    // console.log("collection: ", collection);

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
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
        }}
        key={getUniqueKey()}
      >
        <TableCell
          style={{
            paddingBottom: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingLeft: 0,
            borderBottom: 0,
          }}
        >
          <Card sx={{ display: "flex" }}>
            <CardMedia
              component="img"
              sx={{ width: RBSize.double }}
              image={changeIPFSToGateway(collection.metadata.image)}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: "1 0 auto" }}>
                <Typography component="div" variant="h6">
                  {collection.metadata.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="div"
                >
                  {collection.metadata.description}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="div"
                >
                  OpenSea:{" "}
                  {shortenAddress({
                    address: collection.collectionAddress,
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
                    address: collection.collectionAddress,
                    number: 5,
                    withLink: "maticscan",
                  })}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        </TableCell>
      </TableRow>
    );
  }

  function buildMyTable({ collection, elementArray, type }) {
    // console.log("call buildNftTable()");
    // console.log("collection: ", collection);
    // console.log("elementArray: ", elementArray);

    // * Check element length, if 0, don't show table.
    // TODO: Discern loading or nothing.
    if (elementArray.length == 0) {
      return (
        <TableBody key={getUniqueKey()}>
          <TableRow
            sx={{ "& > *": { borderBottom: "unset" } }}
            key={getUniqueKey()}
          >
            <TableCell sx={{ borderBottom: 0 }}>
              <Typography component="div" variant="body1">
                You do not have any contents.
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody key={getUniqueKey()}>
        {buildCollectionTableRow({ collection })}
        {buildNFTTableRow({ collection, elementArray, type })}
      </TableBody>
    );
  }

  function buildNftTable() {
    // console.log("call buildNftTable()");
    // console.log("collectionArray: ", collectionArray);

    // TODO: Change loading process bar later.
    // console.log("selectedChain: ", selectedChain);
    // console.log("selectedChain.network: ", selectedChain.network);
    // console.log(
    //   "getChainName({ chainId: inputBlockchainNetwork }): ",
    //   getChainName({ chainId: inputBlockchainNetwork })
    // );
    if (
      selectedChain.network ===
        getChainName({ chainId: inputBlockchainNetwork }) &&
      collectionArray.length === 0
    ) {
      return <Typography>loading...</Typography>;
    }

    return (
      <Table>
        {collectionArray.map((element) => {
          let elementArray = [];
          let type = MyMenu.own;

          if (selectedItem === MyMenu.own) {
            elementArray = inputMyRegisteredNFTArray.filter(
              (nftElement) =>
                nftElement.nftAddress === element.collectionAddress
            );
            type = MyMenu.own;
          } else {
            elementArray = myRentNFTArray.filter(
              (nftElement) =>
                nftElement.nftAddress === element.collectionAddress
            );
            type = MyMenu.rent;
          }

          return buildMyTable({
            collection: element,
            elementArray: elementArray,
            type: type,
          });
        })}
      </Table>
    );
  }

  function buildTopMenu() {
    return (
      <List
        sx={{
          // * Selected and (selected + hover) state.
          "&& .Mui-selected, && .Mui-selected:hover": {
            bgcolor: "green",
            "&, & .MuiListItemIcon-root": {
              color: "white",
            },
          },
          // * Normal state.
          "& .MuiListItemButton-root": {
            bgcolor: "lightgrey",
            "&, & .MuiListItemIcon-root": {
              color: "darkgrey",
            },
          },
          // * Hover state.
          "& .MuiListItemButton-root:hover": {
            bgcolor: "orange",
            "&, & .MuiListItemIcon-root": {
              color: "yellow",
            },
          },
          display: "flex",
          flexDirection: "row",
        }}
      >
        <ListItem key="own" disablePadding>
          <ListItemButton
            selected={selectedItem === MyMenu.own}
            onClick={(event) => handleListItemClick(event, MyMenu.own)}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Own
            </Typography>
          </ListItemButton>
        </ListItem>
        <ListItem key="rent" disablePadding>
          <ListItemButton
            selected={selectedItem === MyMenu.rent}
            onClick={(event) => handleListItemClick(event, MyMenu.rent)}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Rent
            </Typography>
          </ListItemButton>
        </ListItem>
      </List>
    );
  }

  return (
    <div>
      <Grid
        container
        spacing={2}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <Grid item>{buildTopMenu()}</Grid>
        <Grid item>{buildNftTable()}</Grid>
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

export default My;
