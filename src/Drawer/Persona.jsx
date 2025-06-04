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

    const [persona, setPersona] = useState({})
    const [personaData, setPersonaData] = useState([])

    const createPersona = async () => {
        try {
            let data = await axioInstance.post(endpoints.persona.persona, persona);
            console.log(data, "_response_");
        } catch (error) {
            console.log(error, "_error_");
        }
    }

    const readPersona = async () => {
        try {
            let data = await axioInstance.get(endpoints.persona.persona);
            if (data?.data?.length > 0) {
                setPersonaData(data?.data);
            }
        } catch (error) {
            console.log(error, "_error_");
        }
    }

    const updatePersona = () => {
        console.log("updatePersona");
    }

    console.log(persona, "_personaData_")
    useEffect(() => {
        readPersona();
    }, [])


    return (
        <>
            {currentSegment === "createPersona" && (
                <div style={{ width: "100%", pt: "40px" }}>
                    <div className="w-full flex items-center justify-between">
                        <h1 className="text-2xl">Added Personas List</h1>

                        <div className="flex items-center justify-end">
                            <div
                                className="rounded border border-solid border-blue-600 hover:bg-blue-600 text-blue-600 hover:text-white cursor-pointer py-1 px-4 w-fit flex items-center gap-2"
                            // onClick={() => setAddData(true)}
                            >
                                <AddIcon className="!text-lg" />
                                Add New
                            </div>
                        </div>
                    </div>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ textAlign: "left", }} className="capitalize">
                                    name
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", }} className="capitalize">
                                    status
                                </TableCell>
                                <TableCell sx={{ textAlign: "right", }} className="capitalize">
                                    action
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {personaData?.length ? personaData.map((v, i) =>
                                <TableRow key={i}>
                                    <TableCell sx={{ textAlign: "left", }}>{v?.name}</TableCell>
                                    <TableCell sx={{ textAlign: "center", }}>
                                        <Chip
                                            label={v?.status_active ? "Active" : "Inactive"}
                                            color={v?.status_active ? "success" : "error"}
                                            size="small"
                                            sx={{
                                                fontWeight: 500,
                                                minWidth: '80px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "right", }}>
                                        <div className="flex items-center justify-end gap-2">
                                            <div
                                                className="rounded border border-solid border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white cursor-pointer py-1 px-4 w-fit"
                                                onClick={() =>
                                                    setPersona({ ...v })
                                                }
                                            >
                                                <EditIcon className="!text-lg" />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>) :
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center h-60">
                                            <RotateRightIcon className="animate-spin !text-5xl" />
                                        </div>
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>}
                        </TableBody>
                    </Table>
                </div>
            )}
        </>
    )
}

export default Persona