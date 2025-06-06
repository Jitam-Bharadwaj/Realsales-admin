import * as React from "react";
import { createTheme } from "@mui/material/styles";

import { Button, Modal, Typography, Grid, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import LogoutIcon from "@mui/icons-material/Logout";
import { axioInstance } from "../api/axios/axios";
import "../Drawer/custome.css";
import { AppProvider } from "@toolpad/core/AppProvider";
import {
  DashboardLayout,
  DashboardSidebarPageItem,
} from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import InterpreterModeIcon from "@mui/icons-material/InterpreterMode";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import FactoryIcon from "@mui/icons-material/Factory";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ModsFlo from "./Mods";
import Role from "./Role";
import Experience from "./Experience";
import Industry from "./Industry";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Persona from "./Persona";
import PlantSize from "./PlantSize";
import ManufacturingModels from "./ManufacturingModels";
import GeneralInstruction from "./GeneralInstruction";

const NAVIGATION = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    segment: "createPersona",
    title: "Create Persona",
    icon: <PersonAddIcon />,
  },
  {
    segment: "modeMgmt",
    title: "Mode Management",
    icon: <InterpreterModeIcon />,
  },
  {
    segment: "industry",
    title: "Industry",
    icon: <WarehouseIcon />,
  },
  {
    segment: "role",
    title: "Role",
    icon: <ManageAccountsIcon />,
  },
  {
    segment: "plantSize",
    title: "Plant Size",
    icon: <HomeWorkIcon />,
  },
  {
    segment: "manufacturingModels",
    title: "Manufacturing Models",
    icon: <FactoryIcon />,
  },
  // {
  //   segment: "generalInstruction",
  //   title: "General Instruction",
  //   icon: <AnnouncementIcon />,
  // },
  // {
  //   segment: "experience",
  //   title: "Experience",
  //   icon: <Diversity3Icon />,
  // },
  {
    kind: "divider",
  },
  {
    segment: "logout",
    title: "Logout",
    icon: <LogoutIcon />,
  },
];

const demoTheme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          default: "#fff", // White background for light mode
          paper: "#fff", // White paper background for light mode
        },
        text: {
          primary: "#000", // Black text for light mode
          secondary: "#000", // Black secondary text for light mode
        },
        primary: {
          main: "#000", // Primary color for light mode (e.g., for buttons)
          contrastText: "#fff", // Contrast text for primary color
        },
      },
      components: {
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: "#fff", // White drawer background for light mode
              color: "#000", // Black text for light mode drawer
            },
          },
        },
        MuiListItemIcon: {
          styleOverrides: {
            root: {
              color: "#000", // Black icons for light mode
            },
          },
        },
        MuiListItemText: {
          styleOverrides: {
            primary: {
              color: "#000", // Black list item text for light mode
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: "#fff", // White top bar background for light mode
              color: "#000", // Black text/icons for light mode top bar
            },
          },
        },
      },
    },
    dark: {
      palette: {
        background: {
          default: "#000", // Black background for dark mode
          paper: "#000", // Black paper background for dark mode
        },
        text: {
          primary: "#fff", // White text for dark mode
          secondary: "#fff", // White secondary text for dark mode
        },
        primary: {
          main: "#fff", // Primary color for dark mode
          contrastText: "#000", // Contrast text for primary color
        },
      },
      components: {
        MuiDrawer: {
          styleOverrides: {
            "& .MuiDrawer-paper": {
              backgroundColor: "#000", // Black drawer background for dark mode
              color: "#fff", // White text for dark mode drawer
            },
          },
        },
        MuiListItemIcon: {
          styleOverrides: {
            root: {
              color: "#fff", // White icons for dark mode
            },
          },
        },
        MuiListItemText: {
          styleOverrides: {
            primary: {
              color: "#fff", // White list item text for dark mode
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: "#000", // Black top bar background for dark mode
              color: "#fff", // White text/icons for dark mode top bar
            },
          },
        },
        // Keep the DashboardSidebarPageItem style overrides for selected state here as they should apply to both modes
        DashboardSidebarPageItem: {
          styleOverrides: {
            root: {
              /* Default state styles if needed */
            },
            selected: {
              backgroundColor: "#fbdc5c", // Yellow background for selected item
              "&:hover": {
                backgroundColor: "#e6c753", // Slightly darker yellow on hover for selected
              },
              "& .MuiListItemIcon-root": {
                color: "#000000", // Black color for the icon when selected
                fill: "#000000", // Also set fill for SVG icons
              },
              "& .MuiListItemText-primary": {
                color: "#000000", // Black color for the text when selected
              },
            },
          },
        },
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function useDemoRouter(initialPath) {
  const [pathname, setPathname] = React.useState(initialPath);

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  return router;
}

export default function DashboardLayoutBasic(props) {
  const { window } = props;
  const router = useDemoRouter("/createPersona");
  const navigate = useNavigate();

  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);

  const handleLogout = async () => {
    console.log("Logout function called");
    try {
      // Call backend logout API to destroy the token
      // Using the specified endpoint /v1/auth/logout with DELETE method
      const res = await axioInstance.delete("/v1/auth/logout");
      console.log("Backend logout successful:", res.data);

      console.log(
        "Local storage before clearing:",
        localStorage.getItem("x-access-token"),
        localStorage.getItem("user")
      );
      // Clear all auth related data from local storage
      localStorage.removeItem("x-access-token");
      localStorage.removeItem("user"); // If you store user data
      console.log(
        "Local storage after clearing:",
        localStorage.getItem("x-access-token"),
        localStorage.getItem("user")
      );

      console.log("Local storage cleared");

      // Close the modal and redirect to login page
      setLogoutModalOpen(false);
      console.log("Redirecting to login page");
      navigate("/");
    } catch (err) {
      console.error("Error during logout:", err);
      console.log(
        "Local storage before clearing (error case):",
        localStorage.getItem("x-access-token"),
        localStorage.getItem("user")
      );
      // Even if backend logout fails, clear local storage and attempt navigation
      // This helps prevent being stuck in a partially logged-out state
      localStorage.removeItem("x-access-token");
      localStorage.removeItem("user");
      console.log(
        "Local storage after clearing (error case):",
        localStorage.getItem("x-access-token"),
        localStorage.getItem("user")
      );
      console.log("Attempting navigation after logout error");
      navigate("/"); // Attempt to navigate even on error
    }
  };

  // Remove this const when copying and pasting into your project.
  const demoWindow = window ? window() : undefined;

  // Extract the current segment from the path
  const currentSegment = router.pathname.split("/").pop();

  // Define the renderPageItem function
  const renderPageItem = React.useCallback(
    (item, { mini }) => {
      if (item.segment === "logout") {
        return (
          <DashboardSidebarPageItem
            item={item}
            mini={mini}
            onClick={() => setLogoutModalOpen(true)} // Open modal on click
          />
        );
      }
      // Default rendering for other items
      return <DashboardSidebarPageItem item={item} mini={mini} />;
    },
    [setLogoutModalOpen]
  ); // Include setLogoutModalOpen in dependencies

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
      branding={{
        logo: (
          <img src="/logo.png" alt="Your Company Logo" style={{ height: 32 }} />
        ),
        title: "RealSales",
      }}
    >
      <DashboardLayout
        renderPageItem={renderPageItem}
        sx={{
          "& .Mui-selected": {
            backgroundColor: "#fbdc5c", // Yellow background for selected item
            "&:hover": {
              backgroundColor: "#e6c253", // Slightly darker yellow on hover for selected
            },
            "& .MuiListItemIcon-root": {
              color: "#000000", // Black color for the icon when selected
              fill: "#000000", // Also set fill for SVG icons
            },
            "& .MuiListItemText-primary": {
              color: "#000000", // Black color for the text when selected
            },
          },
          // Add style to target the drawer paper specifically using theme palette color
          "& .MuiDrawer-paper": {
            bgcolor: "background.paper",
          },
          // Modify style for default text/icon color with higher specificity
          ".MuiListItem-root .MuiListItemText-primary, .MuiListItem-root .MuiListItemIcon-root":
            {
              color: "text.primary",
            },
          // Keep override for selected state (ensuring specificity)
          "& .Mui-selected .MuiListItemText-primary, & .Mui-selected .MuiListItemIcon-root":
            {
              color: "#000000",
              fill: "#000000",
            },
          // Keep style for the AppBar root
          "& .MuiAppBar-root": {
            bgcolor: "background.paper",
          },
        }}
      >
        <PageContainer sx={{ minHeight: "100vh" }}>
          <Grid container spacing={2} sx={{ minHeight: "100vh" }}>
            <Persona currentSegment={currentSegment} />
            <ModsFlo currentSegment={currentSegment} />
            <Role currentSegment={currentSegment} />
            <Experience currentSegment={currentSegment} />
            <Industry currentSegment={currentSegment} />
            <PlantSize currentSegment={currentSegment} />
            <ManufacturingModels currentSegment={currentSegment} />
            <GeneralInstruction currentSegment={currentSegment} />
          </Grid>
        </PageContainer>
      </DashboardLayout>

      <Modal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        aria-labelledby="logout-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#000",
            color: "#fff",
            boxShadow: 24,
            p: 4,
            border: "1px solid #fff",
            borderRadius: "8px",
          }}
        >
          <Typography
            id="logout-modal-title"
            variant="h6"
            component="h2"
            mb={2}
          >
            Confirm Logout
          </Typography>
          <Typography mb={3}>Are you sure you want to logout?</Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                setLogoutModalOpen(false);
              }}
              sx={{ mr: 1, color: "#fff", borderColor: "#fff" }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>
      </Modal>
    </AppProvider>
  );
}
