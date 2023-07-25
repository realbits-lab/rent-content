import React, { useEffect } from "react";
import { formatEther, encodeAbiParameters, parseAbiParameters } from "viem";
import axios from "axios";
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";
import { getContract } from "@wagmi/core";
import { utils } from "ethers";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
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
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import { useRecoilStateLoadable } from "recoil";
import {
  changeIPFSToGateway,
  AlertSeverity,
  RBSize,
  shortenAddress,
  getUniqueKey,
  writeToastMessageState,
} from "@/components/RentContentUtil";
import rentmarketABI from "@/contracts/rentMarket.json";
//* TODO: Test token
import faucetTokenABI from "@/contracts/faucetToken.json";
import rewardTokenABI from "@/contracts/rewardToken.json";

export default function Market() {
  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const SERVICE_OWNER_ADDRESS = process.env.NEXT_PUBLIC_SERVICE_OWNER_ADDRESS;
  const REWARD_TOKEN_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_REWARD_TOKEN_CONTRACT_ADDRESS;

  //*---------------------------------------------------------------------------
  //* Wagmi
  //*---------------------------------------------------------------------------
  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();

  const { data: dataWalletClient, isError, isLoading } = useWalletClient();

  //* getAllRegisterData function.
  const {
    data: dataAllRegisterData,
    isError: isErrorAllRegisterData,
    isLoading: isLoadingAllRegisterData,
    status: statusAllRegisterData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI.abi,
    functionName: "getAllRegisterData",
    watch: true,
  });

  //* getAllCollection function.
  const {
    data: dataAllCollection,
    isError: isErrorAllCollection,
    isLoading: isLoadingAllCollection,
    status: statusAllCollection,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI.abi,
    functionName: "getAllCollection",
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      Promise.all(
        data.map(async (collection) => {
          // console.log("collection: ", collection);
          let response;
          try {
            response = await axios.get(collection.uri, {
              headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Expires: "0",
              },
            });
          } catch (error) {
            console.error(error);
          }
          // console.log("response: ", response);

          return {
            collectionAddress: collection.collectionAddress,
            uri: collection.uri,
            name: response.data.name,
            description: response.data.description,
            image: response.data.image,
          };
        })
      ).then((collectionArray) => {
        // console.log("collectionArray: ", collectionArray);
        setCollectionArray(collectionArray);
      });
    },
  });

  //* rentNFT function
  const {
    data: dataRentNFT,
    isError: isErrorRentNFT,
    isLoading: isLoadingRentNFT,
    write: writeRentNFT,
  } = useContractWrite({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI?.abi,
    functionName: "rentNFT",
  });
  const {
    data: dataRentNFTTx,
    isError: isErrorRentNFTTx,
    isLoading: isLoadingRentNFTTx,
  } = useWaitForTransaction({
    hash: dataRentNFT?.hash,
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

  const { data: dataRentNftByToken, write: writeRentNftByToken } =
    useContractWrite({
      address: RENT_MARKET_CONTRACT_ADDRESS,
      abi: rentmarketABI.abi,
      functionName: "rentNFTByToken",
    });
  const {
    isLoading: isLoadingRentNftByToken,
    isSuccess: isSuccessRentNftByToken,
  } = useWaitForTransaction({
    hash: dataRentNftByToken?.hash,
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage:
          "Renting nft by token transaction is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
  });

  //*---------------------------------------------------------------------------
  //* Define copied local varialbe from input data.
  //*---------------------------------------------------------------------------
  const [collectionArray, setCollectionArray] = React.useState([]);

  //*---------------------------------------------------------------------------
  //* Define collection array data.
  //*---------------------------------------------------------------------------
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
  const handleListCollectionClick = (collection) => {
    setCollectionMetadata({
      collectionAddress: collection.collectionAddress,
      collectionName: collection.name,
      collectionDescription: collection.description,
      collectionImage: collection.image,
    });
  };

  //*---------------------------------------------------------------------------
  //* Define pagination data.
  //*---------------------------------------------------------------------------
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  //*---------------------------------------------------------------------------
  //* Handle toast message.
  //*---------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);

  useEffect(() => {
    // console.log("call useEffect()");

    if (collectionArray.length > 0) {
      handleListCollectionClick(collectionArray[0]);
    }
  }, []);

  async function erc20PermitSignature({ owner, spender, amount, contract }) {
    // console.log("call erc20PermitSignature()");
    // console.log("owner: ", owner);
    // console.log("spender: ", spender);
    // console.log("amount: ", amount);

    try {
      //* Deadline is 20 minutes later from current timestamp.
      const transactionDeadline = Date.now() + 20 * 60;
      // console.log("transactionDeadline: ", transactionDeadline);
      const nonce = await contract.read.nonces({ args: [owner] });
      // console.log("nonce: ", nonce);
      const contractName = await contract.read.name();
      // console.log("contractName: ", contractName);
      const EIP712Domain = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ];
      // console.log("chain: ", chain);
      const domain = {
        name: contractName,
        version: "1",
        chainId: chain.id,
        verifyingContract: contract.address,
      };
      const Permit = [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ];
      const message = {
        owner,
        spender,
        value: amount.toString(),
        nonce: nonce.toString(16),
        deadline: transactionDeadline,
      };
      const msgParams = JSON.stringify({
        types: {
          EIP712Domain,
          Permit,
        },
        domain,
        primaryType: "Permit",
        message,
      });

      const params = [address, msgParams];
      const method = "eth_signTypedData_v4";
      // console.log("params: ", params);
      // console.log("method: ", method);
      const signature = await ethereum.request({
        method,
        params,
      });
      // console.log("signature: ", signature);
      const signData = utils.splitSignature(signature);
      const { r, s, v } = signData;
      return {
        r,
        s,
        v,
        deadline: transactionDeadline,
      };
    } catch (error) {
      console.error("error: ", error);
      return error;
    }
  }

  function buildRowList({ element, key }) {
    // console.log("call buildRowList()");
    // console.log("element: ", element);

    return (
      <TableRow key={key}>
        <TableCell align="center">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Avatar
              alt="image"
              src={changeIPFSToGateway(element.image)}
              sx={{ width: RBSize.big, height: RBSize.big }}
            />
          </Box>
        </TableCell>

        <TableCell align="center">{element.name}</TableCell>

        <TableCell align="center">
          <Button
            color="primary"
            variant="outlined"
            onClick={async () => {
              writeRentNFT?.({
                args: [
                  element.nftAddress,
                  element.tokenId,
                  SERVICE_OWNER_ADDRESS,
                ],
              });
            }}
          >
            {formatEther(element.rentFee)}
          </Button>
        </TableCell>
        <TableCell align="center">
          <Button
            color="primary"
            variant="outlined"
            onClick={async () => {
              const contract = getContract({
                address: element.feeTokenAddress,
                abi: faucetTokenABI.abi,
              });
              // console.log("contract: ", contract);

              const { r, s, v, deadline } = await erc20PermitSignature({
                owner: address,
                spender: RENT_MARKET_CONTRACT_ADDRESS,
                amount: element.rentFeeByToken,
                contract: contract,
              });

              try {
                writeRentNftByToken?.({
                  args: [
                    element.nftAddress,
                    element.tokenId,
                    SERVICE_OWNER_ADDRESS,
                    deadline,
                    v,
                    r,
                    s,
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
            }}
          >
            {formatEther(element.rentFeeByToken)}
          </Button>
        </TableCell>
        <TableCell align="center">{Number(element.rentDuration)}</TableCell>
      </TableRow>
    );
  }

  function buildCollectionMetadataCard() {
    if (collectionArray.length === 0) {
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
              <Skeleton
                variant="rounded"
                width={RBSize.double}
                height={RBSize.double}
              />
              <CardContent>
                <Typography component="div" variant="h6">
                  <Skeleton variant="rounded" width={200} height={10} />
                </Typography>
                <br />
                <Typography>
                  <Skeleton variant="rounded" width={200} height={10} />
                </Typography>
                <br />
                <Typography>
                  <Skeleton variant="rounded" width={200} height={10} />
                </Typography>
              </CardContent>
            </Card>
          </TableCell>
        </TableRow>
      );
    }

    const url = changeIPFSToGateway(collectionImage);

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
                    address: collectionAddress,
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

  function buildNFTDataTableSkeleton() {
    return (
      <Table size="small" aria-label="purchases">
        <TableHead>
          <TableRow key={getUniqueKey()}>
            <TableCell align="center">Content</TableCell>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">Rent by Matic</TableCell>
            <TableCell align="center">Rent by Token</TableCell>
            <TableCell align="center">Rent Duration</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow key={getUniqueKey()}>
            <TableCell align="center">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Skeleton
                    variant="circular"
                    width={RBSize.big}
                    height={RBSize.big}
                  />
                </Box>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="text" />
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="text" />
            </TableCell>
            <TableCell align="center">
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
    }

    const selectedRegisterNFTArray = dataAllRegisterData?.filter(
      (registerData) =>
        registerData.nftAddress.toLowerCase() ===
        collectionAddress.toLowerCase()
    );

    return (
      <Table>
        <TableBody key={getUniqueKey()}>
          {buildCollectionMetadataCard()}

          <TableRow key={getUniqueKey()}>
            <TableCell
              style={{
                padding: 0,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow key={getUniqueKey()} spacing={0}>
                    <TableCell align="center">Content</TableCell>
                    <TableCell align="center">Name</TableCell>
                    <TableCell align="center">Rent by Matic</TableCell>
                    <TableCell align="center">Rent by Token</TableCell>
                    <TableCell align="center">Rent Duration</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedRegisterNFTArray
                    ?.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    .map((element, idx) => {
                      // console.log("element: ", element);
                      return buildRowList({
                        element,
                        key: idx,
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
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  function buildCollectionList() {
    // console.log("call buildCollectionList()");
    // console.log("collectionArray: ", collectionArray);

    return (
      <List style={{ display: "flex", flexDirection: "row", padding: 10 }}>
        {collectionArray.map((collection, idx) => {
          // console.log("collection: ", collection);

          return (
            <ListItem key={idx} disablePadding>
              <ListItemButton
                selected={collectionAddress === collection.collectionAddress}
                onClick={(event) => handleListCollectionClick(collection)}
              >
                <Tooltip title={collection.name}>
                  <Avatar
                    src={collection.image}
                    variant="rounded"
                    sx={{ width: RBSize.middle, height: RBSize.middle }}
                  />
                </Tooltip>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
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

  function TablePageComponent({ selectedRegisterNFTArray }) {
    // console.log("call TablePageComponent()");
    // console.log("page: ", page);
    // console.log("rowsPerPage: ", rowsPerPage);

    return (
      <TablePagination
        key={getUniqueKey()}
        rowsPerPageOptions={[5, 10, 20]}
        count={selectedRegisterNFTArray.length}
        page={page}
        rowsPerPage={rowsPerPage}
        labelRowsPerPage={""}
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
      {/*//*-----------------------------------------------------------------*/}
      {/*//* Collection list.                                                */}
      {/*//*-----------------------------------------------------------------*/}
      <Grid
        container
        padding={0}
        spacing={0}
        display="flex"
        direction="column"
        justifyContent="flex-start"
      >
        <Grid item>{buildCollectionList()}</Grid>
        <Grid item>{buildNFTDataTable()}</Grid>
      </Grid>
    </>
  );
}
