import React, { useState, useEffect, useCallback } from "react";
import { useContractRead } from "wagmi";
import { parseAbiItem, decodeEventLog, formatEther } from "viem";
import { getPublicClient } from "@wagmi/core";
import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";
import {
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useRecoilStateLoadable } from "recoil";
import {
  shortenAddress,
  writeToastMessageState,
} from "@/components/RentContentUtil";
import paymentNFTABI from "@/contracts/paymentNFT.json";
import rentMarketABI from "@/contracts/rentMarket.json";

export default function MonitorPaymentNFT() {
  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const PAYMENT_NFT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_NFT_ADDRESS;
  const PAYMENT_NFT_TOKEN = process.env.NEXT_PUBLIC_PAYMENT_NFT_TOKEN;
  const [rentNFTEventLogs, setRentNFTEventLogs] = useState();
  const [rentingNFTData, setRentingNFTData] = useState();

  const { data: dataName } = useContractRead({
    address: PAYMENT_NFT_ADDRESS,
    abi: paymentNFTABI?.abi,
    functionName: "name",
  });
  const { data: dataSymbol } = useContractRead({
    address: PAYMENT_NFT_ADDRESS,
    abi: paymentNFTABI?.abi,
    functionName: "symbol",
  });

  //* getRegisterData function
  const {
    data: dataRegisterData,
    isError: isErrorRegisterData,
    isLoading: isLoadingRegisterData,
    status: statusRegisterData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentMarketABI?.abi,
    functionName: "getRegisterData",
    args: [PAYMENT_NFT_ADDRESS, PAYMENT_NFT_TOKEN],
    watch: true,
  });
  // console.log("dataRegisterData: ", dataRegisterData);

  //* getAllRentData function
  const {
    data: dataAllRentData,
    isError: isErrorAllRentData,
    isLoading: isLoadingAllRentData,
    status: statusAllRentData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentMarketABI?.abi,
    functionName: "getAllRentData",
    watch: true,
    onSuccess(data) {
      const filteredData = data.filter(
        (rentData) =>
          rentData.nftAddress.toLowerCase() ===
            PAYMENT_NFT_ADDRESS.toLowerCase() &&
          Number(rentData.tokenId) === Number(PAYMENT_NFT_TOKEN)
      );
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
      setRentingNFTData(filteredData);
    },
  });

  //*---------------------------------------------------------------------------
  //* Snackbar message.
  //*---------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);

  const getEventLogsOfRentNFT = useCallback(
    async function () {
      const publicClient = getPublicClient();
      // console.log("publicClient: ", publicClient);

      const eventABI = rentMarketABI?.abi.find((abi) => {
        return abi.name === "RentNFT" && abi.type === "event";
      });
      // console.log("eventABI: ", eventABI);

      const logs = await publicClient.getLogs({
        address: RENT_MARKET_CONTRACT_ADDRESS,
        event: eventABI,
        args: {
          nftAddress: PAYMENT_NFT_ADDRESS,
          tokenId: PAYMENT_NFT_TOKEN,
        },
        fromBlock: 27956165n,
        toBlock: "latest",
        strict: false,
      });
      // console.log("logs: ", logs);

      let topics = [];
      logs.map((log) => {
        const topic = decodeEventLog({
          abi: rentMarketABI?.abi,
          data: log.data,
          topics: log.topics,
        });
        // console.log("topic: ", topic);
        topics.push(topic.args);
      });
      // feeTokenAddress : "0x0000000000000000000000000000000000000000"
      // isRentByToken : false
      // nftAddress : "0xF9216634EB66c8c3b7A77B631fa8AFf26e88417c"
      // rentDuration : 10n
      // rentFee : 100000000000000000n
      // rentFeeByToken : 0n
      // rentStartTimestamp : 1689753436n
      // renteeAddress : "0x1e60Cf7B8fB0B7EaD221CF8D0e7d19c863FfbE40"
      // renterAddress : "0x3851dacd8fA9F3eB64D69151A3597F33E5960A2F"
      // serviceAddress : "0x3851dacd8fA9F3eB64D69151A3597F33E5960A2F"
      // tokenId : 1n
      setRentNFTEventLogs(topics);
    },
    [PAYMENT_NFT_ADDRESS, PAYMENT_NFT_TOKEN, RENT_MARKET_CONTRACT_ADDRESS]
  );

  useEffect(() => {
    // console.log("call useEffect()");
    momentDurationFormatSetup(moment);

    getEventLogsOfRentNFT();
  }, [getEventLogsOfRentNFT]);

  return (
    <>
      {/*//*-----------------------------------------------------------------*/}
      {/*//* Payment NFT                                                     */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ marginTop: "20px", marginBottom: "20px" }}>
        <Chip label="Payment NFT" />
      </Divider>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Symbol</TableCell>
              <TableCell align="center">Address</TableCell>
              <TableCell align="center">Id</TableCell>
              <TableCell align="center">Rent duration</TableCell>
              <TableCell align="center">Rent Fee by Token</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="center">{dataName}</TableCell>
              <TableCell align="center">{dataSymbol}</TableCell>
              <TableCell align="center">
                {shortenAddress({
                  address: PAYMENT_NFT_ADDRESS,
                  withLink: "scan",
                })}
              </TableCell>
              <TableCell align="center">{PAYMENT_NFT_TOKEN}</TableCell>
              <TableCell align="center">
                {moment
                  .duration(Number(dataRegisterData?.rentDuration), "seconds")
                  .format()}
              </TableCell>
              <TableCell align="center">
                {formatEther(dataRegisterData?.rentFeeByToken || BigInt(0))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Renting NFT                                                     */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ marginTop: "20px", marginBottom: "20px" }}>
        <Chip label="Renting NFT" />
      </Divider>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">rentDuration</TableCell>
              <TableCell align="center">rentFee</TableCell>
              <TableCell align="center">rentFeeByToken</TableCell>
              <TableCell align="center">feeTokenAddress</TableCell>
              <TableCell align="center">rentStartTimestamp</TableCell>
              <TableCell align="center">renteeAddress</TableCell>
              <TableCell align="center">renterAddress</TableCell>
              <TableCell align="center">serviceAddress</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rentingNFTData?.map((rentData, idx) => {
              // console.log("rentData: ", rentData);
              return (
                <>
                  <TableRow
                    key={idx}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="center">
                      {Number(rentData.rentDuration)}
                    </TableCell>
                    <TableCell align="center">
                      {formatEther(rentData.rentFee)}
                    </TableCell>
                    <TableCell align="center">
                      {formatEther(rentData.rentFeeByToken)}
                    </TableCell>
                    <TableCell align="center">
                      {shortenAddress({
                        address: rentData.feeTokenAddress,
                        withLink: "scan",
                      })}
                    </TableCell>
                    <TableCell align="center">
                      {moment
                        .unix(Number(rentData.rentStartTimestamp))
                        .format("YYYY/MM/DD-kk:mm:ss")}
                    </TableCell>
                    <TableCell align="center">
                      {shortenAddress({
                        address: rentData.renteeAddress,
                        withLink: "scan",
                      })}
                    </TableCell>
                    <TableCell align="center">
                      {shortenAddress({
                        address: rentData.renterAddress,
                        withLink: "scan",
                      })}
                    </TableCell>
                    <TableCell align="center">
                      {shortenAddress({
                        address: rentData.serviceAddress,
                        withLink: "scan",
                      })}
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Rented NFT                                                      */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ marginTop: "20px", marginBottom: "20px" }}>
        <Chip label="Rented NFT" />
      </Divider>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">rentDuration</TableCell>
              <TableCell align="center">rentFee</TableCell>
              <TableCell align="center">rentFeeByToken</TableCell>
              <TableCell align="center">feeTokenAddress</TableCell>
              <TableCell align="center">rentStartTimestamp</TableCell>
              <TableCell align="center">renteeAddress</TableCell>
              <TableCell align="center">renterAddress</TableCell>
              <TableCell align="center">serviceAddress</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rentNFTEventLogs?.map((eventLog, idx) => {
              // console.log("eventLog: ", eventLog);
              return (
                <>
                  <TableRow
                    key={idx}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="center">
                      {Number(eventLog.rentDuration)}
                    </TableCell>
                    <TableCell align="center">
                      {formatEther(eventLog.rentFee)}
                    </TableCell>
                    <TableCell align="center">
                      {formatEther(eventLog.rentFeeByToken)}
                    </TableCell>
                    <TableCell align="center">
                      {shortenAddress({
                        address: eventLog.feeTokenAddress,
                        withLink: "scan",
                      })}
                    </TableCell>
                    <TableCell align="center">
                      {moment
                        .unix(Number(eventLog.rentStartTimestamp))
                        .format("YYYY/MM/DD-kk:mm:ss")}
                    </TableCell>
                    <TableCell align="center">
                      {shortenAddress({
                        address: eventLog.renteeAddress,
                        withLink: "scan",
                      })}
                    </TableCell>
                    <TableCell align="center">
                      {shortenAddress({
                        address: eventLog.renterAddress,
                        withLink: "scan",
                      })}
                    </TableCell>
                    <TableCell align="center">
                      {shortenAddress({
                        address: eventLog.serviceAddress,
                        withLink: "scan",
                      })}
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
