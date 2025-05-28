import * as React from "react";
import { createTheme, styled } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import Grid from "@mui/material/Grid";
import { Button, Modal, Typography, TextField, Box, CircularProgress } from "@mui/material";
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
    title: "Logout",
    icon: <LogoutIcon />,
    segment: "logout",
  },
];

const demoTheme = createTheme({
  colorSchemes: { light: true, dark: true },
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
  const [editingData, setEditingData] = React.useState({
    description: "",
    prompt_template: "",
    mode_id: null,
    loading: false
  });
  const [modeAiData, setModeAiData] = React.useState([]);
  const [manufacturingModels, setmanufacturingModels] = React.useState([]);
  const [plantModeSize, setPlantModeSize] = React.useState([]);
  const [industrySize, setIndustrySize] = React.useState([]);

  const handleNavigation = (segment) => {
    if (segment === "logout") {
      // do logout logic here if needed
      navigate("/login");
    } else {
      // normal navigation
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
      // console.log(res?.data, "closingData");
      setGetClosing(res?.data);
    } catch (err) {
      console.log(err);
    }
  };

  // console.log(closingData, "closingdata");

  // Add function to fetch specific item data
  const fetchItemData = async (mode_id) => {
    try {
      setEditingData(prev => ({ ...prev, loading: true }));
      const res = await axioInstance.get(`${endpoints.closing.getClosingById}/${mode_id}`);
      setEditingData({
        description: res.data?.description || "",
        prompt_template: res.data?.prompt_template || "",
        mode_id: mode_id,
        loading: false
      });
    } catch (err) {
      console.error("Error fetching item data:", err);
      setEditingData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEditClick = (item) => {
    setEditModalOpen(true);
    // Set initial data from the item
    setEditingData({
      description: item?.description || "",
      prompt_template: item?.prompt_template || "",
      mode_id: item?.mode_id,
      loading: true
    });
    // Fetch fresh data
    if (item?.mode_id) {
      fetchItemData(item.mode_id);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axioInstance.put(
        `${endpoints.closing.editClosingData}/${editingData.mode_id}`,
        {
          description: editingData.description,
          prompt_template: editingData.prompt_template,
        }
      );

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

  // filterData for Mode Ai Roles Bases on mode_id
  const filteredClosinData = Array.isArray(closingData)
    ? closingData.filter(
        (item) => item.mode_id === "1dc1cebb-e716-4c2d-bda6-c177c9686546"
      )
    : [];

   
  const filteredProspectingData = Array.isArray(closingData)
    ? closingData.filter(
        (item) => item.mode_id === "4a72f2c9-cb00-4e7a-83a1-22fd2ec6c6bf"
      )
    : [];

    const filteredSalesData = Array.isArray(closingData)
    ? closingData.filter(
        (item) => item.mode_id === "2dab8507-0523-45ea-a537-4daa105db6a7"
      )
    : [];

  // filterData for Mode Ai Roles Bases on mode_id
  const filteredData = Array.isArray(modeAiData)
    ? modeAiData.filter(
        (item) => item.mode_id === "1dc1cebb-e716-4c2d-bda6-c177c9686546"
      )
    : [];

     const filteredProspectingModeData = Array.isArray(modeAiData)
    ? modeAiData.filter(
        (item) => item.mode_id === "4a72f2c9-cb00-4e7a-83a1-22fd2ec6c6bf"
      )
    : [];


     const filteredSalesModeData = Array.isArray(modeAiData)
    ? modeAiData.filter(
        (item) => item.mode_id === "2dab8507-0523-45ea-a537-4daa105db6a7"
      )
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
    >
      <DashboardLayout>
        <PageContainer>
          <Grid container spacing={2}>
            {/* Display content based on current segment */}
            {currentSegment === "prospecting" && (
              <Grid item xs={12} sx={{ width: "90%", pt: "40px" }}>
                <div>
                  <Accordion sx={{ width: "100%" }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <Typography component="span">Base Prompt</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredProspectingData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
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
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Manufacturing Models
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredManufatcuringProsepectingData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                    
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Plant Size
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                     {filterProspectingPlantsizeModeData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                    
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
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
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
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
                  <Accordion sx={{ width: "100%" }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
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
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
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
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Manufacturing Models
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredManufatcuringSalesData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                    
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Plant Size
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                       {filterSalesPlantsizeModeData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                    
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
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
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
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
                  <Accordion sx={{ width: "100%" }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
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
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
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
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Manufacturing Models
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filteredManufatcuringData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                    <AccordionActions>
                      <Button>Cancel</Button>
                      <Button>Agree</Button>
                    </AccordionActions>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel3-content"
                      id="panel3-header"
                    >
                      <Typography component="span">
                        Instruction Mode Plant Size
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filterPlantsizeModeData?.map((item) => {
                        return (
                          <>
                            <Accordion
                              sx={{ mt: "20px", border: "1px solid #fff" }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
                                  Delete
                                </Button>
                              </AccordionActions>
                            </Accordion>
                          </>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
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
                                expandIcon={<ExpandMoreIcon />}
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
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error">
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
            Edit Data
          </Typography>

          {editingData.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Description"
                value={editingData.description}
                onChange={(e) =>
                  setEditingData({
                    ...editingData,
                    description: e.target.value,
                  })
                }
              />

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
    </AppProvider>
  );
}
