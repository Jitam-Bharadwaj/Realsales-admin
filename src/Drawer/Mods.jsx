import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { axioInstance } from "../api/axios/axios";
import { endpoints } from "../api/endpoints/endpoints";
import EditIcon from "@mui/icons-material/Edit";

const ModsFlo = ({ currentSegment }) => {
  const [mods, setMods] = useState();

  useEffect(() => {
    const getAllMods = async () => {
      try {
        let data = await axioInstance.get(endpoints?.closing?.getClosing);
        if (data?.data?.length) {
          setMods(data?.data);
        }
      } catch (error) {
        console.log(error, "_error_");
      }
    };

    getAllMods();
  }, []);

  return (
    <>
      {/* modeMgmt */}
      {currentSegment === "modeMgmt" && (
        <div style={{ width: "100%", pt: "40px" }}>
          <Table>
            <TableBody>
              {mods?.length
                ? mods?.map((v, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ textAlign: "left", width: "40%" }}>
                        {v?.name}
                      </TableCell>
                      <TableCell sx={{ textAlign: "left", width: "40%" }}>
                        {v?.description.slice(0, 200)}{" "}
                        {v?.description?.length > 200 ? "..." : null}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          textDecoration: "underline",
                          fontWeight: "bold",
                        }}
                      >
                        <div
                          className="flex items-center justify-end"
                          onClick={() =>
                            console.log(v?.prompt_template, "prompt_template")
                          }
                        >
                          <div className="rounded border border-solid border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white cursor-pointer py-1 px-4 w-fit">
                            <EditIcon className="!text-lg" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : "null"}
            </TableBody>
          </Table>
        </div>
      )}
      {/* industry */}
      {currentSegment === "industry" && (
        <div style={{ width: "100%", pt: "40px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ textAlign: "left", width: "40%" }}>
                  Prospecting
                </TableCell>
                <TableCell sx={{ textAlign: "left", width: "40%" }}>
                  Food & Beverage
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
                <TableCell sx={{ textAlign: "left", width: "40%" }}>
                  Discovery
                </TableCell>
                <TableCell sx={{ textAlign: "left", width: "40%" }}>
                  Food & Beverage
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
                <TableCell sx={{ textAlign: "left", width: "40%" }}>
                  Closing
                </TableCell>
                <TableCell sx={{ textAlign: "left", width: "40%" }}>
                  Food & Beverage
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
      {/* role */}
      {currentSegment === "role" && (
        <div style={{ width: "100%", pt: "40px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ textAlign: "left", width: "20%" }}>
                  Prospecting
                </TableCell>
                <TableCell sx={{ textAlign: "left", width: "60%" }}>
                  <div className="flex items-center gap-2">
                    <p className="bg-green-600/90 text-white px-1.5 rounded w-fit">
                      Plant Manager
                    </p>
                    <p className="bg-cyan-400/90 text-white px-1.5 rounded w-fit">
                      Plant Manager
                    </p>
                    <p className="bg-blue-800/60 text-white px-1.5 rounded w-fit">
                      Manufacturing Manager
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
                    <p className="bg-green-600/90 text-white px-1.5 rounded w-fit">
                      Plant Manager
                    </p>
                    <p className="bg-cyan-400/90 text-white px-1.5 rounded w-fit">
                      Plant Manager
                    </p>
                    <p className="bg-blue-800/60 text-white px-1.5 rounded w-fit">
                      Manufacturing Manager
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
                    <p className="bg-green-600/90 text-white px-1.5 rounded w-fit">
                      Plant Manager
                    </p>
                    <p className="bg-cyan-400/90 text-white px-1.5 rounded w-fit">
                      Plant Manager
                    </p>
                    <p className="bg-blue-800/60 text-white px-1.5 rounded w-fit">
                      Manufacturing Manager
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
  );
};

export default ModsFlo;
