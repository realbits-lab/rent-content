import React from "react";
import { ethers } from "ethers";
import {
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Chip,
  Box,
  List,
  ListItem,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
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
  //----------------------------------------------------------------------------
  // Define input copied variables.
  //----------------------------------------------------------------------------
  const rentMarketRef = React.useRef();
  const [blockchainNetwork, setBlockchainNetwork] = React.useState([]);
  const [myRegisteredNFTArray, setMyRegisteredNFTArray] = React.useState([]);
  const [myUnregisteredNFTArray, setMyUnregisteredNFTArray] = React.useState(
    []
  );

  // Set unique variables for table collapse.
  const [
    myRegisteredUniqueNFTAddressArray,
    setMyRegisteredUniqueNFTAddressArray,
  ] = React.useState([]);
  const [
    myUnregisteredUniqueNFTAddressArray,
    setMyUnregisteredUniqueNFTAddressArray,
  ] = React.useState([]);

  //----------------------------------------------------------------------------
  // Nft list data.
  //----------------------------------------------------------------------------
  const [changeElement, setChangeElement] = React.useState([]);
  const [openInput, setOpenInput] = React.useState(false);

  //----------------------------------------------------------------------------
  // Handle toast message.
  //----------------------------------------------------------------------------
  const [snackbarValue, setSnackbarValue] = React.useState({
    snackbarSeverity: AlertSeverity.info,
    snackbarMessage: "",
    snackbarTime: new Date(),
    snackbarOpen: true,
  });
  const { snackbarSeverity, snackbarMessage, snackbarTime, snackbarOpen } =
    snackbarValue;

  //----------------------------------------------------------------------------
  // Handle text input change.
  //----------------------------------------------------------------------------
  // variables for changeNFT function.
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

  //----------------------------------------------------------------------------
  // Initialize data.
  //----------------------------------------------------------------------------
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

  //----------------------------------------------------------------------------
  // Draw each row in table.
  //----------------------------------------------------------------------------
  const RegisterRowList = React.memo(({ element }) => {
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

  const buildRegisterRowHead = ({ openRow, setOpenRow, nftAddress }) => {
    return (
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        key={getUniqueKey()}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpenRow(!openRow)}
          >
            {openRow ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {nftAddress}
        </TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
      </TableRow>
    );
  };

  const buildRegisterRowBody = ({ openRow, setOpenRow, nftAddress }) => {
    return (
      <TableRow key={getUniqueKey()}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={openRow} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                NFT
              </Typography>
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
                    .filter((element) => element.nftAddress === nftAddress)
                    .map((element) => {
                      // console.log(
                      //   "typeof element.rentDuration: ",
                      //   typeof element.rentDuration
                      // );
                      // console.log(
                      //   "isBigNumber element.rentDuration: ",
                      //   ethers.BigNumber.isBigNumber(element.rentDuration)
                      // );
                      return buildRegisterRowList({ element });
                    })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    );
  };

  const RegisterRow = ({ nftAddress }) => {
    const [openRow, setOpenRow] = React.useState(false);

    return (
      <TableBody>
        {buildRegisterRowHead({ openRow, setOpenRow, nftAddress })}
        {buildRegisterRowBody({ openRow, setOpenRow, nftAddress })}
      </TableBody>
    );
  };

  const showMyRegisteredNFTElementTable = () => {
    // https://mui.com/material-ui/react-table/
    // https://medium.com/@freshmilkdev/reactjs-render-optimization-for-collapsible-material-ui-long-list-with-checkboxes-231b36892e20
    return (
      <List>
        {myRegisteredUniqueNFTAddressArray.map((nftAddress) => (
          <ListItem key={getUniqueKey()}>
            <TableContainer component={Paper}>
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow key={getUniqueKey()}>
                    <TableCell />
                    <TableCell>Address</TableCell>
                  </TableRow>
                </TableHead>
                <RegisterRow nftAddress={nftAddress} />
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

  const UnregisterRowList = React.memo(({ nftAddress }) => {
    console.log("call UnregisterRowList component");

    return myUnregisteredNFTArray
      .filter((element) => element.nftAddress === nftAddress)
      .map((element) => (
        <TableRow key={`TableRow-NFT-${element.nftAddress}-${element.tokenId}`}>
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
  });

  const UnregisterRow = ({ nftAddress }) => {
    console.log("call UnregisterRow component");
    console.log("nftAddress: ", nftAddress);

    const [openRow, setOpenRow] = React.useState(false);

    // TODO: Make the collapse close speed.
    return (
      <React.Fragment key={`React.Fragment-${nftAddress}`}>
        <TableRow
          sx={{ "& > *": { borderBottom: "unset" } }}
          key={`TableRow-Arrow-${nftAddress}`}
        >
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpenRow(!openRow)}
            >
              {openRow ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {nftAddress}
          </TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
        </TableRow>
        <TableRow key={`TableRow-Content-${nftAddress}`}>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={openRow} timeout="auto" unmountOnExit={false}>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  NFT
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow key={`TableRow-Head-${nftAddress}`}>
                      <TableCell>image</TableCell>
                      <TableCell>name</TableCell>
                      <TableCell align="right">tokenId</TableCell>
                      <TableCell align="right">launch</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <React.Suspense fallback={<UnregisterRowListSkeleton />}>
                      <UnregisterRowList nftAddress={nftAddress} />
                    </React.Suspense>
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
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
        {myUnregisteredUniqueNFTAddressArray.map((nftAddress) => {
          return (
            <ListItem key={getUniqueKey()}>
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                  <TableHead>
                    <TableRow key={"addressHead"}>
                      <TableCell />
                      <TableCell>Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <UnregisterRow nftAddress={nftAddress} />
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
      {/*--------------------------------------------------------------------*/}
      {/* 1. Show metamask. */}
      {/*--------------------------------------------------------------------*/}
      <p />
      <Divider>
        <Chip label="Metamask" />
      </Divider>
      <p />
      <Metamask blockchainNetwork={blockchainNetwork} />

      {/*--------------------------------------------------------------------*/}
      {/* 2. Show registered NFT with change and unregister button. */}
      {/*--------------------------------------------------------------------*/}

      <p />
      <Divider>
        <Chip label="My Registered NFT" />
      </Divider>
      <p />

      {showMyRegisteredNFTElementTable()}

      {/*--------------------------------------------------------------------*/}
      {/* 3. Show my unregistered NFT with request register button. */}
      {/*--------------------------------------------------------------------*/}

      <p />
      <Divider>
        <Chip label="My Unregistered NFT" />
      </Divider>
      <p />

      {showMyUnregisteredNFTElementTable()}

      {/*--------------------------------------------------------------------*/}
      {/* 4. Show input dialog. */}
      {/*--------------------------------------------------------------------*/}
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
                console.log("typeof inputRentFee: ", typeof inputRentFee);
                console.log(
                  "typeof inputFeeTokenAddress: ",
                  typeof inputFeeTokenAddress
                );
                console.log(
                  "typeof inputRentFeeByToken: ",
                  typeof inputRentFeeByToken
                );
                console.log(
                  "typeof inputRentDuration: ",
                  typeof inputRentDuration
                );
                console.log("inputRentFee: ", inputRentFee);
                console.log("inputFeeTokenAddress: ", inputFeeTokenAddress);
                console.log("inputRentFeeByToken: ", inputRentFeeByToken);
                console.log("inputRentDuration: ", inputRentDuration);
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
