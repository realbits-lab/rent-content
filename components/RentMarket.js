import { ethers } from "ethers";
import keccak256 from "keccak256";
import axios from "axios";
import detectEthereumProvider from "@metamask/detect-provider";
import { Alchemy, Network, AlchemySubscription } from "alchemy-sdk";
import {
  switchNetworkMumbai,
  switchNetworkLocalhost,
  changeIPFSToGateway,
  isObject,
  AlertSeverity,
  getChainName,
} from "@/components/RentContentUtil";
import rentMarketABI from "@/contracts/rentMarket.json";
import rentNFTABI from "@/contracts/rentNFT.json";
import promptNFTABI from "@/contracts/promptNFT.json";

let thisRentMarket;

class RentMarket {
  //* For alchemy API call max count.
  MAX_LOOP_COUNT = 100;

  //*---------------------------------------------------------------------------
  //* Alchemy variables.
  //*---------------------------------------------------------------------------
  // https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getnfts
  ALCHEMY_DEFAULT_PAGE_COUNT = 100;
  NFT_MODE = process.env.NEXT_PUBLIC_NFT_MODE;

  //*---------------------------------------------------------------------------
  //* Constructor function.RentMarketUtil
  //*---------------------------------------------------------------------------
  constructor({
    accountAddress,
    rentMarketAddress,
    localNftContractAddress,
    blockchainNetwork,
    onEventFunc,
    onErrorFunc,
  }) {
    // console.log("call constructor()");
    // console.log("onEventFunc: ", onEventFunc);
    // console.log("onErrorFunc: ", onErrorFunc);
    // console.log("rentMarketAddress: ", rentMarketAddress);
    // console.log("localNftContractAddress: ", localNftContractAddress);
    // console.log("blockchainNetwork: ", blockchainNetwork);
    thisRentMarket = this;

    //*-------------------------------------------------------------------------
    //* Set blockchain network and alchemy sdk.
    //*-------------------------------------------------------------------------
    this.inputBlockchainNetworkName = getChainName({
      chainId: blockchainNetwork,
    });
    switch (this.inputBlockchainNetworkName) {
      case "matic":
        this.alchemy = new Alchemy({
          apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
          network: Network.MATIC_MAINNET,
        });
        this.ALCHEMY_BASE_URL = `https://polygon-mainnet.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}/getNFTs/`;
        break;

      case "maticmum":
      default:
        this.alchemy = new Alchemy({
          apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
          network: Network.MATIC_MUMBAI,
        });
        this.ALCHEMY_BASE_URL = `https://polygon-mumbai.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}/getNFTs/`;
        break;
    }

    //*-------------------------------------------------------------------------
    //* Set rent market smart contract address.
    //*-------------------------------------------------------------------------
    this.rentMarketAddress = rentMarketAddress;

    //*-------------------------------------------------------------------------
    //* Set test nft smart contract address.
    //*-------------------------------------------------------------------------
    this.localNftContractAddress = localNftContractAddress;

    //*-------------------------------------------------------------------------
    //* Define variables.
    //* Undefined varialbe means loading status.
    //*-------------------------------------------------------------------------
    this.metamaskProvider = undefined;
    this.provider = undefined;
    this.signer = undefined;
    this.signerAddress = undefined;
    this.currentBlockchainNetworkName = undefined;
    this.rentMarketContract = undefined;
    this.testNFTContract = undefined;

    //*-------------------------------------------------------------------------
    //* The rent market data list.
    //* Undefined varialbe means loading status.
    //*-------------------------------------------------------------------------
    this.tokenArray;
    this.collectionArray;
    this.serviceArray;
    this.requestNFTArray;
    this.registerNFTArray;
    this.allMyNFTArray;
    this.allRentNFTArray;
    this.pendingRentFeeArray;
    this.accountBalanceArray;

    //*-------------------------------------------------------------------------
    //* The my data list.
    //* Undefined varialbe means loading status.
    //*-------------------------------------------------------------------------
    this.accountAddress = accountAddress;
    this.myRentNFTArray;
    this.myRegisteredNFTArray;
    this.myUnregisteredNFTArray;

    this.onEventFunc = onEventFunc;
    this.onErrorFunc = onErrorFunc;
  }

  async initializeProvider() {
    // console.log("call initializeProvider()");

    //*-------------------------------------------------------------------------
    //* Get metamask provider and set this variable.
    //*-------------------------------------------------------------------------
    this.metamaskProvider = await detectEthereumProvider({
      mustBeMetaMask: true,
    });
    // console.log("this.metamaskProvider: ", this.metamaskProvider);

    // * Check metamask is installed.
    if (this.metamaskProvider !== null) {
      this.provider = new ethers.providers.Web3Provider(this.metamaskProvider);

      // * Register metamask event.
      this.metamaskProvider.on("accountsChanged", this.handleAccountsChanged);
      this.metamaskProvider.on("chainChanged", this.handleChainChanged);
      this.metamaskProvider.on("disconnect", this.handleDisconnect);

      // * Get signer.
      this.signer = this.provider.getSigner();
      // console.log("this.signer: ", this.signer);
      try {
        this.signerAddress = await this.signer.getAddress();
      } catch (error) {
        console.error(error);
        // throw error;
      }

      // * Get metamask chain id.
      const blockchainNetwork = await this.metamaskProvider.request({
        method: "eth_chainId",
      });
      this.currentBlockchainNetworkName = getChainName({
        chainId: blockchainNetwork,
      });

      //* Show error, if block chain is not the same as setting.
      // console.log("this.inputBlockchainNetworkName: ", this.inputBlockchainNetworkName);
      // console.log(
      //   "this.currentBlockchainNetworkName: ",
      //   this.currentBlockchainNetworkName
      // );
      if (
        this.inputBlockchainNetworkName !== this.currentBlockchainNetworkName
      ) {
        this.onErrorFunc &&
          this.onErrorFunc({
            severity: AlertSeverity.warning,
            message: `Metamask blockchain should be
        ${this.inputBlockchainNetworkName}, but you are using 
        ${this.currentBlockchainNetworkName}.`,
          });

        await this.setAlchemyProvider();
      }
    } else {
      await this.setAlchemyProvider();
    }
    // console.log("this.provider: ", this.provider);
  }

  async setAlchemyProvider() {
    // console.log("call setAlchemyProvider()");

    //* Get alchemy provider without metamask.
    this.provider = new ethers.providers.AlchemyProvider(
      this.inputBlockchainNetworkName,
      process.env.NEXT_PUBLIC_ALCHEMY_KEY
    );
  }

  async initializeData() {
    // console.log("call initializeData()");
    // console.log("this.currentBlockchainNetworkName: ", this.currentBlockchainNetworkName);
    // console.log("this.rentMarketAddress: ", this.rentMarketAddress);
    // console.log("this.inputBlockchainNetworkName: ", this.inputBlockchainNetworkName);

    //* Get the rent market contract.
    this.rentMarketContract = new ethers.Contract(
      this.rentMarketAddress,
      rentMarketABI["abi"],
      this.provider
    );
    // console.log("this.rentMarketContract: ", this.rentMarketContract);

    //* Get the local nft contract.
    if (this.inputBlockchainNetworkName === "localhost") {
      if (this.NFT_MODE === "rent") {
        this.testNFTContract = new ethers.Contract(
          this.localNftContractAddress,
          rentNFTABI["abi"],
          this.provider
        );
      } else if (this.NFT_MODE === "prompt") {
        this.testNFTContract = new ethers.Contract(
          this.localNftContractAddress,
          promptNFTABI["abi"],
          this.provider
        );
      } else {
        this.testNFTContract = new ethers.Contract(
          this.localNftContractAddress,
          rentNFTABI["abi"],
          this.provider
        );
      }
      // console.log("this.testNFTContract: ", this.testNFTContract);
    }

    //* Fetch data.
    try {
      await this.fetchToken();

      await this.fetchCollection();

      await this.fetchService();

      await this.fetchRegisterData();

      await this.fetchPendingRentFee();

      await this.fetchAccountBalance();
      this.onEventFunc();

      await this.getMyContentData();
      this.onEventFunc();

      //* Register contract event.
      await this.registerEvent();
    } catch (error) {
      throw error;
    }
  }

  clearAllData() {
    this.tokenArray = [];
    this.collectionArray = [];
    this.serviceArray = [];
    this.requestNFTArray = [];
    this.registerNFTArray = [];
    this.allMyNFTArray = [];
    this.allRentNFTArray = [];
    this.pendingRentFeeArray = [];
    this.accountBalanceArray = [];

    this.myRentNFTArray = [];
    this.myRegisteredNFTArray = [];
    this.myUnregisteredNFTArray = [];

    this.onEventFunc();
  }

  async initializeAll() {
    // console.log("call initializeAll()");

    try {
      //* Get provider and register event and signer, chain ID.
      await this.initializeProvider();

      //* Get rentMarket contract and fetch all data from the contract.
      await this.initializeData();
    } catch (error) {
      throw error;
    }
  }

  // TODO: Add polygon case.
  async requestChangeNetwork() {
    // console.log("requestChangeNetwork");
    if (this.inputBlockchainNetworkName === "localhost") {
      switchNetworkLocalhost(this.metamaskProvider);
    } else if (this.inputBlockchainNetworkName === "maticmum") {
      switchNetworkMumbai(this.metamaskProvider);
    } else {
      console.error(
        "No support blockchain network: ",
        this.inputBlockchainNetworkName
      );
    }
  }

  async handleAccountsChanged(accounts) {
    //* use thisRentMarket instead of this.
    // console.log("call handleAccountsChanged()");
    // console.log("accounts: ", accounts);

    if (accounts.length === 0) {
      thisRentMarket.onErrorFunc &&
        thisRentMarket.onErrorFunc({
          severity: AlertSeverity.warning,
          message: "No account is set in metamask.",
        });
    }

    thisRentMarket.signerAddress = accounts[0];
    // console.log("this.signerAddress: ", this.signerAddress);

    thisRentMarket.onErrorFunc &&
      thisRentMarket.onErrorFunc({
        severity: AlertSeverity.info,
        message: `Account is changed to ${accounts[0]}`,
      });

    //* Reset data.
    await thisRentMarket.initializeData();
  }

  async handleChainChanged(chainId) {
    //* use thisRentMarket instead of this.
    // console.log("call handelChainChanged()");
    // console.log("chainId: ", chainId);

    thisRentMarket.currentBlockchainNetworkName = getChainName({
      chainId: chainId,
    });
    // console.log("this.currentBlockchainNetworkName: ", this.currentBlockchainNetworkName);

    if (
      thisRentMarket.inputBlockchainNetworkName ===
      thisRentMarket.currentBlockchainNetworkName
    ) {
      await thisRentMarket.initializeData();
    }
  }

  async handleDisconnect() {
    //* use thisRentMarket instead of this.
    // console.log("call handleDisconnect()");
  }

  async registerEvent() {
    // console.log("call registerEvent()");

    let eventHash;

    //* Subscription to RegisterToken event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "RegisterToken",
        async function (tokenAddress, name) {
          // console.log("-- RegisterToken event");
          await thisRentMarket.fetchToken();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256("RegisterToken(address,string)");
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          // console.log("-- RegisterToken event");
          await thisRentMarket.fetchToken();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to UnregisterToken event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "UnregisterToken",
        async function (tokenAddress, name) {
          // console.log("-- UnregisterToken event");
          await thisRentMarket.fetchToken();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256("UnregisterToken(address,string)");
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          // console.log("-- UnregisterToken event");
          await thisRentMarket.fetchToken();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to RegisterCollection event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "RegisterCollection",
        async function (collectionAddress, uri) {
          // console.log("-- RegisterCollection event");
          await thisRentMarket.fetchCollection();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256("RegisterCollection(address,string)");
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          // console.log("-- RegisterCollection event");
          await thisRentMarket.fetchCollection();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to UnregisterCollection event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "UnregisterCollection",
        async function (collectionAddress, uri) {
          // console.log("-- UnregisterCollection event");
          await thisRentMarket.fetchCollection();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256("UnregisterCollection(address,string)");
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          // console.log("-- UnregisterCollection event");
          await thisRentMarket.fetchCollection();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to RegisterService event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "RegisterService",
        async function (serviceAddress, uri) {
          // console.log("-- RegisterService event");
          // console.log("serviceAddress: ", serviceAddress);
          // Update request service data.
          await thisRentMarket.fetchService();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256("RegisterService(address,string)");
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          // console.log("-- RegisterService event");
          await thisRentMarket.fetchService();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to UnregisterService event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "UnregisterService",
        async function (serviceAddress, uri) {
          // console.log("-- UnregisterService event");
          // console.log("serviceAddress: ", serviceAddress);
          // Update register data.
          await thisRentMarket.fetchService();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256("UnregisterService(address,string)");
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          // console.log("-- UnregisterService event");
          await thisRentMarket.fetchService();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to RegisterNFT event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "RegisterNFT",
        async function (
          nftAddress,
          tokenId,
          rentFee,
          rentDuration,
          NFTOwnerAddress
        ) {
          // console.log("-- RegisterNFT event");
          // console.log("tokenId: ", tokenId.toString());
          // Update request data.
          // await this.fetchRequestData();
          await thisRentMarket.getMyContentData();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256(
        "RegisterNFT(address,uint256,uint256,uint256,address)"
      );
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          // console.log("-- RegisterNFT event");
          await thisRentMarket.getMyContentData();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to ChangeNFT event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "ChangeNFT",
        async function (
          nftAddress,
          tokenId,
          rentFee,
          feeTokenAddress,
          rentFeeByToken,
          rentDuration,
          NFTOwnerAddress,
          changerAddress
        ) {
          // console.log("-- ChangeNFT event");
          // console.log("tokenId: ", tokenId);
          // Update register data.
          await thisRentMarket.fetchRegisterData();
          await thisRentMarket.getMyContentData();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256(
        "ChangeNFT(address,uint256,uint256,address,uint256,uint256,address,address)"
      );
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("-- ChangeNFT event");
          // console.log("tx: ", tx);
          await thisRentMarket.fetchRegisterData();
          await thisRentMarket.getMyContentData();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to UnregisterNFT event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "UnregisterNFT",
        async function (
          nftAddress,
          tokenId,
          rentFee,
          feeTokenAddress,
          rentFeeByToken,
          rentDuration,
          NFTOwnerAddress,
          UnregisterAddress
        ) {
          // console.log("-- UnregisterNFT event");
          // console.log("tokenId: ", tokenId.toString());
          // Update register data.
          await thisRentMarket.fetchRegisterData();
          await thisRentMarket.getMyContentData();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256(
        "UnregisterNFT(address,uint256,uint256,address,uint256,uint256,address,address)"
      );
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          // console.log("-- UnregisterNFT event");
          await thisRentMarket.fetchRegisterData();
          await thisRentMarket.getMyContentData();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to RentNFT event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "RentNFT",
        async function (
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
          rentStartTimestamp
        ) {
          // console.log("-- RentNFT event");
          // console.log("tokenId: ", tokenId.toString());
          // Update register and rente data and interconnect them.
          await thisRentMarket.fetchRegisterData();
          await thisRentMarket.fetchPendingRentFee();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256(
        "RentNFT(address,uint256,uint256,address,uint256,bool,uint256,address,address,address,uint256)"
      );
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          await thisRentMarket.fetchRegisterData();
          await thisRentMarket.fetchPendingRentFee();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to UnrentNFT event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "UnrentNFT",
        async function (
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
          rentStartTimestamp
        ) {
          // console.log("-- UnrentNFT event");
          // console.log("tokenId: ", tokenId.toString());
          // Update register and rente data and interconnect them.
          await thisRentMarket.fetchRegisterData();
          await thisRentMarket.fetchPendingRentFee();
          await thisRentMarket.fetchAccountBalance();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256(
        "UnrentNFT(address,uint256,uint256,address,uint256,bool,uint256,address,address,address,uint256)"
      );
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          await thisRentMarket.fetchRegisterData();
          await thisRentMarket.fetchPendingRentFee();
          await thisRentMarket.fetchAccountBalance();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to SettleRentData event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "SettleRentData",
        async function (
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
          rentStartTimestamp
        ) {
          // console.log("-- SettleRentData event");
          // console.log("tokenId: ", tokenId.toString());
          // Update register data.
          await thisRentMarket.fetchRegisterData();
          await thisRentMarket.fetchPendingRentFee();
          await thisRentMarket.fetchAccountBalance();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256(
        "SettleRentData(address,uint256,uint256,address,uint256,bool,uint256,address,address,address,uint256)"
      );
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          await thisRentMarket.fetchRegisterData();
          await thisRentMarket.fetchPendingRentFee();
          await thisRentMarket.fetchAccountBalance();
          thisRentMarket.onEventFunc();
        }
      );
    }

    //* Subscription to WithdrawMyBalance event.
    if (this.metamaskProvider !== null) {
      this.rentMarketContract.on(
        "WithdrawMyBalance",
        async function (recipient, tokenAddress, amount) {
          // console.log("-- WithdrawMyBalance event");
          // Update account data.
          await thisRentMarket.fetchAccountBalance();
          thisRentMarket.onEventFunc();
        }
      );
    } else {
      eventHash = keccak256("WithdrawMyBalance(address,address,uint256)");
      this.alchemy.ws.on(
        {
          toAddress: this.rentMarketAddress,
          topics: [`0x${Buffer.from(eventHash).toString("hex")}`],
        },
        async function (tx) {
          // console.log("tx: ", tx);
          await thisRentMarket.fetchAccountBalance();
          thisRentMarket.onEventFunc();
        }
      );
    }
  }

  async fetchToken() {
    // console.log("call fetchToken()");

    try {
      const allTokenArray = await this.getAllToken();
      this.tokenArray = allTokenArray;
    } catch (error) {
      throw error;
    }
  }

  async fetchCollection() {
    // console.log("call fetchCollection()");

    //* Get request collection array.
    let allCollectionArray;
    try {
      allCollectionArray = await this.getAllCollection();
    } catch (error) {
      throw error;
    }
    // console.log("allCollectionArray: ", allCollectionArray);

    //* Set request collection data array.
    this.collectionArray = allCollectionArray;
  }

  async fetchService() {
    //* Get request service array.
    const allServiceArray = await this.getAllService();
    // console.log("allServiceArray: ", allServiceArray);

    //* Set request service data array.
    this.serviceArray = allServiceArray;
  }

  async fetchRegisterData() {
    // console.log("call fetchRegisterData()");

    //* Get registerNFT data array with renter, rentee address and start block number.
    const allRegisterNFTArray = await this.getAllRegisterData();
    // console.log("allRegisterNFTArray: ", allRegisterNFTArray);

    //* Get rentNFT data array.
    const allRentNFTArray = await this.getAllRentData();
    // console.log("allRentNFTArray: ", allRentNFTArray);

    //* Set registerNFT data list with register and rent NFT data array intersection.
    // Should show rent status if any rent data.
    // https://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
    const registerNFTArray = await Promise.all(
      allRegisterNFTArray.map(async (registerNFTElement) => {
        //* Find the matched one in the allRentNFTArray and set renter, rentee address and start block number.
        const foundElement = allRentNFTArray.find(
          (rentNFTElement) =>
            registerNFTElement.nftAddress === rentNFTElement.nftAddress &&
            // registerNFTElement.tokenId === rentNFTElement.tokenId
            registerNFTElement.tokenId.eq(rentNFTElement.tokenId) === true
        );

        //* Get metadta.
        if (foundElement) {
          // console.log("Call addMetadata");
          return this.addMetadata(foundElement);
        } else {
          // console.log("Call addMetadata");
          return this.addMetadata(registerNFTElement);
        }
      })
    );
    // console.log("registerNFTArray: ", registerNFTArray);

    //* Set renteeNFT data.
    const myRenteeNFTArray = await Promise.all(
      allRentNFTArray.map(async (element) => {
        if (
          element.renteeAddress === this.signerAddress ||
          element.renteeAddress === this.accountAddress
        ) {
          // console.log("Call addMetadata");
          return this.addMetadata(element);
        }
      })
    );

    // Remove undefined element.
    // console.log("myRenteeNFTArray: ", myRenteeNFTArray);
    const filteredMyRenteeeNFTArray = myRenteeNFTArray.filter(
      (element) => element !== undefined
    );
    // console.log("filteredMyRenteeeNFTArray: ", filteredMyRenteeeNFTArray);

    //* Set request, register, renter, and rentee NFT data array.
    this.registerNFTArray = registerNFTArray;
    this.myRentNFTArray = filteredMyRenteeeNFTArray;
    this.allRentNFTArray = allRentNFTArray;
  }

  async fetchPendingRentFee() {
    //* Data type.
    // struct pendingRentFee {
    //     address renterAddress;
    //     address serviceAddress;
    //     address feeTokenAddress;
    //     uint256 amount;
    // }

    //* Get and set pending rent fee data array.
    this.pendingRentFeeArray = await this.getAllPendingRentFee();
  }

  async fetchAccountBalance() {
    //* Data type.
    // struct accountBalance {
    //     address accountAddress;
    //     address tokenAddress;
    //     uint256 amount;
    // }

    //* Get and set account balance data array.
    this.accountBalanceArray = await this.getAllAccountBalance();
  }

  getRentMarketContract() {
    return this.rentMarketContract;
  }

  async getAllToken() {
    // console.log("call getAllToken()");

    //* Call rentMarket getAllToken function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    if (isObject(this.rentMarketContract) === false) {
      throw new Error("Rent market contract is not defined.");
    }

    const tokenList = await this.rentMarketContract.getAllToken();
    // console.log("tokenList: ", tokenList);

    //* Get register data from smart contract.
    let tokenArray = [];
    const promises = tokenList.map(async (element) => {
      tokenArray.push({
        key: element.tokenAddress,
        tokenAddress: element.tokenAddress,
        name: element.name,
      });
    });
    await Promise.all(promises);

    //* Return token data.
    return tokenArray;
  }

  async getAllCollection() {
    // console.log("call getAllCollection()");

    //* Call rentMarket getAllCollection function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    const collectionList = await this.rentMarketContract.getAllCollection();
    // console.log("collectionList: ", collectionList);

    //* Get register data from smart contract.
    let collectionArray = [];
    const promises = collectionList.map(async (element) => {
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
      collectionArray.push({
        key: element.collectionAddress,
        collectionAddress: element.collectionAddress,
        uri: element.uri,
        metadata: metadata,
      });
    });
    await Promise.all(promises);

    //* Return collection data.
    return collectionArray;
  }

  async getAllService() {
    //* Call rentMarket getAllService function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    const serviceList = await this.rentMarketContract.getAllService();
    // console.log("serviceList: ", serviceList);

    //* Get register data from smart contract.
    let serviceArray = [];
    const promises = serviceList.map(async (element) => {
      serviceArray.push({
        key: element.serviceAddress,
        serviceAddress: element.serviceAddress,
        uri: element.uri,
      });
    });
    await Promise.all(promises);

    //* Return service data.
    return serviceArray;
  }

  async getAllRegisterData() {
    // console.log("call getAllRegisterData()");

    //* Call rentMarket getAllRegisterData function.
    const registerDataList = await this.rentMarketContract.getAllRegisterData();
    // console.log("registerDataList: ", registerDataList);

    let registerData = [];
    const promises = registerDataList.map(async (element) => {
      registerData.push({
        nftAddress: element.nftAddress,
        tokenId: element.tokenId,
        rentFee: element.rentFee,
        feeTokenAddress: element.feeTokenAddress,
        rentFeeByToken: element.rentFeeByToken,
        isRentByToken: element.isRentByToken,
        rentDuration: element.rentDuration,
        // For intersection with rentData, fill the rest with default value.
        renterAddress: "0",
        renteeAddress: "0",
        serviceAddress: "0",
        rentStartTimestamp: "0",
      });
    });
    await Promise.all(promises);

    //* Return register data.
    return registerData;
  }

  async getAllRentData() {
    //* Call rentMarket getAllRentData function.
    const rentDataList = await this.rentMarketContract.getAllRentData();
    // console.log("rentDataList: ", rentDataList);

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
    //* Get rent data from smart contract.
    let rentData = [];
    const promises = rentDataList.map(async (element) => {
      //* Use a raw format.
      rentData.push({
        nftAddress: element.nftAddress,
        tokenId: element.tokenId,
        rentFee: element.rentFee,
        feeTokenAddress: element.feeTokenAddress,
        rentFeeByToken: element.rentFeeByToken,
        isRentByToken: element.isRentByToken,
        rentDuration: element.rentDuration,
        renterAddress: element.renterAddress,
        renteeAddress: element.renteeAddress,
        serviceAddress: element.serviceAddress,
        rentStartTimestamp: element.rentStartTimestamp,
      });
    });
    await Promise.all(promises);

    //* Return register data.
    return rentData;
  }

  async getAllPendingRentFee() {
    //* Call rentMarket getAllPendingRentFee function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    const pendingRentFeeList =
      await this.rentMarketContract.getAllPendingRentFee();
    // console.log("pendingRentFeeList: ", pendingRentFeeList);

    //* Get pending rent fee from smart contract.
    // struct pendingRentFee {
    //     address renterAddress;
    //     address serviceAddress;
    //     address feeTokenAddress;
    //     uint256 amount;
    // }
    let pendingRentFeeArray = [];
    const promises = pendingRentFeeList.map(async (element) => {
      pendingRentFeeArray.push({
        renterAddress: element.renterAddress,
        serviceAddress: element.serviceAddress,
        feeTokenAddress: element.feeTokenAddress,
        amount: element.amount,
      });
    });
    await Promise.all(promises);

    //* Return pending rent fee array.
    return pendingRentFeeArray;
  }

  async getAllAccountBalance() {
    //* Call rentMarket getAllAccountBalance function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    const accountBalanceList =
      await this.rentMarketContract.getAllAccountBalance();
    // console.log("accountBalanceList: ", accountBalanceList);

    //* Get account balance array from smart contract.
    // struct accountBalance {
    //     address accountAddress;
    //     address tokenAddress;
    //     uint256 amount;
    // }
    let accountBalanceArray = [];
    const promises = accountBalanceList.map(async (element) => {
      accountBalanceArray.push({
        accountAddress: element.accountAddress,
        tokenAddress: element.tokenAddress,
        amount: element.amount,
      });
    });
    await Promise.all(promises);

    //* Return account balance array.
    return accountBalanceArray;
  }

  async getMyContentData() {
    // console.log("call getMyContentData()");

    //* Get my all minted NFT.
    // console.log(
    //   "this.currentBlockchainNetworkName: ",
    //   this.currentBlockchainNetworkName
    // );

    try {
      if (this.currentBlockchainNetworkName === "localhost") {
        // Use local node.
        this.allMyNFTArray = await this.fetchMyNFTDataOnLocalhost();
      } else {
        // Use public node.
        this.allMyNFTArray = await this.fetchMyNFTData();
      }
    } catch (error) {
      throw error;
    }
    // console.log("this.allMyNFTArray: ", this.allMyNFTArray);

    //* Update my registered and unregistered NFT data.
    await this.updateMyContentData();
  }

  async updateMyContentData() {
    if (
      (this.accountAddress === undefined || this.accountAddress === null) &&
      (this.signerAddress === undefined || this.signerAddress === null)
    ) {
      return;
    }

    //*-------------------------------------------------------------------------
    //* Get all register nft data.
    //*-------------------------------------------------------------------------
    const allRegisterNFTArray =
      await this.rentMarketContract.getAllRegisterData();
    // console.log("allRegisterNFTArray: ", allRegisterNFTArray);
    // console.log("this.allMyNFTArray: ", this.allMyNFTArray);

    //*-------------------------------------------------------------------------
    //* Set my register nft data.
    //*-------------------------------------------------------------------------
    const myRegisteredNFTArray = allRegisterNFTArray
      .map((registerElement) => {
        const foundIndex = this.allMyNFTArray.findIndex(
          (myElement) =>
            // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
            registerElement.nftAddress.localeCompare(
              myElement.nftAddress,
              undefined,
              { sensitivity: "accent" }
            ) === 0 && registerElement.tokenId.eq(myElement.tokenId) === true
        );
        // console.log("foundIndex: ", foundIndex);
        // console.log("found element: ", this.allMyNFTArray[foundIndex]);
        // console.log("registerElement: ", registerElement);

        if (foundIndex !== -1) {
          return {
            nftAddress: registerElement.nftAddress,
            tokenId: registerElement.tokenId,
            rentFee: registerElement.rentFee,
            feeTokenAddress: registerElement.feeTokenAddress,
            rentFeeByToken: registerElement.rentFeeByToken,
            rentDuration: registerElement.rentDuration,
            metadata: this.allMyNFTArray[foundIndex].metadata,
          };
        }
      })
      .filter((element) => element !== undefined);
    // console.log("myRegisteredNFTArray: ", myRegisteredNFTArray);
    this.myRegisteredNFTArray = myRegisteredNFTArray;

    //*-------------------------------------------------------------------------
    //* Set my unregister nft data.
    //*-------------------------------------------------------------------------
    const myUnregisteredNFTArray = this.allMyNFTArray
      .map((myElement) => {
        const foundIndex = myRegisteredNFTArray.findIndex(
          (registerElement) =>
            registerElement.nftAddress.localeCompare(
              myElement.nftAddress,
              undefined,
              { sensitivity: "accent" }
            ) === 0 && registerElement.tokenId.eq(myElement.tokenId) === true
        );

        if (foundIndex === -1) {
          return {
            nftAddress: myElement.nftAddress,
            tokenId: myElement.tokenId,
            metadata: myElement.metadata,
          };
        }
      })
      .filter((element) => element !== undefined);
    // console.log("myUnregisteredNFTArray: ", myUnregisteredNFTArray);
    this.myUnregisteredNFTArray = myUnregisteredNFTArray;
  }

  async addMetadata(element) {
    //* Check pre-existed metadata.
    // console.log("element: ", element);
    if (element.metadata !== undefined) {
      return element;
    }

    //* Set default tokenURI function ABI based on OpenZeppelin code.
    const tokenURIAbi = [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "tokenURI",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ];

    let newData = element;
    let nftContract;

    if (
      this.inputBlockchainNetworkName === "localhost" &&
      this.testNFTContract.address.localeCompare(
        element.nftAddress,
        undefined,
        { sensitivity: "accent" }
      ) === 0
    ) {
      nftContract = this.testNFTContract;
    } else {
      nftContract = new ethers.Contract(
        element.nftAddress,
        tokenURIAbi,
        this.provider
      );
    }

    // * Get json metadata fomr tokenURI.
    try {
      // const rawTokenURI = await nftContract.tokenURI(element.tokenId);
      const rawTokenURI = await nftContract.tokenURI(
        ethers.BigNumber.from(element.tokenId)
      );

      //* Get image from json metadata.
      const tokenURI = changeIPFSToGateway(rawTokenURI);
      // console.log("rawTokenURI: ", rawTokenURI);
      // console.log("tokenURI: ", tokenURI);
      let response;
      try {
        response = await axios.get(tokenURI);
      } catch (error) {
        console.error(error);
        throw error;
      }
      const metadata = response.data;

      //* Get name, description, and attributes from json metadata.
      // console.log("metadata: ", metadata);
      // console.log("name: ", metadata.name);
      // console.log("description: ", metadata.description);
      // console.log("attributes: ", JSON.stringify(metadata.attributes, null, 2));
      newData.metadata = metadata;

      //* Return image(url), name, description, and attributes.
      return newData;
    } catch (error) {
      console.error(error);
      return element;
    }
  }

  async registerToken(tokenAddress, tokenName) {
    // console.log("tokenAddress: ", tokenAddress);
    // console.log("tokenName: ", tokenName);
    // console.log("this.signer: ", this.signer);

    //* Call registerToken function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerToken(tokenAddress, tokenName);
    } catch (error) {
      throw error;
    }
  }

  async unregisterToken(element) {
    //* Call unregisterToken function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unregisterToken(element.tokenAddress);
    } catch (error) {
      throw error;
    }
  }

  async registerCollection(collectionAddress, collectionUri) {
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerCollection(collectionAddress, collectionUri);
    } catch (error) {
      throw error;
    }
  }

  async unregisterCollection(collectionAddress) {
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unregisterCollection(collectionAddress);
    } catch (error) {
      throw error;
    }
  }

  async registerService(serviceAddress, serviceName) {
    // console.log("serviceAddress: ", serviceAddress);
    // console.log("serviceName: ", serviceName);
    // console.log("this.signer: ", this.signer);

    //* Call registerService function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerService(serviceAddress, serviceName);
    } catch (error) {
      throw error;
    }
  }

  async unregisterService(element) {
    //* Call unregisterService function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unregisterService(element.serviceAddress);
    } catch (error) {
      throw error;
    }
  }

  async registerNFT(element) {
    // console.log("element.nftAddress: ", element.nftAddress);
    // console.log("element.tokenId: ", element.tokenId);

    //* Call registerNFT function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerNFT(element.nftAddress, element.tokenId);
    } catch (error) {
      throw error;
    }
  }

  async changeNFT({
    provider,
    element,
    rentFee,
    feeTokenAddress,
    rentFeeByToken,
    rentDuration,
  }) {
    // console.log("call changeNFT()");
    // console.log("provider: ", provider);

    // console.log("element: ", element);
    // console.log("typeof rentFee: ", typeof rentFee);
    // console.log("rentFee: ", rentFee);
    // console.log("typeof feeTokenAddress: ", typeof feeTokenAddress);
    // console.log("feeTokenAddress: ", feeTokenAddress);
    // console.log("typeof rentFeeByToken: ", typeof rentFeeByToken);
    // console.log("rentFeeByToken: ", rentFeeByToken);
    // console.log("typeof rentDuration: ", typeof rentDuration);
    // console.log("rentDuration: ", rentDuration);

    if (provider) {
      const web3Provider = new ethers.providers.Web3Provider(provider);
      // console.log("web3Provider: ", web3Provider);
      const signer = web3Provider.getSigner();
      // console.log("signer: ", signer);

      // * Get the rent market contract.
      const contract = new ethers.Contract(
        this.rentMarketAddress,
        rentMarketABI["abi"],
        web3Provider
      );
      // console.log("contract: ", contract);

      try {
        const tx = await contract
          .connect(signer)
          .changeNFT(
            element.nftAddress,
            element.tokenId,
            ethers.utils.parseUnits(rentFee, "ether"),
            feeTokenAddress,
            ethers.utils.parseUnits(rentFeeByToken, "ether"),
            rentDuration
          );
        // console.log("tx: ", tx);
      } catch (error) {
        throw error;
      }
    } else {
      try {
        await this.rentMarketContract
          .connect(this.signer)
          .changeNFT(
            element.nftAddress,
            element.tokenId,
            ethers.utils.parseUnits(rentFee, "ether"),
            feeTokenAddress,
            ethers.utils.parseUnits(rentFeeByToken, "ether"),
            rentDuration
          );
      } catch (error) {
        throw error;
      }
    }
  }

  async unregisterNFT({ provider, element }) {
    // console.log("element.nftAddress: ", element.nftAddress);
    // console.log("element.tokenId: ", element.tokenId);

    if (provider) {
      const web3Provider = new ethers.providers.Web3Provider(provider);
      // console.log("web3Provider: ", web3Provider);
      const signer = web3Provider.getSigner();
      // console.log("signer: ", signer);

      //* Get the rent market contract.
      const contract = new ethers.Contract(
        this.rentMarketAddress,
        rentMarketABI["abi"],
        web3Provider
      );
      // console.log("contract: ", contract);

      try {
        const tx = await contract
          .connect(signer)
          .unregisterNFT(element.nftAddress, element.tokenId);
        // console.log("tx: ", tx);
      } catch (error) {
        throw error;
      }
    } else {
      //* Call unregisterNFT function.
      try {
        await this.rentMarketContract
          .connect(this.signer)
          .unregisterNFT(element.nftAddress, element.tokenId);
      } catch (error) {
        throw error;
      }
    }
  }

  // Fetch all minted token on local blockchain network.
  async fetchMyNFTDataOnLocalhost() {
    try {
      const allMintTokens = await this.getAllMintTokenOnLocalhost();
      // console.log("allMintTokens: ", allMintTokens);
      return allMintTokens;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  //* Get all minted token on local blockchain network.
  async getAllMintTokenOnLocalhost() {
    //*-------------------------------------------------------------------------
    //* Get token balance of owner.
    //*-------------------------------------------------------------------------
    const balance = (
      await this.testNFTContract.balanceOf(this.signerAddress)
    ).toNumber();
    // console.log("this.signerAddress: ", this.signerAddress);
    // console.log("balance: ", balance);

    //*-------------------------------------------------------------------------
    //* Get all token list.
    //*-------------------------------------------------------------------------
    let tokenArray = [];
    for (let i = 0; i < balance; i++) {
      let tokenId;
      let rawTokenURI;
      let tokenURI;
      let response;
      let metadata;

      //* Get token ID from enumerator index.
      try {
        tokenId = await this.testNFTContract.tokenOfOwnerByIndex(
          this.signerAddress,
          i
        );
        const tokenIdNumber = tokenId.toNumber();
        rawTokenURI = await this.testNFTContract.tokenURI(tokenIdNumber);
        tokenURI = changeIPFSToGateway(rawTokenURI);
        try {
          response = await axios.get(tokenURI);
        } catch (error) {
          console.error(error);
          throw error;
        }
        metadata = response.data;
        // console.log("metadata: ", metadata);
      } catch (error) {
        throw error;
      }

      tokenArray.push({
        nftAddress: this.localNftContractAddress,
        tokenId: tokenId,
        metadata: metadata,
      });
    }

    //*-------------------------------------------------------------------------
    //* Return token data.
    //*-------------------------------------------------------------------------
    return tokenArray;
  }

  // Fetch all minted token on public blockchain network.
  async fetchMyNFTData() {
    // console.log("call fetchMyNFTData()");

    let tokenArray = [];
    let alchemyAPIUrl;
    let pageKey;
    let responseCount;
    let response;
    let responseNftArray;
    let loopCount = 0;
    let ownerAddress;

    if (this.signerAddress === undefined || this.signerAddress === null) {
      ownerAddress = this.accountAddress;
    } else {
      ownerAddress = this.signerAddress;
    }
    // console.log("ownerAddress: ", ownerAddress);
    if (ownerAddress === undefined || ownerAddress === null) {
      return;
    }

    const filterAddress = this.collectionArray.map(
      (element) => element.collectionAddress
    );
    // console.log("filterAddress: ", filterAddress);

    if (filterAddress.length === 0) {
      return tokenArray;
    }
    const filterString = `&contractAddresses%5B%5D=${filterAddress}`;

    try {
      do {
        // Check maximum loop count.
        if (++loopCount > this.MAX_LOOP_COUNT) {
          break;
        }

        //* Set alchemy API URL.
        alchemyAPIUrl = pageKey
          ? `${this.ALCHEMY_BASE_URL}?owner=${ownerAddress}&pageKey=${pageKey}`
          : `${this.ALCHEMY_BASE_URL}?owner=${ownerAddress}`;
        alchemyAPIUrl = `${alchemyAPIUrl}${filterString}`;
        // console.log("get alchemyAPIUrl: ", alchemyAPIUrl);

        try {
          response = await axios({
            method: "get",
            url: alchemyAPIUrl,
          });
        } catch (error) {
          console.error(error);
          throw error;
        }
        // console.log(JSON.stringify(response.data, null, 2));

        //* Get response and set variables.
        pageKey = response.data["pageKey"];
        // Set response count while loop.
        if (responseCount === undefined) {
          responseCount = response.data["totalCount"];
        } else {
          responseCount -= this.ALCHEMY_DEFAULT_PAGE_COUNT;
        }
        responseNftArray = response.data["ownedNfts"];
        // console.log("pageKey: ", pageKey);
        // console.log("responseCount: ", responseCount);

        //* Add nft array list to tokenArray.
        // https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getnfts
        const promises = responseNftArray.map(async (element) => {
          // console.log("element: ", element);
          tokenArray.push({
            key: `${element.contract.address}/${Number(element.id.tokenId)}`,
            nftAddress: element.contract.address,
            tokenId: Number(element.id.tokenId),
            metadata: element.metadata,
          });
        });
        await Promise.all(promises);

        //* Update my content data by now.
        this.allMyNFTArray = tokenArray;

        const totalCount = response.data["totalCount"];
        const readCount = response.data["totalCount"] - responseCount;

        this.onErrorFunc &&
          this.onErrorFunc({
            severity: AlertSeverity.info,
            message: `Reading NFT (${readCount}/${totalCount}) is processed.`,
          });

        //* Update my nft register and unregister data.
        //* Update other component by onEventFunc function.
        this.updateMyContentData();
        this.onEventFunc();
      } while (pageKey && responseCount > this.ALCHEMY_DEFAULT_PAGE_COUNT);
      // console.log("tokenArray.length: ", tokenArray.length);

      // Make await for a fast loop.
      this.updateMyContentData();

      //* Return tokenArray.
      return tokenArray;
    } catch (error) {
      throw error;
    }
  }

  isEmpty(value) {
    if (
      value === "" ||
      value === null ||
      value === undefined ||
      (value != null && typeof value === "object" && !Object.keys(value).length)
    ) {
      return true;
    } else {
      return false;
    }
  }

  async rentNFT({ provider, element, serviceAddress }) {
    // console.log("call rentNFT()");
    // console.log("provider: ", provider);
    // console.log("element: ", element);
    // console.log("serviceAddress: ", serviceAddress);

    if (provider) {
      const web3Provider = new ethers.providers.Web3Provider(provider);
      // console.log("web3Provider: ", web3Provider);
      const signer = web3Provider.getSigner();
      // console.log("signer: ", signer);

      //* Get the rent market contract.
      const contract = new ethers.Contract(
        this.rentMarketAddress,
        rentMarketABI["abi"],
        web3Provider
      );
      // console.log("contract: ", contract);

      try {
        const tx = await contract
          .connect(signer)
          .rentNFT(element.nftAddress, element.tokenId, serviceAddress, {
            value: element.rentFee,
          });
        // console.log("tx: ", tx);
      } catch (error) {
        throw error;
      }
    } else {
      //* Call rentNFT function.
      // console.log("this.rentMarketContract: ", this.rentMarketContract);
      // console.log("this.signer: ", this.signer);
      try {
        await this.rentMarketContract
          .connect(this.signer)
          .rentNFT(element.nftAddress, element.tokenId, serviceAddress, {
            // https://docs.ethers.io/v5/api/utils/display-logic/
            //
            // wei	0
            // kwei	3
            // mwei	6
            // gwei	9
            // szabo	12
            // finney	15
            // ether	18
            //
            //                                    1 Ether = 1,000,000,000,000,000,000 WEI = 1 (EXA)WEI
            //               1 (MILLI)ETHER = 0.001 ETHER = 1,000,000,000,000,000 WEI = 1 (PETA)WEI
            //            1 (MICRO)ETHER = 0.000001 ETHER = 1,000,000,000,000 WEI = 1 (TERA)WEI
            //          1 (Nano)ETHER = 0.000000001 ETHER = 1,000,000,000 WEI = 1 (GIGA)WEI
            //       1 (PICO)ETHER = 0.000000000001 ETHER = 1,000,000 WEI = 1 (MEGA)WEI
            //   1 (FEMTO)ETHER = 0.000000000000001 ETHER = 1,000 WEI = 1 (KILO)WEI
            // 1 (ATTO)ETHER = 0.000000000000000001 ETHER = 1 WEI

            // value: ethers.utils.parseUnits(element.rentFee, "wei"),
            value: element.rentFee,
            // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
            // gasLimit: 500_000,
          });
      } catch (error) {
        throw error;
      }
    }
  }

  async unrentNFT(element) {
    //* Call rentNFT function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unrentNFT(element.nftAddress, element.tokenId);
    } catch (error) {
      throw error;
    }
  }

  async settleRentData({ provider, nftAddress, tokenId }) {
    // console.log("call settleRentData");

    if (provider) {
      const web3Provider = new ethers.providers.Web3Provider(provider);
      // console.log("web3Provider: ", web3Provider);
      const signer = web3Provider.getSigner();
      // console.log("signer: ", signer);

      //* Get the rent market contract.
      const contract = new ethers.Contract(
        this.rentMarketAddress,
        rentMarketABI["abi"],
        web3Provider
      );
      // console.log("contract: ", contract);

      try {
        const tx = await contract
          .connect(signer)
          .settleRentData(nftAddress, tokenId);
        // console.log("tx: ", tx);
      } catch (error) {
        throw error;
      }
    } else {
      try {
        await this.rentMarketContract
          .connect(this.signer)
          .settleRentData(nftAddress, tokenId);
      } catch (error) {
        throw error;
      }
    }
  }

  async withdrawMyBalance({ provider, recipient, tokenAddress }) {
    if (provider) {
      const web3Provider = new ethers.providers.Web3Provider(provider);
      // console.log("web3Provider: ", web3Provider);
      const signer = web3Provider.getSigner();
      // console.log("signer: ", signer);

      //* Get the rent market contract.
      const contract = new ethers.Contract(
        this.rentMarketAddress,
        rentMarketABI["abi"],
        web3Provider
      );
      // console.log("contract: ", contract);

      try {
        const tx = await contract
          .connect(signer)
          .withdrawMyBalance(recipient, tokenAddress);
      } catch (error) {
        throw error;
      }
    } else {
      try {
        await this.rentMarketContract
          .connect(this.signer)
          .withdrawMyBalance(recipient, tokenAddress);
      } catch (error) {
        throw error;
      }
    }
  }

  async isOwnerOrRenter(account) {
    // console.log("call isOwnerOrRenter()");

    let response;

    try {
      response = await this.rentMarketContract.isOwnerOrRenter(account);
    } catch (error) {
      throw error;
    }

    return response;
  }
}

export default RentMarket;
