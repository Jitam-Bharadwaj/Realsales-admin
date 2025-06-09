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
import NotFoundImage from "../../public/404_Image.png";

const Industry = ({ currentSegment }) => {
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
  const [industries, setIndustries] = useState([]);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [validationError, setValidationError] = useState({});
  const [loading, setLoading] = useState(false);

  const readIndustry = async () => {
    setLoadingIndustries(true);
    try {
      let data = await axioInstance.get(endpoints.ai.industries);
      if (data?.data?.length) {
        setIndustries(data?.data);
      } else {
        setIndustries([]);
      }
    } catch (error) {
      setIndustries([]);
      console.log(error, "_error_");
    } finally {
      setLoadingIndustries(false);
    }
  };

  const createIndustries = async () => {
    setLoading(true);
    try {
      let data = await axioInstance.post(endpoints.ai.industries, {
        name: editingData?.name,
        details: convertNewlines(editingData?.details),
      });
      if (data?.data?.industry_id) {
        readIndustry();
        setEditingData({});
        setAddData(false);
      }
    } catch (error) {
      console.log(error, "_error_");
    } finally {
      setLoading(false);
    }
  };

  const updateIndustries = async () => {
    setLoading(true);
    try {
      let data = await axioInstance.put(
        `${endpoints.ai.industries}${editingData?.id}`,
        {
          name: editingData?.name,
          details: convertNewlines(editingData?.details),
        }
      );
      if (data?.data?.industry_id) {
        readIndustry();
        setEditingData({});
        setAddData(false);
      }
    } catch (error) {
      console.log(error, "_error_");
    } finally {
      setLoading(false);
    }
  };

  const deleteIndustries = async (id) => {
    try {
      let data = await axioInstance.delete(`${endpoints.ai.industries}${id}`);
      if (data?.status === 204) {
        readIndustry();
        setDeleteId({});
      }
    } catch (error) {
      console.log(error, "_error_");
    }
  };

  const validateIndustry = (data) => {
    const errors = {};
    if (!data?.name) errors.name = "Name is required";
    if (!data?.details) errors.details = "Prompt Template is required";
    return errors;
  };

  console.log(deleteId, "__industries_");
  useEffect(() => {
    readIndustry();
  }, []);

  return (
    <>
      {/* industry */}
      {currentSegment === "industry" && (
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
                label={"Name"}
                value={editingData?.name}
                onChange={(e) => {
                  setEditingData({ ...editingData, name: e.target.value });
                  if (validationError.name)
                    setValidationError((prev) => ({
                      ...prev,
                      name: undefined,
                    }));
                }}
                error={!!validationError.name}
                helperText={validationError.name}
              />
              <TextField
                fullWidth
                margin="normal"
                label={"Prompt Template"}
                multiline
                rows={6}
                value={editingData?.details
                  ?.replace(/\\n\\n/g, "\n\n")
                  .replace(/\\n/g, "\n")}
                onChange={(e) => {
                  setEditingData({ ...editingData, details: e.target.value });
                  if (validationError.details)
                    setValidationError((prev) => ({
                      ...prev,
                      details: undefined,
                    }));
                }}
                error={!!validationError.details}
                helperText={validationError.details}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  className="!border !border-red-600 !bg-transparent w-fit"
                  onClick={() => {
                    setEditingData({});
                    setAddData(false);
                    setValidationError({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  className="!border !border-green-500 !bg-green-500 w-fit"
                  onClick={() => {
                    const errors = validateIndustry(editingData);
                    if (Object.keys(errors).length > 0) {
                      setValidationError(errors);
                      return;
                    }
                    setValidationError({});
                    if (editingData?.id) {
                      updateIndustries();
                    } else {
                      createIndustries();
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <RotateRightIcon className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ textAlign: "left" }}>name</TableCell>
                    <TableCell sx={{ textAlign: "right" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingIndustries ? (
                    <TableRow>
                      <TableCell colSpan={2} className="w-full">
                        <div className="flex items-center justify-center h-60">
                          <RotateRightIcon className="animate-spin !text-5xl" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : industries?.length ? (
                    industries.map((v, i) => (
                      <TableRow key={i}>
                        <TableCell className="capitalize">
                          {v?.name.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <div
                              className="rounded border border-solid border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white cursor-pointer py-1 px-4 w-fit"
                              onClick={() => {
                                setAddData(true);
                                setEditingData({
                                  name: v?.name,
                                  details: v?.details,
                                  id: v?.industry_id,
                                });
                              }}
                            >
                              <EditIcon className="!text-lg" />
                            </div>
                            <div
                              className="rounded border border-solid border-red-400 hover:bg-red-400 text-red-400 hover:text-white cursor-pointer py-1 px-4 w-fit"
                              onClick={() =>
                                setDeleteId({
                                  name: v?.name,
                                  id: v?.industry_id,
                                })
                              }
                            >
                              <DeleteIcon className="!text-lg" />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="w-full">
                        <div className="flex items-center justify-center h-60 relative">
                          <img
                            src={NotFoundImage}
                            alt="404"
                            className="w-auto h-full"
                          />
                          <p className="text-lg absolute bottom-[15%]">
                            Oops... page not found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

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
                onClick={() => deleteIndustries(deleteId?.id)}
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

export default Industry;
