import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Modal,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { axioInstance } from "../api/axios/axios";
import { endpoints } from "../api/endpoints/endpoints";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import AddIcon from "@mui/icons-material/Add";
import { showToast } from "../toastConfig";

const GeneralInstruction = ({ currentSegment }) => {
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

  const [editingData, setEditingData] = useState({});
  const [deleteId, setDeleteId] = useState({});
  const [addData, setAddData] = useState(false);
  const [manufacturingModels, setManufacturingModels] = useState({});
  const [loading, setLoading] = useState(false);

  const readGeneral = async () => {
    try {
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to fetch general instructions");
      console.log(error, "_error_");
    }
  };

  const createGeneral = async () => {
    setLoading(true);
    try {
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to create general instruction");
      console.log(error, "_error_");
    } finally {
      setLoading(false);
    }
  };

  const updateGeneral = async () => {
    try {
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to update general instruction");
      console.log(error, "_error_");
    }
  };

  const deleteGeneral = async (id) => {
    try {
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to delete general instruction");
      console.log(error, "_error_");
    }
  };

  useEffect(() => {
    readGeneral();
  }, []);

  return (
    <>
      {/* role */}
      {currentSegment === "generalInstruction" && (
        <div style={{ width: "100%", pt: "40px" }}>
          {addData ? (
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
                label={"General Instruction"}
                multiline
                rows={6}
                value={editingData?.details
                  ?.replace(/\\n\\n/g, "\n\n")
                  .replace(/\\n/g, "\n")}
                onChange={(e) => {
                  setEditingData({ ...editingData, details: e.target.value });
                }}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  className="!border !border-red-600 !bg-transparent w-fit"
                  onClick={() => {
                    setEditingData({});
                    setAddData(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  className="!border !border-green-500 !bg-green-500 w-fit"
                  onClick={() => {
                    createGeneral();
                  }}
                  disabled={loading}
                >
                  {loading ? <RotateRightIcon className="animate-spin" /> : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-end mt-4">
                <div
                  className="rounded border border-solid border-blue-600 hover:bg-blue-600 text-blue-600 hover:text-white cursor-pointer py-1 px-4 w-fit flex items-center gap-2"
                  onClick={() => setAddData(true)}
                >
                  <AddIcon className="!text-lg" />
                  Add
                </div>
              </div>
            </>
          )}
          <Dialog open={deleteId?.id} onClose={() => setDeleteId({})}>
            <DialogTitle>Delete Confirmation</DialogTitle>
            <DialogContent>
              Are you sure you want to delete <b>{deleteId?.name}</b> prompt?
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                className="!border !border-green-600 !text-green-600 !bg-transparent w-fit"
                onClick={() => setDeleteId({})}
              >
                Close
              </Button>
              <Button
                variant="contained"
                className="!bg-red-600 !text-white w-fit"
                onClick={() => deleteGeneral(deleteId?.id)}
                autoFocus
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default GeneralInstruction;
