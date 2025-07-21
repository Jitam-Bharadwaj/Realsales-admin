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
import { showToast } from "../toastConfig";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

const ModsFlo = ({ currentSegment }) => {
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

  const kewards = [
    { value: "{industry}" },
    { value: "{name}" },
    { value: "{plant_size_impact_details}" },
    // { value: "{experience_level}" },
    { value: "{industry_details}" },
    { value: "{manufacturing_model_details}" },
    { value: "{plant_size_impact}" },
    { value: "{role_details}" },
    { value: "{manufacturing_model}" },
    { value: "{role}" },
    { value: "{behavioral_detail}" },
    { value: "{company_size}" },
    { value: "{company_size_detail}" },
    { value: "{persona_products}" },
    { value: "{gender}" },
  ];

  const [mods, setMods] = useState([]);
  const [loadingMods, setLoadingMods] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [deleteId, setDeleteId] = useState({});
  const [addData, setAddData] = useState(false);
  const [createMode, setCreateMode] = useState({});
  const [validationError, setValidationError] = useState({});
  const [loading, setLoading] = useState(false);
  const [textFieldRef, setTextFieldRef] = useState(null);
  const [caretPos, setCaretPos] = useState(null);
  const DRAG_KEY = "keward-drag-value";
  const [createTextFieldRef, setCreateTextFieldRef] = useState(null);
  const [showMore, setShowMore] = useState(false);

  console.log(deleteId, "deleteId");

  const readAllMods = async () => {
    setLoadingMods(true);
    try {
      let data = await axioInstance.get(`${endpoints?.closing?.getClosing}/`);
      if (data?.data?.length) {
        setMods(data?.data);
      } else {
        setMods([]);
      }
    } catch (error) {
      setMods([]);
      console.log(error, "_error_");
    } finally {
      setLoadingMods(false);
    }
  };

  const createModsPrompt = async () => {
    setLoading(true);
    try {
      let data = await axioInstance.post(`${endpoints?.closing?.getClosing}/`, {
        name: createMode?.name,
        description: createMode?.description,
        prompt_template: convertNewlines(createMode?.prompt_template),
      });
      if (data?.data?.mode_id) {
        setCreateMode({});
        setAddData(false);
        readAllMods();
        showToast.success("Mode created successfully");
      }
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to create mode"
      );
      console.log(error, "_error_");
    } finally {
      setLoading(false);
    }
  };

  const updateMode = async () => {
    setLoading(true);
    try {
      let data = await axioInstance.put(
        `${endpoints?.closing?.getClosing}/${editingData?.id}`,
        {
          mode_id: editingData?.id,
          prompt_template: convertNewlines(editingData?.prompt_template),
        }
      );
      if (data?.data) {
        if (data?.data?.mode_id) {
          setEditingData({});
          readAllMods();
          showToast.success("Mode updated successfully");
        }
      }
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to update mode"
      );
      console.log(error, "_error_");
    } finally {
      setLoading(false);
    }
  };

  const deleteMode = async (id) => {
    try {
      let data = await axioInstance.delete(
        `${endpoints?.closing?.getClosing}/${id}`
      );
      setDeleteId({});
      readAllMods();
      showToast.success("Mode deleted successfully");
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to delete mode"
      );
      console.log(error, "_error_");
    }
  };

  const validateMods = (data) => {
    const errors = {};
    if (!data?.name) errors.name = "Name is required";
    if (!data?.description) errors.description = "Description is required";
    if (!data?.prompt_template)
      errors.prompt_template = "Prompt Template is required";
    return errors;
  };

  // Helper to insert text at caret
  const insertAtCaret = (text, value, setValue) => {
    if (textFieldRef) {
      const start = textFieldRef.selectionStart;
      const end = textFieldRef.selectionEnd;
      const newValue = text.slice(0, start) + value + text.slice(end);
      // Save scroll position
      const scrollTop = textFieldRef.scrollTop;
      setValue(newValue);
      // Move caret after inserted keward and restore scroll
      setTimeout(() => {
        textFieldRef.focus();
        textFieldRef.setSelectionRange(
          start + value.length,
          start + value.length
        );
        textFieldRef.scrollTop = scrollTop;
      }, 0);
    } else {
      setValue(text + value);
    }
  };

  // Helper to insert text at caret for create mode
  const insertAtCaretCreate = (text, value, setValue) => {
    if (createTextFieldRef) {
      const start = createTextFieldRef.selectionStart;
      const end = createTextFieldRef.selectionEnd;
      const newValue = text.slice(0, start) + value + text.slice(end);
      // Save scroll position
      const scrollTop = createTextFieldRef.scrollTop;
      setValue(newValue);
      setTimeout(() => {
        createTextFieldRef.focus();
        createTextFieldRef.setSelectionRange(
          start + value.length,
          start + value.length
        );
        createTextFieldRef.scrollTop = scrollTop;
      }, 0);
    } else {
      setValue(text + value);
    }
  };

  const allKeywordsPresent = (template) => {
    if (!template) return false;
    return kewards.every((kw) => template.includes(kw.value));
  };

  const hasInvalidKeywords = (template) => {
    if (!template) return false;
    const regex = /{[^}]+}/g;
    const matches = template.match(regex) || [];
    const invalidKeywords = matches.filter(
      (match) => !kewards.some((kw) => kw.value === match)
    );
    return {
      hasInvalid: invalidKeywords.length > 0,
      invalidKeywords,
    };
  };

  const hasDuplicateKeywords = (template) => {
    if (!template) return { hasDuplicate: false, duplicateKeywords: [] };
    const regex = /{[^}]+}/g;
    const matches = template.match(regex) || [];
    const seen = new Set();
    const duplicates = [];
    matches.forEach((match) => {
      if (seen.has(match)) {
        duplicates.push(match);
      } else {
        seen.add(match);
      }
    });
    return {
      hasDuplicate: duplicates.length > 0,
      duplicateKeywords: [...new Set(duplicates)],
    };
  };

  useEffect(() => {
    readAllMods();
  }, []);

  return (
    <>
      {/* modeMgmt */}
      {currentSegment === "modeMgmt" && (
        <div style={{ width: "100%", pt: "40px" }}>
          {!editingData?.id ? (
            <>
              {!addData ? (
                <>
                  <Table className="border-t border-solid border-[#515151]">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ textAlign: "left", width: "20%" }}
                          className="!font-bold capitalize"
                        >
                          Name
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "left", width: "60%" }}
                          className="!font-bold capitalize"
                        >
                          Description
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
                      {loadingMods ? (
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell colSpan={2} className="w-full">
                            <div className="flex items-center justify-center h-60">
                              <RotateRightIcon className="animate-spin !text-5xl" />
                            </div>
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ) : mods?.length ? (
                        mods?.map((v, i) => (
                          <TableRow key={i}>
                            <TableCell
                              sx={{ textAlign: "left" }}
                              className="capitalize"
                            >
                              {v?.name ? v?.name : "--"}
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                              {v?.description
                                ? v?.description.slice(0, 100)
                                : "--"}
                              {v?.description?.length > 100 ? "..." : null}
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "right",
                                textDecoration: "underline",
                                fontWeight: "bold",
                              }}
                            >
                              <div className="flex items-center justify-end gap-2">
                                <div
                                  className="rounded border border-solid border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white cursor-pointer py-1 px-4 w-fit"
                                  onClick={() =>
                                    setEditingData({
                                      prompt_template: v?.prompt_template,
                                      id: v?.mode_id,
                                    })
                                  }
                                >
                                  <EditIcon className="!text-lg" />
                                </div>
                                <div
                                  className="rounded border border-solid border-red-400 hover:bg-red-400 text-red-400 hover:text-white cursor-pointer py-1 px-4 w-fit"
                                  onClick={() =>
                                    setDeleteId({
                                      name: v?.name,
                                      id: v?.mode_id,
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
                          <TableCell></TableCell>
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
                          <TableCell></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {mods?.length < 3 && (
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
              ) : (
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
                    value={createMode?.name}
                    onChange={(e) => {
                      setCreateMode({ ...createMode, name: e.target.value });
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
                    label={"Description"}
                    multiline
                    rows={3}
                    value={createMode?.description
                      ?.replace(/\\n\\n/g, "\n\n")
                      .replace(/\\n/g, "\n")}
                    onChange={(e) => {
                      setCreateMode({
                        ...createMode,
                        description: e.target.value,
                      });
                      if (validationError.description)
                        setValidationError((prev) => ({
                          ...prev,
                          description: undefined,
                        }));
                    }}
                    error={!!validationError.description}
                    helperText={validationError.description}
                  />
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      const keward = e.dataTransfer.getData(DRAG_KEY);
                      if (keward) {
                        insertAtCaretCreate(
                          createMode.prompt_template
                            ?.replace(/\\n\\n/g, "\n\n")
                            .replace(/\\n/g, "\n") || "",
                          keward,
                          (val) =>
                            setCreateMode({
                              ...createMode,
                              prompt_template: val,
                            })
                        );
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    style={{ width: "100%" }}
                    className="relative"
                  >
                    <TextField
                      fullWidth
                      margin="normal"
                      label={"Prompt Template"}
                      multiline
                      rows={showMore ? null : 6}
                      value={createMode?.prompt_template
                        ?.replace(/\\n\\n/g, "\n\n")
                        .replace(/\\n/g, "\n")}
                      inputRef={(ref) => setCreateTextFieldRef(ref)}
                      onClick={(e) => setCaretPos(e.target.selectionStart)}
                      onKeyUp={(e) => setCaretPos(e.target.selectionStart)}
                      onChange={(e) => {
                        const scrollTop = createTextFieldRef?.scrollTop;
                        const selectionStart =
                          createTextFieldRef?.selectionStart;
                        const selectionEnd = createTextFieldRef?.selectionEnd;
                        setCreateMode({
                          ...createMode,
                          prompt_template: e.target.value.replace(/"/g, "'"),
                        });
                        if (validationError.prompt_template)
                          setValidationError((prev) => ({
                            ...prev,
                            prompt_template: undefined,
                          }));
                        requestAnimationFrame(() => {
                          if (createTextFieldRef) {
                            createTextFieldRef.scrollTop = scrollTop;
                            createTextFieldRef.setSelectionRange(
                              selectionStart,
                              selectionEnd
                            );
                          }
                        });
                      }}
                      error={
                        !!validationError.prompt_template ||
                        (!allKeywordsPresent(createMode?.prompt_template) &&
                          !!createMode?.prompt_template) ||
                        hasInvalidKeywords(createMode?.prompt_template)
                          .hasInvalid ||
                        hasDuplicateKeywords(createMode?.prompt_template)
                          .hasDuplicate
                      }
                      helperText={
                        validationError.prompt_template
                          ? validationError.prompt_template
                          : hasInvalidKeywords(createMode?.prompt_template)
                                .hasInvalid
                            ? `Invalid keywords detected: ${hasInvalidKeywords(createMode?.prompt_template).invalidKeywords.join(", ")}. Please use only the provided keywords.`
                            : hasDuplicateKeywords(createMode?.prompt_template)
                                  .hasDuplicate
                              ? `Duplicate keywords detected: ${hasDuplicateKeywords(createMode?.prompt_template).duplicateKeywords.join(", ")}. Each keyword can only be used once.`
                              : !allKeywordsPresent(
                                    createMode?.prompt_template
                                  ) && !!createMode?.prompt_template
                                ? `Missing keywords: ${kewards
                                    .filter(
                                      (kw) =>
                                        !(
                                          createMode?.prompt_template || ""
                                        ).includes(kw.value)
                                    )
                                    .map((kw) => kw.value)
                                    .join(", ")}`
                                : ""
                      }
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
                  <div className="flex gap-3 flex-wrap mt-2">
                    {kewards?.length
                      ? kewards.map((v, i) => {
                          const isDisabled = (
                            createMode?.prompt_template || ""
                          ).includes(v.value);
                          return (
                            <div
                              className={`px-2 py-1 border border-solid border-[#d7a100] rounded ${isDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "cursor-pointer text-[#d7a100]"}`}
                              key={i}
                              draggable={!isDisabled}
                              onDragStart={
                                isDisabled
                                  ? undefined
                                  : (e) => {
                                      e.dataTransfer.setData(DRAG_KEY, v.value);
                                    }
                              }
                              title={
                                isDisabled ? "Already used" : "Drag to insert"
                              }
                              style={
                                isDisabled
                                  ? { pointerEvents: "none", opacity: 0.5 }
                                  : {}
                              }
                            >
                              {v?.value}
                            </div>
                          );
                        })
                      : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outlined"
                      className="!border !border-red-600 !bg-transparent w-fit"
                      onClick={() => {
                        setCreateMode({});
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
                        const errors = validateMods(createMode);
                        if (Object.keys(errors).length > 0) {
                          setValidationError(errors);
                          return;
                        }
                        setValidationError({});
                        createModsPrompt();
                      }}
                      disabled={
                        loading ||
                        !allKeywordsPresent(createMode?.prompt_template) ||
                        hasDuplicateKeywords(createMode?.prompt_template)
                          .hasDuplicate
                      }
                    >
                      {loading ? (
                        <RotateRightIcon className="animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2 items-end">
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  const keward = e.dataTransfer.getData(DRAG_KEY);
                  if (keward) {
                    insertAtCaret(
                      editingData.prompt_template
                        ?.replace(/\\n\\n/g, "\n\n")
                        .replace(/\\n/g, "\n") || "",
                      keward,
                      (val) =>
                        setEditingData({ ...editingData, prompt_template: val })
                    );
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                style={{ width: "100%" }}
                className="relative"
              >
                <TextField
                  fullWidth
                  margin="normal"
                  label={
                    editingData.type?.includes("industry")
                      ? "Details"
                      : "Prompt Template"
                  }
                  multiline
                  rows={showMore ? null : 12}
                  value={editingData.prompt_template
                    ?.replace(/\\n\\n/g, "\n\n")
                    .replace(/\\n/g, "\n")}
                  inputRef={(ref) => setTextFieldRef(ref)}
                  onClick={(e) => setCaretPos(e.target.selectionStart)}
                  onKeyUp={(e) => setCaretPos(e.target.selectionStart)}
                  onChange={(e) => {
                    const scrollTop = textFieldRef?.scrollTop;
                    const selectionStart = textFieldRef?.selectionStart;
                    const selectionEnd = textFieldRef?.selectionEnd;
                    setEditingData({
                      ...editingData,
                      prompt_template: e.target.value.replace(/"/g, "'"),
                    });
                    requestAnimationFrame(() => {
                      if (textFieldRef) {
                        textFieldRef.scrollTop = scrollTop;
                        textFieldRef.setSelectionRange(
                          selectionStart,
                          selectionEnd
                        );
                      }
                    });
                  }}
                  error={
                    (!allKeywordsPresent(editingData?.prompt_template) &&
                      !!editingData?.prompt_template) ||
                    hasInvalidKeywords(editingData?.prompt_template)
                      .hasInvalid ||
                    hasDuplicateKeywords(editingData?.prompt_template)
                      .hasDuplicate
                  }
                  helperText={
                    hasInvalidKeywords(editingData?.prompt_template).hasInvalid
                      ? `Invalid keywords detected: ${hasInvalidKeywords(editingData?.prompt_template).invalidKeywords.join(", ")}. Please use only the provided keywords.`
                      : hasDuplicateKeywords(editingData?.prompt_template)
                            .hasDuplicate
                        ? `Duplicate keywords detected: ${hasDuplicateKeywords(editingData?.prompt_template).duplicateKeywords.join(", ")}. Each keyword can only be used once.`
                        : !allKeywordsPresent(editingData?.prompt_template) &&
                            !!editingData?.prompt_template
                          ? `Missing keywords: ${kewards
                              .filter(
                                (kw) =>
                                  !(
                                    editingData?.prompt_template || ""
                                  ).includes(kw.value)
                              )
                              .map((kw) => kw.value)
                              .join(", ")}`
                          : ""
                  }
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
              <div className="flex gap-3 flex-wrap">
                {kewards?.length
                  ? kewards.map((v, i) => {
                      const isDisabled = (
                        editingData?.prompt_template || ""
                      ).includes(v.value);
                      return (
                        <div
                          className={`px-2 py-1 border border-solid border-[#d7a100] rounded ${isDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "cursor-pointer text-[#d7a100]"}`}
                          key={i}
                          draggable={!isDisabled}
                          onDragStart={
                            isDisabled
                              ? undefined
                              : (e) => {
                                  e.dataTransfer.setData(DRAG_KEY, v.value);
                                }
                          }
                          title={isDisabled ? "Already used" : "Drag to insert"}
                          style={
                            isDisabled
                              ? { pointerEvents: "none", opacity: 0.5 }
                              : {}
                          }
                        >
                          {v?.value}
                        </div>
                      );
                    })
                  : null}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  className="!border !border-red-600 !bg-transparent w-fit"
                  onClick={() => {
                    setEditingData({});
                    setValidationError({});
                  }}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  className="!bg-green-600 !text-white w-fit"
                  onClick={() => updateMode()}
                  disabled={
                    loading ||
                    !allKeywordsPresent(editingData?.prompt_template) ||
                    hasDuplicateKeywords(editingData?.prompt_template)
                      .hasDuplicate
                  }
                >
                  {loading ? (
                    <RotateRightIcon className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
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
                onClick={() => deleteMode(deleteId?.id)}
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

export default ModsFlo;
