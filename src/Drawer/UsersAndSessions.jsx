import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Modal,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  Chip,
  Avatar,
  Divider,
  Stack,
} from "@mui/material";
import { axioInstance } from "../api/axios/axios";
import { endpoints } from "../api/endpoints/endpoints";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const drawerWidth = 240; // Drawer width in px

// Date formatting function for mm/dd/yyyy hh:mm:ss
function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  const pad = (n) => n.toString().padStart(2, "0");
  return (
    `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

const UsersAndSessions = ({ currentSegment }) => {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSubscriptionUser, setSelectedSubscriptionUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [error, setError] = useState(null);
  const [modeNames, setModeNames] = useState({}); // { mode_id: mode_name }
  const fetchingModes = useRef({}); // To prevent duplicate fetches
  const [personaNames, setPersonaNames] = useState({}); // { persona_id: persona_name }
  const fetchingPersonas = useRef({}); // To prevent duplicate fetches
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserFields, setEditingUserFields] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [editingUserLoading, setEditingUserLoading] = useState(false);
  const [editingUserValidation, setEditingUserValidation] = useState({});
  const [searchEmail, setSearchEmail] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [roles, setRoles] = useState([]);
  const [changingRoleUser, setChangingRoleUser] = useState(null);
  const [changingRoleId, setChangingRoleId] = useState("");
  const [changingRoleLoading, setChangingRoleLoading] = useState(false);
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false);
  const [giftCreditsModalOpen, setGiftCreditsModalOpen] = useState(false);
  const [giftCreditsAmount, setGiftCreditsAmount] = useState("");
  const [giftCreditsLoading, setGiftCreditsLoading] = useState(false);

  // Move fetchUsers outside useEffect for reuse
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const response = await axioInstance.get(endpoints.auth.allUsers);
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users.");
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!selectedUser) {
      fetchUsers();
    }
  }, [selectedUser]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axioInstance.get("/v1/roles");
        setRoles(response.data || []);
      } catch (err) {
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  const handleViewSessions = async (user) => {
    setSelectedUser(user);
    setLoadingSessions(true);
    setError(null);
    try {
      // Fetch sessions for the user from the real API using user_id
      const response = await axioInstance.get(
        `${endpoints.sessions.byUser}${user.user_id}`
      );
      console.log("Sessions API response:", response.data);
      // Defensive: ensure sessions is always an array
      setSessions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        `Failed to fetch sessions for ${user.first_name || ""} ${user.last_name || ""}`
      );
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setSessions([]);
  };

  const handleOpenReportModal = (report) => {
    let reportObject = report;
    if (typeof report === "string") {
      try {
        reportObject = JSON.parse(report);
      } catch (e) {
        console.error("Failed to parse performance report:", e);
        reportObject = {
          coaching_summary: "Could not parse report data.",
          raw: report,
          overall_score: "N/A",
        };
      }
    }
    setSelectedReport(reportObject);
  };

  const handleCloseReportModal = () => {
    setSelectedReport(null);
  };

  const handleDownloadReport = async (sessionId) => {
    if (!sessionId) return;
    try {
      const response = await axioInstance.get(
        `/v1/performance-reports/${sessionId}/pdf`,
        {
          responseType: "blob",
        }
      );
      // Create a URL for the blob
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      // Create a link and click it to download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `performance_report_${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download report:", error);
      alert("Failed to download report.");
    }
  };

  const handleViewSubscription = async (user) => {
    setSelectedSubscriptionUser(user);
    setLoadingSubscription(true);
    try {
      const response = await axioInstance.get(`${endpoints.subscriptions.byUser}${user.user_id}`);
      const data = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      setSubscriptionList(data);
      // Prefer the first subscription for header context
      const userSubscription = data[0] || null;
      setSubscriptionData(userSubscription);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      setError("Failed to fetch subscription data.");
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Fetch mode name for a given mode_id
  const fetchModeName = async (mode_id) => {
    if (!mode_id || modeNames[mode_id] || fetchingModes.current[mode_id])
      return;
    fetchingModes.current[mode_id] = true;
    try {
      const response = await axioInstance.get(
        `/v1/interaction-modes/${mode_id}`
      );
      const modeName =
        response.data?.name ||
        response.data?.mode_name ||
        response.data?.title ||
        mode_id;
      setModeNames((prev) => ({ ...prev, [mode_id]: modeName }));
    } catch (e) {
      setModeNames((prev) => ({ ...prev, [mode_id]: mode_id }));
    } finally {
      fetchingModes.current[mode_id] = false;
    }
  };

  // Fetch persona name for a given persona_id
  const fetchPersonaName = async (persona_id) => {
    if (
      !persona_id ||
      personaNames[persona_id] ||
      fetchingPersonas.current[persona_id]
    )
      return;
    fetchingPersonas.current[persona_id] = true;
    try {
      const response = await axioInstance.get(`/v1/ai-personas/${persona_id}`);
      const personaName =
        response.data?.name ||
        response.data?.persona_name ||
        response.data?.title ||
        persona_id;
      setPersonaNames((prev) => ({ ...prev, [persona_id]: personaName }));
    } catch (e) {
      setPersonaNames((prev) => ({ ...prev, [persona_id]: persona_id }));
    } finally {
      fetchingPersonas.current[persona_id] = false;
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await axioInstance.delete(`/v1/sessions/${sessionToDelete}`);
      setSnackbar({
        open: true,
        message: "Session deleted successfully.",
        severity: "success",
      });
      // Refresh sessions after deletion
      if (selectedUser) {
        handleViewSessions(selectedUser);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete session.",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };
  //Code for Deleting Users
  // const handleDeleteUser = async () => {
  //   if (!userToDelete) return;
  //   try {
  //     await axioInstance.delete(`/v1/auth/${userToDelete}`);
  //     setSnackbar({ open: true, message: 'User deleted successfully.', severity: 'success' });
  //     setDeleteUserDialogOpen(false);
  //     setUserToDelete(null);
  //     // Refresh users after deletion
  //     setSelectedUser(null);
  //     setSessions([]);
  //     setTimeout(() => {
  //       // Give a moment for backend to update
  //       window.location.reload();
  //     }, 1000);
  //   } catch (error) {
  //     setSnackbar({ open: true, message: 'Failed to delete user.', severity: 'error' });
  //     setDeleteUserDialogOpen(false);
  //     setUserToDelete(null);
  //   }
  // };

  const handleEditUserStart = (user) => {
    setEditingUser(user);
    setEditingUserFields({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone_number: user.phone_number || "",
    });
    setEditingUserValidation({});
  };

  const handleEditUserSave = async () => {
    if (!editingUser) return;
    // Simple validation
    const errors = {};
    if (!editingUserFields.first_name)
      errors.first_name = "First name is required";
    if (!editingUserFields.last_name)
      errors.last_name = "Last name is required";
    setEditingUserValidation(errors);
    if (Object.keys(errors).length > 0) return;
    setEditingUserLoading(true);
    try {
      await axioInstance.put(
        `/v1/auth/${editingUser.user_id}`,
        editingUserFields
      );
      setSnackbar({
        open: true,
        message: "User updated successfully.",
        severity: "success",
      });
      setEditingUser(null);
      // Refetch users to update the list
      fetchUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update user.",
        severity: "error",
      });
    } finally {
      setEditingUserLoading(false);
    }
  };

  const handleSearchByEmail = async () => {
    if (!searchEmail) return;
    setSearchLoading(true);
    setError(null);
    try {
      const response = await axioInstance.get(
        `/v1/auth/by-email/${encodeURIComponent(searchEmail)}`
      );
      // The endpoint may return a single user or an array, handle both
      const user = response.data;
      setUsers(user ? [user] : []);
      setSearchActive(true);
    } catch (err) {
      setUsers([]);
      setError("No user found with that email.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchEmail("");
    setSearchActive(false);
    setError(null);
    fetchUsers();
  };

  const handleOpenChangeRole = (user) => {
    setChangingRoleUser(user);
    setChangingRoleId(user.role?.role_id || "");
    setChangeRoleModalOpen(true);
  };

  const handleCloseChangeRole = () => {
    setChangeRoleModalOpen(false);
    setChangingRoleUser(null);
    setChangingRoleId("");
  };

  const handleChangeRole = async () => {
    if (!changingRoleUser || !changingRoleId) return;
    setChangingRoleLoading(true);
    try {
      await axioInstance.post(
        `/v1/auth/users/${changingRoleUser.user_id}/change-role/${changingRoleId}`
      );
      setSnackbar({
        open: true,
        message: "Role updated successfully.",
        severity: "success",
      });
      handleCloseChangeRole();
      fetchUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update role.",
        severity: "error",
      });
    } finally {
      setChangingRoleLoading(false);
    }
  };

  const handleOpenGiftCredits = () => {
    setGiftCreditsModalOpen(true);
    setGiftCreditsAmount("");
  };

  const handleCloseGiftCredits = () => {
    setGiftCreditsModalOpen(false);
    setGiftCreditsAmount("");
  };

  const handleSaveGiftCredits = async () => {
    if (!giftCreditsAmount || isNaN(giftCreditsAmount) || Number(giftCreditsAmount) <= 0) {
      setSnackbar({
        open: true,
        message: "Please enter a valid number of credits.",
        severity: "error",
      });
      return;
    }

    setGiftCreditsLoading(true);
    try {
      // Find the active subscription from the subscription list
      const activeSubscription = subscriptionList.find(sub => sub.status_active === true);
      
      if (!activeSubscription) {
        throw new Error("No active subscription found");
      }
      
      // Calculate new remaining credits by adding gifted amount to current remaining
      const currentRemaining = activeSubscription.credits_remaining || 0;
      const newRemaining = currentRemaining + Number(giftCreditsAmount);
      
      // Use the user_subscription_id from the active subscription
      const userSubscriptionId = activeSubscription.user_subscription_id;
      
      if (!userSubscriptionId) {
        throw new Error("Active subscription ID not found");
      }
      
      // Update the active user subscription with new remaining credits
      await axioInstance.put(`${endpoints.subscriptions.update}${userSubscriptionId}`, {
        credits_remaining: newRemaining
      });
      
      setSnackbar({
        open: true,
        message: `${giftCreditsAmount} credits gifted successfully to active plan.`,
        severity: "success",
      });
      
      handleCloseGiftCredits();
      // Refresh subscription data
      if (selectedSubscriptionUser) {
        handleViewSubscription(selectedSubscriptionUser);
      }
    } catch (error) {
      console.error("Failed to gift credits:", error);
      setSnackbar({
        open: true,
        message: error.message === "No active subscription found" 
          ? "No active subscription found. Please activate a plan first." 
          : error.message === "Active subscription ID not found"
          ? "Active subscription ID not found. Please refresh and try again."
          : "Failed to gift credits. Please try again.",
        severity: "error",
      });
    } finally {
      setGiftCreditsLoading(false);
    }
  };

  if (currentSegment !== "users") {
    return null;
  }

  return (
    <div className="w-full" style={{ paddingTop: 40 }}>
      {/* Edit User Section - show ONLY this if editingUser is set */}
      {editingUser ? (
        <>
          <div className="w-full flex items-center justify-between mb-2">
            <h1 className="text-2xl">Edit User</h1>
            <Button
              onClick={() => setEditingUser(null)}
              sx={{
                backgroundColor: "#fbd255",
                color: "black",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#ffe066",
                  color: "black",
                },
              }}
            >
              Back to Users
            </Button>
          </div>
          <div
            style={{
              width: "100%",
              marginBottom: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "end",
            }}
          >
            <TextField
              fullWidth
              margin="normal"
              label="First Name"
              value={editingUserFields.first_name}
              onChange={(e) => {
                setEditingUserFields({
                  ...editingUserFields,
                  first_name: e.target.value,
                });
                if (editingUserValidation.first_name)
                  setEditingUserValidation((prev) => ({
                    ...prev,
                    first_name: undefined,
                  }));
              }}
              error={!!editingUserValidation.first_name}
              helperText={editingUserValidation.first_name}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Last Name"
              value={editingUserFields.last_name}
              onChange={(e) => {
                setEditingUserFields({
                  ...editingUserFields,
                  last_name: e.target.value,
                });
                if (editingUserValidation.last_name)
                  setEditingUserValidation((prev) => ({
                    ...prev,
                    last_name: undefined,
                  }));
              }}
              error={!!editingUserValidation.last_name}
              helperText={editingUserValidation.last_name}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Phone Number"
              value={editingUserFields.phone_number}
              onChange={(e) =>
                setEditingUserFields({
                  ...editingUserFields,
                  phone_number: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                className="!border !border-red-600 !bg-transparent w-fit"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                className="!border !border-green-500 !bg-green-500 w-fit"
                onClick={handleEditUserSave}
                disabled={editingUserLoading}
              >
                {editingUserLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Heading and actions */}
          {!selectedUser && !selectedSubscriptionUser && (
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between mb-0 gap-2">
              <h1 className="text-2xl">Users</h1>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <TextField
                  size="small"
                  placeholder="Search user by email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchByEmail();
                  }}
                  disabled={searchLoading}
                  sx={{
                    minWidth: 220,
                    height: 40,
                    "& .MuiInputBase-root": { height: 40 },
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSearchByEmail}
                  disabled={searchLoading || !searchEmail}
                  sx={{
                    backgroundColor: "#fbd255",
                    color: "black",
                    fontWeight: 500,
                    minWidth: 40,
                    height: 40,
                    boxSizing: "border-box",
                  }}
                >
                  <SearchIcon />
                </Button>
                {searchActive && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ minWidth: 40, height: 40, boxSizing: "border-box" }}
                  >
                    <ClearIcon />
                  </Button>
                )}
              </div>
            </div>
          )}
          {selectedUser && (
            <div className="w-full flex items-center justify-between mb-2">
              <h1 className="text-2xl">Sessions</h1>
              <Button
                onClick={handleBackToUsers}
                sx={{
                  backgroundColor: "#fbd255",
                  color: "black",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "#ffe066",
                    color: "black",
                  },
                }}
              >
                Back to Users
              </Button>
            </div>
          )}
          {selectedSubscriptionUser && (
            <Box className="w-full" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    {`${(selectedSubscriptionUser.first_name || "").charAt(0)}${(selectedSubscriptionUser.last_name || "").charAt(0)}`.toUpperCase() || (selectedSubscriptionUser.email || '?').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Subscription Details</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {`${selectedSubscriptionUser.first_name || ''} ${selectedSubscriptionUser.last_name || ''}`.trim() || selectedSubscriptionUser.email}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={handleOpenGiftCredits}
                    sx={{
                      backgroundColor: "#4caf50",
                      color: "white",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "#45a049",
                        color: "white",
                      },
                    }}
                  >
                    Gift Credits
                  </Button>
                  <Button
                    onClick={() => setSelectedSubscriptionUser(null)}
                    sx={{
                      backgroundColor: "#fbd255",
                      color: "black",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "#ffe066",
                        color: "black",
                      },
                    }}
                  >
                    Back to Users
                  </Button>
                </Box>
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>
          )}
          {/* Subscription Section */}
          {selectedSubscriptionUser && !selectedUser && (
            <div className="w-full overflow-x-auto">
              {loadingSubscription ? (
                <div className="flex items-center justify-center h-60">
                  <CircularProgress />
                </div>
              ) : (
                <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 3, borderRadius: 3 }}>
                  {subscriptionList && subscriptionList.length > 0 ? (
                    <div>
                      {subscriptionList.map((sub, index) => (
                        <Box key={sub.subscription?.id || index} sx={{ mb: 5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                              {sub.subscription?.plan_type || 'Subscription'}
                            </Typography>
                            <Chip
                              label={(sub.status_active ? 'Active' : 'Inactive')}
                              color={sub.status_active ? 'success' : 'default'}
                              variant={sub.status_active ? 'filled' : 'outlined'}
                              size="small"
                            />
                          </Box>
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} md={4}>
                              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary">Credits Remaining</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {sub.credits_remaining || '0'}
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary">Credits Used</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {sub.credits_used || '0'}
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary">Sessions Completed</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {sub.sessions_completed || '0'}
                                </Typography>
                              </Paper>
                            </Grid>
                          </Grid>

                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, border: 1, borderColor: 'divider', height: '100%', backgroundColor: 'background.paper' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 2H6C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Plan Information
                                </Typography>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>Plan Type:</Typography>
                                    <Typography sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'primary.main', backgroundColor: 'primary.50', px: 2, py: 0.5, borderRadius: 2, border: 1, borderColor: 'primary.200' }}>
                                      {sub.subscription?.plan_type || 'N/A'}
                                    </Typography>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>Billing Cycle:</Typography>
                                    <Typography sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'text.primary' }}>
                                      {sub.subscription?.billing_cycle || 'N/A'}
                                    </Typography>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>Credits Per Month:</Typography>
                                    <Typography sx={{ fontWeight: 600, color: 'success.main' }}>
                                      {sub.subscription?.credits_per_month || '0'}
                                    </Typography>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>Maximum Users:</Typography>
                                    <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                                      {sub.subscription?.max_users || '0'}
                                    </Typography>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>Max Session Duration:</Typography>
                                    <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                                      {sub.subscription?.max_session_duration ? `${sub.subscription.max_session_duration} min` : 'N/A'}
                                    </Typography>
                                  </div>
                                </div>
                              </Paper>
                            </Grid>
                            <Grid item xs={12}>
                              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, border: 1, borderColor: 'divider', height: '100%', backgroundColor: 'background.paper' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>Usage</Typography>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>Credits Allocated:</Typography>
                                    <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                                      {sub.credits_allocated || '0'}
                                    </Typography>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>Start Date:</Typography>
                                    <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                                      {new Date(sub.start_date).toLocaleDateString()}
                                    </Typography>
                                  </div>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>Usage Progress</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                      {((((sub.credits_used || 0) / (sub.credits_allocated || 1)) * 100)).toFixed(1)}%
                                    </Typography>
                                  </div>
                                  <LinearProgress variant="determinate" value={(((sub.credits_used || 0) / (sub.credits_allocated || 1)) * 100)} sx={{ height: 12, borderRadius: 6, backgroundColor: 'action.hover', '& .MuiLinearProgress-bar': { backgroundColor: (sub.credits_remaining || 0) > 0 ? 'success.main' : 'error.main', borderRadius: 6 } }} />
                                </div>
                              </Paper>
                            </Grid>
                          </Grid>
                          {index < subscriptionList.length - 1 && (
                            <Divider sx={{ my: 3 }} />
                          )}
                        </Box>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      backgroundColor: 'action.hover',
                      borderRadius: '8px'
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: 'error.main',
                          fontWeight: 500,
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        No Subscription Data Available
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No subscription data available for this user.
                      </Typography>
                    </div>
                  )}
                </Paper>
              )}
            </div>
          )}

          {/* Users Section */}
          {!selectedUser && !selectedSubscriptionUser && (
            <>
              {/* <hr className="mt-1" /> */}
              <div className="w-full overflow-x-auto">
                {loadingUsers ? (
                  <div className="flex items-center justify-center h-60">
                    <CircularProgress />
                  </div>
                ) : (
                  <Table
                    className="border-t border-solid border-[#515151] mt-1"
                    sx={{ minWidth: 600, width: "100%" }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ px: 2, py: 1.5 }}
                          className="!font-bold capitalize"
                        >
                          Name
                        </TableCell>
                        <TableCell
                          sx={{ px: 2, py: 1.5 }}
                          className="!font-bold capitalize"
                        >
                          Email
                        </TableCell>
                        <TableCell
                          sx={{ px: 2, py: 1.5 }}
                          className="!font-bold capitalize"
                        >
                          Role
                        </TableCell>
                        <TableCell
                          sx={{ px: 2, py: 1.5 }}
                          className="!font-bold capitalize"
                        >
                          Sessions
                        </TableCell>
                        <TableCell
                          sx={{ px: 2, py: 1.5 }}
                          className="!font-bold capitalize"
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.length > 0 ? (
                        // Sort users by created_at ascending (oldest first)
                        users
                          .slice()
                          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                          .map((user) => (
                            <TableRow
                              key={user.id}
                              sx={{ borderBottom: "1px solid #333" }}
                            >
                              <TableCell sx={{ px: 2, py: 1.5 }}>
                                {`${user.first_name || ""} ${user.last_name || ""}`.trim()}
                              </TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>
                                {user.email}
                              </TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>
                                <span>
                                  {user.role?.name
                                    ? user.role.name.replace(/_/g, " ")
                                    : "-"}
                                </span>
                                <Tooltip title="Change Role">
                                  <div
                                    className="rounded border border-solid border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white cursor-pointer p-1 ml-2"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      verticalAlign: "middle",
                                    }}
                                    onClick={() => handleOpenChangeRole(user)}
                                  >
                                    <EditIcon className="!text-lg" />
                                  </div>
                                </Tooltip>
                              </TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>
                                <Button
                                  variant="contained"
                                  onClick={() => handleViewSessions(user)}
                                  sx={{
                                    backgroundColor: "#fbd255",
                                    color: "black",
                                    fontWeight: 500,
                                    "&:hover": {
                                      backgroundColor: "#45a049",
                                      color: "white",
                                    },
                                    marginRight: 1,
                                  }}
                                >
                                  View Sessions
                                </Button>
                                <Button
                                  variant="contained"
                                  onClick={() => handleViewSubscription(user)}
                                  sx={{
                                    backgroundColor: "#fbd255",
                                    color: "black",
                                    fontWeight: 500,
                                    "&:hover": {
                                      backgroundColor: "#45a049",
                                      color: "white",
                                    },
                                  }}
                                >
                                  View Subscription
                                </Button>
                              </TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <div
                                    className="rounded border border-solid border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white cursor-pointer py-1 px-4 w-fit"
                                    onClick={() => handleEditUserStart(user)}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <EditIcon className="!text-lg" />
                                  </div>
                                  {/* Code for Deleting Users
                                    <div
                                    className="rounded border border-solid border-red-400 hover:bg-red-400 text-red-400 hover:text-white cursor-pointer py-1 px-4 w-fit"
                                    onClick={() => {
                                      setUserToDelete(user.user_id);
                                      setDeleteUserDialogOpen(true);
                                    }}
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                  >
                                    <DeleteIcon className="!text-lg" />
                                  </div> */}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            <div className="flex items-center justify-center h-60 relative">
                              <p className="text-lg absolute bottom-[15%]">
                                Oops... data not found
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
          {/* Sessions Section */}
          {selectedUser && (
            <>
              <div className="mb-2 text-base font-medium">
                {selectedUser.first_name || ""} {selectedUser.last_name || ""}
              </div>
              {/* <hr className="mt-1" /> */}
              <div className="w-full overflow-x-auto">
                {loadingSessions ? (
                  <div className="flex items-center justify-center h-60">
                    <CircularProgress />
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-60 text-red-500">
                    {error}
                  </div>
                ) : (
                  (() => {
                    try {
                      const safeSessions = Array.isArray(sessions)
                        ? sessions
                        : [];
                      const sortedSessions = safeSessions
                        .slice()
                        .sort((a, b) => {
                          const dateA = new Date(
                            a.start_time || a.created_at || 0
                          );
                          const dateB = new Date(
                            b.start_time || b.created_at || 0
                          );
                          return dateB - dateA; // Descending order
                        });
                      return (
                        <Table
                          className="border-t border-solid border-[#515151] mt-1"
                          sx={{ minWidth: 900, width: "100%" }}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell
                                sx={{ textAlign: "left" }}
                                className="!font-bold capitalize"
                              >
                                Session ID
                              </TableCell>
                              <TableCell
                                sx={{ textAlign: "left" }}
                                className="!font-bold capitalize"
                              >
                                Persona
                              </TableCell>
                              <TableCell
                                sx={{ textAlign: "left" }}
                                className="!font-bold capitalize"
                              >
                                Mode
                              </TableCell>
                              <TableCell
                                sx={{ textAlign: "left" }}
                                className="!font-bold capitalize"
                              >
                                Performance Report
                              </TableCell>
                              <TableCell
                                sx={{ textAlign: "left" }}
                                className="!font-bold capitalize"
                              >
                                Start Time
                              </TableCell>
                              <TableCell
                                sx={{ textAlign: "left" }}
                                className="!font-bold capitalize"
                              >
                                End Time
                              </TableCell>
                              <TableCell
                                sx={{ textAlign: "left" }}
                                className="!font-bold capitalize"
                              >
                                Duration
                              </TableCell>
                              <TableCell
                                sx={{ textAlign: "left" }}
                                className="!font-bold capitalize"
                              >
                                Status
                              </TableCell>
                              <TableCell
                                sx={{ textAlign: "left" }}
                                className="!font-bold capitalize"
                              >
                                Created At
                              </TableCell>
                              <TableCell
                                sx={{ textAlign: "left" }}
                                className="!font-bold capitalize"
                              >
                                Updated At
                              </TableCell>
                              <TableCell
                                sx={{ textAlign: "left" }}
                                className="!font-bold capitalize"
                              >
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sortedSessions.length > 0 ? (
                              sortedSessions.map((session, idx) => (
                                <TableRow
                                  key={session.session_id || session.id || idx}
                                  sx={{ borderBottom: "1px solid #333" }}
                                >
                                  <TableCell sx={{ px: 2, py: 1.5 }}>
                                    {session.session_id || "-"}
                                  </TableCell>
                                  <TableCell sx={{ px: 2, py: 1.5 }}>
                                    {(() => {
                                      if (!session.persona_id) return "-";
                                      if (!personaNames[session.persona_id]) {
                                        fetchPersonaName(session.persona_id);
                                        return "...";
                                      }
                                      return personaNames[session.persona_id];
                                    })()}
                                  </TableCell>
                                  <TableCell sx={{ px: 2, py: 1.5 }}>
                                    {(() => {
                                      if (!session.mode_id) return "-";
                                      if (!modeNames[session.mode_id]) {
                                        fetchModeName(session.mode_id);
                                        return "...";
                                      }
                                      return modeNames[session.mode_id];
                                    })()}
                                  </TableCell>
                                  <TableCell sx={{ px: 2, py: 1.5 }}>
                                    {session.performance_report ? (
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Button
                                          variant="contained"
                                          size="small"
                                          onClick={() =>
                                            handleOpenReportModal(
                                              session.performance_report
                                            )
                                          }
                                          sx={{
                                            backgroundColor: "#fbd255",
                                            color: "black",
                                            fontWeight: 500,
                                            "&:hover": {
                                              backgroundColor: "#ffe066",
                                              color: "black",
                                            },
                                          }}
                                        >
                                          View Report
                                        </Button>
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() =>
                                            handleDownloadReport(
                                              session.session_id
                                            )
                                          }
                                          sx={{
                                            borderColor: "#fbd255",
                                            color: "#fbd255",
                                            fontWeight: 500,
                                            "&:hover": {
                                              backgroundColor: "#fbd255",
                                              color: "black",
                                            },
                                          }}
                                        >
                                          Download Report
                                        </Button>
                                      </Box>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ px: 2, py: 1.5 }}>
                                    {formatDateTime(session.start_time)}
                                  </TableCell>
                                  <TableCell sx={{ px: 2, py: 1.5 }}>
                                    {session.end_time || "-"}
                                  </TableCell>
                                  <TableCell sx={{ px: 2, py: 1.5 }}>
                                    {session.duration || "-"}
                                  </TableCell>
                                  <TableCell sx={{ px: 2, py: 1.5 }}>
                                    {session.status || "-"}
                                  </TableCell>
                                  <TableCell sx={{ px: 2, py: 1.5 }}>
                                    {formatDateTime(session.created_at)}
                                  </TableCell>
                                  <TableCell sx={{ px: 2, py: 1.5 }}>
                                    {formatDateTime(session.updated_at)}
                                  </TableCell>
                                  <TableCell sx={{ px: 2, py: 1.5 }}>
                                    <div
                                      className="rounded border border-solid border-red-400 hover:bg-red-400 text-red-400 hover:text-white cursor-pointer py-1 px-4 w-fit"
                                      onClick={() => {
                                        setSessionToDelete(session.session_id);
                                        setDeleteDialogOpen(true);
                                      }}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <DeleteIcon className="!text-lg" />
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={10} align="center">
                                  <div className="flex items-center justify-center h-60 relative">
                                    <p className="text-lg absolute bottom-[15%]">
                                      Oops... data not found
                                    </p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      );
                    } catch (e) {
                      return (
                        <div className="flex items-center justify-center h-60 text-red-500">
                          Error rendering sessions table: {e.message}
                        </div>
                      );
                    }
                  })()
                )}
              </div>
            </>
          )}
        </>
      )}
      {error && <Typography color="error">{error}</Typography>}

      {/* Performance Report Modal */}
      <Modal
        open={!!selectedReport}
        onClose={handleCloseReportModal}
        aria-labelledby="report-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", md: 700 },
            bgcolor: "background.paper",
            border: "1px solid #ccc",
            borderRadius: 2,
            boxShadow: 24,
            p: { xs: 2, md: 4 },
            color: "text.primary",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Typography
            id="report-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Performance Report
          </Typography>
          {selectedReport && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    backgroundColor: "#fbd255",
                    color: "#000",
                  }}
                >
                  <Typography variant="overline">Overall Score</Typography>
                  <Typography variant="h4">
                    {selectedReport.overall_score ?? "N/A"}
                  </Typography>
                </Paper>
              </Grid>

              {Object.entries(selectedReport)
                .filter(
                  ([key]) =>
                    !["overall_score", "coaching_summary", "raw"].includes(
                      key
                    ) && typeof selectedReport[key] === "number"
                )
                .map(([key, value]) => (
                  <Grid item xs={6} sm={4} key={key}>
                    <Paper elevation={1} sx={{ p: 1.5, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          textTransform: "capitalize",
                          color: "text.secondary",
                        }}
                      >
                        {key.replace(/_/g, " ")}
                      </Typography>
                      <Typography variant="h6">{value}</Typography>
                    </Paper>
                  </Grid>
                ))}

              {selectedReport.coaching_summary && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Coaching Summary
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid #eee",
                      whiteSpace: "pre-wrap",
                      maxHeight: "30vh",
                      overflowY: "auto",
                    }}
                  >
                    <Typography variant="body2">
                      {selectedReport.coaching_summary}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </Modal>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Session</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this session?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSession} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Change Role Section */}
      <Modal
        open={changeRoleModalOpen}
        onClose={handleCloseChangeRole}
        aria-labelledby="change-role-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", md: 480 },
            bgcolor: "background.paper",
            border: "1px solid #ccc",
            borderRadius: 2,
            boxShadow: 24,
            p: { xs: 2, md: 4 },
            color: "text.primary",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className="w-full flex items-center justify-between mb-2">
            <h1 className="text-2xl">Change User Role</h1>
          </div>
          <TextField
            select
            label="Select Role"
            value={changingRoleId}
            onChange={(e) => setChangingRoleId(e.target.value)}
            fullWidth
            sx={{ mt: 1, mb: 2 }}
          >
            {roles.map((role) => (
              <MenuItem key={role.role_id} value={role.role_id}>
                {role.name.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </TextField>
          <div className="flex items-center gap-2 justify-end w-full mt-2">
            <Button
              variant="outlined"
              className="!border !border-red-600 !bg-transparent w-fit"
              onClick={handleCloseChangeRole}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className="!border !border-green-500 !bg-green-500 w-fit"
              onClick={handleChangeRole}
              disabled={changingRoleLoading || !changingRoleId}
            >
              {changingRoleLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Gift Credits Modal */}
      <Modal
        open={giftCreditsModalOpen}
        onClose={handleCloseGiftCredits}
        aria-labelledby="gift-credits-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", md: 480 },
            bgcolor: "background.paper",
            border: "1px solid #ccc",
            borderRadius: 2,
            boxShadow: 24,
            p: { xs: 2, md: 4 },
            color: "text.primary",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Gift Credits
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Gift additional credits to {selectedSubscriptionUser?.first_name || selectedSubscriptionUser?.email || 'this user'}
          </Typography>

          {/* Current Credits Display */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Credits Remaining</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {subscriptionData?.credits_remaining || '0'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Credits Allocated</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {subscriptionData?.credits_allocated || '0'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TextField
            fullWidth
            label="Number of Credits to Gift"
            type="number"
            value={giftCreditsAmount}
            onChange={(e) => setGiftCreditsAmount(e.target.value)}
            placeholder="Enter number of credits"
            sx={{ mb: 3 }}
            inputProps={{ min: 1 }}
          />

          <div className="flex items-center gap-2 justify-end w-full">
            <Button
              variant="outlined"
              onClick={handleCloseGiftCredits}
              disabled={giftCreditsLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveGiftCredits}
              disabled={giftCreditsLoading || !giftCreditsAmount}
              sx={{
                backgroundColor: "#4caf50",
                "&:hover": {
                  backgroundColor: "#45a049",
                },
              }}
            >
              {giftCreditsLoading ? "Gifting..." : "Gift Credits"}
            </Button>
          </div>
        </Box>
      </Modal>
      {/* Code for Deleting Users
      <Dialog open={deleteUserDialogOpen} onClose={() => setDeleteUserDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          The action cannot be reverted and the user will be permanently removed from the system.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleDeleteUser} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar> */}
    </div>
  );
};

export default UsersAndSessions;
