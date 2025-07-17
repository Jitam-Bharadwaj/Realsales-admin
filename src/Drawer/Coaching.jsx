import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import EditIcon from "@mui/icons-material/Edit";
import NotFoundImage from "../../public/404_Image.png";
import { axioInstance } from "../api/axios/axios";
import { endpoints } from "../api/endpoints/endpoints";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

const Coaching = ({ currentSegment }) => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingData, setEditingData] = useState({});
  const [addEditMode, setAddEditMode] = useState(false);
  const [validationError, setValidationError] = useState({});
  const [showMore, setShowMore] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const textFieldRef = useRef(null);

  // Fetch all coaching prompts
  const fetchPrompts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axioInstance.get(endpoints.coaching.fetchPrompts);
      let data = res.data;
      if (Array.isArray(data)) {
        setPrompts(data);
      } else if (data && data.prompt) {
        setPrompts([data]);
      } else {
        setPrompts([]);
      }
    } catch (err) {
      setError("Failed to fetch coaching prompts.");
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSegment === "coaching") {
      fetchPrompts();
    }
    // eslint-disable-next-line
  }, [currentSegment]);

  const handleEdit = (idx) => {
    setAddEditMode(true);
    setEditingData({
      name: prompts[idx].name || '',
      template: prompts[idx].template || prompts[idx].prompt || '',
      id: prompts[idx].prompt_id || prompts[idx].id,
    });
    setShowMore(false);
  };
  const handleCancel = () => {
    setAddEditMode(false);
    setEditingData({});
    setValidationError({});
    setShowMore(false);
  };
  const validateCoaching = (data) => {
    const errors = {};
    if (!data?.name) errors.name = 'Name is required';
    if (!data?.template) errors.template = 'Template is required';
    return errors;
  };
  const handleSave = async () => {
    if (!editingData.id && editingData.id !== 0) return;
    const errors = validateCoaching(editingData);
    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updateUrl = `${endpoints.coaching.updatePrompt}${editingData.id}`;
      await axioInstance.put(updateUrl, { name: editingData.name, template: editingData.template });
      // Update local state by id
      const updated = prompts.map((item) =>
        (item.prompt_id === editingData.id || item.id === editingData.id)
          ? { ...item, name: editingData.name, template: editingData.template }
          : item
      );
      setPrompts(updated);
      setAddEditMode(false);
      setEditingData({});
      setValidationError({});
      setShowMore(false);
      setSnackbar({ open: true, message: 'Prompt updated successfully.', severity: 'success' });
    } catch (err) {
      setError("Failed to update coaching prompt.");
      setSnackbar({ open: true, message: 'Failed to update coaching prompt.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (currentSegment !== "coaching") return null;

  return (
    <Box sx={{ width: "100%", pt: 4 }}>
      {addEditMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', marginBottom: 24 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={editingData.name}
            onChange={e => setEditingData({ ...editingData, name: e.target.value })}
            error={!!validationError.name}
            helperText={validationError.name}
            disabled={saving}
            sx={{ mb: 1 }}
          />
          <div className="relative w-full">
            <TextField
              fullWidth
              margin="normal"
              label="Template"
              value={editingData.template}
              onChange={e => setEditingData({ ...editingData, template: e.target.value })}
              multiline
              rows={showMore ? 12 : 6}
              error={!!validationError.template}
              helperText={validationError.template}
              disabled={saving}
            />
            <div
              className="absolute right-3 bottom-0.5 bg-green-500 w-10 py-0.5 rounded flex items-center justify-center cursor-pointer"
              onClick={() => setShowMore(!showMore)}
            >
              {!showMore ? (
                <UnfoldMoreIcon className="!w-3.5 !h-3.5" />
              ) : (
                <UnfoldLessIcon className="!w-3.5 !h-3.5" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <RotateRightIcon className="animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="!font-bold capitalize">Name</TableCell>
                <TableCell className="!font-bold capitalize" align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Typography color="error">{error}</Typography>
                  </TableCell>
                </TableRow>
              ) : prompts.length ? (
                prompts.map((promptObj, idx) => (
                  <TableRow key={promptObj.prompt_id || promptObj.id || idx}>
                    <TableCell>
                      {promptObj.name || '--'}
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-2">
                        <div
                          className="rounded border border-solid border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white cursor-pointer py-1 px-4 w-fit"
                          onClick={() => handleEdit(idx)}
                          style={{ pointerEvents: addEditMode ? 'none' : 'auto', opacity: addEditMode ? 0.5 : 1 }}
                        >
                          <EditIcon className="!text-lg" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <div className="flex items-center justify-center h-60 relative">
                      <img
                        src={NotFoundImage}
                        alt="404"
                        style={{ width: 'auto', height: 120 }}
                      />
                      <p className="text-lg absolute bottom-[15%]">
                        Oops... data not found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Coaching; 