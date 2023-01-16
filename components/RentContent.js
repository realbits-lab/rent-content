import React from "react";
import {
  styled,
  useTheme,
  Box,
  Drawer,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  AppBar as MuiAppBar,
} from "@mui/material";
import {
  MiscellaneousServices as MiscellaneousServicesIcon,
  Sell as SellIcon,
  ShoppingCart as ShoppingCartIcon,
  Menu as MenuIcon,
  Store as StoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Collections as CollectionsIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { useRecoilStateLoadable, useRecoilValueLoadable } from "recoil";
import { RentMarket } from "rent-market";
import Content from "./Content";
import Collection from "./Collection";
import Service from "./Service";
import {
  AlertSeverity,
  RBSnackbar,
  writeToastMessageState,
  readToastMessageState,
} from "./RentContentUtil";

const RENT_CONTENT_COMPONENT_DRAWER_WIDTH = 180;

// * ---------------------------------------------------------------------------
// * Define Main component style.
// * ---------------------------------------------------------------------------
const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: "white",
  height: "100vh",
  flexGrow: 1,
  padding: theme.spacing(3),
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

// * ---------------------------------------------------------------------------
// * Define AppBar component style.
// * ---------------------------------------------------------------------------
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

// * ---------------------------------------------------------------------------
// * Define DrawerHeader component style.
// * ---------------------------------------------------------------------------
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const RentContent = ({
  rentMarketAddress,
  testNftAddress,
  blockchainNetwork,
  serviceAddress,
}) => {
  // * -------------------------------------------------------------------------
  // * Define each menu index.
  // * -------------------------------------------------------------------------
  const DEFAULT_MENU_INDEX = 0;

  const CONTENT_MENU_INDEX = 0;
  const COLLECTION_MENU_INDEX = 1;
  const SERVICE_MENU_INDEX = 2;

  // * -------------------------------------------------------------------------
  // * Set MUI theme.
  // * -------------------------------------------------------------------------
  const theme = useTheme();

  // * -------------------------------------------------------------------------
  // * Define rent market class.
  // * -------------------------------------------------------------------------
  const rentMarket = React.useRef();

  // * -------------------------------------------------------------------------
  // * Data list.
  // * -------------------------------------------------------------------------
  const [myRegisteredNFTArray, setMyRegisteredNFTArray] = React.useState([]);
  const [myUnregisteredNFTArray, setMyUnregisteredNFTArray] = React.useState(
    []
  );
  const [collectionArray, setCollectionArray] = React.useState([]);
  const [serviceArray, setServiceArray] = React.useState([]);
  const [tokenArray, setTokenArray] = React.useState([]);
  const [inputRentMarket, setInputRentMarket] = React.useState();

  // * -------------------------------------------------------------------------
  // * If undefined, it'd loading status.
  // * -------------------------------------------------------------------------
  const [registerNFTArray, setRegisterNFTArray] = React.useState();
  const [myRentNFTArray, setMyRentNFTArray] = React.useState();

  // * -------------------------------------------------------------------------
  // * Handle open drawer.
  // * -------------------------------------------------------------------------
  const [openDrawer, setOpenDrawer] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };
  const handleDrawerClose = () => {
    setOpenDrawer(false);
  };

  // * -------------------------------------------------------------------------
  // * Handle toast message.
  // * -------------------------------------------------------------------------
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

  const readToastMessageLoadable = useRecoilValueLoadable(
    readToastMessageState
  );
  const readToastMessage = React.useMemo(() => {
    return readToastMessageLoadable?.state === "hasValue"
      ? readToastMessageLoadable.contents
      : {
          snackbarSeverity: AlertSeverity.info,
          snackbarMessage: "",
          snackbarTime: new Date(),
          snackbarOpen: true,
        };
  });

  // * -------------------------------------------------------------------------
  // * Handle selected index.
  // * -------------------------------------------------------------------------
  const [selectedIndex, setSelectedIndex] = React.useState(DEFAULT_MENU_INDEX);
  const handleListItemClick = (event, index) => {
    // Set selected index.
    setSelectedIndex(index);

    // Close drawer.
    // handleDrawerClose();
  };

  // * Initialize data.
  React.useEffect(() => {
    // console.log("call React.useEffect()");

    const initRentMarket = async () => {
      // console.log("rentMarketAddress: ", rentMarketAddress);
      rentMarket.current = new RentMarket({
        rentMarketAddress,
        testNftAddress,
        blockchainNetwork,
        onEventFunc,
        onErrorFunc,
      });
      // console.log("rentMarket.current: ", rentMarket.current);

      // console.log("call rentMarket.current.initializeAll()");
      try {
        // await rentMarket.current.initializeAll();
        rentMarket.current.initializeAll();
      } catch (error) {
        console.error(error);
        setWriteToastMessage({
          snackbarSeverity: AlertSeverity.error,
          snackbarMessage: error.reason ? error.reason : error,
          snackbarTime: new Date(),
          snackbarOpen: true,
        });
      }

      // Set inputRentMarket for updating component which uses rentMarket.
      // For calling function of rentMarket contract.
      // console.log("call setInputRentMarket()");
      setInputRentMarket(rentMarket.current);
    };

    // * -----------------------------------------------------------------------
    // * Fetch token, collection, service, request/register data,
    // * and rent data to interconnect them.
    // * -----------------------------------------------------------------------
    initRentMarket().catch(console.error);
  }, []);

  const onErrorFunc = (
    { severity, message } = { severity: AlertSeverity.error, message: "" }
  ) => {
    setWriteToastMessage({
      snackbarSeverity: severity,
      snackbarMessage: message,
      snackbarTime: new Date(),
      snackbarOpen: true,
    });
  };

  const onEventFunc = (
    { event, message } = { event: undefined, message: undefined }
  ) => {
    if (event !== undefined) {
      console.log("event: ", event);
    }
    // console.log("call onEventFunc()");

    // console.log(
    //   "rentMarket.current.registerNFTArray: ",
    //   rentMarket.current.registerNFTArray
    // );
    // console.log(
    //   "rentMarket.current.myRentNFTArray: ",
    //   rentMarket.current.myRentNFTArray
    // );
    // console.log(
    //   "rentMarket.current.collectionArray: ",
    //   rentMarket.current.collectionArray
    // );
    // console.log(
    //   "rentMarket.current.myRegisteredNFTArray: ",
    //   rentMarket.current.myRegisteredNFTArray
    // );
    // console.log(
    //   "rentMarket.current.myUnregisteredNFTArray: ",
    //   rentMarket.current.myUnregisteredNFTArray
    // );

    setMyRegisteredNFTArray(rentMarket.current.myRegisteredNFTArray);
    setMyUnregisteredNFTArray(rentMarket.current.myUnregisteredNFTArray);
    setRegisterNFTArray(rentMarket.current.registerNFTArray);
    setMyRentNFTArray(rentMarket.current.myRentNFTArray);
    setCollectionArray(rentMarket.current.collectionArray);
    setServiceArray(rentMarket.current.serviceArray);
    setTokenArray(rentMarket.current.tokenArray);

    if (message) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: message,
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    }
  };

  // console.log("Build RentContent component.");

  // * -------------------------------------------------------------------------
  // * Rendering function.
  // * -------------------------------------------------------------------------
  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      {/* // * --------------------------------------------------------------*/}
      {/* // * App bar title part.                                           */}
      {/* // * --------------------------------------------------------------*/}
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
            {selectedIndex === CONTENT_MENU_INDEX
              ? "Content"
              : selectedIndex === COLLECTION_MENU_INDEX
              ? "Collection"
              : selectedIndex === SERVICE_MENU_INDEX
              ? "Service"
              : "Rent Market"}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* // * --------------------------------------------------------------*/}
      {/* // * Drawer part.                                                  */}
      {/* // * --------------------------------------------------------------*/}
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
          {/* // * ----------------------------------------------------------*/}
          {/* // * Content menu.                                             */}
          {/* // * ----------------------------------------------------------*/}

          <p />
          <Divider>
            <Chip label="Content" />
          </Divider>
          <p />

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

          {/* // * ----------------------------------------------------------*/}
          {/* // * Market menu.                                             */}
          {/* // * ----------------------------------------------------------*/}

          <p />
          <Divider>
            <Chip label="Market" />
          </Divider>
          <p />

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
        </List>
        <Divider />
      </Drawer>

      {/* // * --------------------------------------------------------------*/}
      {/* // * Right content page.                                           */}
      {/* // * --------------------------------------------------------------*/}
      <Main open={openDrawer}>
        <DrawerHeader />
        {selectedIndex === CONTENT_MENU_INDEX ? (
          inputRentMarket && (
            <Content
              inputRentMarket={inputRentMarket}
              inputMyRegisteredNFTArray={myRegisteredNFTArray}
              inputMyUnregisteredNFTArray={myUnregisteredNFTArray}
              inputBlockchainNetwork={blockchainNetwork}
            />
          )
        ) : selectedIndex === COLLECTION_MENU_INDEX ? (
          inputRentMarket && (
            <Collection
              blockchainNetwork={blockchainNetwork}
              inputCollectionArray={collectionArray}
              inputRentMarket={inputRentMarket}
            />
          )
        ) : selectedIndex === SERVICE_MENU_INDEX ? (
          inputRentMarket && (
            <Service
              blockchainNetwork={blockchainNetwork}
              inputServiceArray={serviceArray}
              inputRentMarket={inputRentMarket}
            />
          )
        ) : (
          <></>
        )}
        <Box></Box>
      </Main>

      {/* // * --------------------------------------------------------------*/}
      {/* // * Toast message.                                                */}
      {/* // * --------------------------------------------------------------*/}
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
