import React from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useWeb3Modal } from "@web3modal/react";
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";
import { isMobile } from "react-device-detect";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { useRecoilStateLoadable } from "recoil";
import {
  changeIPFSToGateway,
  RBSize,
  getUniqueKey,
  getChainName,
  AlertSeverity,
  shortenAddress,
  writeToastMessageState,
} from "@/components/RentContentUtil";
import rentmarketABI from "@/contracts/rentMarket.json";

export default function Content({
  inputRentMarket,
  inputBlockchainNetwork,
  inputMyRegisteredNFTArray,
  inputMyUnregisteredNFTArray,
}) {
  //*---------------------------------------------------------------------------
  //* Hook variables.
  //*---------------------------------------------------------------------------
  const { address, isConnected } = useAccount();

  //*---------------------------------------------------------------------------
  //* Define input copied variables.
  //*---------------------------------------------------------------------------
  const rentMarketRef = React.useRef();
  const [myRegisteredNFTArray, setMyRegisteredNFTArray] = React.useState();
  const [myUnregisteredNFTArray, setMyUnregisteredNFTArray] = React.useState();

  //*---------------------------------------------------------------------------
  //* Set unique variables for table collapse.
  //*---------------------------------------------------------------------------
  const [
    myRegisteredUniqueNFTAddressArray,
    setMyRegisteredUniqueNFTAddressArray,
  ] = React.useState();
  const [
    myUnregisteredUniqueNFTAddressArray,
    setMyUnregisteredUniqueNFTAddressArray,
  ] = React.useState();

  //*---------------------------------------------------------------------------
  //* Nft list data.
  //*---------------------------------------------------------------------------
  const [changeElement, setChangeElement] = React.useState([]);
  const [openInput, setOpenInput] = React.useState(false);

  //*---------------------------------------------------------------------------
  //* Handle toast message.
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
  //* Handle text input change.
  //* Variables for changeNFT function.
  //*---------------------------------------------------------------------------
  const ZERO_ADDRESS_STRING = "0x0000000000000000000000000000000000000000";
  const [formValue, setFormValue] = React.useState({
    inputRentFee: 0,
    inputFeeTokenAddress: ZERO_ADDRESS_STRING,
    inputRentFeeByToken: 0,
    inputRentDuration: 0,
  });
  const {
    inputRentFee,
    inputFeeTokenAddress,
    inputRentFeeByToken,
    inputRentDuration,
  } = formValue;
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
  //* Table pagination data.
  //*---------------------------------------------------------------------------
  const [page, setPage] = React.useState([]);
  const [rowsPerPage, setRowsPerPage] = React.useState([]);

  //*---------------------------------------------------------------------------
  //* Wagmi hook functions.
  //*---------------------------------------------------------------------------
  const {
    isOpen: isOpenWeb3Modal,
    open: openWeb3Modal,
    close: closeWeb3Modal,
    setDefaultChain: setDefaultChainWeb3Modal,
  } = useWeb3Modal();
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const [unregisterTokenAddress, setUnregisterTokenAddress] = React.useState();

  const {
    data: dataAllToken,
    isError: isErrorAllToken,
    isLoading: isLoadingAllToken,
    status: statusAllToken,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllToken",
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
    },
    onError(error) {
      // console.log("call onError()");
      // console.log("error: ", error);
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
    },
  });
  // console.log("dataAllToken: ", dataAllToken);

  React.useEffect(() => {
    // console.log("call React.useEffect()");
    // console.log("inputMyRegisteredNFTArray: ", inputMyRegisteredNFTArray);
    // console.log("inputMyUnregisteredNFTArray: ", inputMyUnregisteredNFTArray);

    rentMarketRef.current = inputRentMarket;
    setMyRegisteredNFTArray(inputMyRegisteredNFTArray);
    setMyUnregisteredNFTArray(inputMyUnregisteredNFTArray);

    // Set unique data.
    let uniqueRegisterNFTAddressSet;
    if (inputMyRegisteredNFTArray) {
      uniqueRegisterNFTAddressSet = new Set(
        inputMyRegisteredNFTArray.map((element) => element.nftAddress)
      );
      setMyRegisteredUniqueNFTAddressArray([...uniqueRegisterNFTAddressSet]);
    }

    let uniqueUnregisterNFTAddressSet;
    if (inputMyUnregisteredNFTArray) {
      uniqueUnregisterNFTAddressSet = new Set(
        inputMyUnregisteredNFTArray.map((element) => element.nftAddress)
      );
      setMyUnregisteredUniqueNFTAddressArray([
        ...uniqueUnregisterNFTAddressSet,
      ]);
    }

    // * Initialize page and rowsPerPage array.
    page.splice(0, page.length);
    rowsPerPage.splice(0, rowsPerPage.length);

    // * Add each register and unregister page and rowsPerPage per nft contract address.
    if (uniqueRegisterNFTAddressSet) {
      for (const nftAddress of uniqueRegisterNFTAddressSet) {
        page.push({
          address: nftAddress,
          mode: "register",
          page: 0,
        });
        rowsPerPage.push({
          address: nftAddress,
          mode: "register",
          rowsPerPage: 5,
        });
      }
    }

    if (uniqueUnregisterNFTAddressSet) {
      for (const nftAddress of uniqueUnregisterNFTAddressSet) {
        page.push({
          address: nftAddress,
          mode: "unregister",
          page: 0,
        });
        rowsPerPage.push({
          address: nftAddress,
          mode: "unregister",
          rowsPerPage: 5,
        });
      }
    }
  }, [
    inputRentMarket,
    inputRentMarket.rentMarketContract,
    inputBlockchainNetwork,
    inputMyRegisteredNFTArray,
    inputMyUnregisteredNFTArray,
  ]);

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

  function getPage({ nftContractAddress, mode }) {
    const findPage = page.find(
      (e) => e.address === nftContractAddress && e.mode === mode
    );
    // console.log("findPage: ", findPage);
    const tablePage = findPage ? findPage.page : 0;
    return tablePage;
  }

  function getRowsPerPage({ nftContractAddress, mode }) {
    const findRowsPerPage = rowsPerPage.find(
      (e) => e.address === nftContractAddress && e.mode === mode
    );
    // console.log("findRowsPerPage: ", findRowsPerPage);
    const tableRowsPerPage = findRowsPerPage ? findRowsPerPage.rowsPerPage : 5;
    return tableRowsPerPage;
  }

  function TablePageComponent({ nftContractAddress, mode }) {
    // console.log("call TablePageComponent()");
    // console.log("nftContractAddress: ", nftContractAddress);
    // console.log("page: ", page);
    // console.log("rowsPerPage: ", rowsPerPage);

    const tablePage = getPage({ nftContractAddress, mode });
    const tableRowsPerPage = getRowsPerPage({ nftContractAddress, mode });
    let count = 0;
    if (mode === "register" && myRegisteredNFTArray) {
      count = myRegisteredNFTArray.filter(
        (e) => e.nftAddress === nftContractAddress
      ).length;
    } else if (mode === "unregister" && myUnregisteredNFTArray) {
      count = myUnregisteredNFTArray.filter(
        (e) => e.nftAddress === nftContractAddress
      ).length;
    } else {
      count = 0;
    }

    return (
      <TablePagination
        key={getUniqueKey()}
        rowsPerPageOptions={[5, 10, 20]}
        count={count}
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
          setPage((prevState) => {
            const newState = prevState.map((e) => {
              if (e.address === nftContractAddress) {
                return {
                  address: nftContractAddress,
                  mode: mode,
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
          setRowsPerPage((prevState) => {
            const newState = prevState.map((e) => {
              if (e.address === nftContractAddress) {
                return {
                  address: nftContractAddress,
                  mode: mode,
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
              if (e.address === nftContractAddress) {
                return {
                  address: nftContractAddress,
                  mode: mode,
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
    );
  }

  //*---------------------------------------------------------------------------
  //* Draw each register data row list in table.
  //*---------------------------------------------------------------------------
  function buildRegisterRowList({ element }) {
    // console.log("element: ", element);
    const found = dataAllToken?.find((token) => {
      // console.log("token: ", token);
      return (
        token.tokenAddress.toLowerCase() ===
          element.feeTokenAddress.toLowerCase() ||
        element.feeTokenAddress.toLowerCase() ===
          ZERO_ADDRESS_STRING.toLowerCase()
      );
    });
    // console.log("found: ", found);

    let buttonColor;
    if (found) {
      buttonColor = "black";
    } else {
      buttonColor = "red";
    }

    return (
      <TableRow key={getUniqueKey()}>
        <TableCell component="th" scope="row" align="center" padding="normal">
          <Avatar
            alt="image"
            src={
              element.metadata
                ? changeIPFSToGateway(element.metadata.image)
                : ""
            }
            sx={{ width: RBSize.middle, height: RBSize.middle }}
          />
        </TableCell>
        <TableCell align="center" padding="none">
          {element.metadata ? element.metadata.name : "N/A"}
        </TableCell>
        <TableCell align="center">{element.tokenId.toNumber()}</TableCell>
        <TableCell align="center">
          {element.rentFee / Math.pow(10, 18)}
        </TableCell>
        <TableCell align="center">
          {element.rentFeeByToken / Math.pow(10, 18)}
        </TableCell>
        <TableCell align="center">{element.rentDuration.toNumber()}</TableCell>
        <TableCell align="center">
          <Button
            size="small"
            onClick={() => {
              setChangeElement(element);
              setFormValue((prevState) => {
                return {
                  ...prevState,
                  inputRentFee: element.rentFee / Math.pow(10, 18),
                  inputFeeTokenAddress: element.feeTokenAddress,
                  inputRentFeeByToken:
                    element.rentFeeByToken / Math.pow(10, 18),
                  inputRentDuration: element.rentDuration,
                };
              });
              setOpenInput(true);
            }}
          >
            <EditRoundedIcon sx={{ color: buttonColor }} />
          </Button>
        </TableCell>
        <TableCell align="center">
          <Button
            size="small"
            onClick={async () => {
              //* Create WalletConnect Provider.
              let provider;
              if (isMobile === true) {
                provider = new WalletConnectProvider({
                  rpc: {
                    137: "https://rpc-mainnet.maticvigil.com",
                    80001: "https://rpc-mumbai.maticvigil.com/",
                  },
                  infuraId: process.env.NEXT_PUBLIC_INFURA_KEY,
                });

                //* Enable session (triggers QR Code modal).
                await provider.enable();
                // console.log("provider: ", provider);
              }

              try {
                await rentMarketRef.current.unregisterNFT({
                  provider: provider,
                  element: element,
                });
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
            <DeleteRoundedIcon />
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  //*---------------------------------------------------------------------------
  //* Draw each register data row body in table.
  //*---------------------------------------------------------------------------
  function RegisterNftDataRowList({ nftContractAddress }) {
    // console.log("call RegisterNftDataRowList()");

    const tablePage = getPage({ nftContractAddress, mode: "register" });
    const tableRowsPerPage = getRowsPerPage({
      nftContractAddress,
      mode: "register",
    });

    return (
      <Table size="small" padding="none">
        <TableHead>
          <TableRow
            key={getUniqueKey()}
            sx={{
              backgroundColor: "lightgrey",
              borderBottom: "2px solid black",
              "& th": {
                fontSize: "12px",
              },
            }}
          >
            <TableCell align="center" padding="normal">
              Content
            </TableCell>
            <TableCell align="center" padding="normal">
              name
            </TableCell>
            <TableCell align="center" padding="normal">
              Token Id
            </TableCell>
            <TableCell align="center" padding="normal">
              Fee (matic)
            </TableCell>
            <TableCell align="center" padding="normal">
              Fee (token)
            </TableCell>
            <TableCell align="center" padding="normal">
              Rent Duration (seconds)
            </TableCell>
            <TableCell align="center" padding="normal">
              Change
            </TableCell>
            <TableCell align="center" padding="normal">
              Unregister
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {myRegisteredNFTArray &&
            myRegisteredNFTArray
              .filter((element) => element.nftAddress === nftContractAddress)
              .slice(
                tablePage * tableRowsPerPage,
                tablePage * tableRowsPerPage + tableRowsPerPage
              )
              .map((element) => {
                return buildRegisterRowList({ element });
              })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePageComponent
              nftContractAddress={nftContractAddress}
              mode={"register"}
            />
          </TableRow>
        </TableFooter>
      </Table>
    );
  }

  function showMyRegisteredNFTElementTable() {
    // console.log("call showMyRegisteredNFTElementTable()");
    // console.log(
    //   "myRegisteredUniqueNFTAddressArray: ",
    //   myRegisteredUniqueNFTAddressArray
    // );

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

    if (isConnected === false) {
      return (
        <Box
          sx={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Button variant="text" onClick={openWeb3Modal}>
            Click the connect wallet button
          </Button>
        </Box>
      );
    }

    if (myRegisteredUniqueNFTAddressArray === undefined) {
      return (
        <Box
          sx={{
            marginTop: "20px",
            display: "flex",
            width: "100vw",
            height: "10vh",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Grid>
        {myRegisteredUniqueNFTAddressArray.map((nftContractAddress) => {
          return (
            <Grid key={getUniqueKey()}>
              <Typography variant="caption" color={"black"}>
                OpenSea:{" "}
                {shortenAddress({
                  address: nftContractAddress,
                  number: 4,
                  withLink: openseaMode,
                })}
              </Typography>
              <RegisterNftDataRowList nftContractAddress={nftContractAddress} />
            </Grid>
          );
        })}
      </Grid>
    );
  }

  function UnregisterRowListSkeleton() {
    return (
      <TableRow key={getUniqueKey()}>
        <TableCell component="th" scope="row">
          <Skeleton
            variant="rounded"
            width={RBSize.double}
            height={RBSize.double}
          />
        </TableCell>
        <TableCell>
          <Skeleton variant="rounded" width={200} height={10} />
        </TableCell>
        <TableCell>
          <Skeleton variant="rounded" width={200} height={10} />
        </TableCell>
        <TableCell>
          <Skeleton variant="rounded" width={200} height={10} />
        </TableCell>
      </TableRow>
    );
  }

  function buildUnregisterRowList({ element }) {
    return (
      // <TableRow key={`TableRow-NFT-${element.nftAddress}-${element.tokenId}`}>
      <TableRow key={getUniqueKey()}>
        <TableCell component="th" scope="row">
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
        <TableCell>{element.metadata.name}</TableCell>
        <TableCell align="right">{element.tokenId}</TableCell>
        <TableCell align="right">
          <Button
            size="small"
            onClick={async () => {
              try {
                await rentMarketRef.current.registerNFT(element);
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
        </TableCell>
      </TableRow>
    );
  }

  function UnregisterNftDataRowList({ nftContractAddress }) {
    // console.log("call UnregisterNftDataRowList()");

    const tablePage = getPage({ nftContractAddress, mode: "unregister" });
    const tableRowsPerPage = getRowsPerPage({
      nftContractAddress,
      mode: "unregister",
    });
    // console.log("tablePage: ", tablePage);
    // console.log("tableRowsPerPage: ", tableRowsPerPage);

    return (
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
        <Table size="small" aria-label="purchases">
          <TableHead>
            <TableRow key={getUniqueKey()}>
              <TableCell>image</TableCell>
              <TableCell>name</TableCell>
              <TableCell align="right">tokenId</TableCell>
              <TableCell align="right">register</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {myUnregisteredNFTArray &&
              myUnregisteredNFTArray
                .filter((element) => element.nftAddress === nftContractAddress)
                .slice(
                  tablePage * tableRowsPerPage,
                  tablePage * tableRowsPerPage + tableRowsPerPage
                )
                .map((element) => {
                  return buildUnregisterRowList({ element });
                })}
          </TableBody>
        </Table>
      </TableCell>
    );
  }

  function UnregisterNftDataRow({ nftContractAddress }) {
    return (
      <TableBody>
        <TableRow
          sx={{ "& > *": { borderBottom: "unset" } }}
          key={getUniqueKey()}
        >
          <TableCell component="th" scope="row">
            {nftContractAddress}
          </TableCell>
        </TableRow>

        <TableRow key={getUniqueKey()}>
          <UnregisterNftDataRowList nftContractAddress={nftContractAddress} />
        </TableRow>
      </TableBody>
    );
  }

  function showMyUnregisteredNFTElementTable() {
    // console.log("call showMyUnregisteredNFTElementTable()");
    // https://mui.com/material-ui/react-table/
    // https://medium.com/@freshmilkdev/reactjs-render-optimization-for-collapsible-material-ui-long-list-with-checkboxes-231b36892e20

    if (isConnected === false) {
      return (
        <Box
          sx={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Button variant="text" onClick={openWeb3Modal}>
            Click the connect wallet button
          </Button>
        </Box>
      );
    }

    if (myUnregisteredUniqueNFTAddressArray === undefined) {
      return (
        <Box
          sx={{
            marginTop: "20px",
            display: "flex",
            width: "100vw",
            height: "100vh",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    return (
      <List>
        {myUnregisteredUniqueNFTAddressArray.map((nftContractAddress) => {
          return (
            <ListItem key={getUniqueKey()}>
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                  <UnregisterNftDataRow
                    nftContractAddress={nftContractAddress}
                  />
                  <TableFooter>
                    <TableRow>
                      <TablePageComponent
                        nftContractAddress={nftContractAddress}
                        mode={"unregister"}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </ListItem>
          );
        })}
      </List>
    );
  }

  return (
    <div>
      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show registered NFT with change and unregister button.          */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px", marginTop: "20px" }}>
        <Chip label="My Registered NFT" />
      </Divider>
      {showMyRegisteredNFTElementTable()}

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show my unregistered NFT with request register button.          */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px", marginTop: "20px" }}>
        <Chip label="My Unregistered NFT" />
      </Divider>
      {showMyUnregisteredNFTElementTable()}

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show input dialog.                                              */}
      {/*//*-----------------------------------------------------------------*/}
      <Dialog
        fullWidth
        open={openInput}
        onClose={() => {
          setOpenInput(false);
        }}
      >
        <DialogTitle>Change rent fee or rent duration</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate autoComplete="off">
            <div>
              <Divider sx={{ marginTop: "20px", marginBottom: "20px" }}>
                <Chip label="MATIC FEE" />
              </Divider>
              <TextField
                fullWidth
                required
                id="outlined-required"
                label="Rent Fee (matic)"
                name="inputRentFee"
                value={inputRentFee}
                onChange={handleChange}
                sx={{ marginTop: "10px", marginBottom: "10px" }}
              />

              <Divider sx={{ marginTop: "20px", marginBottom: "20px" }}>
                <Chip label="TOKEN FEE" />
              </Divider>
              <TextField
                select
                fullWidth
                required
                id="outlined"
                label="Token Address"
                name="inputFeeTokenAddress"
                value={inputFeeTokenAddress}
                onChange={handleChange}
                sx={{ marginTop: "10px", marginBottom: "10px" }}
              >
                <MenuItem key={getUniqueKey()} value={ZERO_ADDRESS_STRING}>
                  None
                </MenuItem>
                {dataAllToken?.map((token, idx) => (
                  <MenuItem key={idx} value={token.tokenAddress}>
                    {token.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                required
                id="outlined"
                label="Rent Fee by Token"
                name="inputRentFeeByToken"
                value={inputRentFeeByToken}
                onChange={handleChange}
                sx={{ marginTop: "10px", marginBottom: "10px" }}
              />

              <Divider sx={{ marginTop: "20px", marginBottom: "20px" }}>
                <Chip label="RENT DURATION" />
              </Divider>
              <TextField
                fullWidth
                required
                id="outlined"
                label="Rent Duration (second unit)"
                name="inputRentDuration"
                value={inputRentDuration}
                onChange={handleChange}
                sx={{ marginTop: "10px", marginBottom: "10px" }}
              />
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenInput(false);
            }}
          >
            CLOSE
          </Button>
          <Button
            onClick={async () => {
              try {
                // console.log("typeof inputRentFee: ", typeof inputRentFee);
                // console.log(
                //   "typeof inputFeeTokenAddress: ",
                //   typeof inputFeeTokenAddress
                // );
                // console.log(
                //   "typeof inputRentFeeByToken: ",
                //   typeof inputRentFeeByToken
                // );
                // console.log(
                //   "typeof inputRentDuration: ",
                //   typeof inputRentDuration
                // );
                // console.log("inputRentFee: ", inputRentFee);
                // console.log("inputFeeTokenAddress: ", inputFeeTokenAddress);
                // console.log("inputRentFeeByToken: ", inputRentFeeByToken);
                // console.log("inputRentDuration: ", inputRentDuration);

                //* Create WalletConnect Provider.
                let provider;
                if (isMobile === true) {
                  provider = new WalletConnectProvider({
                    rpc: {
                      137: "https://rpc-mainnet.maticvigil.com",
                      80001: "https://rpc-mumbai.maticvigil.com/",
                    },
                    infuraId: process.env.NEXT_PUBLIC_INFURA_KEY,
                  });

                  //* Enable session (triggers QR Code modal).
                  await provider.enable();
                  // console.log("provider: ", provider);
                }

                //* rent fee and rent fee by token should be an ether unit expression.
                await rentMarketRef.current.changeNFT({
                  provider: provider,
                  element: changeElement,
                  rentFee: inputRentFee.toString(),
                  feeTokenAddress: inputFeeTokenAddress,
                  rentFeeByToken: inputRentFeeByToken.toString(),
                  rentDuration: inputRentDuration,
                });
              } catch (error) {
                console.error(error);
                setWriteToastMessage({
                  snackbarSeverity: AlertSeverity.error,
                  snackbarMessage: error.reason,
                  snackbarTime: new Date(),
                  snackbarOpen: true,
                });
              }
              setFormValue((prevState) => {
                return {
                  ...prevState,
                  inputRentFee: 0,
                  inputFeeTokenAddress: "",
                  inputRentFeeByToken: 0,
                  inputRentDuration: 0,
                };
              });
              setOpenInput(false);
            }}
          >
            SAVE
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
