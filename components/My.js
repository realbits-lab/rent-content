import * as React from "react";
import axios from "axios";
import { Alchemy, Network } from "alchemy-sdk";
import { formatEther } from "viem";
import { useAccount, useNetwork, useContractRead } from "wagmi";
import moment from "moment";
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
  RBSize,
  shortenAddress,
  getUniqueKey,
} from "@/components/RentContentUtil";
import rentmarketABI from "@/contracts/rentMarket.json";

export default function My() {
  //*---------------------------------------------------------------------------
  //* Wagmi
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const { address, connector: activeConnector, isConnected } = useAccount();
  const { chain, chains } = useNetwork();

  //* getAllRentData function
  const {
    data: dataAllRentData,
    isError: isErrorAllRentData,
    isLoading: isLoadingAllRentData,
    status: statusAllRentData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "getAllRentData",
    // watch: true,
  });

  //* getAllRegisterData function
  const {
    data: dataAllRegisterData,
    isError: isErrorAllRegisterData,
    isLoading: isLoadingAllRegisterData,
    status: statusAllRegisterData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "getAllRegisterData",
    // watch: true,
  });

  //* getAllCollection function
  const {
    data: dataAllCollection,
    isError: isErrorAllCollection,
    isLoading: isLoadingAllCollection,
    status: statusAllCollection,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "getAllCollection",
    // watch: true,
    async onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      //* Get register data from smart contract.
      let tempCollectionArray = [];
      const promises = data.map(async (element) => {
        // console.log("element: ", element);
        let response;
        try {
          response = await axios.get(element.uri);
        } catch (error) {
          console.error(error);
          throw error;
        }
        const metadata = response.data;
        // console.log("collection metadata: ", metadata);

        //* Add collection array with metadata.
        tempCollectionArray.push({
          key: element.collectionAddress,
          collectionAddress: element.collectionAddress,
          uri: element.uri,
          metadata: metadata,
        });
      });
      await Promise.all(promises);

      setCollectionArray(tempCollectionArray);
    },
  });

  //*---------------------------------------------------------------------------
  //* Variable.
  //*---------------------------------------------------------------------------
  const theme = useTheme();
  const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;

  //*---------------------------------------------------------------------------
  //* Define copied local varialbe from input data.
  //*---------------------------------------------------------------------------
  const [collectionArray, setCollectionArray] = React.useState([]);
  const [myRegisteredNFTArray, setMyRegisteredNFTArray] = React.useState([]);
  const [myRentNFTArray, setMyRentNFTArray] = React.useState([]);
  const [currentTimestamp, setCurrentTimestamp] = React.useState();

  //*---------------------------------------------------------------------------
  //* Handle selected collection.
  //* Default is own menu.
  //*---------------------------------------------------------------------------
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

  //*---------------------------------------------------------------------------
  //* Table pagination data.
  //*---------------------------------------------------------------------------
  const [page, setPage] = React.useState([]);
  const [rowsPerPage, setRowsPerPage] = React.useState([]);

  async function initialize() {
    let network;
    // console.log("chain: ", chain);
    switch (chain.network) {
      case "matic":
        network = Network.MATIC_MAINNET;
        break;

      case "maticmum":
        network = Network.MATIC_MUMBAI;
        break;
    }
    const config = {
      apiKey: ALCHEMY_KEY,
      network,
    };
    // console.log("config: ", config);
    const alchemy = new Alchemy(config);

    //* Get all NFTs.
    // console.log("address: ", address);
    const nfts = await alchemy.nft.getNftsForOwner(address);
    // console.log("nfts: ", nfts);

    //* Set metadata for register nft.
    let inputMyRegisteredNFTArray = [];
    nfts["ownedNfts"].map((nft) => {
      const foundRegisterData = dataAllRegisterData?.find(
        (registerData) =>
          registerData.nftAddress.toLowerCase() ===
            nft?.contract?.address.toLowerCase() &&
          Number(registerData.tokenId) === Number(nft?.tokenId)
      );
      if (foundRegisterData) {
        //* Find my NFT in register data.
        inputMyRegisteredNFTArray.push({
          nftAddress: foundRegisterData.nftAddress,
          tokenId: foundRegisterData.tokenId,
          rentFee: foundRegisterData.rentFee,
          feeTokenAddress: foundRegisterData.feeTokenAddress,
          rentFeeByToken: foundRegisterData.rentFeeByToken,
          rentDuration: foundRegisterData.rentDuration,
          metadata: nft.rawMetadata,
        });
      }
    });
    // console.log("inputMyRegisteredNFTArray: ", inputMyRegisteredNFTArray);

    //* Set metadata for rent nft.
    let inputMyRentNFTArray = [];
    dataAllRentData?.map(async (rentData) => {
      if (rentData.renteeAddress.toLowerCase() === address.toLowerCase()) {
        const metadata = await alchemy.nft.getNftMetadata(
          rentData.nftAddress,
          rentData.tokenId,
          {}
        );
        console.log("metadata: ", metadata);

        //* Find my rent nft in rent data.
        inputMyRentNFTArray.push({
          ...rentData,
          metadata: metadata,
        });
      }
    });

    setMyRegisteredNFTArray(inputMyRegisteredNFTArray);
    setMyRentNFTArray(inputMyRentNFTArray);
  }

  React.useEffect(() => {
    // console.log("call React.useEffect()");

    initialize();

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
  }, []);

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
        {elementArray &&
          elementArray
            .slice(
              tablePage * tableRowsPerPage,
              tablePage * tableRowsPerPage + tableRowsPerPage
            )
            .map((element) => {
              console.log("element: ", element);
              const rentStartTimestamp = element.rentStartTimestamp
                ? Number(element.rentStartTimestamp)
                : 0;
              // console.log("rentStartTimestamp: ", rentStartTimestamp);

              //* Get rent duration display string for own case.
              const durationTimestampDisplay = `${moment
                .duration(Number(element.rentDuration), "seconds")
                .humanize()}`;
              // console.log("durationTimestampDisplay: ", durationTimestampDisplay);

              //* Get end rent time display string for rent case.
              const endRentTimestamp =
                rentStartTimestamp + Number(element.rentDuration);
              // console.log("endRentTimestamp: ", endRentTimestamp);
              // console.log("currentTimestamp: ", currentTimestamp);
              let endRentTimestampDisplay;
              if (currentTimestamp >= endRentTimestamp) {
                endRentTimestampDisplay = "finished";
              } else {
                endRentTimestampDisplay = moment
                  .unix(endRentTimestamp)
                  .fromNow(true);
              }
              // console.log("endRentTimestampDisplay: ", endRentTimestampDisplay);

              return (
                <TableRow
                  key={getUniqueKey()}
                  // sx={{
                  //   "&:hover": {
                  //     backgroundColor: theme.palette.success.light,
                  //   },
                  //   "&:hover .MuiTableCell-root": {
                  //     color: "white",
                  //   },
                  // }}
                  // style={{
                  //   cursor: "pointer",
                  // }}
                >
                  <TableCell align="center" style={{ borderColor: "#FFF7ED" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        alt="image"
                        src={
                          element.metadata
                            ? changeIPFSToGateway(element.metadata.image)
                            : ""
                        }
                        sx={{ width: RBSize.big, height: RBSize.big }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center" style={{ borderColor: "#FFF7ED" }}>
                    {element.metadata ? element.metadata.name : "N/A"}
                  </TableCell>
                  <TableCell align="center" style={{ borderColor: "#FFF7ED" }}>
                    {formatEther(element.rentFee)}
                  </TableCell>
                  <TableCell align="center" style={{ borderColor: "#FFF7ED" }}>
                    {formatEther(element.rentFeeByToken)}
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
          <TableCell align="center">Content</TableCell>
          <TableCell align="center">Name</TableCell>
          <TableCell align="center">Rent Fee</TableCell>
          <TableCell align="center">Rent Fee By Token</TableCell>
          <TableCell align="center">Rent Duration</TableCell>
          {/* <TableCell align="center">Select</TableCell> */}
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
                  count={elementArray ? elementArray.length : 0}
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
              image={
                changeIPFSToGateway(collection.metadata.image) ||
                "/fallback.png"
              }
              onError={(error) => {
                e.target.onerror = null;
                e.target.style.display = "none";
                e.target.src = "/fallback.png";
              }}
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
                    withLink: "opensea",
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
    // console.log("myRentNFTArray: ", myRentNFTArray);

    return (
      <Box
        sx={{
          marginTop: "20px",
        }}
      >
        <Table>
          {collectionArray.map((collection) => {
            let elementArray = [];
            let type = MyMenu.own;

            if (selectedItem === MyMenu.own) {
              elementArray = myRegisteredNFTArray?.filter(
                (nftElement) =>
                  nftElement.nftAddress === collection.collectionAddress
              );
              type = MyMenu.own;
            } else {
              elementArray = myRentNFTArray?.filter(
                (nftElement) =>
                  nftElement.nftAddress === collection.collectionAddress
              );
              type = MyMenu.rent;
            }

            return buildMyTable({
              collection: collection,
              elementArray: elementArray,
              type: type,
            });
          })}
        </Table>
      </Box>
    );
  }

  function buildTopMenu() {
    return (
      <Box
        sx={{
          marginTop: "20px",
        }}
      >
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
                OWN
              </Typography>
            </ListItemButton>
          </ListItem>
          <ListItem key="rent" disablePadding>
            <ListItemButton
              selected={selectedItem === MyMenu.rent}
              onClick={(event) => handleListItemClick(event, MyMenu.rent)}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                RENT
              </Typography>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    );
  }

  return (
    <div>
      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <Grid item>{buildTopMenu()}</Grid>
        <Grid item>{buildNftTable()}</Grid>
      </Grid>
    </div>
  );
}
