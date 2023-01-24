import React from "react";
import moment from "moment";
import { ethers } from "ethers";
import { Network, Alchemy } from "alchemy-sdk";
import keccak256 from "keccak256";
import { Buffer } from "buffer";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useRecoilStateLoadable } from "recoil";
import {
  getUniqueKey,
  shortenAddress,
  AlertSeverity,
  writeToastMessageState,
  getChainName,
  LOCAL_CHAIN_ID,
} from "./RentContentUtil";

// TODO: Add event monitor of settleRentData.
// https://docs.alchemy.com/docs/deep-dive-into-eth_getlogs
const MonitorRentNft = ({
  inputRentMarket,
  rentMarketAddress,
  inputBlockchainNetwork,
}) => {
  // * Define constant varialbe.
  const TABLE_MIN_WIDTH = 400;

  // * Define rent market class.
  const rentMarketRef = React.useRef();
  const [rentArray, setRentArray] = React.useState([]);
  const [rentEventArray, setRentEventArray] = React.useState([]);

  // * Define alchemy configuration.
  const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
    network: Network.MATIC_MUMBAI,
  };
  const alchemy = new Alchemy(settings);

  // * Handle toast message.
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);
  const writeToastMessage = React.useMemo(() => {
    return writeToastMessageLoadable?.state === "hasValue"
      ? writeToastMessageLoadable.contents
      : {
          snackbarSeverity: AlertSeverity.info,
          snackbarMessage: "",
          snackbarTime: new Date(),
          snackbarOpen: true,
        };
  });

  // * Init function.
  React.useEffect(() => {
    window.Buffer = window.Buffer || Buffer;

    if (
      inputRentMarket !== undefined &&
      inputRentMarket.rentMarketContract !== undefined
    ) {
      rentMarketRef.current = inputRentMarket;
      rentMarketRef.current.getAllRentData().then(
        (resultRentArray) => setRentArray(resultRentArray),
        (error) => {
          // console.log("getAllAccountBalance error: ", error);
          setWriteToastMessage({
            snackbarSeverity: AlertSeverity.error,
            snackbarMessage: error?.message,
            snackbarTime: new Date(),
            snackbarOpen: true,
          });
        }
      );
    } else {
      const chainName = getChainName({ chainId: inputBlockchainNetwork });
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.error,
        snackbarMessage: `Metamask is not connect or not connected to ${chainName}.`,
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    }

    // Get and set the latest block number.
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    const eventHash = keccak256(
      "RentNFT(address,uint256,uint256,address,uint256,bool,uint256,address,address,address,uint256)"
    );
    const topicHash = `0x${Buffer.from(eventHash).toString("hex")}`;
    // console.log("call getLogs()");
    // console.log("eventHash: ", eventHash);
    // console.log("topicHash: ", topicHash);
    // Get logs for a certain address, with specified topics and blockHash
    // event RentNFT(
    //   address indexed nftAddress,
    //   uint256 indexed tokenId,
    //   uint256 rentFee,
    //   address feeTokenAddress,
    //   uint256 rentFeeByToken,
    //   bool isRentByToken,
    //   uint256 rentDuration,
    //   address renterAddress,
    //   address indexed renteeAddress,
    //   address serviceAddress,
    //   uint256 rentStartTimestamp
    // );
    // data and topic unit is 64 byte.
    // https://docs.alchemy.com/docs/deep-dive-into-eth_getlogs
    let fromBlock;
    let promiseGetLogs;
    if (inputBlockchainNetwork === LOCAL_CHAIN_ID) {
      fromBlock = 0;
      promiseGetLogs = provider.getLogs({
        // https://mumbai.polygonscan.com/address/0xde55A9C006a2786BFC365D1Fbc7c769b907D6709
        fromBlock: fromBlock,
        toBlock: "latest",
        address: rentMarketAddress,
        topics: [topicHash],
      });
    } else {
      fromBlock = 27956165;
      promiseGetLogs = alchemy.core.getLogs({
        // https://mumbai.polygonscan.com/address/0xde55A9C006a2786BFC365D1Fbc7c769b907D6709
        fromBlock: fromBlock,
        toBlock: "latest",
        address: rentMarketAddress,
        topics: [topicHash],
      });
    }

    promiseGetLogs.then((response) => {
      // console.log("response: ", response);
      const eventArray = response.map((event) => {
        // data value
        // 0x
        // 00000000000000000000000000000000000000000000000000038d7ea4c68000
        // 0000000000000000000000000000000000000000000000000000000000000000
        // 0000000000000000000000000000000000000000000000000000000000000000
        // 0000000000000000000000000000000000000000000000000000000000000000
        // 0000000000000000000000000000000000000000000000000000000000000064
        // 0000000000000000000000001e60cf7b8fb0b7ead221cf8d0e7d19c863ffbe40
        // 00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8
        // 0000000000000000000000000000000000000000000000000000000001aa9e95
        // console.log("event: ", event);
        // data has 514 bytes with "0x"
        const startIndex = 2;
        const endIndex = 66;

        // const nftAddress = Buffer.from(event.topics[0]).toString("hex");
        const nftAddress = `0x${event.topics[1].slice(
          startIndex + 24,
          endIndex
        )}`;
        const tokenId = Number(event.topics[2]).toString();
        const renteeAddress = `0x${event.topics[3].slice(
          startIndex + 24,
          endIndex
        )}`;

        const rentFee =
          ethers.BigNumber.from(`0x${event.data.slice(startIndex, endIndex)}`) /
          Math.pow(10, 18);
        const feeTokenAddress = `0x${event.data.slice(
          startIndex + 64 + 24,
          endIndex + 64
        )}`;
        const rentFeeByToken =
          ethers.BigNumber.from(
            event.data.slice(startIndex + 128, endIndex + 128)
          ) / Math.pow(10, 18);
        const isRentByToken = new Boolean(
          Number(`0x${event.data.slice(startIndex + 192, endIndex + 192)}`)
        ).toString();
        const rentDuration = Number(
          `0x${event.data.slice(startIndex + 256, endIndex + 256)}`
        );
        // address is 40 bytes, so add 24 (total is 64 bbytes)
        const renterAddress = `0x${event.data.slice(
          startIndex + 320 + 24,
          endIndex + 320
        )}`;
        const serviceAddress = `0x${event.data.slice(
          startIndex + 384 + 24,
          endIndex + 384
        )}`;
        const rentStartTimestamp = Number(
          `0x${event.data.slice(startIndex + 448, endIndex + 448)}`
        );

        // console.log("nftAddress: ", nftAddress);
        // console.log("tokenId: ", tokenId);
        // console.log("rentFee: ", rentFee);
        // console.log("feeTokenAddress: ", feeTokenAddress);
        // console.log("rentFeeByToken: ", rentFeeByToken);
        // console.log("isRentByToken: ", isRentByToken);
        // console.log("rentDuration: ", rentDuration);
        // console.log("renterAddress: ", renterAddress);
        // console.log("renteeAddress: ", renteeAddress);
        // console.log("serviceAddress: ", serviceAddress);
        // console.log("rentStartTimestamp: ", rentStartTimestamp);

        return {
          key: `${event.blockNumber}${nftAddress}${tokenId}`,
          nftAddress,
          tokenId,
          rentFee,
          feeTokenAddress,
          rentFeeByToken,
          isRentByToken,
          rentDuration,
          renterAddress,
          renteeAddress,
          serviceAddress,
          rentStartTimestamp,
        };
      });

      setRentEventArray(eventArray);
    });
  }, [inputRentMarket]);

  return (
    <div>
      {/* // * --------------------------------------------------------------*/}
      {/* // * Show current all rent data.                                   */}
      {/* // * --------------------------------------------------------------*/}

      <Divider sx={{ margin: "5px" }}>
        <Chip label="Current Rent Data" />
      </Divider>

      <TableContainer component={Paper}>
        <Table
          size="small"
          sx={{
            width: "max-content",
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "lightgrey",
                borderBottom: "2px solid black",
                "& th": {
                  fontSize: "10px",
                },
              }}
            >
              <TableCell align="center">NFT Address</TableCell>
              <TableCell align="center">Token ID</TableCell>
              <TableCell align="center">Rent Fee</TableCell>
              <TableCell align="center">Fee Token Address</TableCell>
              <TableCell align="center">Rent Fee by Token</TableCell>
              <TableCell align="center">Is rent by Token</TableCell>
              <TableCell align="center">Rent Duration</TableCell>
              <TableCell align="center">Rent Start Timestamp</TableCell>
              <TableCell align="center">Rent Remain Timestamp</TableCell>
              <TableCell align="center">Settle</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rentArray.map((row) => {
              // console.log("row: ", row);
              // struct rentData {
              //     address nftAddress;
              //     uint256 tokenId;
              //     uint256 rentFee;
              //     address feeTokenAddress;
              //     uint256 rentFeeByToken;
              //     bool isRentByToken;
              //     uint256 rentDuration;
              //     address renterAddress;
              //     address renteeAddress;
              //     address serviceAddress;
              //     uint256 rentStartTimestamp;
              // }

              // * Get display timestamp string.
              const durationTimestampDisplay = `${moment
                .unix(row.rentDuration.toNumber())
                .diff(0, "days", true)} day`;
              // * https://momentjs.com/docs/#/displaying/format/
              const rentStartTimestampDisplay = moment
                .unix(row.rentStartTimestamp.toNumber())
                .format("YYYY/MM/DD-kk:mm:ss");

              // * Get remain timestamp.
              const currentTimestamp = Math.round(new Date().getTime() / 1000);
              const remainTimestamp = row.rentStartTimestamp - currentTimestamp;
              let remainTimestampDisplay;

              // Make settle button.
              let disabledSettle = true;
              if (remainTimestamp < 0) {
                // Make settle button enable.
                disabledSettle = false;
                remainTimestampDisplay = moment
                  .unix(row.rentStartTimestamp.add(row.rentDuration).toNumber())
                  .fromNow();
              } else {
                // Make settle button disable.
                disabledSettle = true;
                remainTimestampDisplay = moment
                  .unix(row.rentStartTimestamp.add(row.rentDuration).toNumber())
                  .toNow();
              }

              const settleButton = (
                <Button
                  variant="outlined"
                  disabled={disabledSettle}
                  onClick={async () => {
                    try {
                      // console.log("row.nftAddress: ", row.nftAddress);
                      // console.log("row.tokenId: ", row.tokenId);
                      await rentMarketRef.current.settleRentData(
                        row.nftAddress,
                        row.tokenId
                      );
                    } catch (error) {
                      console.error(error);
                      setWriteToastMessage({
                        snackbarSeverity: AlertSeverity.error,
                        snackbarMessage: error?.reason,
                        snackbarTime: new Date(),
                        snackbarOpen: true,
                      });
                    }
                  }}
                >
                  SETTLE
                </Button>
              );

              return (
                <TableRow
                  key={getUniqueKey()}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "& td": {
                      fontSize: "0.7rem",
                      color: "rgba(96, 96, 96)",
                    },
                  }}
                >
                  <TableCell align="center">
                    {shortenAddress({ address: row.nftAddress, number: 2 })}
                  </TableCell>
                  <TableCell align="center">{row.tokenId.toNumber()}</TableCell>
                  <TableCell align="center">
                    {row.rentFee / Math.pow(10, 18)}
                  </TableCell>
                  <TableCell align="center">
                    {shortenAddress({
                      address: row.feeTokenAddress,
                      number: 2,
                    })}
                  </TableCell>
                  <TableCell align="center">
                    {row.rentFeeByToken.toNumber()}
                  </TableCell>
                  <TableCell align="center">
                    {row.isRentByToken.toString()}
                  </TableCell>
                  <TableCell align="center">
                    {durationTimestampDisplay}
                  </TableCell>
                  <TableCell align="center">
                    {rentStartTimestampDisplay}
                  </TableCell>
                  <TableCell align="center">{remainTimestampDisplay}</TableCell>
                  <TableCell align="center">{settleButton}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* // * --------------------------------------------------------------*/}
      {/* // * Show all rent event history.                                  */}
      {/* // * --------------------------------------------------------------*/}
      <Divider sx={{ margin: "5px" }}>
        <Chip label="Rent Event History" />
      </Divider>

      <TableContainer component={Paper}>
        <Table
          size="small"
          sx={{
            width: "max-content",
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "lightgrey",
                borderBottom: "2px solid black",
                "& th": {
                  fontSize: "10px",
                },
              }}
            >
              <TableCell align="right" fontSize="10pt">
                NFT Address
              </TableCell>
              <TableCell align="right">Token ID</TableCell>
              <TableCell align="right">Rent Fee</TableCell>
              <TableCell align="right">Fee Token Address</TableCell>
              <TableCell align="right">Rent Fee by Token</TableCell>
              <TableCell align="right">Is rent by Token</TableCell>
              <TableCell align="right">Rent Duration</TableCell>
              <TableCell align="right">Renter Address</TableCell>
              <TableCell align="right">Rentee Address</TableCell>
              <TableCell align="right">Service Address</TableCell>
              <TableCell align="right">rentStartTimestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rentEventArray.map((row) => {
              // console.log("row: ", row);
              return (
                <TableRow
                  key={row.key}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    // backgroundColor: "yellow",
                    // borderBottom: "2px solid black",
                    "& td": {
                      fontSize: "0.7rem",
                      color: "rgba(96, 96, 96)",
                    },
                  }}
                >
                  <TableCell align="right">
                    {shortenAddress({ address: row.nftAddress, number: 2 })}
                  </TableCell>
                  <TableCell align="right">{row.tokenId}</TableCell>
                  <TableCell align="right">{row.rentFee}</TableCell>
                  <TableCell align="right">
                    {shortenAddress({
                      address: row.feeTokenAddress,
                      number: 2,
                    })}
                  </TableCell>
                  <TableCell align="right">{row.rentFeeByToken}</TableCell>
                  <TableCell align="right">{row.isRentByToken}</TableCell>
                  <TableCell align="right">{row.rentDuration}</TableCell>
                  <TableCell align="right">
                    {shortenAddress({ address: row.renterAddress, number: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    {shortenAddress({ address: row.renteeAddress, number: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    {shortenAddress({ address: row.serviceAddress, number: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    {row.rentStartTimestamp.toString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MonitorRentNft;
