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
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
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
import '../Drawer/custome.css'
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";

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
    title: "Reports",
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
          default: '#fff', // White background for light mode
          paper: '#fff', // White paper background for light mode
        },
        text: {
          primary: '#000', // Black text for light mode
          secondary: '#000', // Black secondary text for light mode
        },
        primary: {
          main: '#000', // Primary color for light mode (e.g., for buttons)
          contrastText: '#fff', // Contrast text for primary color
        },
      },
      components: {
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: '#fff', // White drawer background for light mode
              color: '#000', // Black text for light mode drawer
            },
          },
        },
        MuiListItemIcon: {
          styleOverrides: {
            root: {
              color: '#000', // Black icons for light mode
            },
          },
        },
        MuiListItemText: {
          styleOverrides: {
            primary: {
              color: '#000', // Black list item text for light mode
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: '#fff', // White top bar background for light mode
              color: '#000', // Black text/icons for light mode top bar
            },
          },
        },
      },
    },
    dark: {
      palette: {
        background: {
          default: '#000', // Black background for dark mode
          paper: '#000', // Black paper background for dark mode
        },
        text: {
          primary: '#fff', // White text for dark mode
          secondary: '#fff', // White secondary text for dark mode
        },
        primary: {
          main: '#fff', // Primary color for dark mode
          contrastText: '#000', // Contrast text for primary color
        },
      },
      components: {
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: '#000', // Black drawer background for dark mode
              color: '#fff', // White text for dark mode drawer
            },
          },
        },
        MuiListItemIcon: {
          styleOverrides: {
            root: {
              color: '#fff', // White icons for dark mode
            },
          },
        },
        MuiListItemText: {
          styleOverrides: {
            primary: {
              color: '#fff', // White list item text for dark mode
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: '#000', // Black top bar background for dark mode
              color: '#fff', // White text/icons for dark mode top bar
            },
          },
        },
        // Keep the DashboardSidebarPageItem style overrides for selected state here as they should apply to both modes
        DashboardSidebarPageItem: {
          styleOverrides: {
            root: { /* Default state styles if needed */ },
            selected: {
              backgroundColor: '#fbdc5c', // Yellow background for selected item
              '&:hover': {
                backgroundColor: '#e6c753', // Slightly darker yellow on hover for selected
              },
              '& .MuiListItemIcon-root': {
                color: '#000000', // Black color for the icon when selected
                fill: '#000000', // Also set fill for SVG icons
              },
              '& .MuiListItemText-primary': {
                color: '#000000', // Black color for the text when selected
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
    mode_id: null,
    type: null,
    loading: false
  });
  const [modeAiData, setModeAiData] = React.useState([]);
  const [manufacturingModels, setmanufacturingModels] = React.useState([]);
  const [plantModeSize, setPlantModeSize] = React.useState([]);
  const [industrySize, setIndustrySize] = React.useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteItemId, setDeleteItemId] = React.useState(null);
  const [deleteType, setDeleteType] = React.useState('');
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    console.log("Logout function called");
    // Clear all auth related data
    localStorage.removeItem("x-access-token");
    localStorage.removeItem("user"); // If you store user data
    console.log("Local storage cleared");
    
    // Close the modal and redirect to login page
    setLogoutModalOpen(false);
    console.log("Redirecting to login page");
    navigate("/");
  };

  const handleNavigation = (segment) => {
    if (segment === "logout") {
      localStorage.removeItem("x-access-token");
      navigate("/");
    } else {
      navigate(`/${segment}`);
    }
  };

  // Remove this const when copying and pasting into your project.
  const demoWindow = window ? window() : undefined;

  // Extract the current segment from the path
  const currentSegment = router.pathname.split("/").pop();

  // getClosing function to fetch data based on segment

  const getClosingData = async () => {
    try {
      const res = await axioInstance.get(`${endpoints.closing.getClosing}`);
      console.log("Base Prompt Data:", res?.data);
      setGetClosing(res?.data);
    } catch (err) {
      console.log(err);
    }
  };

  // console.log(closingData, "closingdata");

  // Add function to fetch specific item data
  const fetchItemData = async (itemId, type) => {
    try {
      setEditingData(prev => ({ ...prev, loading: true }));
      const baseUrl = endpoints.closing;
      let url;

      if (type?.includes('plant')) {
        url = `${baseUrl.plantModeSize}/${itemId}`;
      } else if (type?.includes('manufacturing')) {
        url = `${baseUrl.manufacturingModels}/${itemId}`;
      } else if (type?.includes('roles')) {
        url = `${baseUrl.modeAiRoles}/${itemId}`;
      } else if (type?.includes('industry')) {
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
        loading: false
      });
    } catch (err) {
      console.error("Error fetching item data:", err);
      setEditingData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEditClick = (item, type) => {
    setEditModalOpen(true);
    // Set the appropriate ID based on the type
    let itemId;
    if (type?.includes('plant')) {
      itemId = item.interaction_mode_plant_size_impact_id;
    } else if (type?.includes('manufacturing')) {
      itemId = item.interaction_mode_manufacturing_model_id;
    } else if (type?.includes('roles')) {
      itemId = item.interaction_mode_ai_role_id;
    } else if (type?.includes('industry')) {
      itemId = item.industry_id;
    } else {
      itemId = item.mode_id;
    }

    // Set initial data from the item
    setEditingData({
      description: item?.description || item?.name || "",
      prompt_template: item?.prompt_template || item?.details || "",
      mode_id: itemId,
      type: type,
      loading: true
    });
    
    // Fetch fresh data
    if (itemId) {
      fetchItemData(itemId, type);
    }
  };

  const handleDeleteClick = (item, type) => {
    console.log("Delete clicked with type:", type);
    console.log("Item being deleted:", item);
    
    // Set the appropriate ID based on the type
    let itemId;
    if (type.includes('plant')) {
      itemId = item.interaction_mode_plant_size_impact_id;
    } else if (type.includes('manufacturing')) {
      itemId = item.interaction_mode_manufacturing_model_id;
    } else if (type.includes('roles')) {
      itemId = item.interaction_mode_ai_role_id;
    } else if (type.includes('industry')) {
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
      
      switch(deleteType) {
        // Base Prompt (interaction-modes)
        case 'prospecting-base':
        case 'sales-base':
        case 'closing-base':
          await axioInstance.delete(`${baseUrl.getClosing}/${deleteItemId}`);
          await getClosingData();
          break;

        // Interaction Roles
        case 'prospecting-roles':
        case 'sales-roles':
        case 'closing-roles':
          await axioInstance.delete(`${baseUrl.modeAiRoles}/${deleteItemId}`);
          await getModeAiRelesData();
          break;

        // Manufacturing Models
        case 'prospecting-manufacturing':
        case 'sales-manufacturing':
        case 'closing-manufacturing':
          await axioInstance.delete(`${baseUrl.manufacturingModels}/${deleteItemId}`);
          await getManufacturingModels();
          break;

        // Plant Size
        case 'prospecting-plant':
        case 'sales-plant':
        case 'closing-plant':
          await axioInstance.delete(`${baseUrl.plantModeSize}/${deleteItemId}`);
          await getPlantModeSize();
          break;

        // Industry
        case 'prospecting-industry':
        case 'sales-industry':
        case 'closing-industry':
          await axioInstance.delete(`${baseUrl.industrysize}${deleteItemId}`); // Note: no slash here as it's in the base URL
          await getIndustryDetails();
          break;

        default:
          console.error('Unknown delete type:', deleteType);
          return;
      }
      
      setDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteType('');
    } catch (err) {
      console.error("Error deleting data:", err);
      console.log("Delete error details:", {
        type: deleteType,
        id: deleteItemId,
        error: err,
        url: err.config?.url
      });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const baseUrl = endpoints.closing;
      const itemId = editingData.mode_id;
      const type = editingData.type;
      let url;
      let payload;

      if (type?.includes('plant')) {
        url = `${baseUrl.plantModeSize}/${itemId}`;
        payload = {
          prompt_template: editingData.prompt_template,
          interaction_mode_plant_size_impact_id: itemId
        };
      } else if (type?.includes('manufacturing')) {
        url = `${baseUrl.manufacturingModels}/${itemId}`;
        payload = {
          prompt_template: editingData.prompt_template,
          interaction_mode_manufacturing_model_id: itemId
        };
      } else if (type?.includes('roles')) {
        url = `${baseUrl.modeAiRoles}/${itemId}`;
        payload = {
          prompt_template: editingData.prompt_template,
          interaction_mode_ai_role_id: itemId
        };
      } else if (type?.includes('industry')) {
        url = `${baseUrl.industrysize}${itemId}`; // Note: no slash here as it's in the base URL
        payload = {
          details: editingData.prompt_template,
          industry_id: itemId
        };
      } else {
        url = `${baseUrl.getClosing}/${itemId}`;
        payload = {
          prompt_template: editingData.prompt_template,
          mode_id: itemId
        };
      }

      console.log('Making PUT request to:', url);
      console.log('With payload:', payload);

      const response = await axioInstance.put(url, payload);
      console.log('Edit response:', response);

      // Refresh all data after successful update
      await Promise.all([
        getClosingData(),
        getModeAiRelesData(),
        getManufacturingModels(),
        getPlantModeSize(),
        getIndustryDetails()
      ]);
      
      setEditModalOpen(false);
    } catch (err) {
      console.error("Error updating data:", err);
      console.log("Edit error details:", {
        type: editingData.type,
        id: editingData.mode_id,
        error: err,
        url: err.config?.url
      });
    }
  };

  // get Handle Mode Ai roles Data function

  const getModeAiRelesData = async () => {
    try {
      const res = await axioInstance.get(endpoints.closing.modeAiRoles);
      setModeAiData(res?.data);
    } catch (err) {
      console.log(err);
    }
  };

  // get Handle Mode Ai roles Data function

  const getManufacturingModels = async () => {
    try {
      const res = await axioInstance.get(
        `${endpoints.closing.manufacturingModels}`
      );
      setmanufacturingModels(res?.data);
    } catch (err) {
      console.log(err);
    }
  };

  // get Handle Plant Mode Size Data function
  const getPlantModeSize = async () => {
    try {
      const res = await axioInstance.get(`${endpoints.closing.plantModeSize}`);
      setPlantModeSize(res?.data);
    } catch (err) {
      console.log(err);
    }
  };

  // get Handle Industry Details Data function

  const getIndustryDetails = async () => {
    try {
      const res = await axioInstance.get(`${endpoints.closing.industrysize}`);
      setIndustrySize(res?.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getClosingData();
    getModeAiRelesData();
    getManufacturingModels();
    getPlantModeSize();
    getIndustryDetails();
  }, []);

  const getHeadingFromPrompt = (promptTemplate) => {
    if (!promptTemplate) return "No Description";
    const parts = promptTemplate.split(':');
    return parts[0].trim();
  };

  // Modify your filter functions to include the heading extraction
  const filteredClosinData = Array.isArray(closingData)
    ? closingData.filter(
        (item) => item.mode_id === "1dc1cebb-e716-4c2d-bda6-c177c9686546"
      ).map(item => ({
        ...item,
        description: getHeadingFromPrompt(item.prompt_template)
      }))
    : [];

  const filteredProspectingData = Array.isArray(closingData)
    ? closingData.filter(
        (item) => item.mode_id === "4a72f2c9-cb00-4e7a-83a1-22fd2ec6c6bf"
      ).map(item => ({
        ...item,
        description: getHeadingFromPrompt(item.prompt_template)
      }))
    : [];

  const filteredSalesData = Array.isArray(closingData)
    ? closingData.filter(
        (item) => item.mode_id === "2dab8507-0523-45ea-a537-4daa105db6a7"
      ).map(item => ({
        ...item,
        description: getHeadingFromPrompt(item.prompt_template)
      }))
    : [];

  // Do the same for other filtered data sets
  const filteredData = Array.isArray(modeAiData)
    ? modeAiData.filter(
        (item) => item.mode_id === "1dc1cebb-e716-4c2d-bda6-c177c9686546"
      ).map(item => ({
        ...item,
        description: getHeadingFromPrompt(item.prompt_template)
      }))
    : [];

  const filteredProspectingModeData = Array.isArray(modeAiData)
    ? modeAiData.filter(
        (item) => item.mode_id === "4a72f2c9-cb00-4e7a-83a1-22fd2ec6c6bf"
      ).map(item => ({
        ...item,
        description: getHeadingFromPrompt(item.prompt_template)
      }))
    : [];

  const filteredSalesModeData = Array.isArray(modeAiData)
    ? modeAiData.filter(
        (item) => item.mode_id === "2dab8507-0523-45ea-a537-4daa105db6a7"
      ).map(item => ({
        ...item,
        description: getHeadingFromPrompt(item.prompt_template)
      }))
    : [];

  // filterData for Manufacturing Models based on mode-id
  const filteredManufatcuringData = Array.isArray(manufacturingModels)
    ? manufacturingModels.filter(
        (item) =>
          item?.interaction_mode?.mode_id ===
          "1dc1cebb-e716-4c2d-bda6-c177c9686546"
      )
    : [];

    const filteredManufatcuringProsepectingData = Array.isArray(manufacturingModels)
    ? manufacturingModels.filter(
        (item) =>
          item?.interaction_mode?.mode_id ===
          "4a72f2c9-cb00-4e7a-83a1-22fd2ec6c6bf"
      )
    : [];
    
     const filteredManufatcuringSalesData = Array.isArray(manufacturingModels)
    ? manufacturingModels.filter(
        (item) =>
          item?.interaction_mode?.mode_id ===
          "2dab8507-0523-45ea-a537-4daa105db6a7"
      )
    : [];


  // filterData for Mode Plant size Bases on mode_id
  const filterPlantsizeModeData = Array.isArray(plantModeSize)
    ? plantModeSize.filter(
        (item) => item?.mode_id === "1dc1cebb-e716-4c2d-bda6-c177c9686546"
      )
    : [];

    const filterProspectingPlantsizeModeData = Array.isArray(plantModeSize)
    ? plantModeSize.filter(
        (item) => item?.mode_id === "4a72f2c9-cb00-4e7a-83a1-22fd2ec6c6bf"
      )
    : [];

     const filterSalesPlantsizeModeData = Array.isArray(plantModeSize)
    ? plantModeSize.filter(
        (item) => item?.mode_id === "2dab8507-0523-45ea-a537-4daa105db6a7"
      )
    : [];

  // filterData for Industry Details Bases on Industry_id

  const filterIndustry = Array.isArray(industrySize)
    ? industrySize.filter(
        (item) => item?.industry_id === "1ce9f0c2-fdb3-4215-91f3-31cba9a64b90"
      )
    : [];

     const filterProsepectingIndustry = Array.isArray(industrySize)
    ? industrySize.filter(
        (item) => item?.industry_id === "4a72f2c9-cb00-4e7a-83a1-22fd2ec6c6bf"
      )
    : [];

     const filterSalesIndustry = Array.isArray(industrySize)
    ? industrySize.filter(
        (item) => item?.industry_id === "2dab8507-0523-45ea-a537-4daa105db6a7"
      )
    : [];

  console.log(industrySize, "industrySize");

  console.log(filterIndustry, "filterClosingData");

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
      branding={{
        logo: <img src="/logow.png" alt="Your Company Logo" style={{ height: 40, marginRight: 8 }} />,
        title: '',
      }}
    >
      <DashboardLayout
        sx={{
          '& .Mui-selected': {
            backgroundColor: '#fbdc5c', // Yellow background for selected item
            '&:hover': {
              backgroundColor: '#e6c753', // Slightly darker yellow on hover for selected
            },
            '& .MuiListItemIcon-root': {
              color: '#000000', // Black color for the icon when selected
              fill: '#000000', // Also set fill for SVG icons
            },
            '& .MuiListItemText-primary': {
              color: '#000000', // Black color for the text when selected
            },
          },
        }}
      >
        <PageContainer sx={{ minHeight: '100vh' }}>
          <Grid container spacing={2} sx={{ minHeight: '100vh' }}>
            {/* Display content based on current segment */}
            {currentSegment === "prospecting" && (
              <Grid item xs={12} sx={{ width: "90%", pt: "40px" }}>
                <div>
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <Typography component="span">Base Prompt</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {console.log("Base Prompt Data being mapped:", filteredProspectingData)}
                      {filteredProspectingData?.map((item) => {
                        console.log("Individual Base Prompt item:", item);
                        return (
                          <Accordion
                            key={item.mode_id}
                            sx={{ mt: "20px", border: "1px solid #fff" }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                              aria-controls="panel2-content"
                              id="panel2-header"
                            >
                              <Typography component="span">
                                {item?.description || "No Description"}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              {item?.prompt_template}
                            </AccordionDetails>
                            <AccordionActions>
                              <Button
                                variant="outlined"
                                onClick={(e) => handleEditClick(item, 'prospecting')}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outlined" 
                                color="error"
                                onClick={(e) => {
                                  console.log("Deleting prospecting item:", item);
                                  handleDeleteClick(item, 'prospecting-base')
                                }}
                              >
                                Delete
                              </Button>
                            </AccordionActions>
                          </Accordion>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
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
                                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.description || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                {item?.prompt_template}
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) => handleEditClick(item, 'prospecting')}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  color="error"
                                  onClick={(e) => handleDeleteClick(item, 'prospecting-roles')}
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
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
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
                            {item?.prompt_template}
                          </AccordionDetails>
                          <AccordionActions>
                            <Button variant="outlined" onClick={(e) => handleEditClick(item, 'prospecting')}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={(e) => handleDeleteClick(item, 'prospecting-manufacturing')}>
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
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
                            {item?.prompt_template}
                          </AccordionDetails>
                          <AccordionActions>
                            <Button variant="outlined" onClick={(e) => handleEditClick(item, 'prospecting')}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={(e) => handleDeleteClick(item, 'prospecting-plant')}>
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">Industry Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filterProsepectingIndustry?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.description || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                {item?.details}
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) => handleEditClick(item, 'prospecting')}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  color="error"
                                  onClick={(e) => handleDeleteClick(item, 'prospecting-industry')}
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

            {currentSegment === "sales" && (
              <Grid item xs={12} sx={{ width: "90%", pt: "40px" }}>
                <div>
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <Typography component="span">Base Prompt</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredSalesData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.description || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                {item?.prompt_template}
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) => handleEditClick(item, 'sales')}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  color="error"
                                  onClick={(e) => {
                                    console.log("Deleting sales item:", item);
                                    handleDeleteClick(item, 'sales-base')
                                  }}
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
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
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
                                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.description || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                {item?.prompt_template}
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) => handleEditClick(item, 'sales')}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  color="error"
                                  onClick={(e) => handleDeleteClick(item, 'sales-roles')}
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
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
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
                            {item?.prompt_template}
                          </AccordionDetails>
                          <AccordionActions>
                            <Button variant="outlined" onClick={(e) => handleEditClick(item, 'sales')}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={(e) => handleDeleteClick(item, 'sales-manufacturing')}>
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
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
                            {item?.prompt_template}
                          </AccordionDetails>
                          <AccordionActions>
                            <Button variant="outlined" onClick={(e) => handleEditClick(item, 'sales')}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={(e) => handleDeleteClick(item, 'sales-plant')}>
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
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
                                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.description || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                {item?.details}
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) => handleEditClick(item, 'sales')}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  color="error"
                                  onClick={(e) => handleDeleteClick(item, 'sales-industry')}
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
                <div>
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <Typography component="span">Base Prompt</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredClosinData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.description || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                {item?.prompt_template}
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) => handleEditClick(item, 'closing')}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  color="error"
                                  onClick={(e) => {
                                    console.log("Deleting closing item:", item);
                                    handleDeleteClick(item, 'closing-base')
                                  }}
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
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
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
                                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.description || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                {item?.prompt_template}
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) => handleEditClick(item, 'closing')}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  color="error"
                                  onClick={(e) => handleDeleteClick(item, 'closing-roles')}
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
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
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
                            {item?.prompt_template}
                          </AccordionDetails>
                          <AccordionActions>
                            <Button variant="outlined" onClick={(e) => handleEditClick(item, 'closing')}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={(e) => handleDeleteClick(item, 'closing-manufacturing')}>
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
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
                            {item?.prompt_template}
                          </AccordionDetails>
                          <AccordionActions>
                            <Button variant="outlined" onClick={(e) => handleEditClick(item, 'closing')}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={(e) => handleDeleteClick(item, 'closing-plant')}>
                              Delete
                            </Button>
                          </AccordionActions>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion sx={{ width: '100%', border: '1px solid #fff', borderRadius: '8px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
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
                                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                                aria-controls="panel2-content"
                                id="panel2-header"
                              >
                                <Typography component="span">
                                  {item?.name || "No Description"}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                {item?.details}
                              </AccordionDetails>
                              <AccordionActions>
                                <Button
                                  variant="outlined"
                                  onClick={(e) => handleEditClick(item, 'closing')}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  color="error"
                                  onClick={(e) => handleDeleteClick(item, 'closing-industry')}
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
            Edit Prompt Template
          </Typography>

          {editingData.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TextField
              fullWidth
              margin="normal"
              label="Prompt Template"
              multiline
              rows={12}
              value={editingData.prompt_template}
              onChange={(e) =>
                setEditingData({
                  ...editingData,
                  prompt_template: e.target.value,
                })
              }
            />
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
          setDeleteType('');
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
          <Typography id="delete-modal-title" variant="h6" component="h2" mb={2}>
            Confirm Delete
          </Typography>
          <Typography mb={3}>
            Are you sure you want to delete this item? This action cannot be undone.
          </Typography>
          
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button 
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteItemId(null);
                setDeleteType('');
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
          <Typography id="logout-modal-title" variant="h6" component="h2" mb={2}>
            Confirm Logout
          </Typography>
          <Typography mb={3}>
            Are you sure you want to logout?
          </Typography>
          
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button 
              onClick={() => setLogoutModalOpen(false)} 
              sx={{ mr: 1, color: "#fff", borderColor: "#fff" }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Modal>
    </AppProvider>
  );
}
