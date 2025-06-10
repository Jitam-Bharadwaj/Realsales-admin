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
  Chip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { axioInstance } from "../api/axios/axios";
import { endpoints } from "../api/endpoints/endpoints";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useDropzone } from "react-dropzone";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import NotFoundImage from "../../public/404_Image.png";
import { showToast } from "../toastConfig";

const geography = [{ name: "us", value: "us" }];

const Persona = ({ currentSegment }) => {
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

  const [addPersona, setAddPersona] = useState(false);
  const [persona, setPersona] = useState({});
  const [loadingPersona, setLoadingPersona] = useState(false);
  const [deleteId, setDeleteId] = useState({});
  const [personaId, setPersonaId] = useState("");
  const [personaData, setPersonaData] = useState([]);
  const [industriesData, setIndustriesData] = useState([]);
  const [plant_size_impactsData, setPlant_size_impactsData] = useState([]);
  const [ai_rolesData, setAi_rolesData] = useState([]);
  const [manufacturing_modelsData, setManufacturing_modelsData] = useState([]);
  const [aiLists, setAiLists] = useState({
    industry: true,
    plantSize: true,
    Roles: true,
    manufacturing: true,
    geography: true,
  });
  const [validationError, setValidationError] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  // const [uploadSuccess, setUploadSuccess] = useState(false);

  console.log(persona, personaId, "persona__");

  const uploadInterviewBehavior = async (file) => {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      let data = await axioInstance.post(
        endpoints.persona.interview_behavior,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (data?.data?.persona) {
        setSelectedFile(null);
        if (validationError.behavioral_detail)
          setValidationError((prev) => ({
            ...prev,
            behavioral_detail: undefined,
          }));
        setPersona({ ...persona, behavioral_detail: data?.data?.persona });
      }
    } catch (error) {
      setUploadError("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      uploadInterviewBehavior(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      // "application/pdf": [".pdf"],
      // "text/plain": [".txt"],
      "application/msword": [".doc", ".docx"],
    },
  });

  const readPersona = async (control) => {
    setLoadingPersona(true);
    try {
      if (control === "table") {
        let data = await axioInstance.get(endpoints.persona.persona);
        if (data?.data?.length > 0) {
          setPersonaData(data?.data);
          setLoadingPersona(false);
        } else {
          setPersonaData([]);
        }
      } else {
        let data = await axioInstance.get(endpoints.persona.persona);
        if (data?.data?.length > 0) {
          setPersonaData(data?.data);
          setLoadingPersona(false);
        } else {
          setPersonaData([]);
        }

        let industriData = await axioInstance.get(endpoints.ai.industries);
        if (industriData?.data?.length > 0) {
          setIndustriesData(industriData?.data);
        } else {
          setIndustriesData([]);
        }

        let plant_size_impactData = await axioInstance.get(
          endpoints.ai.plant_size_impacts
        );
        if (plant_size_impactData?.data?.length > 0) {
          setPlant_size_impactsData(plant_size_impactData?.data);
        } else {
          setPlant_size_impactsData([]);
        }

        let aIrolesData = await axioInstance.get(endpoints.ai.ai_roles);
        if (aIrolesData?.data?.length > 0) {
          setAi_rolesData(aIrolesData?.data);
        } else {
          setAi_rolesData([]);
        }

        let manufacturingModelsData = await axioInstance.get(
          endpoints.ai.manufacturing_models
        );
        if (manufacturingModelsData?.data?.length > 0) {
          setManufacturing_modelsData(manufacturingModelsData?.data);
        } else {
          setManufacturing_modelsData([]);
        }
      }
    } catch (error) {
      console.log(error, "_error_");
    } finally {
      setLoadingPersona(false);
    }
  };

  const createPersona = async () => {
    setLoading(true);
    try {
      let data = await axioInstance.post(endpoints.persona.persona, {
        ...persona,
      });
      if (data?.data?.persona_id) {
        readPersona("table");
        setAddPersona(false);
        setPersona({});
        setPersonaId("");
        setAiLists({
          industry: true,
          plantSize: true,
          Roles: true,
          manufacturing: true,
          geography: true,
        });
        showToast.success("Persona created successfully");
      }
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to create persona"
      );
      console.log(error, "_error_");
    } finally {
      setLoading(false);
    }
  };

  const updatePersona = async (id) => {
    setLoading(true);
    try {
      let data = await axioInstance.put(`${endpoints.persona.persona}${id}`, {
        ...persona,
      });
      if (data?.data?.persona_id) {
        readPersona("table");
        setAddPersona(false);
        setPersona({});
        setPersonaId("");
        setAiLists({
          industry: true,
          plantSize: true,
          Roles: true,
          manufacturing: true,
          geography: true,
        });
        showToast.success("Persona updated successfully");
      }
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to update persona"
      );
      console.log(error, "_error_");
    } finally {
      setLoading(false);
    }
  };

  const deletePersona = async (id) => {
    try {
      let data = await axioInstance.delete(`${endpoints.persona.persona}${id}`);
      if (data?.status === 204) {
        readPersona("table");
        setDeleteId({});
        showToast.success("Persona deleted successfully");
      }
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Failed to delete persona"
      );
      console.log(error, "_error_");
    }
  };

  const validatePersona = () => {
    const errors = {};
    if (!persona?.name) errors.name = "Name is required";
    if (!persona?.behavioral_detail)
      errors.behavioral_detail = "Summary is required";
    if (!persona?.industry_id) errors.industry_id = "Industry is required";
    if (!persona?.plant_size_impact_id)
      errors.plant_size_impact_id = "Plant Size is required";
    if (!persona?.ai_role_id) errors.ai_role_id = "Role is required";
    if (!persona?.manufacturing_model_id)
      errors.manufacturing_model_id = "Manufacturing Model is required";
    if (!persona?.geography) errors.geography = "Geography is required";
    return errors;
  };

  console.log(persona, "_personaData_");
  useEffect(() => {
    readPersona();
  }, []);

  return (
    <>
      {currentSegment === "createPersona" && (
        <div style={{ width: "100%", pt: "40px" }}>
          {addPersona && (
            <div className="flex flex-col gap-4 my-4">
              <TextField
                fullWidth
                className="!m-0"
                margin="normal"
                label={"Name"}
                value={persona?.name}
                onChange={(e) => {
                  setPersona({ ...persona, name: e.target.value });
                  if (validationError.name)
                    setValidationError((prev) => ({
                      ...prev,
                      name: undefined,
                    }));
                }}
                error={!!validationError.name}
                helperText={validationError.name}
              />

              {persona?.behavioral_detail ? (
                <TextField
                  fullWidth
                  className="!m-0"
                  margin="normal"
                  label={"Summary"}
                  multiline
                  rows={8}
                  value={persona?.behavioral_detail
                    ?.replace(/\\n\\n/g, "\n\n")
                    .replace(/\\n/g, "\n")}
                  onChange={(e) => {
                    setPersona({
                      ...persona,
                      behavioral_detail: e.target.value,
                    });
                    if (validationError.behavioral_detail)
                      setValidationError((prev) => ({
                        ...prev,
                        behavioral_detail: undefined,
                      }));
                  }}
                  error={!!validationError.behavioral_detail}
                  helperText={validationError.behavioral_detail}
                />
              ) : (
                <div className="flex flex-col gap-2 items-start w-full">
                  <p>Summary</p>
                  <div
                    {...getRootProps()}
                    className={`w-full flex flex-col items-center border border-dashed rounded p-4 ${uploading ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {uploading ? null : <input {...getInputProps()} />}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <CloudUploadIcon style={{ fontSize: 24 }} />
                      {isDragActive ? (
                        <p>Drop the files here ...</p>
                      ) : (
                        <p>Drag & drop a file here, or click to select file</p>
                      )}
                    </div>
                    {selectedFile && (
                      <div style={{ marginTop: 8, color: "#1976d2" }}>
                        Selected: {selectedFile.name}
                      </div>
                    )}
                    {uploading && (
                      <div style={{ color: "#1976d2", marginTop: 4 }}>
                        Uploading...
                      </div>
                    )}
                    {/* {uploadSuccess && (
                    <div style={{ color: "green", marginTop: 4 }}>
                      Upload successful!
                    </div>
                  )} */}
                    {uploadError && (
                      <div style={{ color: "red", marginTop: 4 }}>
                        {uploadError}
                      </div>
                    )}
                  </div>
                  {validationError.behavioral_detail && (
                    <p
                      style={{
                        color: "red",
                        margin: "0 16px",
                        fontSize: "13px",
                      }}
                    >
                      {validationError.behavioral_detail}
                    </p>
                  )}
                </div>
              )}

              {/* Select Industry */}
              <div className="w-full flex flex-col items-start gap-2">
                <div className="w-full border border-solid rounded">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      setAiLists((pre) => ({
                        ...pre,
                        industry: !aiLists?.industry,
                      }));
                      if (validationError.industry_id)
                        setValidationError((prev) => ({
                          ...prev,
                          industry_id: undefined,
                        }));
                    }}
                  >
                    <p>Select Industry</p>
                    <KeyboardArrowDownIcon
                      className={`${aiLists?.industry ? "rotate-180" : "rotate-0"}`}
                    />
                  </div>
                  {aiLists?.industry && (
                    <>
                      <hr />
                      {industriesData?.length
                        ? industriesData.map((v, i) => (
                            <div
                              key={i}
                              className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer capitalize`}
                              onClick={() => {
                                setPersona((pre) => ({
                                  ...pre,
                                  industry_id: v?.industry_id,
                                }));
                                if (validationError.industry_id)
                                  setValidationError((prev) => ({
                                    ...prev,
                                    industry_id: undefined,
                                  }));
                              }}
                            >
                              <div
                                className={`rounded-full w-4 h-4 ${persona?.industry_id === v?.industry_id ? "border-2 border-solid border-[#fbd255] bg-[#fbd255]" : "border-2 border-solid border-[#fbd255]"}`}
                              />
                              {v?.name.replace(/_/g, " ")}
                            </div>
                          ))
                        : null}
                    </>
                  )}
                </div>
                {validationError.industry_id && (
                  <p
                    style={{ color: "red", margin: "0 16px", fontSize: "13px" }}
                  >
                    {validationError.industry_id}
                  </p>
                )}
              </div>

              {/* Select Plant Size */}
              <div className="w-full flex flex-col items-start gap-2">
                <div className="w-full border border-solid rounded">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      setAiLists((pre) => ({
                        ...pre,
                        plantSize: !aiLists?.plantSize,
                      }));
                      if (validationError.plant_size_impact_id)
                        setValidationError((prev) => ({
                          ...prev,
                          plant_size_impact_id: undefined,
                        }));
                    }}
                  >
                    <p>Select Plant Size</p>
                    <KeyboardArrowDownIcon
                      className={`${aiLists?.plantSize ? "rotate-180" : "rotate-0"}`}
                    />
                  </div>
                  {aiLists?.plantSize && (
                    <>
                      <hr />
                      {plant_size_impactsData?.length
                        ? plant_size_impactsData.map((v, i) => (
                            <div
                              key={i}
                              className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer capitalize`}
                              onClick={() => {
                                setPersona((pre) => ({
                                  ...pre,
                                  plant_size_impact_id: v?.plant_size_impact_id,
                                }));

                                if (validationError.plant_size_impact_id)
                                  setValidationError((prev) => ({
                                    ...prev,
                                    plant_size_impact_id: undefined,
                                  }));
                              }}
                            >
                              <div
                                className={`rounded-full w-4 h-4 ${persona?.plant_size_impact_id === v?.plant_size_impact_id ? "border-2 border-solid border-[#fbd255] bg-[#fbd255]" : "border-2 border-solid border-[#fbd255]"}`}
                              />
                              {v?.name.replace(/_/g, " ")}
                            </div>
                          ))
                        : null}
                    </>
                  )}
                </div>
                {validationError.plant_size_impact_id && (
                  <p
                    style={{ color: "red", margin: "0 16px", fontSize: "13px" }}
                  >
                    {validationError.plant_size_impact_id}
                  </p>
                )}
              </div>

              {/* Select Role */}
              <div className="w-full flex flex-col items-start gap-2">
                <div className="w-full border border-solid rounded">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      setAiLists((pre) => ({ ...pre, Roles: !aiLists?.Roles }));
                      if (validationError.ai_role_id)
                        setValidationError((prev) => ({
                          ...prev,
                          ai_role_id: undefined,
                        }));
                    }}
                  >
                    <p>Select Role</p>
                    <KeyboardArrowDownIcon
                      className={`${aiLists?.Roles ? "rotate-180" : "rotate-0"}`}
                    />
                  </div>
                  {aiLists?.Roles && (
                    <>
                      <hr />
                      {ai_rolesData?.length
                        ? ai_rolesData.map((v, i) => (
                            <div
                              key={i}
                              className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer capitalize`}
                              onClick={() => {
                                setPersona((pre) => ({
                                  ...pre,
                                  ai_role_id: v?.ai_role_id,
                                }));
                                if (validationError.ai_role_id)
                                  setValidationError((prev) => ({
                                    ...prev,
                                    ai_role_id: undefined,
                                  }));
                              }}
                            >
                              <div
                                className={`rounded-full w-4 h-4 ${persona?.ai_role_id === v?.ai_role_id ? "border-2 border-solid border-[#fbd255] bg-[#fbd255]" : "border-2 border-solid border-[#fbd255]"}`}
                              />
                              {v?.name.replace(/_/g, " ")}
                            </div>
                          ))
                        : null}
                    </>
                  )}
                </div>
                {validationError.ai_role_id && (
                  <p
                    style={{ color: "red", margin: "0 16px", fontSize: "13px" }}
                  >
                    {validationError.ai_role_id}
                  </p>
                )}
              </div>

              {/* Select Manufacturing Mode */}
              <div className="w-full flex flex-col items-start gap-2">
                <div className="w-full border border-solid rounded">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      setAiLists((pre) => ({
                        ...pre,
                        manufacturing: !aiLists?.manufacturing,
                      }));
                      if (validationError.manufacturing_model_id)
                        setValidationError((prev) => ({
                          ...prev,
                          manufacturing_model_id: undefined,
                        }));
                    }}
                  >
                    <p>Select Manufacturing Mode</p>
                    <KeyboardArrowDownIcon
                      className={`${aiLists?.manufacturing ? "rotate-180" : "rotate-0"}`}
                    />
                  </div>
                  {aiLists?.manufacturing && (
                    <>
                      <hr />
                      {manufacturing_modelsData?.length
                        ? manufacturing_modelsData.map((v, i) => (
                            <div
                              key={i}
                              className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer capitalize`}
                              onClick={() => {
                                setPersona((pre) => ({
                                  ...pre,
                                  manufacturing_model_id:
                                    v?.manufacturing_model_id,
                                }));
                                if (validationError.manufacturing_model_id)
                                  setValidationError((prev) => ({
                                    ...prev,
                                    manufacturing_model_id: undefined,
                                  }));
                              }}
                            >
                              <div
                                className={`rounded-full w-4 h-4 ${persona?.manufacturing_model_id === v?.manufacturing_model_id ? "border-2 border-solid border-[#fbd255] bg-[#fbd255]" : "border-2 border-solid border-[#fbd255]"}`}
                              />
                              {v?.name.replace(/_/g, " ")}
                            </div>
                          ))
                        : null}
                    </>
                  )}
                </div>
                {validationError.manufacturing_model_id && (
                  <p
                    style={{ color: "red", margin: "0 16px", fontSize: "13px" }}
                  >
                    {validationError.manufacturing_model_id}
                  </p>
                )}
              </div>

              {/* Select Geography */}
              <div className="w-full flex flex-col items-start gap-2">
                <div className="w-full border border-solid rounded">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      setAiLists((pre) => ({
                        ...pre,
                        geography: !aiLists?.geography,
                      }));
                      if (validationError.geography)
                        setValidationError((prev) => ({
                          ...prev,
                          geography: undefined,
                        }));
                    }}
                  >
                    <p>Select Geography</p>
                    <KeyboardArrowDownIcon
                      className={`${aiLists?.geography ? "rotate-180" : "rotate-0"}`}
                    />
                  </div>
                  {aiLists?.geography && (
                    <>
                      <hr />
                      {geography?.length
                        ? geography.map((v, i) => (
                            <div
                              key={i}
                              className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer capitalize`}
                              onClick={() => {
                                setPersona((pre) => ({
                                  ...pre,
                                  geography: v?.value,
                                }));
                                if (validationError.geography)
                                  setValidationError((prev) => ({
                                    ...prev,
                                    geography: undefined,
                                  }));
                              }}
                            >
                              <div
                                className={`rounded-full w-4 h-4 ${persona?.geography === v?.value ? "border-2 border-solid border-[#fbd255] bg-[#fbd255]" : "border-2 border-solid border-[#fbd255]"}`}
                              />
                              {v?.name.replace(/_/g, " ")}
                            </div>
                          ))
                        : null}
                    </>
                  )}
                </div>
                {validationError.geography && (
                  <p
                    style={{ color: "red", margin: "0 16px", fontSize: "13px" }}
                  >
                    {validationError.geography}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="w-full flex items-center justify-between my-4">
            <h1 className="text-2xl">{!addPersona && "Added Personas List"}</h1>

            <div className="flex items-center justify-end gap-2">
              {!addPersona ? (
                <div
                  className="rounded border border-solid border-blue-600 hover:bg-blue-600 text-blue-600 hover:text-white cursor-pointer py-1 px-4 w-fit flex items-center gap-2"
                  onClick={() => setAddPersona(true)}
                >
                  <AddIcon className="!text-lg" />
                  Add New
                </div>
              ) : (
                <>
                  <div
                    className="rounded border border-solid border-red-600 hover:border-red-700 bg-red-600 hover:bg-red-700 text-white cursor-pointer py-1 px-4 w-fit flex items-center gap-2"
                    onClick={() => {
                      setAddPersona(false);
                      setPersona({});
                      setValidationError({});
                      setPersonaId("");
                      setAiLists({
                        industry: true,
                        plantSize: true,
                        Roles: true,
                        manufacturing: true,
                        geography: true,
                      });
                    }}
                  >
                    Cancel
                  </div>
                  <div
                    className="rounded border border-solid border-blue-600 hover:border-blue-700 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer py-1 px-6 w-fit flex items-center gap-2"
                    onClick={() => {
                      if (loading) return;
                      const errors = validatePersona();
                      if (Object.keys(errors).length > 0) {
                        setValidationError(errors);
                        return;
                      }
                      setValidationError({});
                      if (personaId === "") {
                        createPersona();
                      } else {
                        updatePersona(personaId);
                      }
                    }}
                    style={{
                      opacity: loading ? 0.7 : 1,
                      pointerEvents: loading ? "none" : "auto",
                    }}
                  >
                    {loading ? (
                      <RotateRightIcon className="animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {!addPersona && (
            <>
              <hr className="mt-4" />
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
                      sx={{ textAlign: "center" }}
                      className="!font-bold capitalize"
                    >
                      status
                    </TableCell>
                    <TableCell
                      sx={{ textAlign: "right" }}
                      className="!font-bold capitalize"
                    >
                      action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loadingPersona ? (
                    personaData?.length ? (
                      personaData.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ textAlign: "left" }}>
                            {v?.name.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <Chip
                              label={v?.status_active ? "Active" : "Inactive"}
                              color={v?.status_active ? "success" : "error"}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                minWidth: "80px",
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: "right" }}>
                            <div className="flex items-center justify-end gap-2">
                              <div
                                className="rounded border border-solid border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white cursor-pointer py-1 px-4 w-fit"
                                onClick={() => {
                                  setPersonaId(v?.persona_id);
                                  setPersona({
                                    name: v?.name,
                                    behavioral_detail: v?.behavioral_detail,
                                    industry_id: v?.industry?.industry_id,
                                    ai_role_id: v?.ai_role?.ai_role_id,
                                    manufacturing_model_id:
                                      v?.manufacturing_model
                                        ?.manufacturing_model_id,
                                    plant_size_impact_id:
                                      v?.plant_size_impact
                                        ?.plant_size_impact_id,
                                    geography: v?.geography,
                                  });
                                  setAddPersona(true);
                                }}
                              >
                                <EditIcon className="!text-lg" />
                              </div>

                              <div
                                className="rounded border border-solid border-red-400 hover:bg-red-400 text-red-400 hover:text-white cursor-pointer py-1 px-4 w-fit"
                                onClick={() =>
                                  setDeleteId({
                                    name: v?.name,
                                    id: v?.persona_id,
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
                        <TableCell>
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
                    )
                  ) : (
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center h-60">
                          <RotateRightIcon className="animate-spin !text-5xl" />
                        </div>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
                onClick={() => deletePersona(deleteId?.id)}
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

export default Persona;
