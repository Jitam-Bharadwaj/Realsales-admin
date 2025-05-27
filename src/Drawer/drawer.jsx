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
import { Button, Modal, Typography, TextField, Box } from "@mui/material";
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
  const [closingData, setGetClosing] = React.useState({});
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingData, setEditingData] = React.useState({
    description: "",
    prompt_template: "",
  });
  const [modeAiData, setModeAiData] = React.useState([]);

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
      const res = await axioInstance.get(
        `${endpoints.closing.getClosing}/closing`
      );
      // console.log(res?.data, "closingData");
      setGetClosing(res?.data);
    } catch (err) {
      console.log(err);
    }
  };

  // console.log(closingData, "closingdata");

  const handleEditClick = () => {
    setEditingData({
      description: closingData?.description || "",
      prompt_template: closingData?.prompt_template || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Replace with your actual update endpoint
      const res = await axioInstance.put(
        `${endpoints.closing.editClosingData}/${closingData?.mode_id}`,
        {
          description: editingData.description,
          prompt_template: editingData.prompt_template,
        }
      );

      // Refresh the data after successful update
      await getClosingData();
      setEditModalOpen(false);
    } catch (err) {
      console.error("Error updating closing data:", err);
      // You might want to add error handling here
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

  useEffect(() => {
    getClosingData();
    getModeAiRelesData();
  }, []);

  // console.log(modeAiData, "modeAiData");

 const filteredData = Array.isArray(modeAiData)
  ? modeAiData.filter((item) => item.mode_id === "1dc1cebb-e716-4c2d-bda6-c177c9686546")
  : [];
   

  console.log(filteredData,'filtereddata')

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
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
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
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel2-content"
                          id="panel2-header"
                          sx={{ mt: "20px", border: "1px solid #fff" }}
                        >
                          <Typography component="span">
                            Interaction Roles Ai Mode
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Suspendisse malesuada lacus ex, sit amet blandit
                          leo lobortis eget.
                        </AccordionDetails>
                      </Accordion>
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel2-content"
                          id="panel2-header"
                          sx={{ mt: "20px", border: "1px solid #fff" }}
                        >
                          <Typography component="span">
                            Interaction Roles Ai Mode
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Suspendisse malesuada lacus ex, sit amet blandit
                          leo lobortis eget.
                        </AccordionDetails>
                      </Accordion>
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
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
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
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
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
                      <Typography component="span">Industry Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
                    </AccordionDetails>
                    <AccordionActions>
                      <Button>Cancel</Button>
                      <Button>Agree</Button>
                    </AccordionActions>
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
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
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
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
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
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
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
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
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
                      <Typography component="span">Industry Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
                    </AccordionDetails>
                    <AccordionActions>
                      <Button>Cancel</Button>
                      <Button>Agree</Button>
                    </AccordionActions>
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
                      <Accordion sx={{ mt: "20px", border: "1px solid #fff" }}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel2-content"
                          id="panel2-header"
                        >
                          <Typography component="span">
                            {closingData?.description || "No Description"}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {closingData?.prompt_template}
                        </AccordionDetails>
                        <AccordionActions>
                          <Button variant="outlined" onClick={handleEditClick}>
                            Edit
                          </Button>
                          <Button variant="outlined" color="error">
                            Delete
                          </Button>
                        </AccordionActions>
                      </Accordion>
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
                                  onClick={handleEditClick}
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
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
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
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
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
                      <Typography component="span">Industry Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Suspendisse malesuada lacus ex, sit amet blandit leo
                      lobortis eget.
                    </AccordionDetails>
                    <AccordionActions>
                      <Button>Cancel</Button>
                      <Button>Agree</Button>
                    </AccordionActions>
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
          <Typography id="edit-modal-title" variant="h6" component="h2">
            Edit Closing Data
          </Typography>

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
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setEditModalOpen(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveEdit}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </AppProvider>
  );
}
