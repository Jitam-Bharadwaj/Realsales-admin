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
import React, { useEffect, useState, useRef } from "react";
import { axioInstance } from "../api/axios/axios";
import { endpoints } from "../api/endpoints/endpoints";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import AddIcon from "@mui/icons-material/Add";
import NotFoundImage from "../../public/404_Image.png";
import { showToast } from "../toastConfig";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

const Role = ({ currentSegment }) => {
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
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [validationError, setValidationError] = useState({});
  const [loading, setLoading] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const textFieldRef = useRef(null);
  const [showMore, setShowMore] = useState(false);

  const readRole = async () => {
    setLoadingRoles(true);
    try {
      let data = await axioInstance.get(endpoints.ai.ai_roles);
      if (data?.data?.length) {
        setRoles(data?.data);
      } else {
        setRoles([]);
      }
    } catch (error) {
      setRoles([]);
      console.log(error, "_error_");
    } finally {
      setLoadingRoles(false);
    }
  };

  const createRole = async () => {
    setLoading(true);
    try {
      let data = await axioInstance.post(endpoints.ai.ai_roles, {
        name: editingData?.name,
        description: convertNewlines(editingData?.description),
      });
      if (data?.data?.ai_role_id) {
        readRole();
        setEditingData({});
        setAddData(false);
        showToast.success("Role created successfully");
      }
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to create role"
      );
      console.log(error, "_error_");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async () => {
    setLoading(true);
    try {
      let data = await axioInstance.put(
        `${endpoints.ai.ai_roles}${editingData?.id}`,
        {
          name: editingData?.name,
          description: convertNewlines(editingData?.description),
        }
      );
      if (data?.data?.ai_role_id) {
        readRole();
        setEditingData({});
        setAddData(false);
        showToast.success("Role updated successfully");
      }
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to update role"
      );
      console.log(error, "_error_");
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id) => {
    try {
      let data = await axioInstance.delete(`${endpoints.ai.ai_roles}${id}`);
      if (data?.status === 204) {
        readRole();
        setDeleteId({});
        showToast.success("Role deleted successfully");
      }
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to delete role"
      );
      console.log(error, "_error_");
    }
  };

  const validateRole = (data) => {
    const errors = {};
    if (!data?.name) errors.name = "Name is required";
    if (!data?.description) errors.description = "Prompt Template is required";
    return errors;
  };

  console.log(deleteId, "__industries_");
  useEffect(() => {
    readRole();
  }, []);

  return (
    <>
      {/* role */}
      {currentSegment === "role" && (
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
              <div className="relative w-full">
                <TextField
                  fullWidth
                  margin="normal"
                  label={"Prompt Template"}
                  multiline
                  rows={showMore ? null : 6}
                  inputRef={textFieldRef}
                  value={editingData?.description
                    ?.replace(/\\n\\n/g, "\n\n")
                    .replace(/\\n/g, "\n")}
                  onKeyDown={(e) => {
                    const textarea = e.target;
                    const cursorPosition = textarea.selectionStart;
                    const scrollTop = textarea.scrollTop;
                    
                    requestAnimationFrame(() => {
                      textarea.selectionStart = cursorPosition;
                      textarea.selectionEnd = cursorPosition;
                      textarea.scrollTop = scrollTop;
                    });
                  }}
                  onChange={(e) => {
                    const textarea = e.target;
                    const cursorPosition = textarea.selectionStart;
                    const scrollTop = textarea.scrollTop;
                    
                    setEditingData({
                      ...editingData,
                      description: e.target.value.replace(/"/g, "'"),
                    });
                    if (validationError.description)
                      setValidationError((prev) => ({
                        ...prev,
                        description: undefined,
                      }));
                    
                    requestAnimationFrame(() => {
                      textarea.selectionStart = cursorPosition;
                      textarea.selectionEnd = cursorPosition;
                      textarea.scrollTop = scrollTop;
                    });
                  }}
                  error={!!validationError.description}
                  helperText={validationError.description}
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  className="!border !border-red-600 !bg-transparent w-fit"
                  onClick={() => {
                    setEditingData({});
                    setAddData(false);
                    setShowMore(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  className="!border !border-green-500 !bg-green-500 w-fit"
                  onClick={() => {
                    const errors = validateRole(editingData);
                    if (Object.keys(errors).length > 0) {
                      setValidationError(errors);
                      return;
                    }
                    setValidationError({});
                    if (editingData?.id) {
                      updateRole();
                    } else {
                      createRole();
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
                    <TableCell
                      sx={{ textAlign: "left" }}
                      className="!font-bold capitalize"
                    >
                      name
                    </TableCell>
                    <TableCell
                      sx={{ textAlign: "right" }}
                      className="!font-bold capitalize"
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingRoles ? (
                    <TableRow>
                      <TableCell colSpan={2} className="w-full">
                        <div className="flex items-center justify-center h-60">
                          <RotateRightIcon className="animate-spin !text-5xl" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : roles?.length ? (
                    roles.map((v, i) => (
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
                                  description: v?.description,
                                  id: v?.ai_role_id,
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
                                  id: v?.ai_role_id,
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
                            Oops... data not found
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
              Are you sure you want to delete <b>{deleteId?.name}</b> report?
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
                onClick={() => deleteRole(deleteId?.id)}
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

export default Role;
