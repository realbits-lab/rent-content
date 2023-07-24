import React, { useEffect } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { parseEther, formatEther } from "viem";
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
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

export default function Content() {
  //*---------------------------------------------------------------------------
  //* Wagmi
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
  const [unregisterTokenAddress, setUnregisterTokenAddress] = React.useState();
  const { address, isConnected } = useAccount();
  const { chain, chains } = useNetwork();

  //* unregisterNFT function
  const {
    data: dataUnregisterNFT,
    isError: isErrorUnregisterNFT,
    isLoading: isLoadingUnregisterNFT,
    write: writeUnregisterNFT,
  } = useContractWrite({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "unregisterNFT",
  });
  const {
    data: dataUnregisterNFTTx,
    isError: isErrorUnregisterNFTTx,
    isLoading: isLoadingUnregisterNFTTx,
  } = useWaitForTransaction({
    hash: dataUnregisterNFT?.hash,
  });

  //* registerNFT function
  const {
    data: dataRegisterNFT,
    isError: isErrorRegisterNFT,
    isLoading: isLoadingRegisterNFT,
    write: writeRegisterNFT,
  } = useContractWrite({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "registerNFT",
  });
  const {
    data: dataRegisterNFTTx,
    isError: isErrorRegisterNFTTx,
    isLoading: isLoadingRegisterNFTTx,
  } = useWaitForTransaction({
    hash: dataRegisterNFT?.hash,
  });

  //* changeNFT function
  const {
    data: dataChangeNFT,
    isError: isErrorChangeNFT,
    isLoading: isLoadingChangeNFT,
    write: writeChangeNFT,
  } = useContractWrite({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "changeNFT",
  });
  const {
    data: dataChangeNFTTx,
    isError: isErrorChangeNFTTx,
    isLoading: isLoadingChangeNFTTx,
  } = useWaitForTransaction({
    hash: dataChangeNFT?.hash,
  });

  //* getAllRegister function
  const {
    data: dataAllRegisterData,
    isError: isErrorAllRegisterData,
    isLoading: isLoadingAllRegisterData,
    status: statusAllRegisterData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "getAllRegisterData",
    watch: true,
  });

  //* getAllToken function
  const {
    data: dataAllToken,
    isError: isErrorAllToken,
    isLoading: isLoadingAllToken,
    status: statusAllToken,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "getAllToken",
    watch: true,
  });
  // console.log("dataAllToken: ", dataAllToken);

  //*---------------------------------------------------------------------------
  //* Define input copied variables.
  //*---------------------------------------------------------------------------
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

    let inputMyRegisteredNFTArray = [];
    let inputMyUnregisteredNFTArray = [];

    nfts["ownedNfts"].map((nft) => {
      const foundRegisterData = dataAllRegisterData?.find(
        (registerData) =>
          registerData.nftAddress.toLowerCase() ===
            nft?.contract?.address.toLowerCase() &&
          Number(nft?.tokenId) === Number(registerData.tokenId)
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
      } else {
        // console.log("nft: ", nft);
        //* Not find my NFT in register data.
        inputMyUnregisteredNFTArray.push({
          nftAddress: nft.contract.address,
          tokenId: nft.tokenId,
          metadata: nft.rawMetadata,
        });
      }
    });
    // console.log("inputMyRegisteredNFTArray: ", inputMyRegisteredNFTArray);
    // console.log("inputMyUnregisteredNFTArray: ", inputMyUnregisteredNFTArray);

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
  }

  useEffect(() => {
    // console.log("call React.useEffect()");
    // console.log("inputMyRegisteredNFTArray: ", inputMyRegisteredNFTArray);
    // console.log("inputMyUnregisteredNFTArray: ", inputMyUnregisteredNFTArray);

    initialize();

    // setMyRegisteredNFTArray(inputMyRegisteredNFTArray);
    // setMyUnregisteredNFTArray(inputMyUnregisteredNFTArray);

    // // Set unique data.
    // let uniqueRegisterNFTAddressSet;
    // if (inputMyRegisteredNFTArray) {
    //   uniqueRegisterNFTAddressSet = new Set(
    //     inputMyRegisteredNFTArray.map((element) => element.nftAddress)
    //   );
    //   setMyRegisteredUniqueNFTAddressArray([...uniqueRegisterNFTAddressSet]);
    // }

    // let uniqueUnregisterNFTAddressSet;
    // if (inputMyUnregisteredNFTArray) {
    //   uniqueUnregisterNFTAddressSet = new Set(
    //     inputMyUnregisteredNFTArray.map((element) => element.nftAddress)
    //   );
    //   setMyUnregisteredUniqueNFTAddressArray([
    //     ...uniqueUnregisterNFTAddressSet,
    //   ]);
    // }

    // // * Initialize page and rowsPerPage array.
    // page.splice(0, page.length);
    // rowsPerPage.splice(0, rowsPerPage.length);

    // // * Add each register and unregister page and rowsPerPage per nft contract address.
    // if (uniqueRegisterNFTAddressSet) {
    //   for (const nftAddress of uniqueRegisterNFTAddressSet) {
    //     page.push({
    //       address: nftAddress,
    //       mode: "register",
    //       page: 0,
    //     });
    //     rowsPerPage.push({
    //       address: nftAddress,
    //       mode: "register",
    //       rowsPerPage: 5,
    //     });
    //   }
    // }

    // if (uniqueUnregisterNFTAddressSet) {
    //   for (const nftAddress of uniqueUnregisterNFTAddressSet) {
    //     page.push({
    //       address: nftAddress,
    //       mode: "unregister",
    //       page: 0,
    //     });
    //     rowsPerPage.push({
    //       address: nftAddress,
    //       mode: "unregister",
    //       rowsPerPage: 5,
    //     });
    //   }
    // }
  }, []);

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
  function buildRegisterNFTRow({ nft }) {
    // console.log("call buildRegisterRowList()");
    // console.log("nft: ", nft);

    const found = dataAllToken?.find((token) => {
      // console.log("token: ", token);
      return (
        token.tokenAddress.toLowerCase() ===
          nft.feeTokenAddress.toLowerCase() ||
        nft.feeTokenAddress.toLowerCase() === ZERO_ADDRESS_STRING.toLowerCase()
      );
    });
    // console.log("found: ", found);

    let buttonColor;
    if (found) {
      buttonColor = "black";
    } else {
      buttonColor = "red";
    }

    //* TODO: Handle isLoadingRegisterNFTTx status.
    return (
      <TableRow key={getUniqueKey()}>
        <TableCell component="th" scope="row" align="center" padding="normal">
          <Avatar
            alt="image"
            src={nft.metadata ? changeIPFSToGateway(nft.metadata.image) : ""}
            sx={{ width: RBSize.middle, height: RBSize.middle }}
          />
        </TableCell>
        <TableCell align="center" padding="none">
          {nft.metadata ? nft.metadata.name : "N/A"}
        </TableCell>
        <TableCell align="center">{nft.tokenId.toString()}</TableCell>
        <TableCell align="center">{formatEther(nft.rentFee)}</TableCell>
        <TableCell align="center">{formatEther(nft.rentFeeByToken)}</TableCell>
        <TableCell align="center">{nft.rentDuration.toString()}</TableCell>
        <TableCell align="center">
          <Button
            size="small"
            onClick={() => {
              setChangeElement(nft);
              setFormValue((prevState) => {
                console.log("nft: ", nft);
                return {
                  ...prevState,
                  inputRentFee: formatEther(nft.rentFee),
                  inputFeeTokenAddress: nft.feeTokenAddress,
                  inputRentFeeByToken: formatEther(nft.rentFeeByToken),
                  inputRentDuration: nft.rentDuration,
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
              try {
                writeUnregisterNFT?.({
                  args: [nft.nftAddress, nft.tokenId],
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
              .filter((nft) => nft.nftAddress === nftContractAddress)
              .slice(
                tablePage * tableRowsPerPage,
                tablePage * tableRowsPerPage + tableRowsPerPage
              )
              .map((nft) => {
                return buildRegisterNFTRow({ nft });
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

  function buildMyRegisteredNFTElementTable() {
    // console.log("call buildMyRegisteredNFTElementTable()");
    // console.log(
    //   "myRegisteredUniqueNFTAddressArray: ",
    //   myRegisteredUniqueNFTAddressArray
    // );

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
                  withLink: "opensea",
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

  //* TODO: Handle isLoadingUnregisterNFTTx status.
  function buildUnregisterRowList({ element }) {
    return (
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
                writeRegisterNFT?.({
                  args: [element.nftAddress, element.tokenId],
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

  function buildMyUnregisteredNFTElementTable() {
    // console.log("call buildMyUnregisteredNFTElementTable()");
    // https://mui.com/material-ui/react-table/
    // https://medium.com/@freshmilkdev/reactjs-render-optimization-for-collapsible-material-ui-long-list-with-checkboxes-231b36892e20

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
        {myUnregisteredUniqueNFTAddressArray.map((nftContractAddress, idx) => {
          return (
            <ListItem key={idx}>
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
      {buildMyRegisteredNFTElementTable()}

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Show my unregistered NFT with request register button.          */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px", marginTop: "20px" }}>
        <Chip label="My Unregistered NFT" />
      </Divider>
      {buildMyUnregisteredNFTElementTable()}

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
                writeChangeNFT?.({
                  args: [
                    changeElement.nftAddress,
                    changeElement.tokenId,
                    parseEther(inputRentFee.toString()),
                    inputFeeTokenAddress,
                    parseEther(inputRentFeeByToken.toString()),
                    inputRentDuration,
                  ],
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
