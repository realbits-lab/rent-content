import * as React from "react";
import { formatEther } from "viem";
import { getContract } from "@wagmi/core";
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useRecoilStateLoadable } from "recoil";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import {
  changeIPFSToGateway,
  AlertSeverity,
  RBSize,
  writeToastMessageState,
  erc20PermitSignature,
} from "@/components/RentContentUtil";
import rentNFTABI from "@/contracts/rentNFT.json";
import rentmarketABI from "@/contracts/rentMarket.json";
import faucetTokenABI from "@/contracts/faucetToken.json";

export default function MarketNftItem({ element, key }) {
  // console.log("call MarketNftItem()");
  // console.log("element: ", element);

  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const SERVICE_OWNER_ADDRESS = process.env.NEXT_PUBLIC_SERVICE_OWNER_ADDRESS;
  const [metadata, setMetadata] = React.useState();

  //*---------------------------------------------------------------------------
  //* Handle toast message.
  //*---------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);

  const { address, connector, isConnected } = useAccount();
  const { chains, chain } = useNetwork();

  const {
    data: dataTokenURI,
    isError: isErrorTokenURI,
    isLoading: isLoadingTokenURI,
    isValidating: isValidatingTokenURI,
    status: statusTokenURI,
  } = useContractRead({
    address: element?.nftAddress,
    abi: rentNFTABI.abi,
    functionName: "tokenURI",
    args: [element?.tokenId],
    // watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      fetch(data).then((fetchResult) =>
        fetchResult.blob().then((tokenMetadata) =>
          tokenMetadata.text().then((metadataJsonTextData) => {
            // console.log("metadataJsonTextData: ", metadataJsonTextData);
            const metadata = JSON.parse(metadataJsonTextData);
            // console.log("metadata: ", metadata);
            setMetadata(metadata);
          })
        )
      );
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
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: "Renting nft is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
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
            src={changeIPFSToGateway(metadata?.image)}
            sx={{ width: RBSize.big, height: RBSize.big }}
          />
        </Box>
      </TableCell>

      <TableCell align="center">{metadata?.name || "loading.."}</TableCell>

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
              value: element.rentFee,
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
              chain: chain,
              address: address,
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
