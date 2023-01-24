import React from "react";
import moment from "moment";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Avatar from "@mui/material/Avatar";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTheme } from "@mui/material/styles";
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
  // * Initialize data.
  // * -------------------------------------------------------------------------
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
  }, [
    selectAvatarFunc,
    inputRentMarket,
    inputCollectionArray,
    inputServiceAddress,
    inputMyRegisteredNFTArray,
    inputMyRentNFTArray,
    inputBlockchainNetwork,
  ]);

  function buildNFTTableRowBody({ elementArray, type }) {
    return (
      <TableBody key={getUniqueKey()}>
        {elementArray.map((element) => {
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

  function buildNFTTableRowHead({ collection, type }) {
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

  function buildNFTTableRow({ collection, elementArray, type }) {
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
          <Table size="small">
            {buildNFTTableRowHead({ collection, type })}
            {buildNFTTableRowBody({ elementArray, type })}
          </Table>
        </TableCell>
      </TableRow>
    );
  }

  function buildCollectionTableRow({ collection }) {
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
                  {shortenAddress({
                    address: collection.collectionAddress,
                    number: 5,
                  })}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        </TableCell>
      </TableRow>
    );
  }

  function buildCollapseMyTable({ collection, elementArray, type }) {
    // * Check element length, if 0, don't show table.
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

  function buildNFTTable() {
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

          return buildCollapseMyTable({
            collection: element,
            elementArray: elementArray,
            type: type,
          });
        })}
      </Table>
    );
  }

  function buildLeftMenu() {
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
        <Grid item>{buildLeftMenu()}</Grid>
        <Grid item>{buildNFTTable()}</Grid>
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
