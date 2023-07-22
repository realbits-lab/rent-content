import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAccount, useNetwork, useDisconnect } from "wagmi";
import { styled } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import MuiAppBar from "@mui/material/AppBar";
import StoreIcon from "@mui/icons-material/Store";
import TokenIcon from "@mui/icons-material/Token";
import SellIcon from "@mui/icons-material/Sell";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import CircleIcon from "@mui/icons-material/Circle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CollectionsIcon from "@mui/icons-material/Collections";
import { useRecoilStateLoadable, useRecoilValueLoadable } from "recoil";
import My from "@/components/My";
import Market from "@/components/Market";
import RentMarket from "@/components/RentMarket";
import Content from "@/components/Content";
import Collection from "@/components/Collection";
import Service from "@/components/Service";
import Token from "@/components/Token";
import MonitorToken from "@/components/MonitorToken";
import MonitorRentNft from "@/components/MonitorRentNft";
import MonitorPendingRentFee from "@/components/MonitorPendingRentFee";
import MonitorAccountBalance from "@/components/MonitorAccountBalance";
import MonitorReward from "@/components/MonitorReward";
import MonitorSetting from "@/components/MonitorSetting";
import {
  AlertSeverity,
  RBSnackbar,
  writeToastMessageState,
  readToastMessageState,
  checkMobile,
} from "@/components/RentContentUtil";
const LoginWrapper = dynamic(() => import("./LoginWrapper"), {
  ssr: false,
});

const RENT_CONTENT_COMPONENT_DRAWER_WIDTH = 180;

//*-----------------------------------------------------------------------------
//* Define Main component style.
//*-----------------------------------------------------------------------------
const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexGrow: 1,
  overflow: "scroll",
  padding: theme.spacing(1),
  marginLeft: `-${RENT_CONTENT_COMPONENT_DRAWER_WIDTH}px`,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

//*-----------------------------------------------------------------------------
//* Define AppBar component style.
//*-----------------------------------------------------------------------------
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${RENT_CONTENT_COMPONENT_DRAWER_WIDTH}px)`,
    marginLeft: `${RENT_CONTENT_COMPONENT_DRAWER_WIDTH}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

//*-----------------------------------------------------------------------------
//* Define DrawerHeader component style.
//*-----------------------------------------------------------------------------
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  justifyContent: "flex-end",
  //* Necessary for content to be below app bar.
  ...theme.mixins.toolbar,
}));

const RentContent = ({
  rentMarketAddress,
  testNftAddress,
  blockchainNetwork,
  serviceAddress,
}) => {
  //*---------------------------------------------------------------------------
  //* Wagmi
  //*---------------------------------------------------------------------------
  const { disconnect } = useDisconnect();
  const { chain, chains } = useNetwork();
  const { address, isConnected } = useAccount();

  //*---------------------------------------------------------------------------
  //* Define each menu index.
  //*---------------------------------------------------------------------------
  const CONTENT_MENU_INDEX = 0;
  const MY_MENU_INDEX = 1;
  const MARKET_MENU_INDEX = 2;
  const COLLECTION_MENU_INDEX = 3;
  const SERVICE_MENU_INDEX = 4;
  const TOKEN_MENU_INDEX = 5;
  const MONITOR_TOKEN_MENU_INDEX = 6;
  const MONITOR_ACCOUNT_BALANCE_MENU_INDEX = 7;
  const MONITOR_PENDING_RENT_FEE_MENU_INDEX = 8;
  const MONITOR_RENT_NFT_MENU_INDEX = 9;
  const MONITOR_REWARD_MENU_INDEX = 10;
  const MONITOR_SETTING_MENU_INDEX = 11;

  const DEFAULT_MENU_INDEX = MONITOR_ACCOUNT_BALANCE_MENU_INDEX;

  //*---------------------------------------------------------------------------
  //* Set MUI theme.
  //*---------------------------------------------------------------------------
  const theme = useTheme();

  //*---------------------------------------------------------------------------
  //* Define rent market class.
  //*---------------------------------------------------------------------------
  const rentMarketClassRef = React.useRef();

  //*---------------------------------------------------------------------------
  //* Data list.
  //* Undefined varialbe means loading status.
  //*---------------------------------------------------------------------------
  const [myRegisteredNFTArray, setMyRegisteredNFTArray] = React.useState();
  const [myUnregisteredNFTArray, setMyUnregisteredNFTArray] = React.useState();
  const [collectionArray, setCollectionArray] = React.useState();
  const [serviceArray, setServiceArray] = React.useState();
  const [tokenArray, setTokenArray] = React.useState();
  const [inputRentMarket, setInputRentMarket] = React.useState();
  const isMobileRef = React.useRef(false);

  //*---------------------------------------------------------------------------
  //* If undefined, it'd loading status.
  //*---------------------------------------------------------------------------
  const [registerNFTArray, setRegisterNFTArray] = React.useState();
  const [myRentNFTArray, setMyRentNFTArray] = React.useState();

  //*---------------------------------------------------------------------------
  //* Handle drawer open.
  //*---------------------------------------------------------------------------
  const [openDrawer, setOpenDrawer] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };
  const handleDrawerClose = () => {
    setOpenDrawer(false);
  };

  //*---------------------------------------------------------------------------
  //* Handle drawer selected index.
  //*---------------------------------------------------------------------------
  const [selectedIndex, setSelectedIndex] = React.useState(DEFAULT_MENU_INDEX);
  const handleListItemClick = (event, index) => {
    // * Set selected index.
    setSelectedIndex(index);

    // * Close drawer in mobile browser.
    if (isMobileRef.current === true) {
      handleDrawerClose();
    }
  };

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

  const readToastMessageLoadable = useRecoilValueLoadable(
    readToastMessageState
  );
  const readToastMessage =
    readToastMessageLoadable?.state === "hasValue"
      ? readToastMessageLoadable.contents
      : {
          snackbarSeverity: AlertSeverity.info,
          snackbarMessage: "",
          snackbarTime: new Date(),
          snackbarOpen: true,
        };

  useEffect(() => {
    // console.log("call useEffect()");
    // console.log("rentMarketAddress: ", rentMarketAddress);
    // console.log("testNftAddress: ", testNftAddress);
    // console.log("blockchainNetwork: ", blockchainNetwork);
    // console.log("serviceAddress: ", serviceAddress);

    async function initRentMarket() {
      // console.log("call initRentMarket()");

      rentMarketClassRef.current = new RentMarket({
        accountAddress: address,
        rentMarketAddress,
        testNftAddress,
        blockchainNetwork,
        onEventFunc,
        onErrorFunc,
      });
      // console.log("rentMarketClassRef.current: ", rentMarketClassRef.current);

      //* Set inputRentMarket for updating component which uses rentMarket.
      //* For calling function of rentMarket contract.
      // console.log("call setInputRentMarket()");
      setInputRentMarket(rentMarketClassRef.current);

      // console.log("call rentMarketClassRef.current.initializeAll()");
      try {
        // await rentMarketClassRef.current.initializeAll();
        rentMarketClassRef.current.initializeAll();
      } catch (error) {
        console.error(error);
        setWriteToastMessage({
          snackbarSeverity: AlertSeverity.error,
          snackbarMessage: error.reason ? error.reason : error,
          snackbarTime: new Date(),
          snackbarOpen: true,
        });
      }

      //* Close drawer in mobile browser.
      isMobileRef.current = checkMobile();
      // console.log("isMobileRef.current: ", isMobileRef.current);
      if (isMobileRef.current === true) {
        setOpenDrawer(false);
      }
    }

    //*-------------------------------------------------------------------------
    //* Fetch token, collection, service, request/register data,
    //* and rent data to interconnect them.
    //*-------------------------------------------------------------------------
    initRentMarket().catch(console.error);
  }, [rentMarketAddress, testNftAddress, blockchainNetwork, serviceAddress]);

  function onErrorFunc({ severity = AlertSeverity.error, message = "" }) {
    setWriteToastMessage({
      snackbarSeverity: severity,
      snackbarMessage: message,
      snackbarTime: new Date(),
      snackbarOpen: true,
    });
  }

  function onEventFunc(
    { event, message } = { event: undefined, message: undefined }
  ) {
    // console.log("call onEventFunc()");

    // console.log(
    //   "rentMarketClassRef.current.registerNFTArray: ",
    //   rentMarketClassRef.current.registerNFTArray
    // );
    // console.log(
    //   "rentMarketClassRef.current.myRentNFTArray: ",
    //   rentMarketClassRef.current.myRentNFTArray
    // );
    // console.log(
    //   "rentMarketClassRef.current.collectionArray: ",
    //   rentMarketClassRef.current.collectionArray
    // );
    // console.log(
    //   "rentMarketClassRef.current.myRegisteredNFTArray: ",
    //   rentMarketClassRef.current.myRegisteredNFTArray
    // );
    // console.log(
    //   "rentMarketClassRef.current.myUnregisteredNFTArray: ",
    //   rentMarketClassRef.current.myUnregisteredNFTArray
    // );

    setMyRegisteredNFTArray(rentMarketClassRef.current.myRegisteredNFTArray);
    setMyUnregisteredNFTArray(
      rentMarketClassRef.current.myUnregisteredNFTArray
    );
    setRegisterNFTArray(rentMarketClassRef.current.registerNFTArray);
    setMyRentNFTArray(rentMarketClassRef.current.myRentNFTArray);
    setCollectionArray(rentMarketClassRef.current.collectionArray);
    setServiceArray(rentMarketClassRef.current.serviceArray);
    setTokenArray(rentMarketClassRef.current.tokenArray);

    if (message) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: message,
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    }
  }

  //*---------------------------------------------------------------------------
  //* Rendering function.
  //*---------------------------------------------------------------------------
  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      {/* //*----------------------------------------------------------------*/}
      {/* //* App bar title part.                                            */}
      {/* //*----------------------------------------------------------------*/}
      <AppBar position="fixed" open={openDrawer}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(openDrawer && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {selectedIndex === MARKET_MENU_INDEX
              ? "Market"
              : selectedIndex === MY_MENU_INDEX
              ? "My"
              : selectedIndex === CONTENT_MENU_INDEX
              ? "Content"
              : selectedIndex === COLLECTION_MENU_INDEX
              ? "Collection"
              : selectedIndex === SERVICE_MENU_INDEX
              ? "Service"
              : selectedIndex === TOKEN_MENU_INDEX
              ? "Token"
              : selectedIndex === MONITOR_TOKEN_MENU_INDEX
              ? "Monitor - Token"
              : selectedIndex === MONITOR_ACCOUNT_BALANCE_MENU_INDEX
              ? "Monitor - Account Balance"
              : selectedIndex === MONITOR_PENDING_RENT_FEE_MENU_INDEX
              ? "Monitor - Pending Rent Fee"
              : selectedIndex === MONITOR_RENT_NFT_MENU_INDEX
              ? "Monitor - Rent NFT"
              : selectedIndex === MONITOR_REWARD_MENU_INDEX
              ? "Monitor - Reward"
              : selectedIndex === MONITOR_SETTING_MENU_INDEX
              ? "Monitor - Setting"
              : "Rent Market"}
          </Typography>

          {isConnected === true ? (
            <div>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ flexGrow: 1 }}
              >
                <Button
                  onClick={() => {
                    disconnect();
                  }}
                  sx={{ color: "white" }}
                >
                  DISCONNECT
                </Button>
              </Typography>
            </div>
          ) : null}
        </Toolbar>
      </AppBar>

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Drawer part                                                     */}
      {/*//*-----------------------------------------------------------------*/}
      <Drawer
        sx={{
          width: RENT_CONTENT_COMPONENT_DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: RENT_CONTENT_COMPONENT_DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={openDrawer}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {/*//*------------------------------------------------------------*/}
          {/*//* User menu list.                                            */}
          {/*//*------------------------------------------------------------*/}

          <Divider sx={{ margin: "5px" }}>
            <Chip label="User" />
          </Divider>

          {
            <ListItem key="Market" disablePadding>
              <ListItemButton
                selected={selectedIndex === MARKET_MENU_INDEX}
                onClick={(event) =>
                  handleListItemClick(event, MARKET_MENU_INDEX)
                }
              >
                <ListItemIcon>
                  <StoreIcon />
                </ListItemIcon>
                <ListItemText primary="Market" />
              </ListItemButton>
            </ListItem>
          }
          {
            <ListItem key="My" disablePadding>
              <ListItemButton
                selected={selectedIndex === MY_MENU_INDEX}
                onClick={(event) => handleListItemClick(event, MY_MENU_INDEX)}
              >
                <ListItemIcon>
                  <ShoppingCartIcon />
                </ListItemIcon>
                <ListItemText primary="My" />
              </ListItemButton>
            </ListItem>
          }
          {
            <ListItem key="Content" disablePadding>
              <ListItemButton
                selected={selectedIndex === CONTENT_MENU_INDEX}
                onClick={(event) =>
                  handleListItemClick(event, CONTENT_MENU_INDEX)
                }
              >
                <ListItemIcon>
                  <SellIcon />
                </ListItemIcon>
                <ListItemText primary="Content" />
              </ListItemButton>
            </ListItem>
          }

          {/*//*-------------------------------------------------------------*/}
          {/*//* Market menu list.                                           */}
          {/*//*-------------------------------------------------------------*/}

          <Divider sx={{ margin: "5px" }}>
            <Chip label="Market" />
          </Divider>

          {
            <ListItem key="Collection" disablePadding>
              <ListItemButton
                selected={selectedIndex === COLLECTION_MENU_INDEX}
                onClick={(event) =>
                  handleListItemClick(event, COLLECTION_MENU_INDEX)
                }
              >
                <ListItemIcon>
                  <CollectionsIcon />
                </ListItemIcon>
                <ListItemText primary="Collection" />
              </ListItemButton>
            </ListItem>
          }
          {
            <ListItem key="Service" disablePadding>
              <ListItemButton
                selected={selectedIndex === SERVICE_MENU_INDEX}
                onClick={(event) =>
                  handleListItemClick(event, SERVICE_MENU_INDEX)
                }
              >
                <ListItemIcon>
                  <MiscellaneousServicesIcon />
                </ListItemIcon>
                <ListItemText primary="Service" />
              </ListItemButton>
            </ListItem>
          }
          {
            <ListItem key="Token" disablePadding>
              <ListItemButton
                selected={selectedIndex === TOKEN_MENU_INDEX}
                onClick={(event) =>
                  handleListItemClick(event, TOKEN_MENU_INDEX)
                }
              >
                <ListItemIcon>
                  <TokenIcon />
                </ListItemIcon>
                <ListItemText primary="Token" />
              </ListItemButton>
            </ListItem>
          }

          {/*//*-------------------------------------------------------------*/}
          {/*//* Monitor menu list.                                          */}
          {/*//*-------------------------------------------------------------*/}

          <Divider sx={{ margin: "5px" }}>
            <Chip label="Monitor" />
          </Divider>

          {
            <ListItem key="Monitor-Token" disablePadding>
              <ListItemButton
                selected={selectedIndex === MONITOR_TOKEN_MENU_INDEX}
                onClick={(event) =>
                  handleListItemClick(event, MONITOR_TOKEN_MENU_INDEX)
                }
              >
                <ListItemIcon>
                  <CircleIcon />
                </ListItemIcon>
                <ListItemText primary="Token" />
              </ListItemButton>
            </ListItem>
          }
          {
            <ListItem key="Monitor-AccountBalance" disablePadding>
              <ListItemButton
                selected={selectedIndex === MONITOR_ACCOUNT_BALANCE_MENU_INDEX}
                onClick={(event) =>
                  handleListItemClick(event, MONITOR_ACCOUNT_BALANCE_MENU_INDEX)
                }
              >
                <ListItemIcon>
                  <CircleIcon />
                </ListItemIcon>
                <ListItemText primary="Account Balance" />
              </ListItemButton>
            </ListItem>
          }
          {
            <ListItem key="Monitor-PendingRentFee" disablePadding>
              <ListItemButton
                selected={selectedIndex === MONITOR_PENDING_RENT_FEE_MENU_INDEX}
                onClick={(event) =>
                  handleListItemClick(
                    event,
                    MONITOR_PENDING_RENT_FEE_MENU_INDEX
                  )
                }
              >
                <ListItemIcon>
                  <CircleIcon />
                </ListItemIcon>
                <ListItemText primary="Pending Rent Fee" />
              </ListItemButton>
            </ListItem>
          }
          {
            <ListItem key="Monitor-RentNft" disablePadding>
              <ListItemButton
                selected={selectedIndex === MONITOR_RENT_NFT_MENU_INDEX}
                onClick={(event) =>
                  handleListItemClick(event, MONITOR_RENT_NFT_MENU_INDEX)
                }
              >
                <ListItemIcon>
                  <CircleIcon />
                </ListItemIcon>
                <ListItemText primary="Rent NFT" />
              </ListItemButton>
            </ListItem>
          }
          {
            <ListItem key="Monitor-Reward" disablePadding>
              <ListItemButton
                selected={selectedIndex === MONITOR_REWARD_MENU_INDEX}
                onClick={(event) =>
                  handleListItemClick(event, MONITOR_REWARD_MENU_INDEX)
                }
              >
                <ListItemIcon>
                  <CircleIcon />
                </ListItemIcon>
                <ListItemText primary="Reward" />
              </ListItemButton>
            </ListItem>
          }
          {
            <ListItem key="Monitor-Setting" disablePadding>
              <ListItemButton
                selected={selectedIndex === MONITOR_SETTING_MENU_INDEX}
                onClick={(event) =>
                  handleListItemClick(event, MONITOR_SETTING_MENU_INDEX)
                }
              >
                <ListItemIcon>
                  <CircleIcon />
                </ListItemIcon>
                <ListItemText primary="Setting" />
              </ListItemButton>
            </ListItem>
          }
        </List>
        <Divider />
      </Drawer>

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Content page.                                                   */}
      {/*//*-----------------------------------------------------------------*/}

      <Main open={openDrawer}>
        <DrawerHeader />

        <LoginWrapper>
          {selectedIndex === MARKET_MENU_INDEX ? (
            inputRentMarket && (
              <Market
                inputRentMarketClass={inputRentMarket}
                inputCollectionArray={collectionArray}
                inputServiceAddress={serviceAddress}
                inputRegisterNFTArray={registerNFTArray}
                inputBlockchainNetwork={blockchainNetwork}
                setWriteToastMessage={setWriteToastMessage}
              />
            )
          ) : selectedIndex === MY_MENU_INDEX ? (
            inputRentMarket && <My />
          ) : selectedIndex === CONTENT_MENU_INDEX ? (
            inputRentMarket && <Content />
          ) : selectedIndex === COLLECTION_MENU_INDEX ? (
            inputRentMarket && <Collection />
          ) : selectedIndex === SERVICE_MENU_INDEX ? (
            inputRentMarket && <Service />
          ) : selectedIndex === TOKEN_MENU_INDEX ? (
            inputRentMarket && <Token />
          ) : selectedIndex === MONITOR_TOKEN_MENU_INDEX ? (
            inputRentMarket && <MonitorToken />
          ) : selectedIndex === MONITOR_ACCOUNT_BALANCE_MENU_INDEX ? (
            inputRentMarket && <MonitorAccountBalance />
          ) : selectedIndex === MONITOR_PENDING_RENT_FEE_MENU_INDEX ? (
            inputRentMarket && <MonitorPendingRentFee />
          ) : selectedIndex === MONITOR_RENT_NFT_MENU_INDEX ? (
            inputRentMarket && <MonitorRentNft />
          ) : selectedIndex === MONITOR_REWARD_MENU_INDEX ? (
            <MonitorReward />
          ) : selectedIndex === MONITOR_SETTING_MENU_INDEX ? (
            <MonitorSetting />
          ) : (
            <></>
          )}
        </LoginWrapper>
      </Main>

      {/*//*-----------------------------------------------------------------*/}
      {/*//* Toast message.                                                  */}
      {/*//*-----------------------------------------------------------------*/}
      <RBSnackbar
        open={readToastMessage.snackbarOpen}
        message={readToastMessage.snackbarMessage}
        severity={readToastMessage.snackbarSeverity}
        currentTime={readToastMessage.snackbarTime}
      />
    </Box>
  );
};

export default RentContent;
