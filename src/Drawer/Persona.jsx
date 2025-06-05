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
//   import DeleteIcon from "@mui/icons-material/Delete";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

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

  console.log(persona, personaId, "persona__");

  const readPersona = async (control) => {
    try {
      if (control === "table") {
        let data = await axioInstance.get(endpoints.persona.persona);
        if (data?.data?.length > 0) {
          setPersonaData(data?.data);
        }
      } else {
        let data = await axioInstance.get(endpoints.persona.persona);
        if (data?.data?.length > 0) {
          setPersonaData(data?.data);
        }

        let industriData = await axioInstance.get(endpoints.ai.industries);
        if (industriData?.data?.length > 0) {
          setIndustriesData(industriData?.data);
        }

        let plant_size_impactData = await axioInstance.get(
          endpoints.ai.plant_size_impacts
        );
        if (plant_size_impactData?.data?.length > 0) {
          setPlant_size_impactsData(plant_size_impactData?.data);
        }

        let aIrolesData = await axioInstance.get(endpoints.ai.ai_roles);
        if (aIrolesData?.data?.length > 0) {
          setAi_rolesData(aIrolesData?.data);
        }

        let manufacturingModelsData = await axioInstance.get(
          endpoints.ai.manufacturing_models
        );
        if (manufacturingModelsData?.data?.length > 0) {
          setManufacturing_modelsData(manufacturingModelsData?.data);
        }
      }
    } catch (error) {
      console.log(error, "_error_");
    }
  };

  const createPersona = async () => {
    try {
      let data = await axioInstance.post(endpoints.persona.persona, {
        ...persona,
        behavioral_traits: [
          {
            name: "string",
            intensity: 0,
            description: "string",
          },
        ],
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
      }
    } catch (error) {
      console.log(error, "_error_");
    }
  };

  const updatePersona = async (id) => {
    try {
      let data = await axioInstance.put(`${endpoints.persona.persona}/${id}`, {
        ...persona,
        behavioral_traits: [
          {
            name: "string",
            intensity: 0,
            description: "string",
          },
        ],
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
      }
    } catch (error) {
      console.log(error, "_error_");
    }
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
                onChange={(e) =>
                  setPersona({
                    ...persona,
                    name: e.target.value,
                  })
                }
              />
              <TextField
                fullWidth
                className="!m-0"
                margin="normal"
                label={"Summary"}
                multiline
                rows={3}
                value={persona?.summary
                  ?.replace(/\\n\\n/g, "\n\n")
                  .replace(/\\n/g, "\n")}
                onChange={(e) =>
                  setPersona({
                    ...persona,
                    summary: e.target.value,
                  })
                }
              />

              {/* Select Industry */}
              <div className="border border-solid rounded">
                <div
                  className="p-3 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setAiLists((pre) => ({
                      ...pre,
                      industry: !aiLists?.industry,
                    }))
                  }
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
                            className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer`}
                            onClick={() =>
                              setPersona((pre) => ({
                                ...pre,
                                industry_id: v?.industry_id,
                              }))
                            }
                          >
                            <div
                              className={`rounded-full w-4 h-4 ${persona?.industry_id === v?.industry_id ? "border-2 border-solid border-cyan-400 bg-cyan-400" : "border-2 border-solid border-cyan-400"}`}
                            />
                            {v?.name}
                          </div>
                        ))
                      : null}
                  </>
                )}
              </div>

              {/* Select Plant Size */}
              <div className="border border-solid rounded">
                <div
                  className="p-3 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setAiLists((pre) => ({
                      ...pre,
                      plantSize: !aiLists?.plantSize,
                    }))
                  }
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
                            className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer`}
                            onClick={() =>
                              setPersona((pre) => ({
                                ...pre,
                                plant_size_impact_id: v?.plant_size_impact_id,
                              }))
                            }
                          >
                            <div
                              className={`rounded-full w-4 h-4 ${persona?.plant_size_impact_id === v?.plant_size_impact_id ? "border-2 border-solid border-cyan-400 bg-cyan-400" : "border-2 border-solid border-cyan-400"}`}
                            />
                            {v?.name}
                          </div>
                        ))
                      : null}
                  </>
                )}
              </div>

              {/* Select Role */}
              <div className="border border-solid rounded">
                <div
                  className="p-3 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setAiLists((pre) => ({ ...pre, Roles: !aiLists?.Roles }))
                  }
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
                            className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer`}
                            onClick={() =>
                              setPersona((pre) => ({
                                ...pre,
                                ai_role_id: v?.ai_role_id,
                              }))
                            }
                          >
                            <div
                              className={`rounded-full w-4 h-4 ${persona?.ai_role_id === v?.ai_role_id ? "border-2 border-solid border-cyan-400 bg-cyan-400" : "border-2 border-solid border-cyan-400"}`}
                            />
                            {v?.name}
                          </div>
                        ))
                      : null}
                  </>
                )}
              </div>

              {/* Select Manufacturing Mode */}
              <div className="border border-solid rounded">
                <div
                  className="p-3 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setAiLists((pre) => ({
                      ...pre,
                      manufacturing: !aiLists?.manufacturing,
                    }))
                  }
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
                            className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer`}
                            onClick={() =>
                              setPersona((pre) => ({
                                ...pre,
                                manufacturing_model_id:
                                  v?.manufacturing_model_id,
                              }))
                            }
                          >
                            <div
                              className={`rounded-full w-4 h-4 ${persona?.manufacturing_model_id === v?.manufacturing_model_id ? "border-2 border-solid border-cyan-400 bg-cyan-400" : "border-2 border-solid border-cyan-400"}`}
                            />
                            {v?.name}
                          </div>
                        ))
                      : null}
                  </>
                )}
              </div>

              {/* Select Geography */}
              <div className="border border-solid rounded">
                <div
                  className="p-3 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setAiLists((pre) => ({
                      ...pre,
                      geography: !aiLists?.geography,
                    }))
                  }
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
                            className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer`}
                            onClick={() =>
                              setPersona((pre) => ({
                                ...pre,
                                geography: v?.value,
                              }))
                            }
                          >
                            <div
                              className={`rounded-full w-4 h-4 ${persona?.geography === v?.value ? "border-2 border-solid border-cyan-400 bg-cyan-400" : "border-2 border-solid border-cyan-400"}`}
                            />
                            {v?.name}
                          </div>
                        ))
                      : null}
                  </>
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
                      if (personaId === "") {
                        createPersona();
                      } else {
                        updatePersona(personaId);
                      }
                    }}
                  >
                    Save
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
                      className="capitalize"
                    >
                      name
                    </TableCell>
                    <TableCell
                      sx={{ textAlign: "center" }}
                      className="capitalize"
                    >
                      status
                    </TableCell>
                    <TableCell
                      sx={{ textAlign: "right" }}
                      className="capitalize"
                    >
                      action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {personaData?.length ? (
                    personaData.map((v, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ textAlign: "left" }}>
                          {v?.name}
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
                                  summary: v?.summary,
                                  industry_id: v?.industry?.industry_id,
                                  ai_role_id: v?.ai_role?.ai_role_id,
                                  manufacturing_model_id:
                                    v?.manufacturing_model
                                      ?.manufacturing_model_id,
                                  plant_size_impact_id:
                                    v?.plant_size_impact?.plant_size_impact_id,
                                  geography: v?.geography,
                                });
                                setAddPersona(true);
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
        </div>
      )}
    </>
  );
};

export default Persona;
