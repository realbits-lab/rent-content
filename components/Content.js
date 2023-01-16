import React from "react";
import { ethers } from "ethers";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
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
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import {
  changeIPFSToGateway,
  AlertSeverity,
  RBSnackbar,
  RBSize,
  Metamask,
  getUniqueKey,
} from "rent-market";

const Content = ({
  inputRentMarket,
  inputBlockchainNetwork,
  inputMyRegisteredNFTArray,
  inputMyUnregisteredNFTArray,
}) => {
  // * -------------------------------------------------------------------------
  // * Define input copied variables.
  // * -------------------------------------------------------------------------
  const rentMarketRef = React.useRef();
  const [blockchainNetwork, setBlockchainNetwork] = React.useState([]);
  const [myRegisteredNFTArray, setMyRegisteredNFTArray] = React.useState([]);
  const [myUnregisteredNFTArray, setMyUnregisteredNFTArray] = React.useState(
    []
  );

  // * -------------------------------------------------------------------------
  // * Set unique variables for table collapse.
  // * -------------------------------------------------------------------------
  const [
    myRegisteredUniqueNFTAddressArray,
    setMyRegisteredUniqueNFTAddressArray,
  ] = React.useState([]);
  const [
    myUnregisteredUniqueNFTAddressArray,
    setMyUnregisteredUniqueNFTAddressArray,
  ] = React.useState([]);

  // * -------------------------------------------------------------------------
  // * Nft list data.
  // * -------------------------------------------------------------------------
  const [changeElement, setChangeElement] = React.useState([]);
  const [openInput, setOpenInput] = React.useState(false);

  // * -------------------------------------------------------------------------
  // * Handle toast message.
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
  // * Handle text input change.
  // * Variables for changeNFT function.
  // * -------------------------------------------------------------------------
  const [formValue, setFormValue] = React.useState({
    inputRentFee: 0,
    inputFeeTokenAddress: "",
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

  // * -------------------------------------------------------------------------
  // * Table pagination data.
  // * -------------------------------------------------------------------------
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  // const [page, setPage] = React.useState([
  //   { address: "0x0", mode: "register", page: 0 },
  // ]);
  // const [rowsPerPage, setRowsPerPage] = React.useState([
  //   { address: "0x0", mode: "register", rowsPerPage: 5 },
  // ]);

  // * -------------------------------------------------------------------------
  // * Initialize data.
  // * -------------------------------------------------------------------------
  React.useEffect(() => {
    // console.log("call React.useEffect()");

    rentMarketRef.current = inputRentMarket;
    setMyRegisteredNFTArray(inputMyRegisteredNFTArray);
    setMyUnregisteredNFTArray(inputMyUnregisteredNFTArray);
    setBlockchainNetwork(inputBlockchainNetwork);

    // Set unique data.
    setMyRegisteredUniqueNFTAddressArray([
      ...new Set(
        inputMyRegisteredNFTArray.map((element) => element.nftAddress)
      ),
    ]);
    setMyUnregisteredUniqueNFTAddressArray([
      ...new Set(
        inputMyUnregisteredNFTArray.map((element) => element.nftAddress)
      ),
    ]);
  }, [
    inputRentMarket,
    inputBlockchainNetwork,
    inputMyRegisteredNFTArray,
    inputMyUnregisteredNFTArray,
  ]);

  // * -------------------------------------------------------------------------
  // * Handle table pagination data.
  // * -------------------------------------------------------------------------
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const TablePaginationActions = (props) => {
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
  };

  // * -------------------------------------------------------------------------
  // * Draw each row in table.
  // * -------------------------------------------------------------------------
  const RegisterRowList = React.memo(function RegisterRowList({ element }) {
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
        <TableCell>
          {element.metadata ? element.metadata.name : "N/A"}
        </TableCell>
        <TableCell align="right">{element.tokenId}</TableCell>
        <TableCell align="right">
          {element.rentFee / Math.pow(10, 18)}
        </TableCell>
        <TableCell align="right">{element.rentDuration}</TableCell>
        <TableCell align="right">
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
            Change
          </Button>
        </TableCell>
        <TableCell align="right">
          <Button
            size="small"
            onClick={async () => {
              try {
                await rentMarketRef.current.unregisterNFT(element);
              } catch (error) {
                console.error(error);
                setSnackbarValue({
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
        </TableCell>
      </TableRow>
    );
  });

  // * -------------------------------------------------------------------------
  // * Draw each register data row list in table.
  // * -------------------------------------------------------------------------
  const buildRegisterRowList = ({ element }) => {
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
        <TableCell>
          {element.metadata ? element.metadata.name : "N/A"}
        </TableCell>
        <TableCell align="right">{element.tokenId}</TableCell>
        <TableCell align="right">
          {element.rentFee / Math.pow(10, 18)}
        </TableCell>
        <TableCell align="right">{element.rentDuration}</TableCell>
        <TableCell align="right">
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
            Change
          </Button>
        </TableCell>
        <TableCell align="right">
          <Button
            size="small"
            onClick={async () => {
              try {
                await rentMarketRef.current.unregisterNFT(element);
              } catch (error) {
                console.error(error);
                setSnackbarValue({
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
        </TableCell>
      </TableRow>
    );
  };

  // * -------------------------------------------------------------------------
  // * Draw each register data row body in table.
  // * -------------------------------------------------------------------------
  const RegisterNftDataRowList = ({ nftContractAddress }) => {
    return (
      <TableRow key={getUniqueKey()}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Table size="small" aria-label="purchases">
            <TableHead>
              <TableRow key={getUniqueKey()}>
                <TableCell>image</TableCell>
                <TableCell>name</TableCell>
                <TableCell align="right">tokenId</TableCell>
                <TableCell align="right">rent fee</TableCell>
                <TableCell align="right">rent duration</TableCell>
                <TableCell align="right">change</TableCell>
                <TableCell align="right">unregister</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myRegisteredNFTArray
                .filter((element) => element.nftAddress === nftContractAddress)
                .map((element) => {
                  return buildRegisterRowList({ element });
                })}
            </TableBody>
          </Table>
        </TableCell>
      </TableRow>
    );
  };

  const RegisterNftDataRow = ({ nftContractAddress }) => {
    const [openRow, setOpenRow] = React.useState(false);

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
        <RegisterNftDataRowList nftContractAddress={nftContractAddress} />
      </TableBody>
    );
  };

  const showMyRegisteredNFTElementTable = () => {
    // https://mui.com/material-ui/react-table/
    // https://medium.com/@freshmilkdev/reactjs-render-optimization-for-collapsible-material-ui-long-list-with-checkboxes-231b36892e20
    return (
      <List>
        {myRegisteredUniqueNFTAddressArray.map((nftContractAddress) => (
          <ListItem key={getUniqueKey()}>
            <TableContainer component={Paper}>
              <Table aria-label="collapsible table">
                <RegisterNftDataRow nftContractAddress={nftContractAddress} />
              </Table>
            </TableContainer>
          </ListItem>
        ))}
      </List>
    );
  };

  const UnregisterRowListSkeleton = () => {
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
  };

  const UnregisterNftDataRowList = React.memo(
    function UnregisterNftDataRowList({ nftContractAddress }) {
      // console.log("call UnregisterNftDataRowList()");

      return myUnregisteredNFTArray
        .filter((element) => element.nftAddress === nftContractAddress)
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((element) => (
          <TableRow
            key={`TableRow-NFT-${element.nftAddress}-${element.tokenId}`}
          >
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
                    setSnackbarValue({
                      snackbarSeverity: AlertSeverity.error,
                      snackbarMessage: error.reason,
                      snackbarTime: new Date(),
                      snackbarOpen: true,
                    });
                  }
                }}
              >
                Launch
              </Button>
            </TableCell>
          </TableRow>
        ));
    }
  );

  const UnregisterNftDataRow = ({ nftContractAddress }) => {
    // console.log("call UnregisterNftDataRow()");
    // console.log("nftContractAddress: ", nftContractAddress);

    return (
      <React.Fragment key={`React.Fragment-${nftContractAddress}`}>
        <TableRow key={`TableRow-Content-${nftContractAddress}`}>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h7" gutterBottom component="div">
                {nftContractAddress}
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow key={`TableRow-Head-${nftContractAddress}`}>
                    <TableCell>image</TableCell>
                    <TableCell>name</TableCell>
                    <TableCell align="right">tokenId</TableCell>
                    <TableCell align="right">launch</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <React.Suspense fallback={<UnregisterRowListSkeleton />}>
                    <UnregisterNftDataRowList
                      nftContractAddress={nftContractAddress}
                    />
                  </React.Suspense>
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                colSpan={4}
                count={myUnregisteredNFTArray.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: {
                    "aria-label": "rows per page",
                  },
                  native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </Box>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  const showMyUnregisteredNFTElementTable = () => {
    // console.log("call showMyUnregisteredNFTElementTable()");
    // https://mui.com/material-ui/react-table/
    // https://medium.com/@freshmilkdev/reactjs-render-optimization-for-collapsible-material-ui-long-list-with-checkboxes-231b36892e20
    return (
      <List>
        {myUnregisteredUniqueNFTAddressArray.map((nftContractAddress) => {
          return (
            <ListItem key={getUniqueKey()}>
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                  <TableBody>
                    <UnregisterNftDataRow
                      nftContractAddress={nftContractAddress}
                    />
                  </TableBody>
                </Table>
              </TableContainer>
            </ListItem>
          );
        })}
      </List>
    );
  };

  return (
    <div>
      {/* // * --------------------------------------------------------------*/}
      {/* // * Show metamask.                                                */}
      {/* // * --------------------------------------------------------------*/}
      <p />
      <Divider>
        <Chip label="Metamask" />
      </Divider>
      <p />
      <Metamask blockchainNetwork={blockchainNetwork} />

      {/* // * --------------------------------------------------------------*/}
      {/* // * Show registered NFT with change and unregister button.        */}
      {/* // * --------------------------------------------------------------*/}
      <p />
      <Divider>
        <Chip label="My Registered NFT" />
      </Divider>
      <p />

      {showMyRegisteredNFTElementTable()}

      {/* // * --------------------------------------------------------------*/}
      {/* // * Show my unregistered NFT with request register button.        */}
      {/* // * --------------------------------------------------------------*/}
      <p />
      <Divider>
        <Chip label="My Unregistered NFT" />
      </Divider>
      <p />

      {showMyUnregisteredNFTElementTable()}

      {/* // * --------------------------------------------------------------*/}
      {/* // * Show input dialog.                                            */}
      {/* // * --------------------------------------------------------------*/}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={openInput}
        onClose={() => {
          setOpenInput(false);
        }}
      >
        <DialogTitle>Rent Fee</DialogTitle>
        <DialogContent>
          <p />
          <TextField
            fullWidth
            required
            id="outlined"
            label="Rent Fee"
            name="inputRentFee"
            InputProps={{ style: { fontSize: 12 } }}
            value={inputRentFee}
            onChange={handleChange}
          />
          <p />
          <TextField
            fullWidth
            required
            id="outlined"
            label="Token Address"
            name="inputFeeTokenAddress"
            InputProps={{ style: { fontSize: 12 } }}
            value={inputFeeTokenAddress}
            onChange={handleChange}
          />
          <p />
          <TextField
            fullWidth
            required
            id="outlined"
            label="Rent Fee by Token"
            name="inputRentFeeByToken"
            InputProps={{ style: { fontSize: 12 } }}
            value={inputRentFeeByToken}
            onChange={handleChange}
          />
          <p />
          <TextField
            fullWidth
            required
            id="outlined"
            label="Rent Duration"
            name="inputRentDuration"
            InputProps={{ style: { fontSize: 12 } }}
            value={inputRentDuration}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenInput(false);
            }}
          >
            Close
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
                await rentMarketRef.current.changeNFT(
                  changeElement,
                  inputRentFee.toString(),
                  inputFeeTokenAddress,
                  inputRentFeeByToken.toString(),
                  inputRentDuration
                );
              } catch (error) {
                console.error(error);
                setSnackbarValue({
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
            Change
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast message. */}
      <RBSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        currentTime={snackbarTime}
      />
    </div>
  );
};

export default Content;
