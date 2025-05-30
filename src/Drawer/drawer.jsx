import * as React from "react";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import {
  Button,
  Modal,
  Typography,
  TextField,
  CircularProgress,
  Grid,
  Box,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import { axioInstance } from "../api/axios/axios";
import { endpoints } from "../api/endpoints/endpoints";
import { useEffect } from "react";
import "../Drawer/custome.css";
import { AppProvider } from "@toolpad/core/AppProvider";
import {
  DashboardLayout,
  DashboardSidebarPageItem,
} from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { showToast } from "../toastConfig";

// Text formatting functions
const convertNewlines = (text) => {
  return text
    .trim()
    .replace(/\s*\n\s*/g, "\n") // Clean up spaces around newlines
    .replace(/\n{3,}/g, "\n\n") // Limit to max 2 consecutive newlines
    .split("\n\n")
    .filter((para) => para.trim()) // Remove empty paragraphs
    .map((paragraph) => paragraph.replace(/\n/g, "\\n"))
    .join("\\n\\n");
};

// Text display component
const TextDisplay = ({ text }) => {
  if (!text) return null;
  const displayText = text.replace(/\\n\\n/g, "\n\n").replace(/\\n/g, "\n");
  return (
    <div className="whitespace-pre-wrap p-4 bg-gray-100 rounded">
      {displayText}
    </div>
  );
};

const NAVIGATION = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "reports",
    title: "Modes",
    icon: <BarChartIcon />,
    children: [
      {
        segment: "prospecting",
        title: "Prospecting",
        icon: <DescriptionIcon />,
      },
      {
        segment: "sales",
        title: "Sales",
        icon: <DescriptionIcon />,
      },
      {
        segment: "closing",
        title: "Closing",
        icon: <DescriptionIcon />,
      },
    ],
  },
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

const Skeleton = styled("div")(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  content: '" "',
}));

export default function DashboardLayoutBasic(props) {
  const { window } = props;
  const router = useDemoRouter("/dashboard");
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [closingData, setGetClosing] = React.useState([]);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);
  const [editingData, setEditingData] = React.useState({
    description: "",
    prompt_template: "",
    ai_id: null,
    mode_id: null,
    type: null,
    loading: false,
  });
  const [addData, setAddData] = React.useState({});
  const [modeAiData, setModeAiData] = React.useState([]);
  const [manufacturingModels, setmanufacturingModels] = React.useState([]);
  const [plantModeSize, setPlantModeSize] = React.useState([]);
  const [industrySize, setIndustrySize] = React.useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteItemId, setDeleteItemId] = React.useState(null);
  const [deleteType, setDeleteType] = React.useState("");
  const [mods, setMods] = React.useState([]);
  const [mods_Id, setMods_Id] = React.useState({});

  const handleNavigation = (segment) => {
    if (segment !== "logout") {
      navigate(`/${segment}`);
    }
  };

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

  // getClosing function to fetch data based on segment

  const getClosingData = async (modesId) => {
    try {
      console.log("Fetching base prompt data for segment:", currentSegment);
      let modeId;

      // Set the appropriate mode_id based on the current segment
      switch (currentSegment) {
        case "prospecting":
          modeId = modesId ? modesId : mods_Id?.prospecting_mode_id;
          break;
        case "sales":
          modeId = modesId ? modesId : mods_Id?.discovering_mode_id;
          break;
        case "closing":
          modeId = modesId ? modesId : mods_Id?.closing_mode_id;
          break;
        default:
          console.error("Unknown segment:", currentSegment);
          return;
      }

      const res = await axioInstance.get(
        `${endpoints.closing.getClosing}?mode_id=${modeId}`
      );
      console.log("Base prompt response for segment", currentSegment, ":", {
        modeId,
        data: res?.data,
        url: `${endpoints.closing.getClosing}?mode_id=${modeId}`,
      });
      setGetClosing(res?.data);
    } catch (err) {
      console.error("Error fetching base prompt data:", err);
    }
  };

  // console.log(closingData, "closingdata");

  // Add function to fetch specific item data
  const fetchItemData = async (itemId, type) => {
    try {
      setEditingData((prev) => ({ ...prev, loading: true }));
      const baseUrl = endpoints.closing;
      let url;

      if (type?.includes("plant")) {
        url = `${baseUrl.plantModeSize}/${itemId}`;
      } else if (type?.includes("manufacturing")) {
        url = `${baseUrl.manufacturingModels}/${itemId}`;
      } else if (type?.includes("roles")) {
        url = `${baseUrl.modeAiRoles}/${itemId}`;
      } else if (type?.includes("industry")) {
        url = `${baseUrl.industrysize}${itemId}`;
      } else {
        url = `${baseUrl.getClosing}/${itemId}`;
      }

      const res = await axioInstance.get(url);
      setEditingData({
        description: res.data?.description || res.data?.name || "",
        prompt_template: res.data?.prompt_template || res.data?.details || "",
        mode_id: itemId,
        type: type,
        loading: false,
      });
    } catch (err) {
      console.error("Error fetching item data:", err);
      setEditingData((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleEditClick = (item, type) => {
    setEditModalOpen(true);
    console.log("Edit clicked for item:", item, "with type:", type);

    // Set the appropriate content and ID based on the type
    let content, itemId, ai_id;

    if (type?.includes("industry")) {
      content = item?.details || "";
      itemId = item.industry_id;
    } else if (type?.includes("plant")) {
      content = item?.prompt_template || "";
      itemId = item.interaction_mode_plant_size_impact_id;
      ai_id = item?.plant_size_impact_id;
    } else if (type?.includes("manufacturing")) {
      content = item?.prompt_template || "";
      itemId = item.interaction_mode_manufacturing_model_id;
      ai_id = item?.manufacturing_model?.manufacturing_model_id;
    } else if (type?.includes("roles")) {
      content = item?.prompt_template || "";
      itemId = item.interaction_mode_ai_role_id;
      ai_id = item?.ai_role_id;
    } else {
      content = item?.prompt_template || "";
      itemId = item.mode_id;
    }

    // Set the exact data that's shown in the accordion
    setEditingData({
      description: item?.description || item?.name || "",
      prompt_template: content,
      ai_id: ai_id,
      mode_id: itemId,
      type: type,
      loading: false, // No need to load since we're using existing data
    });
  };

  const handleDeleteClick = (item, type) => {
    console.log("Delete clicked with type:", type);
    console.log("Item being deleted:", item);

    // Set the appropriate ID based on the type
    let itemId;
    if (type.includes("plant")) {
      itemId = item.interaction_mode_plant_size_impact_id;
    } else if (type.includes("manufacturing")) {
      itemId = item.interaction_mode_manufacturing_model_id;
    } else if (type.includes("roles")) {
      itemId = item.interaction_mode_ai_role_id;
    } else if (type.includes("industry")) {
      itemId = item.industry_id;
    } else {
      itemId = item.mode_id;
    }

    setDeleteItemId(itemId);
    setDeleteType(type);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log("Deleting with type:", deleteType);
      console.log("Deleting item ID:", deleteItemId);

      // Base URL from endpoints
      const baseUrl = endpoints.closing;

      switch (deleteType) {
        // Base Prompt (interaction-modes)
        case "prospecting-base":
        case "sales-base":
        case "closing-base":
          await axioInstance.delete(`${baseUrl.getClosing}/${deleteItemId}`);
          await getClosingData();
          break;

        // Interaction Roles
        case "prospecting-roles":
        case "sales-roles":
        case "closing-roles":
          await axioInstance.delete(`${baseUrl.modeAiRoles}/${deleteItemId}`);
          await getModeAiRelesData();
          break;

        // Manufacturing Models
        case "prospecting-manufacturing":
        case "sales-manufacturing":
        case "closing-manufacturing":
          await axioInstance.delete(
            `${baseUrl.manufacturingModels}/${deleteItemId}`
          );
          await getManufacturingModels();
          break;

        // Plant Size
        case "prospecting-plant":
        case "sales-plant":
        case "closing-plant":
          await axioInstance.delete(`${baseUrl.plantModeSize}/${deleteItemId}`);
          await getPlantModeSize();
          break;

        // Industry
        case "prospecting-industry":
        case "sales-industry":
        case "closing-industry":
          await axioInstance.delete(`${baseUrl.industrysize}${deleteItemId}`); // Note: no slash here as it's in the base URL
          await getIndustryDetails();
          break;

        default:
          console.error("Unknown delete type:", deleteType);
          return;
      }

      setDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteType("");
    } catch (err) {
      console.error("Error deleting data:", err);
      console.log("Delete error details:", {
        type: deleteType,
        id: deleteItemId,
        error: err,
        url: err.config?.url,
      });
    }
  };
  console.log(editingData, "editingData__");
  const handleSaveEdit = async () => {
    try {
      const baseUrl = endpoints.closing;
      const itemId = editingData.mode_id;
      const ai_id = editingData?.ai_id;
      const type = editingData.type;
      let url;
      let payload;

      // Use the convertNewlines function to format the text
      const formattedText = convertNewlines(editingData.prompt_template);

      // Determine the correct URL and payload based on type
      if (type.includes("plant")) {
        url = `${baseUrl.plantModeSize}/${itemId}`;
        payload = {
          prompt_template: formattedText,
          interaction_mode_plant_size_impact_id: itemId,
          mode_id: type.includes("prospecting")
            ? mods_Id?.prospecting_mode_id
            : type.includes("sales")
              ? mods_Id?.discovering_mode_id
              : mods_Id?.closing_mode_id,
          plant_size_impact_id: ai_id,
        };
      } else if (type.includes("manufacturing")) {
        url = `${baseUrl.manufacturingModels}/${itemId}`;
        payload = {
          prompt_template: formattedText,
          interaction_mode_manufacturing_model_id: itemId,
          mode_id: type.includes("prospecting")
            ? mods_Id?.prospecting_mode_id
            : type.includes("sales")
              ? mods_Id?.discovering_mode_id
              : mods_Id?.closing_mode_id,
          manufacturing_model_id: ai_id,
        };
      } else if (type.includes("roles")) {
        url = `${baseUrl.modeAiRoles}/${itemId}`;
        payload = {
          prompt_template: formattedText,
          interaction_mode_ai_role_id: itemId,
          mode_id: type.includes("prospecting")
            ? mods_Id?.prospecting_mode_id
            : type.includes("sales")
              ? mods_Id?.discovering_mode_id
              : mods_Id?.closing_mode_id,
          ai_role_id: ai_id,
        };
      } else if (type.includes("industry")) {
        url = `${baseUrl.industrysize}${itemId}`;
        payload = {
          details: formattedText,
          industry_id: itemId,
        };
      } else {
        // Base prompt case
        url = `${baseUrl.getClosing}/${itemId}`;
        payload = {
          prompt_template: formattedText,
          mode_id: itemId,
        };
      }

      console.log("Making PUT request to:", url);
      console.log("With payload:", payload);

      const response = await axioInstance.put(url, payload);
      console.log("Edit response:", response);

      // Refresh all data after successful update
      await Promise.all([
        getClosingData(),
        getModeAiRelesData(),
        getManufacturingModels(),
        getPlantModeSize(),
        getIndustryDetails(),
      ]);

      setEditModalOpen(false);
    } catch (err) {
      console.error("Error updating data:", err);
      console.log("Edit error details:", {
        type: editingData.type,
        id: editingData.mode_id,
        error: err,
        url: err.config?.url,
      });
    }
  };

  // get Handle Mode Ai roles Data function

  const getModeAiRelesData = async () => {
    try {
      console.log("Fetching AI roles data...");
      const res = await axioInstance.get(endpoints.closing.modeAiRoles);
      console.log("AI roles response:", res?.data);
      if (res?.data?.length) {
        setModeAiData(res?.data);
      }
    } catch (err) {
      console.error("Error fetching AI roles:", err);
    }
  };

  // get Handle Mode Ai roles Data function

  const getManufacturingModels = async () => {
    try {
      console.log("Fetching manufacturing models...");
      const res = await axioInstance.get(
        `${endpoints.closing.manufacturingModels}`
      );
      console.log("Manufacturing models response:", res?.data);
      setmanufacturingModels(res?.data);
    } catch (err) {
      console.error("Error fetching manufacturing models:", err);
    }
  };

  // get Handle Plant Mode Size Data function
  const getPlantModeSize = async () => {
    try {
      console.log("Fetching plant mode size...");
      const res = await axioInstance.get(`${endpoints.closing.plantModeSize}`);
      console.log("Plant mode size response:", res?.data);
      setPlantModeSize(res?.data);
    } catch (err) {
      console.error("Error fetching plant mode size:", err);
    }
  };

  // get Handle Industry Details Data function

  const getIndustryDetails = async () => {
    try {
      console.log("Fetching industry details...");
      const res = await axioInstance.get(`${endpoints.closing.industrysize}`);
      console.log("Industry details response:", res?.data);
      setIndustrySize(res?.data);
    } catch (err) {
      console.error("Error fetching industry details:", err);
    }
  };

  useEffect(() => {
    getClosingData();
    getModeAiRelesData();
    getManufacturingModels();
    getPlantModeSize();
    getIndustryDetails();
  }, [currentSegment]);

  const getHeadingFromPrompt = (promptTemplate) => {
    if (!promptTemplate) return "No Description";
    const parts = promptTemplate.split(":");
    return parts[0].trim();
  };

  useEffect(() => {
    const getAiMode = async () => {
      try {
        let data = await axioInstance.get(endpoints.mods.interaction_modes);
        if (data?.data?.length) {
          // Assuming data.data is an array of objects
          const updatedData = data.data.map((item) => {
            if (item.name === "closing") {
              // Check if the item's name is "closing"
              return { ...item, closing_mode_id: item?.mode_id }; // Set mode_id to closing_mode_id
            }
            if (item.name === "discovering") {
              // Check if the item's name is "closing"
              return { ...item, discovering_mode_id: item?.mode_id }; // Set mode_id to discovering_mode_id
            }
            if (item.name === "prospecting") {
              // Check if the item's name is "closing"
              return { ...item, prospecting_mode_id: item?.mode_id }; // Set mode_id to prospecting_mode_id
            }
            return item; // Return the item unchanged if not "closing"
          });
          setMods(updatedData); // Update state with modified data
        }
      } catch (error) {
        console.error("Error fetching AI modes:", error);
      }
    };

    getAiMode();
  }, []);

  useEffect(() => {
    let closing_mode_id = mods
      .filter((v) => v?.closing_mode_id)
      .map((val) => val?.closing_mode_id)[0];
    let discovering_mode_id = mods
      .filter((v) => v?.discovering_mode_id)
      .map((val) => val?.discovering_mode_id)[0];
    let prospecting_mode_id = mods
      .filter((v) => v?.prospecting_mode_id)
      .map((val) => val?.prospecting_mode_id)[0];

    if (closing_mode_id) {
      setMods_Id((pre) => ({ ...pre, closing_mode_id: closing_mode_id }));
    }
    if (discovering_mode_id) {
      setMods_Id((pre) => ({
        ...pre,
        discovering_mode_id: discovering_mode_id,
      }));
    }
    if (prospecting_mode_id) {
      setMods_Id((pre) => ({
        ...pre,
        prospecting_mode_id: prospecting_mode_id,
      }));
    }
  }, [mods?.length]);
  console.log(mods_Id, "___mods");

  // Modify your filter functions to include the heading extraction
  let filteredClosinData = Array.isArray(closingData)
    ? closingData
        .filter((item) => item.mode_id === mods_Id?.closing_mode_id)
        .map((item) => ({
          ...item,
          description: getHeadingFromPrompt(item.prompt_template),
        }))
    : [];

  let filteredProspectingData = Array.isArray(closingData)
    ? closingData
        .filter((item) => item.mode_id === mods_Id?.prospecting_mode_id)
        .map((item) => ({
          ...item,
          description: getHeadingFromPrompt(item.prompt_template),
        }))
    : [];

  let filteredSalesData = Array.isArray(closingData)
    ? closingData
        .filter((item) => item.mode_id === mods_Id?.discovering_mode_id)
        .map((item) => ({
          ...item,
          description: getHeadingFromPrompt(item.prompt_template),
        }))
    : [];

  // Do the same for other filtered data sets
  let filteredData = Array.isArray(modeAiData)
    ? modeAiData
        .filter((item) => item.mode_id === mods_Id?.closing_mode_id)
        .map((item) => ({
          ...item,
          description: getHeadingFromPrompt(item.prompt_template),
        }))
    : [];

  let filteredProspectingModeData = Array.isArray(modeAiData)
    ? modeAiData
        .filter((item) => item.mode_id === mods_Id?.prospecting_mode_id)
        .map((item) => ({
          ...item,
          description: getHeadingFromPrompt(item.prompt_template),
        }))
    : [];

  let filteredSalesModeData = Array.isArray(modeAiData)
    ? modeAiData
        .filter((item) => item.mode_id === mods_Id?.discovering_mode_id)
        .map((item) => ({
          ...item,
          description: getHeadingFromPrompt(item.prompt_template),
        }))
    : [];

  // filterData for Manufacturing Models based on mode-id
  let filteredManufatcuringData = Array.isArray(manufacturingModels)
    ? manufacturingModels.filter(
        (item) => item?.interaction_mode?.mode_id === mods_Id?.closing_mode_id
      )
    : [];

  let filteredManufatcuringProsepectingData = Array.isArray(
    manufacturingModels
  )
    ? manufacturingModels.filter(
        (item) =>
          item?.interaction_mode?.mode_id === mods_Id?.prospecting_mode_id
      )
    : [];

  let filteredManufatcuringSalesData = Array.isArray(manufacturingModels)
    ? manufacturingModels.filter(
        (item) =>
          item?.interaction_mode?.mode_id === mods_Id?.discovering_mode_id
      )
    : [];

  // filterData for Mode Plant size Bases on mode_id
  let filterPlantsizeModeData = Array.isArray(plantModeSize)
    ? plantModeSize.filter((item) => item?.mode_id === mods_Id?.closing_mode_id)
    : [];

  let filterProspectingPlantsizeModeData = Array.isArray(plantModeSize)
    ? plantModeSize.filter(
        (item) => item?.mode_id === mods_Id?.prospecting_mode_id
      )
    : [];

  let filterSalesPlantsizeModeData = Array.isArray(plantModeSize)
    ? plantModeSize.filter(
        (item) => item?.mode_id === mods_Id?.discovering_mode_id
      )
    : [];

  // filterData for Industry Details Bases on Industry_id

  let filterIndustry = Array.isArray(industrySize)
    ? industrySize.filter(
        (item) => item?.industry_id === "1ce9f0c2-fdb3-4215-91f3-31cba9a64b90"
      )
    : [];

  let filterProsepectingIndustry = Array.isArray(industrySize)
    ? industrySize.filter(
        (item) => item?.industry_id === "1ce9f0c2-fdb3-4215-91f3-31cba9a64b90"
      )
    : [];

  let filterSalesIndustry = Array.isArray(industrySize)
    ? industrySize.filter(
        (item) => item?.industry_id === "1ce9f0c2-fdb3-4215-91f3-31cba9a64b90"
      )
    : [];

  // Add useEffect to log state changes
  useEffect(() => {
    console.log("Industry size data updated:", industrySize);
  }, [industrySize]);

  useEffect(() => {
    console.log("Plant size data updated:", plantModeSize);
  }, [plantModeSize]);

  useEffect(() => {
    console.log("Manufacturing models updated:", manufacturingModels);
  }, [manufacturingModels]);

  useEffect(() => {
    console.log("AI roles data updated:", modeAiData);
  }, [modeAiData]);

  useEffect(() => {
    console.log("Base prompt data updated:", closingData);
  }, [closingData]);

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

  const addModsPrompt = async (name) => {
    try {
      let data = await axioInstance.post(endpoints?.mods?.interaction_modes, {
        name: name,
        description: addData?.description,
        prompt_template: addData?.prompt_template,
      });
      if (data?.data?.mode_id) {
        showToast.success("Prompt saved successfully!");
        console.log(data?.data?.mode_id, "<_data_data_mode_id_>");
        getClosingData(data?.data?.mode_id);
        setAddData({});
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
      branding={{
        logo: (
          <img
            src="/logow.png"
            alt="Your Company Logo"
            style={{ height: 40, marginRight: 8 }}
          />
        ),
        title: "",
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
            {/* Display content based on current segment */}
            {currentSegment === "prospecting" && (
              <Grid item xs={12} sx={{ width: "90%", pt: "40px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <Typography component="span">Base Prompt</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {console.log(
                        "Base Prompt Data being mapped:",
                        filteredProspectingData
                      )}
                      {filteredProspectingData?.length ? (
                        filteredProspectingData?.map((item) => {
                          console.log("Individual Base Prompt item:", item);
                          return (
                            <Accordion
                              key={item.mode_id}
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandMoreIcon sx={{ color: "#fff" }} />
                                }
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.description || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <TextDisplay text={item?.prompt_template} />
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) =>
                                    handleEditClick(item, "prospecting-base")
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={(e) => {
                                    console.log(
                                      "Deleting prospecting item:",
                                      item
                                    );
                                    handleDeleteClick(item, "prospecting-base");
                                  }}
                                >
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          );
                        })
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "end",
                          }}
                        >
                          <TextField
                            fullWidth
                            margin="normal"
                            label={"Description"}
                            multiline
                            rows={4}
                            value={addData?.description
                              ?.replace(/\\n\\n/g, "\n\n")
                              .replace(/\\n/g, "\n")}
                            onChange={(e) =>
                              setAddData({
                                ...addData,
                                description: e.target.value,
                              })
                            }
                          />
                          <TextField
                            fullWidth
                            margin="normal"
                            label={"Prompt Template"}
                            multiline
                            rows={8}
                            value={addData?.prompt_template
                              ?.replace(/\\n\\n/g, "\n\n")
                              .replace(/\\n/g, "\n")}
                            onChange={(e) =>
                              setAddData({
                                ...addData,
                                prompt_template: e.target.value,
                              })
                            }
                          />
                          <Button
                            variant="contained"
                            onClick={() => addModsPrompt("prospecting")}
                            // disabled={editingData.loading}
                          >
                            Save
                          </Button>
                        </div>
                      )}
                    </AccordionDetails>
                  </Accordion>

                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel2-content"
                      id="panel2-header"
                    >
                      <Typography component="span">
                        Interaction Roles Ai Mode
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredProspectingModeData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandMoreIcon sx={{ color: "#fff" }} />
                                }
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.description || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <TextDisplay text={item?.prompt_template} />
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) =>
                                    handleEditClick(item, "prospecting-roles")
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={(e) =>
                                    handleDeleteClick(item, "prospecting-roles")
                                  }
                                >
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Manufacturing Models
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredManufatcuringProsepectingData?.map((item) => (
                        <Accordion
                          key={item.interaction_mode_manufacturing_model_id}
                          sx={{ mt: "20px", border: "1px solid #fff" }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${item.interaction_mode_manufacturing_model_id}-content`}
                            id={`panel-${item.interaction_mode_manufacturing_model_id}-header`}
                          >
                            <Typography component="span">
                              {getHeadingFromPrompt(item.prompt_template)}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TextDisplay text={item?.prompt_template} />
                          </AccordionDetails>
                          <AccordionActions>
                            <Button
                              variant="outlined"
                              onClick={(e) =>
                                handleEditClick(
                                  item,
                                  "prospecting-manufacturing"
                                )
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={(e) =>
                                handleDeleteClick(
                                  item,
                                  "prospecting-manufacturing"
                                )
                              }
                            >
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Plant Size
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filterProspectingPlantsizeModeData?.map((item) => (
                        <Accordion
                          key={item.interaction_mode_plant_size_impact_id}
                          sx={{ mt: "20px", border: "1px solid #fff" }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${item.interaction_mode_plant_size_impact_id}-content`}
                            id={`panel-${item.interaction_mode_plant_size_impact_id}-header`}
                          >
                            <Typography component="span">
                              {getHeadingFromPrompt(item.prompt_template)}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TextDisplay text={item?.prompt_template} />
                          </AccordionDetails>
                          <AccordionActions>
                            <Button
                              variant="outlined"
                              onClick={(e) =>
                                handleEditClick(item, "prospecting-plant")
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={(e) =>
                                handleDeleteClick(item, "prospecting-plant")
                              }
                            >
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">Industry Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filterProsepectingIndustry?.map((item) => (
                        <Accordion
                          key={item.industry_id}
                          sx={{ mt: "20px", border: "1px solid #fff" }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${item.industry_id}-content`}
                            id={`panel-${item.industry_id}-header`}
                          >
                            <Typography component="span">
                              {item?.name || "No Description"}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TextDisplay text={item?.details} />
                          </AccordionDetails>
                          <AccordionActions>
                            <Button
                              variant="outlined"
                              onClick={(e) =>
                                handleEditClick(item, "prospecting-industry")
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={(e) =>
                                handleDeleteClick(item, "prospecting-industry")
                              }
                            >
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </div>
              </Grid>
            )}

            {currentSegment === "sales" && (
              <Grid item xs={12} sx={{ width: "90%", pt: "40px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <Typography component="span">Base Prompt</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredSalesData?.length ? (
                        filteredSalesData?.map((item) => {
                          return (
                            <>
                              <Accordion
                                sx={{ mt: "20px", border: "1px solid #fff" }}
                              >
                                <AccordionSummary
                                  expandIcon={
                                    <ExpandMoreIcon sx={{ color: "#fff" }} />
                                  }
                                  aria-controls="panel2-content"
                                  id="panel2-header"
                                >
                                  <Typography component="span">
                                    {item?.description || "No Description"}
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <TextDisplay text={item?.prompt_template} />
                                </AccordionDetails>
                                <AccordionActions>
                                  <Button
                                    variant="outlined"
                                    onClick={(e) =>
                                      handleEditClick(item, "sales-base")
                                    }
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={(e) => {
                                      console.log("Deleting sales item:", item);
                                      handleDeleteClick(item, "sales-base");
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </AccordionActions>
                              </Accordion>
                            </>
                          );
                        })
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "end",
                          }}
                        >
                          <TextField
                            fullWidth
                            margin="normal"
                            label={"Description"}
                            multiline
                            rows={4}
                            value={addData?.description
                              ?.replace(/\\n\\n/g, "\n\n")
                              .replace(/\\n/g, "\n")}
                            onChange={(e) =>
                              setAddData({
                                ...addData,
                                description: e.target.value,
                              })
                            }
                          />
                          <TextField
                            fullWidth
                            margin="normal"
                            label={"Prompt Template"}
                            multiline
                            rows={8}
                            value={addData?.prompt_template
                              ?.replace(/\\n\\n/g, "\n\n")
                              .replace(/\\n/g, "\n")}
                            onChange={(e) =>
                              setAddData({
                                ...addData,
                                prompt_template: e.target.value,
                              })
                            }
                          />
                          <Button
                            variant="contained"
                            onClick={() => addModsPrompt("discovering")}
                            // disabled={editingData.loading}
                          >
                            Save
                          </Button>
                        </div>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel2-content"
                      id="panel2-header"
                    >
                      <Typography component="span">
                        Interaction Roles Ai Mode
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredSalesModeData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandMoreIcon sx={{ color: "#fff" }} />
                                }
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.description || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <TextDisplay text={item?.prompt_template} />
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) =>
                                    handleEditClick(item, "sales-roles")
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={(e) =>
                                    handleDeleteClick(item, "sales-roles")
                                  }
                                >
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Manufacturing Models
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredManufatcuringSalesData?.map((item) => (
                        <Accordion
                          key={item.interaction_mode_manufacturing_model_id}
                          sx={{ mt: "20px", border: "1px solid #fff" }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${item.interaction_mode_manufacturing_model_id}-content`}
                            id={`panel-${item.interaction_mode_manufacturing_model_id}-header`}
                          >
                            <Typography component="span">
                              {getHeadingFromPrompt(item.prompt_template)}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TextDisplay text={item?.prompt_template} />
                          </AccordionDetails>
                          <AccordionActions>
                            <Button
                              variant="outlined"
                              onClick={(e) =>
                                handleEditClick(item, "sales-manufacturing")
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={(e) =>
                                handleDeleteClick(item, "sales-manufacturing")
                              }
                            >
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Plant Size
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filterSalesPlantsizeModeData?.map((item) => (
                        <Accordion
                          key={item.interaction_mode_plant_size_impact_id}
                          sx={{ mt: "20px", border: "1px solid #fff" }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${item.interaction_mode_plant_size_impact_id}-content`}
                            id={`panel-${item.interaction_mode_plant_size_impact_id}-header`}
                          >
                            <Typography component="span">
                              {getHeadingFromPrompt(item.prompt_template)}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TextDisplay text={item?.prompt_template} />
                          </AccordionDetails>
                          <AccordionActions>
                            <Button
                              variant="outlined"
                              onClick={(e) =>
                                handleEditClick(item, "sales-plant")
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={(e) =>
                                handleDeleteClick(item, "sales-plant")
                              }
                            >
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">Industry Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filterSalesIndustry?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandMoreIcon sx={{ color: "#fff" }} />
                                }
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.name || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <TextDisplay text={item?.details} />
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) =>
                                    handleEditClick(item, "sales-industry")
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={(e) =>
                                    handleDeleteClick(item, "sales-industry")
                                  }
                                >
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                </div>
              </Grid>
            )}

            {currentSegment === "closing" && (
              <Grid item xs={12} sx={{ width: "90%", pt: "40px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <Typography component="span">Base Prompt</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredClosinData?.length ? (
                        filteredClosinData?.map((item) => {
                          return (
                            <>
                              <Accordion
                                sx={{ mt: "20px", border: "1px solid #fff" }}
                              >
                                <AccordionSummary
                                  expandIcon={
                                    <ExpandMoreIcon sx={{ color: "#fff" }} />
                                  }
                                  aria-controls="panel2-content"
                                  id="panel2-header"
                                >
                                  <Typography component="span">
                                    {item?.description || "No Description"}
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <TextDisplay text={item?.prompt_template} />
                                </AccordionDetails>
                                <AccordionActions>
                                  <Button
                                    variant="outlined"
                                    onClick={(e) =>
                                      handleEditClick(item, "closing-base")
                                    }
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={(e) => {
                                      console.log(
                                        "Deleting closing item:",
                                        item
                                      );
                                      handleDeleteClick(item, "closing-base");
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </AccordionActions>
                              </Accordion>
                            </>
                          );
                        })
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "end",
                          }}
                        >
                          <TextField
                            fullWidth
                            margin="normal"
                            label={"Description"}
                            multiline
                            rows={4}
                            value={addData?.description
                              ?.replace(/\\n\\n/g, "\n\n")
                              .replace(/\\n/g, "\n")}
                            onChange={(e) =>
                              setAddData({
                                ...addData,
                                description: e.target.value,
                              })
                            }
                          />
                          <TextField
                            fullWidth
                            margin="normal"
                            label={"Prompt Template"}
                            multiline
                            rows={8}
                            value={addData?.prompt_template
                              ?.replace(/\\n\\n/g, "\n\n")
                              .replace(/\\n/g, "\n")}
                            onChange={(e) =>
                              setAddData({
                                ...addData,
                                prompt_template: e.target.value,
                              })
                            }
                          />
                          <Button
                            variant="contained"
                            onClick={() => addModsPrompt("closing")}
                            // disabled={editingData.loading}
                          >
                            Save
                          </Button>
                        </div>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel2-content"
                      id="panel2-header"
                    >
                      <Typography component="span">
                        Interaction Roles Ai Mode
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandMoreIcon sx={{ color: "#fff" }} />
                                }
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.description || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <TextDisplay text={item?.prompt_template} />
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) =>
                                    handleEditClick(item, "closing-roles")
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={(e) =>
                                    handleDeleteClick(item, "closing-roles")
                                  }
                                >
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Manufacturing Models
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredManufatcuringData?.map((item) => (
                        <Accordion
                          key={item.interaction_mode_manufacturing_model_id}
                          sx={{ mt: "20px", border: "1px solid #fff" }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${item.interaction_mode_manufacturing_model_id}-content`}
                            id={`panel-${item.interaction_mode_manufacturing_model_id}-header`}
                          >
                            <Typography component="span">
                              {getHeadingFromPrompt(item.prompt_template)}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TextDisplay text={item?.prompt_template} />
                          </AccordionDetails>
                          <AccordionActions>
                            <Button
                              variant="outlined"
                              onClick={(e) =>
                                handleEditClick(item, "closing-manufacturing")
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={(e) =>
                                handleDeleteClick(item, "closing-manufacturing")
                              }
                            >
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Plant Size
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filterPlantsizeModeData?.map((item) => (
                        <Accordion
                          key={item.interaction_mode_plant_size_impact_id}
                          sx={{ mt: "20px", border: "1px solid #fff" }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${item.interaction_mode_plant_size_impact_id}-content`}
                            id={`panel-${item.interaction_mode_plant_size_impact_id}-header`}
                          >
                            <Typography component="span">
                              {getHeadingFromPrompt(item.prompt_template)}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TextDisplay text={item?.prompt_template} />
                          </AccordionDetails>
                          <AccordionActions>
                            <Button
                              variant="outlined"
                              onClick={(e) =>
                                handleEditClick(item, "closing-plant")
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={(e) =>
                                handleDeleteClick(item, "closing-plant")
                              }
                            >
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    sx={{
                      width: "100%",
                      border: "1px solid #fff",
                      borderRadius: "8px",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">Industry Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filterIndustry?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandMoreIcon sx={{ color: "#fff" }} />
                                }
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.name || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <TextDisplay text={item?.details} />
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) =>
                                    handleEditClick(item, "closing-industry")
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={(e) =>
                                    handleDeleteClick(item, "closing-industry")
                                  }
                                >
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                </div>
              </Grid>
            )}
          </Grid>
        </PageContainer>
      </DashboardLayout>

      {/* Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="edit-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            border: "1px solid #fff",
            borderRadius: "8px",
          }}
        >
          <Typography id="edit-modal-title" variant="h6" component="h2" mb={2}>
            {editingData.type?.includes("industry")
              ? "Edit Details"
              : "Edit Prompt Template"}
          </Typography>

          {editingData.loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                margin="normal"
                label={
                  editingData.type?.includes("industry")
                    ? "Details"
                    : "Prompt Template"
                }
                multiline
                rows={12}
                value={editingData.prompt_template
                  ?.replace(/\\n\\n/g, "\n\n")
                  .replace(/\\n/g, "\n")}
                onChange={(e) =>
                  setEditingData({
                    ...editingData,
                    prompt_template: e.target.value,
                  })
                }
              />
            </>
          )}

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setEditModalOpen(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveEdit}
              disabled={editingData.loading}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteItemId(null);
          setDeleteType("");
        }}
        aria-labelledby="delete-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            border: "1px solid #fff",
            borderRadius: "8px",
          }}
        >
          <Typography
            id="delete-modal-title"
            variant="h6"
            component="h2"
            mb={2}
          >
            Confirm Delete
          </Typography>
          <Typography mb={3}>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteItemId(null);
                setDeleteType("");
              }}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Logout Confirmation Modal */}
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
              onClick={() => setLogoutModalOpen(false)}
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
