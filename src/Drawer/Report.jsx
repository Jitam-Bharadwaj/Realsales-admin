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

const Report = ({ currentSegment }) => {
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
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [validationError, setValidationError] = useState({});
  const [loading, setLoading] = useState(false);
  const [mods, setMods] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const textFieldRef = useRef(null);
  const [showMore, setShowMore] = useState(false);

  const readMods = async () => {
    try {
      let data = await axioInstance.get(endpoints.mods.interaction_modes);
      if (data?.data.length) {
        setMods(data?.data);
      }
    } catch (error) {
      console.log(error, "_error_");
    }
  };

  const readReport = async () => {
    setLoadingReports(true);
    try {
      let data = await axioInstance.get(endpoints.report.modeReport);
      if (data?.data?.length) {
        setReports(data?.data);
      } else {
        setReports([]);
      }
    } catch (error) {
      setReports([]);
      console.log(error, "_error_");
    } finally {
      setLoadingReports(false);
    }
  };

  const createReports = async () => {
    setLoading(true);
    try {
      let data = await axioInstance.post(endpoints.report.modeReport, {
        mode_id: editingData?.mode_id,
        prompt_template: convertNewlines(editingData?.prompt_template),
      });
      if (data?.data?.report_detail_id) {
        readReport();
        setEditingData({});
        setAddData(false);
        showToast.success("Report created successfully");
      }
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to create report"
      );
      console.log(error, "_error_");
    } finally {
      setLoading(false);
    }
  };

  const updateReports = async () => {
    setLoading(true);
    try {
      let data = await axioInstance.put(
        `${endpoints.report.modeReport}${editingData?.id}`,
        {
          mode_id: editingData?.mode_id,
          prompt_template: convertNewlines(editingData?.prompt_template),
        }
      );
      if (data?.data?.report_detail_id) {
        readReport();
        setEditingData({});
        setAddData(false);
        showToast.success("Report updated successfully");
      }
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to update report"
      );
      console.log(error, "_error_");
    } finally {
      setLoading(false);
    }
  };

  const deleteReports = async (id) => {
    try {
      let data = await axioInstance.delete(
        `${endpoints.report.modeReport}${id}`
      );
      if (data?.status === 204) {
        readReport();
        setDeleteId({});
        showToast.success("Report deleted successfully");
      }
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to delete report"
      );
      console.log(error, "_error_");
    }
  };

  const validateReports = (data) => {
    const errors = {};
    if (!data?.mode_id) errors.mode_id = "Name is required";
    if (!data?.prompt_template)
      errors.prompt_template = "Prompt Template is required";
    return errors;
  };

  useEffect(() => {
    readReport();
    readMods();
  }, []);

  return (
    <>
      {/* report */}
      {currentSegment === "report" && (
        <div style={{ width: "100%", pt: "40px" }}>
          {addData ? (
            <div className="flex flex-col items-end ">
              {!editingData?.id && (
                <div className="border rounded border-solid w-full flex flex-col">
                  {mods?.length
                    ? mods.map((v, i) => {
                        // Check if mode_id is already used in reports (except when editing that report)
                        const isUsed = reports.some(
                          (r) =>
                            r.mode_id === v.mode_id &&
                            (!editingData?.id ||
                              editingData?.mode_id !== v.mode_id)
                        );
                        return (
                          <div
                            key={i}
                            className={`p-3 border-b border-solid flex items-center gap-2 capitalize ${isUsed ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            onClick={() => {
                              if (isUsed) return; // Prevent selection if disabled
                              setEditingData((pre) => ({
                                ...pre,
                                mode_id: v?.mode_id,
                              }));
                            }}
                            style={isUsed ? { pointerEvents: "none" } : {}}
                          >
                            <div
                              className={`rounded-full w-4 h-4 ${editingData?.mode_id === v?.mode_id ? "border-2 border-solid border-[#fbd255] bg-[#fbd255]" : "border-2 border-solid border-[#fbd255]"}`}
                            />
                            {v?.name?.replace(/_/g, " ")}
                          </div>
                        );
                      })
                    : null}
                </div>
              )}
              <div className="relative w-full">
                <TextField
                  fullWidth
                  margin="normal"
                  label={"Prompt Template"}
                  multiline
                  rows={showMore ? null : 6}
                  inputRef={textFieldRef}
                  value={editingData?.prompt_template
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
                      prompt_template: e.target.value.replace(/"/g, "'"),
                    });
                    if (validationError.prompt_template)
                      setValidationError((prev) => ({
                        ...prev,
                        prompt_template: undefined,
                      }));
                    
                    requestAnimationFrame(() => {
                      textarea.selectionStart = cursorPosition;
                      textarea.selectionEnd = cursorPosition;
                      textarea.scrollTop = scrollTop;
                    });
                  }}
                  error={!!validationError.prompt_template}
                  helperText={validationError.prompt_template}
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
                    const errors = validateReports(editingData);
                    if (Object.keys(errors).length > 0) {
                      setValidationError(errors);
                      return;
                    }
                    setValidationError({});
                    if (editingData?.id) {
                      updateReports();
                    } else {
                      createReports();
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
                  {loadingReports ? (
                    <TableRow>
                      <TableCell colSpan={2} className="w-full">
                        <div className="flex items-center justify-center h-60">
                          <RotateRightIcon className="animate-spin !text-5xl" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : reports?.length ? (
                    reports.map((v, i) => (
                      <TableRow key={i}>
                        <TableCell className="capitalize">
                          {mods?.length
                            ? mods
                                .filter((val) => val?.mode_id === v?.mode_id)
                                .map((value) => value?.name)
                            : null}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <div
                              className="rounded border border-solid border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white cursor-pointer py-1 px-4 w-fit"
                              onClick={() => {
                                setAddData(true);
                                setEditingData({
                                  mode_id: v?.mode_id,
                                  prompt_template: v?.prompt_template,
                                  id: v?.report_detail_id,
                                });
                              }}
                            >
                              <EditIcon className="!text-lg" />
                            </div>
                            <div
                              className="rounded border border-solid border-red-400 hover:bg-red-400 text-red-400 hover:text-white cursor-pointer py-1 px-4 w-fit"
                              onClick={() =>
                                setDeleteId({
                                  mode_id: v?.mode_id,
                                  id: v?.report_detail_id,
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

              {reports?.length < 3 && (
                <div className="flex items-center justify-end mt-4">
                  <div
                    className="rounded border border-solid border-blue-600 hover:bg-blue-600 text-blue-600 hover:text-white cursor-pointer py-1 px-4 w-fit flex items-center gap-2"
                    onClick={() => setAddData(true)}
                  >
                    <AddIcon className="!text-lg" />
                    Add
                  </div>
                </div>
              )}
            </>
          )}
          <Dialog open={deleteId?.id} onClose={() => setDeleteId({})}>
            <DialogTitle>Delete Confirmation</DialogTitle>
            <DialogContent>
              Are you sure you want to delete&nbsp;
              <b>
                {mods?.length
                  ? mods
                      .filter((val) => val?.mode_id === deleteId?.mode_id)
                      .map((value) => value?.name)
                  : null}
              </b>
              &nbsp;prompt?
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
                onClick={() => deleteReports(deleteId?.id)}
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

export default Report;
