import React from "react";
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractReads,
  useContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";
import { ethers } from "ethers";
import { Network, Alchemy } from "alchemy-sdk";
import keccak256 from "keccak256";
import { Buffer } from "buffer";
import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";
import {
  Divider,
  Chip,
  Link,
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
  AlertSeverity,
  writeToastMessageState,
  getChainName,
} from "@/components/RentContentUtil";
import rentmarketABI from "@/contracts/rentMarket.json";
import rewardTokenABI from "@/contracts/rewardToken.json";
import rewardTokenShareABI from "@/contracts/rewardTokenShare.json";
import faucetTokenABI from "@/contracts/faucetToken.json";

export default function MonitorReward() {
  const REWARD_TOKEN_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_REWARD_TOKEN_CONTRACT_ADDRESS;
  const REWARD_TOKEN_SHARE_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_REWARD_TOKEN_SHARE_CONTRACT_ADDRESS;
  const BLOCKCHAIN_NETWORK = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;
  const [tokenEventArray, setTokenEventArray] = React.useState([]);

  //*---------------------------------------------------------------------------
  //* Define alchemy configuration.
  //*---------------------------------------------------------------------------
  const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
    network: Network.MATIC_MUMBAI,
  };
  const alchemy = new Alchemy(settings);

  //*---------------------------------------------------------------------------
  //* Handle toast message.
  //*---------------------------------------------------------------------------
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
  }, [writeToastMessageLoadable.contents, writeToastMessageLoadable?.state]);

  //*---------------------------------------------------------------------------
  //* Wagmi hook functions.
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;

  const rewardTokenContract = {
    address: REWARD_TOKEN_CONTRACT_ADDRESS,
    abi:
      BLOCKCHAIN_NETWORK === "matic" ? rewardTokenABI.abi : faucetTokenABI.abi,
  };
  const rewardTokenContractFunctions = [
    {
      ...rewardTokenContract,
      functionName: "name",
    },
    {
      ...rewardTokenContract,
      functionName: "symbol",
    },
    {
      ...rewardTokenContract,
      functionName: "totalSupply",
    },
    {
      ...rewardTokenContract,
      functionName: "rewardTokenShareContractAddress",
    },
    {
      ...rewardTokenContract,
      functionName: "start",
    },
    {
      ...rewardTokenContract,
      functionName: "duration",
    },
    {
      ...rewardTokenContract,
      functionName: "frequency",
    },
    {
      ...rewardTokenContract,
      functionName: "totalReleased",
    },
    {
      ...rewardTokenContract,
      functionName: "currentReleasable",
    },
    {
      ...rewardTokenContract,
      functionName: "totalAllocation",
    },
    {
      ...rewardTokenContract,
      functionName: "minimumReleasable",
    },
    {
      ...rewardTokenContract,
      functionName: "remainingTimestampToNextVesting",
    },
  ];
  const {
    data: dataRewardToken,
    isError: isErrorRewardToken,
    isLoading: isLoadingRewardToken,
    status: statusRewardToken,
  } = useContractReads({
    contracts: rewardTokenContractFunctions,
    watch: true,
  });
  console.log("dataRewardToken: ", dataRewardToken);

  const rewardTokenShareContract = {
    address: REWARD_TOKEN_SHARE_CONTRACT_ADDRESS,
    abi: rewardTokenShareABI.abi,
  };
  const rewardTokenShareContractFunctions = [
    {
      ...rewardTokenShareContract,
      functionName: "getRewardTokenBalance",
    },
    {
      ...rewardTokenShareContract,
      functionName: "getRewardTokenContractAddress",
    },
    {
      ...rewardTokenShareContract,
      functionName: "getProjectTeamAccountAddress",
    },
    {
      ...rewardTokenShareContract,
      functionName: "getRentMarketContractAddressArray",
    },
  ];
  const {
    data: dataRewardTokenShare,
    isError: isErrorRewardTokenShare,
    isLoading: isLoadingRewardTokenShare,
    status: statusRewardTokenShare,
  } = useContractReads({
    contracts: rewardTokenShareContractFunctions,
  });
  console.log("dataRewardTokenShare: ", dataRewardTokenShare);

  React.useEffect(() => {
    // console.log("call useEffect()");

    momentDurationFormatSetup(moment);

    const eventHash = keccak256("RegisterToken(address,name)");
    const topicHash = `0x${Buffer.from(eventHash).toString("hex")}`;
    alchemy.core
      .getLogs({
        fromBlock: 27956165,
        toBlock: "latest",
        address: RENT_MARKET_CONTRACT_ADDRES,
        topics: [topicHash],
      })
      .then((response) => {
        // console.log("response: ", response);
        const eventArray = response.map((event) => {
          // console.log("event: ", event);
          // data has 514 bytes with "0x"
          const startIndex = 2;
          const endIndex = 66;

          const tokenAddress = `0x${event.topics[1].slice(
            startIndex + 24,
            endIndex
          )}`;

          const name = event.data.slice(startIndex, endIndex);
          // console.log("tokenAddress: ", tokenAddress);
          // console.log("name: ", name);

          return {
            key: `${event.blockNumber}${tokenAddress}`,
            tokenAddress,
            name,
          };
        });

        setTokenEventArray(eventArray);
      });
  }, []);

  return (
    <div>
      {/*//*-----------------------------------------------------------------*/}
      {/*//* Reward token                                                    */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ marginTop: "20px", marginBottom: "20px" }}>
        <Chip label="Reward Token" />
      </Divider>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Key</TableCell>
              <TableCell align="center">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataRewardToken &&
              Object.entries(rewardTokenContractFunctions).map((func, idx) => {
                const functionName = func[1].functionName;
                // console.log("func: ", func);
                if (dataRewardToken[idx].status === "success") {
                  let value;
                  // if (typeof dataRewardToken[idx].result === "bigint") {
                  if (
                    functionName === "totalSupply" ||
                    functionName === "currentReleasable" ||
                    functionName === "totalAllocation" ||
                    functionName === "minimumReleasable"
                  ) {
                    value = (
                      dataRewardToken[idx].result / BigInt(Math.pow(10, 18))
                    ).toLocaleString();
                  } else if (functionName === "start") {
                    value = moment
                      .unix(Number(dataRewardToken[idx].result), "seconds")
                      .format();
                  } else if (functionName === "duration") {
                    value = moment
                      .duration(Number(dataRewardToken[idx].result), "seconds")
                      .format();
                  } else if (
                    functionName === "remainingTimestampToNextVesting"
                  ) {
                    value = moment
                      .duration(Number(dataRewardToken[idx].result), "seconds")
                      .format();
                  } else {
                    value = dataRewardToken[idx].result.toString();
                  }

                  return (
                    <TableRow key={idx}>
                      <TableCell align="left">{functionName}</TableCell>
                      <TableCell align="left">{value}</TableCell>
                    </TableRow>
                  );
                }
              })}
          </TableBody>
        </Table>
      </TableContainer>

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Reward token share                                              */}
      {/*//*-----------------------------------------------------------------*/}
      <Divider sx={{ marginTop: "20px", marginBottom: "20px" }}>
        <Chip label="Reward Token Share" />
      </Divider>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Key</TableCell>
              <TableCell align="center">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataRewardTokenShare &&
              Object.entries(rewardTokenShareContractFunctions).map(
                (func, idx) => {
                  console.log("func: ", func);
                  const functionName = func[1].functionName;
                  console.log("functionName: ", functionName);
                  if (dataRewardTokenShare[idx].status === "success") {
                    let value;
                    if (functionName === "getRewardTokenBalance") {
                      value = (
                        dataRewardTokenShare[idx].result /
                        BigInt(Math.pow(10, 18))
                      ).toLocaleString();
                    } else {
                      value = dataRewardTokenShare[idx].result.toString();
                    }

                    return (
                      <TableRow key={idx}>
                        <TableCell align="left">{functionName}</TableCell>
                        <TableCell align="left">{value}</TableCell>
                      </TableRow>
                    );
                  }
                }
              )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
