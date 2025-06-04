import React from 'react'
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
//   import React, { useEffect, useState } from "react";
//   import { axioInstance } from "../api/axios/axios";
//   import { endpoints } from "../api/endpoints/endpoints";
//   import EditIcon from "@mui/icons-material/Edit";
//   import DeleteIcon from "@mui/icons-material/Delete";
//   import RotateRightIcon from "@mui/icons-material/RotateRight";
//   import AddIcon from "@mui/icons-material/Add";

const Experience = ({ currentSegment }) => {
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

    return (
        <>
            {/* experience */}
            {currentSegment === "experience" && (
                <div style={{ width: "100%", pt: "40px" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ textAlign: "left", width: "20%" }}>
                                    Prospecting
                                </TableCell>
                                <TableCell sx={{ textAlign: "left", width: "60%" }}>
                                    <div className="flex items-center gap-2">
                                        <p className="bg-blue-800 text-white px-1.5 rounded w-fit">
                                            Senior
                                        </p>
                                        <p className="bg-blue-600 text-white px-1.5 rounded w-fit">
                                            Mid Level
                                        </p>
                                        <p className="bg-blue-400 text-white px-1.5 rounded w-fit">
                                            Junior
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        color: "green",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Edit
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ textAlign: "left", width: "20%" }}>
                                    Discovery
                                </TableCell>
                                <TableCell sx={{ textAlign: "left", width: "60%" }}>
                                    <div className="flex items-center gap-2">
                                        <p className="bg-blue-800 text-white px-1.5 rounded w-fit">
                                            Senior
                                        </p>
                                        <p className="bg-blue-600 text-white px-1.5 rounded w-fit">
                                            Mid Level
                                        </p>
                                        <p className="bg-blue-400 text-white px-1.5 rounded w-fit">
                                            Junior
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        color: "green",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Edit
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ textAlign: "left", width: "20%" }}>
                                    Closing
                                </TableCell>
                                <TableCell sx={{ textAlign: "left", width: "60%" }}>
                                    <div className="flex items-center gap-2">
                                        <p className="bg-blue-800 text-white px-1.5 rounded w-fit">
                                            Senior
                                        </p>
                                        <p className="bg-blue-600 text-white px-1.5 rounded w-fit">
                                            Mid Level
                                        </p>
                                        <p className="bg-blue-400 text-white px-1.5 rounded w-fit">
                                            Junior
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        color: "green",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Edit
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            )}
        </>
    )
}

export default Experience