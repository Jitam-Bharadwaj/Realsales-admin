import React, { useState, useEffect } from "react";
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
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { axioInstance } from "../api/axios/axios";
import { endpoints } from "../api/endpoints/endpoints";
import { showToast } from "../toastConfig";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import RotateRightIcon from "@mui/icons-material/RotateRight";

const Subscriptions = ({ currentSegment }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [validationError, setValidationError] = useState({});

  // Fetch all subscriptions
  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    
    // Try different possible endpoints
    const endpointsToTry = [
      endpoints.subscriptions.allAlt1,
      endpoints.subscriptions.allAlt2,
      endpoints.subscriptions.allAlt3,
    ];
    
    for (let i = 0; i < endpointsToTry.length; i++) {
      try {
        const response = await axioInstance.get(endpointsToTry[i]);
        
        if (response.data) {
          const data = Array.isArray(response.data) ? response.data : [];
          
          // Ensure status_active field exists for display
          const mappedData = data.map(subscription => ({
            ...subscription,
            status_active: subscription.status_active !== undefined ? subscription.status_active : (subscription.is_custom !== undefined ? subscription.is_custom : true)
          }));
          
          // Sort subscriptions: Free Trial first, then Starter plans, then Manager plans
          const sortedData = mappedData.sort((a, b) => {
            const getSortOrder = (subscription) => {
              const planType = (subscription.plan_type || "").toLowerCase();
              
              // Free trial first
              if (planType.includes("free") || planType.includes("trial")) {
                return 1;
              }
              // Starter plans second
              if (planType.includes("starter")) {
                return 2;
              }
              // Manager plans third
              if (planType.includes("manager")) {
                return 3;
              }
              // Other plans last
              return 4;
            };
            
            return getSortOrder(a) - getSortOrder(b);
          });
          
          setSubscriptions(sortedData);
          setLoading(false);
          return; // Success, exit the function
        }
      } catch (err) {
        if (i === endpointsToTry.length - 1) {
          // Last endpoint failed, show error
          setError(`Failed to fetch subscriptions. Last error: ${err.response?.data?.detail || err.message}`);
        }
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (currentSegment === "subscriptions") {
      fetchSubscriptions();
    }
  }, [currentSegment]);

  // Handle edit start
  const handleEditStart = (subscription) => {
    setEditingSubscription(subscription);
    setEditFormData({
      plan_type: subscription.plan_type || "",
      billing_cycle: subscription.billing_cycle || "",
      credits_per_month: subscription.credits_per_month || "",
      max_users: subscription.max_users || "",
      max_session_duration: subscription.max_session_duration || "",
      monthly_price: subscription.monthly_price || "",
      yearly_price: subscription.yearly_price || "",
      status_active: subscription.status_active,
    });
    setValidationError({});
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingSubscription(null);
    setEditFormData({});
    setValidationError({});
  };




  // Handle form input change
  const handleInputChange = (field, value) => {
    setEditFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Clear opposite price field when billing cycle changes
      if (field === "billing_cycle") {
        if (value === "monthly") {
          newData.yearly_price = "";
        } else if (value === "yearly") {
          newData.monthly_price = "";
        }
      }
      
      return newData;
    });
    
    // Clear validation error for this field
    if (validationError[field]) {
      setValidationError(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!editFormData.plan_type) errors.plan_type = "Plan type is required";
    if (!editFormData.billing_cycle) errors.billing_cycle = "Billing cycle is required";
    if (!editFormData.credits_per_month || editFormData.credits_per_month < 0) {
      errors.credits_per_month = "Credits per month must be a positive number";
    }
    if (!editFormData.max_users || editFormData.max_users < 0) {
      errors.max_users = "Max users must be a positive number";
    }
    if (!editFormData.max_session_duration || editFormData.max_session_duration < 0) {
      errors.max_session_duration = "Max session duration must be a positive number";
    }
    // Validate pricing based on billing cycle
    if (editFormData.billing_cycle === "monthly") {
      if (editFormData.monthly_price === undefined || editFormData.monthly_price < 0) {
        errors.monthly_price = "Monthly price must be a positive number";
      }
    } else if (editFormData.billing_cycle === "yearly") {
      if (editFormData.yearly_price === undefined || editFormData.yearly_price < 0) {
        errors.yearly_price = "Yearly price must be a positive number";
      }
    }
    return errors;
  };


  // Handle save changes
  const handleSaveChanges = async () => {
    if (!editingSubscription) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      return;
    }

    setEditLoading(true);
    try {
      // Prepare data for update - only send changed fields
      const updateData = {};
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key] !== editingSubscription[key]) {
          updateData[key] = editFormData[key];
        }
      });

      // Always include status_active field
      updateData.status_active = editFormData.status_active;

      if (Object.keys(updateData).length === 0) {
        showToast.info("No changes detected.");
        handleEditCancel();
        return;
      }

      const subscriptionId = editingSubscription.id || editingSubscription.subscription_id || editingSubscription.plan_id;

      // Use the correct subscriptions endpoint
      try {
        // Try PATCH first
        await axioInstance.patch(
          `${endpoints.subscriptions.allAlt1}${subscriptionId}/`,
          updateData
        );
      } catch (patchError) {
        // Fallback to PUT
        await axioInstance.put(
          `${endpoints.subscriptions.allAlt1}${subscriptionId}/`,
          updateData
        );
      }

      showToast.success("Subscription updated successfully.");

      // Refresh the subscriptions list
      fetchSubscriptions();
      handleEditCancel();
    } catch (error) {
      console.error("Failed to update subscription:", error);
      showToast.error(error?.response?.data?.message || "Failed to update subscription.");
    } finally {
      setEditLoading(false);
    }
  };


  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get display price based on billing cycle
  const getDisplayPrice = (subscription) => {
    if (subscription.billing_cycle === "monthly") {
      return subscription.monthly_price;
    } else if (subscription.billing_cycle === "yearly") {
      return subscription.yearly_price;
    }
    return subscription.monthly_price || subscription.yearly_price;
  };

  // Capitalize first letter of a string
  const capitalizeFirstLetter = (str) => {
    if (!str) return "N/A";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (currentSegment !== "subscriptions") {
    return null;
  }

  return (
    <div className="w-full" style={{ paddingTop: 40 }}>
      {editingSubscription ? (
        <>
          <div className="w-full flex items-center justify-between mb-2">
            <h1 className="text-2xl">
              Edit Subscription - {editingSubscription?.plan_type ? editingSubscription.plan_type.charAt(0).toUpperCase() + editingSubscription.plan_type.slice(1) : "N/A"}
            </h1>
            <div
              className="rounded border border-solid border-[#fbd255] hover:bg-[#fbd255] text-[#fbd255] hover:text-black cursor-pointer py-1 px-4 w-fit"
              onClick={handleEditCancel}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 500,
              }}
            >
              Back to Subscriptions
            </div>
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
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Plan Type"
                  value={editFormData.plan_type}
                  onChange={(e) => handleInputChange("plan_type", e.target.value)}
                  error={!!validationError.plan_type}
                  helperText={validationError.plan_type}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!validationError.billing_cycle}>
                  <InputLabel>Billing Cycle</InputLabel>
                  <Select
                    value={editFormData.billing_cycle}
                    onChange={(e) => handleInputChange("billing_cycle", e.target.value)}
                    label="Billing Cycle"
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                  </Select>
                  {validationError.billing_cycle && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                      {validationError.billing_cycle}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Credits Per Month"
                  type="number"
                  value={editFormData.credits_per_month}
                  onChange={(e) => handleInputChange("credits_per_month", parseInt(e.target.value) || 0)}
                  error={!!validationError.credits_per_month}
                  helperText={validationError.credits_per_month}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Max Users"
                  type="number"
                  value={editFormData.max_users}
                  onChange={(e) => handleInputChange("max_users", parseInt(e.target.value) || 0)}
                  error={!!validationError.max_users}
                  helperText={validationError.max_users}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Max Session Duration (minutes)"
                  type="number"
                  value={editFormData.max_session_duration}
                  onChange={(e) => handleInputChange("max_session_duration", parseInt(e.target.value) || 0)}
                  error={!!validationError.max_session_duration}
                  helperText={validationError.max_session_duration}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                {editFormData.billing_cycle === "monthly" ? (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Monthly Price ($)"
                    type="number"
                    step="0.01"
                    value={editFormData.monthly_price}
                    onChange={(e) => handleInputChange("monthly_price", parseFloat(e.target.value) || 0)}
                    error={!!validationError.monthly_price}
                    helperText={validationError.monthly_price}
                  />
                ) : editFormData.billing_cycle === "yearly" ? (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Yearly Price ($)"
                    type="number"
                    step="0.01"
                    value={editFormData.yearly_price}
                    onChange={(e) => handleInputChange("yearly_price", parseFloat(e.target.value) || 0)}
                    error={!!validationError.yearly_price}
                    helperText={validationError.yearly_price}
                  />
                ) : (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Price ($)"
                    type="number"
                    step="0.01"
                    value={editFormData.monthly_price || editFormData.yearly_price}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (editFormData.billing_cycle === "monthly") {
                        handleInputChange("monthly_price", value);
                      } else {
                        handleInputChange("yearly_price", value);
                      }
                    }}
                    error={!!(validationError.monthly_price || validationError.yearly_price)}
                    helperText={validationError.monthly_price || validationError.yearly_price}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editFormData.status_active}
                    onChange={(e) => handleInputChange("status_active", e.target.value)}
                    label="Status"
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <div className="flex items-center gap-2 mt-4">
              <div
                className="rounded border border-solid border-red-600 hover:bg-red-600 text-red-600 hover:text-white cursor-pointer py-1 px-4 w-fit"
                onClick={handleEditCancel}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: editLoading ? 0.7 : 1,
                  pointerEvents: editLoading ? "none" : "auto",
                }}
              >
                Cancel
              </div>
              <div
                className="rounded border border-solid border-blue-600 hover:border-blue-700 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer py-1 px-6 w-fit flex items-center gap-2"
                onClick={handleSaveChanges}
                style={{
                  opacity: editLoading ? 0.7 : 1,
                  pointerEvents: editLoading ? "none" : "auto",
                }}
              >
                {editLoading ? (
                  <RotateRightIcon className="animate-spin" />
                ) : (
                  "Save"
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <LocalOfferIcon sx={{ fontSize: 28, color: "#fbd255" }} />
              <h1 className="text-2xl">Subscription Plans</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchSubscriptions}
                disabled={loading}
                sx={{
                  borderColor: "#fbd255",
                  color: "#fbd255",
                  "&:hover": {
                    backgroundColor: "#fbd255",
                    color: "black",
                  },
                }}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Subscriptions Table */}
          <div className="w-full overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-60">
                <CircularProgress />
              </div>
            ) : (
              <Table
                className="border-t border-solid border-[#515151]"
                sx={{ minWidth: 800, width: "100%" }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                      Plan Type
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                      Billing Cycle
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                      Credits/Month
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                      Max Users
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                      Max Session Duration
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                      Price
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                      Status
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions.length > 0 ? (
                    subscriptions.map((subscription) => (
                      <TableRow
                        key={subscription.id || subscription.subscription_id || subscription.plan_id || subscription._id}
                        sx={{ borderBottom: "1px solid #333" }}
                      >
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {capitalizeFirstLetter(subscription.plan_type)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                            {subscription.billing_cycle || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <Typography variant="body2">
                            {subscription.credits_per_month || "0"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <Typography variant="body2">
                            {subscription.max_users || "0"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <Typography variant="body2">
                            {subscription.max_session_duration ? `${subscription.max_session_duration} min` : "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatCurrency(getDisplayPrice(subscription))}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <Chip
                            label={subscription.status_active ? "Active" : "Inactive"}
                            color={subscription.status_active ? "success" : "default"}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <div className="flex items-center justify-end gap-2">
                            <div
                              className="rounded border border-solid border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white cursor-pointer py-1 px-4 w-fit"
                              onClick={() => handleEditStart(subscription)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <EditIcon className="!text-lg" />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <div className="flex items-center justify-center h-60 relative">
                          <p className="text-lg absolute bottom-[15%]">
                            No subscriptions found
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

    </div>
  );
};

export default Subscriptions;
