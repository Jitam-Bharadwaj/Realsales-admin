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
  Avatar,
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { axioInstance } from "../api/axios/axios";
import { endpoints } from "../api/endpoints/endpoints";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import AddIcon from "@mui/icons-material/Add";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
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
  const [editProductsModal, setEditProductsModal] = useState(false);
  const [selectedPersonaForProducts, setSelectedPersonaForProducts] =
    useState(null);
  const [personaData, setPersonaData] = useState([]);
  const [industriesData, setIndustriesData] = useState([]);
  const [plant_size_impactsData, setPlant_size_impactsData] = useState([]);
  const [company_sizes_data, setCompany_sizes_data] = useState([]);
  const [ai_rolesData, setAi_rolesData] = useState([]);
  const [manufacturing_modelsData, setManufacturing_modelsData] = useState([]);
  const [aiLists, setAiLists] = useState({
    industry: true,
    plantSize: true,
    Roles: true,
    manufacturing: true,
    geography: true,
    companySize: true,
    product: true,
  });
  const [validationError, setValidationError] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const textFieldRef = useRef(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [profileUploadError, setProfileUploadError] = useState("");
  const [profileFile, setProfileFile] = useState();
  const [product, setProduct] = useState([]);
  const [deleteProductId, setDeleteProductId] = useState({});

  console.log(product, "___product__");
  console.log(personaData, "__personaData__");

  console.log(persona, personaId, product, "persona__");

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

  const uploadProfilePicture = async (id, file) => {
    setUploadingProfile(true);
    setProfileUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      let data = await axioInstance.post(
        `${endpoints.persona.persona}${id}/upload-profile-pic`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (data?.data?.profile_pic) {
        readPersona("table");
        setAddPersona(false);
        setPersona({});
        setPersonaId("");
        setProfilePicture(null);
        setProfilePicturePreview(null);
        setProfileFile(null);
        setAiLists({
          industry: true,
          plantSize: true,
          Roles: true,
          manufacturing: true,
          geography: true,
          companySize: true,
          product: true,
        });
      }
    } catch (error) {
      setProfileUploadError("Failed to upload profile picture.");
    } finally {
      setUploadingProfile(false);
    }
  };

  const onProfileDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // uploadProfilePicture(file);
      setProfileFile(file);
    }
  };

  const {
    getRootProps: getProfileRootProps,
    getInputProps: getProfileInputProps,
    isDragActive: isProfileDragActive,
  } = useDropzone({
    onDrop: onProfileDrop,
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
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
        let prodData = await axioInstance.get(endpoints.ai.product);
        if (prodData?.data?.length) {
          setProduct(prodData?.data);
        } else {
          setProduct([]);
        }

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

        let company_sizes_data = await axioInstance.get(
          endpoints.ai.company_size
        );
        if (company_sizes_data?.data?.length > 0) {
          setCompany_sizes_data(company_sizes_data?.data);
        } else {
          setCompany_sizes_data([]);
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
        // Send each produced product individually
        // if ((persona.product_ids || []).length > 0) {
        //   for (const product_id of persona.product_ids) {
        //     await axioInstance.post(endpoints.persona.produced_products, {
        //       persona_id: data.data.persona_id,
        //       product_id,
        //     });
        //   }
        // }
        if (profileFile) {
          await uploadProfilePicture(data?.data?.persona_id, profileFile);
        } else {
          readPersona("table");
          setAddPersona(false);
          setPersona({});
          setPersonaId("");
          setProfilePicture(null);
          setProfilePicturePreview(null);
          setProfileFile(null);
          setAiLists({
            industry: true,
            plantSize: true,
            Roles: true,
            manufacturing: true,
            geography: true,
            companySize: true,
            product: true,
          });
        }
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
        // Send each produced product individually
        // if ((persona.product_ids || []).length > 0) {
        //   for (const product_id of persona.product_ids) {
        //     await axioInstance.post(endpoints.persona.produced_products, {
        //       persona_id: data.data.persona_id,
        //       product_id,
        //     });
        //   }
        // }
        if (profileFile) {
          await uploadProfilePicture(data?.data?.persona_id, profileFile);
        } else {
          readPersona("table");
          setAddPersona(false);
          setPersona({});
          setPersonaId("");
          setProfilePicture(null);
          setProfilePicturePreview(null);
          setProfileFile(null);
          setAiLists({
            industry: true,
            plantSize: true,
            Roles: true,
            manufacturing: true,
            geography: true,
            companySize: true,
            product: true,
          });
        }
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
    // Only require product selection if there are products for the selected industry
    // const availableProducts = product.filter(
    //   (p) => p.industry_id === persona?.industry_id
    // );
    // if (
    //   availableProducts.length > 0 &&
    //   (!persona?.product_ids || persona.product_ids.length === 0)
    // ) {
    //   errors.product_ids = "At least one product is required";
    // }
    if (!persona?.plant_size_impact_id)
      errors.plant_size_impact_id = "Plant Size is required";
    if (!persona?.company_size_id)
      errors.company_size_id = "Company Size is required";
    if (!persona?.ai_role_id) errors.ai_role_id = "Role is required";
    if (!persona?.manufacturing_model_id)
      errors.manufacturing_model_id = "Manufacturing Model is required";
    if (!persona?.geography) errors.geography = "Geography is required";
    return errors;
  };

  const updateProducedProducts = async (
    persona_id,
    product_id,
    action,
    persona_product_id
  ) => {
    try {
      if (action === "add") {
        await axioInstance.post(endpoints.persona.produced_products, {
          persona_id,
          product_id,
        });
        showToast.success("Product added successfully");
      } else if (action === "remove") {
        await axioInstance.delete(
          `${endpoints.persona.produced_products}${persona_product_id}`
        );
        showToast.success("Product removed successfully");
      }
      // Refresh the persona data after update
      readPersona("table");
    } catch (error) {
      showToast.error("Failed to update produced products");
    } finally {
      setEditProductsModal(false);
    }
  };

  const handleProductDelete = (personaId, productId, productName, personaProductId) => {
    setDeleteProductId({
      persona_id: personaId,
      product_id: productId,
      name: productName,
      persona_product_id: personaProductId
    });
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
              {/* Profile Picture Upload */}
              <div className="flex flex-col gap-2 items-start w-full">
                <p>Profile Picture</p>
                <div
                  {...getProfileRootProps()}
                  className={`w-full flex flex-col items-center border border-dashed rounded p-4 ${uploadingProfile ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {uploadingProfile ? null : (
                    <input {...getProfileInputProps()} />
                  )}
                  <div className="flex flex-col items-center gap-4">
                    {(profilePicturePreview || persona?.profile_pic) && (
                      <Avatar
                        src={profilePicturePreview || persona?.profile_pic}
                        sx={{ width: 100, height: 100 }}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <CloudUploadIcon style={{ fontSize: 24 }} />
                      {isProfileDragActive ? (
                        <p>Drop the image here ...</p>
                      ) : (
                        <p>
                          Drag & drop a profile picture here, or click to select
                        </p>
                      )}
                    </div>
                    {profilePicture && (
                      <div style={{ color: "#1976d2" }}>
                        Selected: {profilePicture.name}
                      </div>
                    )}
                    {uploadingProfile && (
                      <div style={{ color: "#1976d2" }}>Uploading...</div>
                    )}
                    {profileUploadError && (
                      <div style={{ color: "red" }}>{profileUploadError}</div>
                    )}
                  </div>
                </div>
              </div>

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
                  inputRef={textFieldRef}
                  value={persona?.behavioral_detail
                    ?.replace(/\\n\\n/g, "\n\n")
                    ?.replace(/\\n/g, "\n")}
                  onKeyDown={(e) => {
                    const textarea = e.target;
                    const cursorPosition = textarea.selectionStart;
                    const scrollTop = textarea.scrollTop;

                    // Store cursor position and scroll position
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

                    setPersona({
                      ...persona,
                      behavioral_detail: e.target.value.replace(/"/g, "'"),
                    });

                    if (validationError.behavioral_detail)
                      setValidationError((prev) => ({
                        ...prev,
                        behavioral_detail: undefined,
                      }));

                    // Restore cursor position and scroll position
                    requestAnimationFrame(() => {
                      textarea.selectionStart = cursorPosition;
                      textarea.selectionEnd = cursorPosition;
                      textarea.scrollTop = scrollTop;
                    });
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

              {/* Select Product (filtered by Industry) */}
              {/* <div className="w-full flex flex-col items-start gap-2">
                <div className="w-full border border-solid rounded">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      setAiLists((pre) => ({
                        ...pre,
                        product: !aiLists?.product,
                      }));
                      if (validationError.product_ids)
                        setValidationError((prev) => ({
                          ...prev,
                          product_ids: undefined,
                        }));
                    }}
                  >
                    <p>Select Product</p>
                    <KeyboardArrowDownIcon
                      className={`${aiLists?.product ? "rotate-180" : "rotate-0"}`}
                    />
                  </div>
                  {aiLists?.product && (
                    <>
                      <hr />
                      {product?.filter(
                        (p) => p.industry_id === persona?.industry_id
                      )?.length ? (
                        product
                          .filter((p) => p.industry_id === persona?.industry_id)
                          .map((v, i) => {
                            // Find if this product is selected and get its persona_product_id if it exists
                            const selectedProduct = persona?.product_ids?.find(
                              (obj) => obj.product_id === v.product_id
                            );
                            const selected = !!selectedProduct;

                            return (
                              <div
                                key={i}
                                className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer capitalize ${selected ? "bg-[#fbd255]/20" : ""}`}
                                onClick={() => {
                                  setPersona((pre) => {
                                    const ids = pre.product_ids || [];
                                    let newIds;
                                    let action;

                                    if (selected) {
                                      newIds = ids.filter(
                                        (obj) => obj.product_id !== v.product_id
                                      );
                                      action = "remove";
                                      // Update backend if editing existing persona
                                      if (personaId) {
                                        updateProducedProducts(
                                          personaId,
                                          v.product_id,
                                          action,
                                          selectedProduct.persona_product_id
                                        );
                                      }
                                    } else {
                                      newIds = [
                                        ...ids,
                                        {
                                          persona_product_id: "",
                                          product_id: v.product_id,
                                        },
                                      ];
                                      action = "add";
                                      // Update backend if editing existing persona
                                      if (personaId) {
                                        updateProducedProducts(
                                          personaId,
                                          v.product_id,
                                          action
                                        );
                                      }
                                    }

                                    return {
                                      ...pre,
                                      product_ids: newIds,
                                    };
                                  });
                                  if (validationError.product_ids)
                                    setValidationError((prev) => ({
                                      ...prev,
                                      product_ids: undefined,
                                    }));
                                }}
                              >
                                <div
                                  className={`rounded-full w-4 h-4 border-2 border-solid border-[#fbd255] ${selected ? "bg-[#fbd255]" : ""}`}
                                />
                                {v?.name.replace(/_/g, " ")}
                                {selected && (
                                  <span className="ml-2 text-xs text-[#fbd255]">
                                    Selected
                                  </span>
                                )}
                              </div>
                            );
                          })
                      ) : persona?.industry_id ? (
                        <div className="p-3 text-gray-500 text-center">
                          No products available for the selected industry.
                        </div>
                      ) : (
                        <div className="p-3 text-gray-500 text-center">
                          Please select an industry first to view available
                          products.
                        </div>
                      )}
                    </>
                  )}
                </div>
                {validationError.product_ids && (
                  <p
                    style={{ color: "red", margin: "0 16px", fontSize: "13px" }}
                  >
                    {validationError.product_ids}
                  </p>
                )}
              </div> */}

              {/* Show selected products as chips */}
              <div className="flex flex-wrap gap-2 mb-2">
                {persona?.product_ids?.map((obj) => {
                  const p = product.find(
                    (prod) => prod.product_id === obj.product_id
                  );
                  if (!p) return null;
                  return (
                    <div
                      key={obj.product_id}
                      className="bg-[#fbd255] text-black px-2 py-1 rounded-full text-xs flex items-center gap-1"
                    >
                      {p.name.replace(/_/g, " ")}
                      <span
                        className="cursor-pointer ml-1"
                        onClick={() => {
                          setPersona((pre) => {
                            const newIds = pre.product_ids.filter(
                              (item) => item.product_id !== obj.product_id
                            );
                            // Update backend if editing existing persona
                            if (personaId) {
                              updateProducedProducts(
                                personaId,
                                obj.product_id,
                                "remove",
                                obj.persona_product_id
                              );
                            }
                            return {
                              ...pre,
                              product_ids: newIds,
                            };
                          });
                        }}
                      >
                        ×
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Select Company Size */}
              <div className="w-full flex flex-col items-start gap-2">
                <div className="w-full border border-solid rounded">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      setAiLists((pre) => ({
                        ...pre,
                        companySize: !aiLists?.companySize,
                      }));
                      if (validationError.company_size_id)
                        setValidationError((prev) => ({
                          ...prev,
                          company_size_id: undefined,
                        }));
                    }}
                  >
                    <p>Select Company Size</p>
                    <KeyboardArrowDownIcon
                      className={`${aiLists?.companySize ? "rotate-180" : "rotate-0"}`}
                    />
                  </div>
                  {aiLists?.companySize && (
                    <>
                      <hr />
                      {company_sizes_data?.length
                        ? company_sizes_data.map((v, i) => (
                            <div
                              key={i}
                              className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer capitalize`}
                              onClick={() => {
                                setPersona((pre) => ({
                                  ...pre,
                                  company_size_id: v?.company_size_id,
                                }));
                                if (validationError.company_size_id)
                                  setValidationError((prev) => ({
                                    ...prev,
                                    company_size_id: undefined,
                                  }));
                              }}
                            >
                              <div
                                className={`rounded-full w-4 h-4 ${persona?.company_size_id === v?.company_size_id ? "border-2 border-solid border-[#fbd255] bg-[#fbd255]" : "border-2 border-solid border-[#fbd255]"}`}
                              />
                              {v?.name.replace(/_/g, " ")}
                            </div>
                          ))
                        : null}
                    </>
                  )}
                </div>
                {validationError.company_size_id && (
                  <p
                    style={{ color: "red", margin: "0 16px", fontSize: "13px" }}
                  >
                    {validationError.company_size_id}
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
                        companySize: true,
                        product: true,
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
                      profile
                    </TableCell>
                    <TableCell
                      sx={{ textAlign: "left" }}
                      className="!font-bold capitalize"
                    >
                      name
                    </TableCell>
                    <TableCell
                      sx={{ textAlign: "left" }}
                      className="!font-bold capitalize"
                    >
                      products
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
                            <Avatar
                              src={v?.profile_pic}
                              sx={{ width: 40, height: 40 }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: "left" }}>
                            {v?.name.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell sx={{ textAlign: "left" }}>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-wrap gap-1">
                                {v?.persona_products?.map((pp, idx) => (
                                  <Chip
                                    key={idx}
                                    label={pp?.product?.name.replace(/_/g, " ")}
                                    size="small"
                                    onDelete={() => handleProductDelete(
                                      v?.persona_id,
                                      pp?.product?.product_id,
                                      pp?.product?.name,
                                      pp?.persona_product_id
                                    )}
                                    sx={{
                                      backgroundColor: "#ffbf00",
                                      color: "black",
                                      fontWeight: 500,
                                      "& .MuiChip-deleteIcon": {
                                        color: "black",
                                      },
                                    }}
                                  />
                                ))}
                              </div>
                                <div
                                  className="rounded border border-solid border-[#ffbf00] hover:bg-[#ffbf00] text-[#ffbf00] hover:text-black cursor-pointer p-1"
                                  onClick={() => {
                                    setSelectedPersonaForProducts(v);
                                    setEditProductsModal(true);
                                  }}
                                >
                                  <AddIcon className="!text-lg" />
                                </div>
                            </div>
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
                                    company_size_id:
                                      v?.company_size_new?.company_size_id,
                                    geography: v?.geography,
                                    profile_pic: v?.profile_pic,
                                    product_ids:
                                      v?.persona_products?.map((pp) => ({
                                        persona_product_id:
                                          pp?.persona_product_id,
                                        product_id: pp?.product?.product_id,
                                      })) || [],
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
                        <TableCell></TableCell>
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
                      <TableCell></TableCell>
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

          {/* Products Edit Modal */}
          <Dialog
            open={editProductsModal}
            onClose={() => {
              setEditProductsModal(false);
              setSelectedPersonaForProducts(null);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Edit Products for {selectedPersonaForProducts?.name}
            </DialogTitle>
            <DialogContent>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  {selectedPersonaForProducts?.persona_products?.map((pp) => (
                    <Chip
                      key={pp.persona_product_id}
                      label={pp.product.name.replace(/_/g, " ")}
                      onDelete={() => handleProductDelete(
                        selectedPersonaForProducts.persona_id,
                        pp.product.product_id,
                        pp.product.name,
                        pp.persona_product_id
                      )}
                      sx={{
                        backgroundColor: "#fbd255",
                        color: "black",
                        fontWeight: 500,
                        "& .MuiChip-deleteIcon": {
                          color: "black",
                        },
                      }}
                    />
                  ))}
                </div>
                <div className="w-full border border-[#ffbf00] border-solid rounded">
                  <div className="p-3">
                    <p className="text-[#ffbf00]">Available Products</p>
                  </div>
                  <hr className="border-[#ffbf00]"/>
                  <div className="max-h-60 overflow-y-auto">
                    {product
                      ?.filter(
                        (p) =>
                          p.industry_id ===
                          selectedPersonaForProducts?.industry?.industry_id
                      )
                      ?.filter(
                        (p) =>
                          !selectedPersonaForProducts?.persona_products?.some(
                            (pp) => pp.product.product_id === p.product_id
                          )
                      )?.length > 0 ? (
                      product
                        ?.filter(
                          (p) =>
                            p.industry_id ===
                            selectedPersonaForProducts?.industry?.industry_id
                        )
                        ?.filter(
                          (p) =>
                            !selectedPersonaForProducts?.persona_products?.some(
                              (pp) => pp.product.product_id === p.product_id
                            )
                        )
                        ?.map((v, i) => (
                          <div
                            key={i}
                            className="p-3 border-b border-solid flex items-center gap-2 cursor-pointer capitalize text-[#ffbf00]"
                            onClick={() => {
                              updateProducedProducts(
                                selectedPersonaForProducts.persona_id,
                                v.product_id,
                                "add"
                              );
                            }}
                          >
                            <AddIcon className="!text-lg" />
                            {v?.name.replace(/_/g, " ")}
                          </div>
                        ))
                    ) : (
                      <div className="p-3 text-gray-500 text-center">
                        No additional products available for this industry.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                className="!text-white !border-white !bg-red-600"
                onClick={() => {
                  setEditProductsModal(false);
                  setSelectedPersonaForProducts(null);
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Product Delete Confirmation Modal */}
          <Dialog 
            open={Boolean(deleteProductId?.product_id)} 
            onClose={() => setDeleteProductId({})}
          >
            <DialogTitle>Remove Product Confirmation</DialogTitle>
            <DialogContent>
              Are you sure you want to remove <b>{deleteProductId?.name?.replace(/_/g, " ")}</b> from this persona?
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                className="!border !border-green-600 !text-green-600 !bg-transparent w-fit"
                onClick={() => setDeleteProductId({})}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                className="!bg-red-600 !text-white w-fit"
                onClick={() => {
                  updateProducedProducts(
                    deleteProductId.persona_id,
                    deleteProductId.product_id,
                    "remove",
                    deleteProductId.persona_product_id
                  );
                  setDeleteProductId({});
                }}
                autoFocus
              >
                Remove
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default Persona;
