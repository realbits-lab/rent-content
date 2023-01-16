import React from "react";
import { ethers } from "ethers";
import {
  useTheme,
  Grid,
  Fab,
  Divider,
  Collapse,
  Box,
  Card,
  CardMedia,
  Paper,
  IconButton,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Table,
  TableBody,
  TableCell,
  Avatar,
  TableHead,
  TableContainer,
  TableRow,
} from "@mui/material";
import { red, blue, blueGrey } from "@mui/material/colors";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Metamask } from "rent-market";
import {
  changeIPFSToGateway,
  MyMenu,
  AlertSeverity,
  RBSnackbar,
  RBSize,
  shortenAddress,
  getUniqueKey,
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
  const theme = useTheme();

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
  // * Other variables.
  // * -------------------------------------------------------------------------
  const [currentBlockNumber, setCurrentBlockNumber] = React.useState(0);

  // * -------------------------------------------------------------------------
  // * Initialize data.
  // * -------------------------------------------------------------------------
  React.useEffect(() => {
    // console.log("call React.useEffect() without condition");
  });

  React.useEffect(() => {
    // console.log("call React.useEffect() with condition");
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

    // Get and set the latest block number.
    // TODO: Change duration process from block number to block timestamp.
    let provider;
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    } catch (error) {
      console.error(error);
    }

    // console.log("provider: ", provider);

    if (provider) {
      provider.getBlockNumber().then((blockNumber) => {
        // console.log("local chain blockNumber: ", blockNumber);
        setCurrentBlockNumber(blockNumber);
      });
      provider.on("block", (blockNumber) => {
        // console.log("new block number: ", blockNumber);
        setCurrentBlockNumber(blockNumber);
      });
    }
  }, [
    selectAvatarFunc,
    inputRentMarket,
    inputCollectionArray,
    inputServiceAddress,
    inputMyRegisteredNFTArray,
    inputMyRentNFTArray,
    inputBlockchainNetwork,
  ]);

  const [openRow, setOpenRow] = React.useState(false);

  const buildNFTTableRowBody = ({ elementArray, type }) => {
    return (
      <TableBody key={getUniqueKey()}>
        {elementArray.map((element) => {
          const rentStartTimestamp = element.rentStartTimestamp
            ? element.rentStartTimestamp.toNumber()
            : 0;
          // console.log("currentBlockNumber: ", currentBlockNumber);
          // console.log(
          //   "element.rentStartTimestamp: ",
          //   element.rentStartTimestamp
          // );
          // console.log("rentStartTimestamp: ", rentStartTimestamp);
          // console.log(
          //   "element.rentDuration: ",
          //   element.rentDuration
          // );
          const currentTimeInSecond = new Date().getTime() / 1000;
          const remainTimestamp =
            rentStartTimestamp +
            parseInt(element.rentDuration) -
            // currentBlockNumber;
            currentTimeInSecond;

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
                {type === MyMenu.own ? element.rentDuration : remainTimestamp}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    );
  };

  const buildNFTTableRowHead = ({ collection, type }) => {
    return (
      <TableHead>
        <TableRow key={getUniqueKey()}>
          <TableCell align="center">Avatar</TableCell>
          <TableCell align="center">Name</TableCell>
          <TableCell align="center">
            Fee
            <br />
            (matic)
          </TableCell>
          <TableCell align="center">
            {type === MyMenu.own ? "Duration" : "Remain"}
            <br />
            (block)
          </TableCell>
        </TableRow>
      </TableHead>
    );
  };

  const buildNFTTableRow = ({ collection, elementArray, type }) => {
    return (
      <TableRow key={getUniqueKey()}>
        <TableCell
          style={{
            paddingBottom: 0,
            paddingTop: 0,
            borderBottom: 0,
          }}
          colSpan={5}
        >
          {/* TODO: Handle collapse later. */}
          {/* <Collapse in={openRow} timeout="auto" unmountOnExit>
          <Box> */}
          <Table size="small" aria-label="purchases">
            {buildNFTTableRowHead({ collection, type })}
            {buildNFTTableRowBody({ elementArray, type })}
          </Table>
          {/* </Box>
          </Collapse> */}
        </TableCell>
      </TableRow>
    );
  };

  const buildCollectionTableRow = ({ collection }) => {
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
                  {shortenAddress(collection.collectionAddress, 5)}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        </TableCell>
      </TableRow>
    );
  };

  const buildCollapseMyTable = ({ collection, elementArray, type }) => {
    // 1. Check element length, if 0, don't show table.
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
  };

  const buildNFTTable = () => {
    return (
      <TableContainer>
        <Table aria-label="collapsible table">
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

            return buildCollapseMyTable({
              collection: element,
              elementArray: elementArray,
              type: type,
            });
          })}
        </Table>
      </TableContainer>
    );
  };

  const buildLeftMenu = () => {
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
  };

  // console.log("Build My component.");

  return (
    <div>
      <Divider>
        <Metamask blockchainNetwork={blockchainNetwork} />
      </Divider>
      <p />

      <Grid container spacing={2}>
        <Grid item xs={2}>
          {buildLeftMenu()}
        </Grid>
        <Grid item xs={10}>
          {buildNFTTable()}
        </Grid>
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
