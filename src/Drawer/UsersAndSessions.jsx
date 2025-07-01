import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Box,
  Grid,
  Modal,
} from "@mui/material";
import { axioInstance } from "../api/axios/axios";
import { endpoints } from "../api/endpoints/endpoints";

const drawerWidth = 240; // Drawer width in px

const UsersAndSessions = ({ currentSegment }) => {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState(null);
  const [modeNames, setModeNames] = useState({}); // { mode_id: mode_name }
  const fetchingModes = useRef({}); // To prevent duplicate fetches
  const [personaNames, setPersonaNames] = useState({}); // { persona_id: persona_name }
  const fetchingPersonas = useRef({}); // To prevent duplicate fetches
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setError(null);
      try {
        const response = await axioInstance.get(endpoints.auth.allUsers);
        setUsers(response.data);
      } catch (err) {
        setError("Failed to fetch users.");
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (!selectedUser) {
      fetchUsers();
    }
  }, [selectedUser]);

  const handleViewSessions = async (user) => {
    setSelectedUser(user);
    setLoadingSessions(true);
    setError(null);
    try {
      // Fetch sessions for the user from the real API using user_id
      const response = await axioInstance.get(`${endpoints.sessions.byUser}${user.user_id}`);
      console.log('Sessions API response:', response.data);
      // Defensive: ensure sessions is always an array
      setSessions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(`Failed to fetch sessions for ${user.first_name || ''} ${user.last_name || ''}`);
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setSessions([]);
  };

  const handleOpenReportModal = (report) => {
    let reportObject = report;
    if (typeof report === 'string') {
      try {
        reportObject = JSON.parse(report);
      } catch (e) {
        console.error("Failed to parse performance report:", e);
        reportObject = { 
          coaching_summary: "Could not parse report data.", 
          raw: report,
          overall_score: 'N/A' 
        };
      }
    }
    setSelectedReport(reportObject);
  };

  const handleCloseReportModal = () => {
    setSelectedReport(null);
  };

  const handleDownloadReport = async (sessionId) => {
    if (!sessionId) return;
    try {
      const response = await axioInstance.get(`/v1/performance-reports/${sessionId}/pdf`, {
        responseType: 'blob',
      });
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      // Create a link and click it to download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `performance_report_${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report.');
    }
  };

  // Fetch mode name for a given mode_id
  const fetchModeName = async (mode_id) => {
    if (!mode_id || modeNames[mode_id] || fetchingModes.current[mode_id]) return;
    fetchingModes.current[mode_id] = true;
    try {
      const response = await axioInstance.get(`/v1/interaction-modes/${mode_id}`);
      const modeName = response.data?.name || response.data?.mode_name || response.data?.title || mode_id;
      setModeNames((prev) => ({ ...prev, [mode_id]: modeName }));
    } catch (e) {
      setModeNames((prev) => ({ ...prev, [mode_id]: mode_id }));
    } finally {
      fetchingModes.current[mode_id] = false;
    }
  };

  // Fetch persona name for a given persona_id
  const fetchPersonaName = async (persona_id) => {
    if (!persona_id || personaNames[persona_id] || fetchingPersonas.current[persona_id]) return;
    fetchingPersonas.current[persona_id] = true;
    try {
      const response = await axioInstance.get(`/v1/ai-personas/${persona_id}`);
      const personaName = response.data?.name || response.data?.persona_name || response.data?.title || persona_id;
      setPersonaNames((prev) => ({ ...prev, [persona_id]: personaName }));
    } catch (e) {
      setPersonaNames((prev) => ({ ...prev, [persona_id]: persona_id }));
    } finally {
      fetchingPersonas.current[persona_id] = false;
    }
  };

  if (currentSegment !== "users") {
    return null;
  }

  return (
    <div className="w-full" style={{ paddingTop: 40 }}>
      {/* Heading and actions */}
      {!selectedUser && (
        <div className="w-full flex items-center justify-between mb-0">
          <h1 className="text-2xl">Users</h1>
        </div>
      )}
      {selectedUser && (
        <div className="w-full flex items-center justify-between mb-2">
          <h1 className="text-2xl">Sessions</h1>
          <Button
            onClick={handleBackToUsers}
            sx={{
              backgroundColor: "#fbd255",
              color: "black",
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#ffe066',
                color: 'black',
              },
            }}
          >
            Back to Users
          </Button>
        </div>
      )}
      {/* Users Section */}
      {!selectedUser && (
        <>
          <hr className="mt-1" />
          <div className="w-full overflow-x-auto">
            {loadingUsers ? (
              <div className="flex items-center justify-center h-60">
                <CircularProgress />
              </div>
            ) : (
              <Table sx={{ minWidth: 600, width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Name</TableCell>
                    <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Email</TableCell>
                    <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id} sx={{ borderBottom: '1px solid #333' }}>
                        <TableCell sx={{ px: 2, py: 1.5 }}>{`${user.first_name || ''} ${user.last_name || ''}`.trim()}</TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>{user.email}</TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <Button
                            variant="contained"
                            onClick={() => handleViewSessions(user)}
                            sx={{
                              backgroundColor: "#fbd255",
                              color: "black",
                              fontWeight: 500,
                              '&:hover': {
                                backgroundColor: '#ffe066',
                                color: 'black',
                              },
                            }}
                          >
                            View Sessions
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <div className="flex items-center justify-center h-60 relative">
                          <p className="text-lg absolute bottom-[15%]">Oops... data not found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}
      {/* Sessions Section */}
      {selectedUser && (
        <>
          <div className="mb-2 text-base font-medium">
            {selectedUser.first_name || ''} {selectedUser.last_name || ''}
          </div>
          <hr className="mt-1" />
          <div className="w-full overflow-x-auto">
            {loadingSessions ? (
              <div className="flex items-center justify-center h-60">
                <CircularProgress />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-60 text-red-500">
                {error}
              </div>
            ) : (
              (() => {
                try {
                  const safeSessions = Array.isArray(sessions) ? sessions : [];
                  return (
                    <Table sx={{ minWidth: 900, width: '100%' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Session ID</TableCell>
                          <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Persona</TableCell>
                          <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Mode</TableCell>
                          <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Performance Report</TableCell>
                          <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Start Time</TableCell>
                          <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">End Time</TableCell>
                          <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Duration</TableCell>
                          <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Status</TableCell>
                          <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Created At</TableCell>
                          <TableCell sx={{ textAlign: 'left' }} className="!font-bold capitalize">Updated At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {safeSessions.length > 0 ? (
                          safeSessions.map((session, idx) => (
                            <TableRow key={session.session_id || session.id || idx} sx={{ borderBottom: '1px solid #333' }}>
                              <TableCell sx={{ px: 2, py: 1.5 }}>{session.session_id || '-'}</TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>
                                {(() => {
                                  if (!session.persona_id) return '-';
                                  if (!personaNames[session.persona_id]) {
                                    fetchPersonaName(session.persona_id);
                                    return '...';
                                  }
                                  return personaNames[session.persona_id];
                                })()}
                              </TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>
                                {(() => {
                                  if (!session.mode_id) return '-';
                                  if (!modeNames[session.mode_id]) {
                                    fetchModeName(session.mode_id);
                                    return '...';
                                  }
                                  return modeNames[session.mode_id];
                                })()}
                              </TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>
                                {session.performance_report ? (
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handleOpenReportModal(session.performance_report)}
                                      sx={{
                                        backgroundColor: "#fbd255",
                                        color: "black",
                                        fontWeight: 500,
                                        '&:hover': {
                                          backgroundColor: '#ffe066',
                                          color: 'black',
                                        },
                                      }}
                                    >
                                      View Report
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() => handleDownloadReport(session.session_id)}
                                      sx={{
                                        borderColor: '#fbd255',
                                        color: '#fbd255',
                                        fontWeight: 500,
                                        '&:hover': {
                                          backgroundColor: '#fbd255',
                                          color: 'black',
                                        },
                                      }}
                                    >
                                      Download Report
                                    </Button>
                                  </Box>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>{session.start_time || '-'}</TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>{session.end_time || '-'}</TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>{session.duration || '-'}</TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>{session.status || '-'}</TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>{session.created_at || '-'}</TableCell>
                              <TableCell sx={{ px: 2, py: 1.5 }}>{session.updated_at || '-'}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={10} align="center">
                              <div className="flex items-center justify-center h-60 relative">
                                <p className="text-lg absolute bottom-[15%]">Oops... data not found</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  );
                } catch (e) {
                  return (
                    <div className="flex items-center justify-center h-60 text-red-500">
                      Error rendering sessions table: {e.message}
                    </div>
                  );
                }
              })()
            )}
          </div>
        </>
      )}
      {error && <Typography color="error">{error}</Typography>}
      
      {/* Performance Report Modal */}
      <Modal open={!!selectedReport} onClose={handleCloseReportModal} aria-labelledby="report-modal-title">
          <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', md: 700 },
              bgcolor: 'background.paper',
              border: '1px solid #ccc',
              borderRadius: 2,
              boxShadow: 24,
              p: { xs: 2, md: 4 },
              color: 'text.primary',
              maxHeight: '90vh',
              overflowY: 'auto'
          }}>
              <Typography id="report-modal-title" variant="h6" component="h2" gutterBottom>
                  Performance Report
              </Typography>
              {selectedReport && (
                  <Grid container spacing={2}>
                      <Grid item xs={12}>
                          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', backgroundColor: '#fbd255', color: '#000' }}>
                              <Typography variant="overline">Overall Score</Typography>
                              <Typography variant="h4">{selectedReport.overall_score ?? 'N/A'}</Typography>
                          </Paper>
                      </Grid>

                      {Object.entries(selectedReport)
                          .filter(([key]) => !['overall_score', 'coaching_summary', 'raw'].includes(key) && typeof selectedReport[key] === 'number')
                          .map(([key, value]) => (
                              <Grid item xs={6} sm={4} key={key}>
                                  <Paper elevation={1} sx={{ p: 1.5, textAlign: 'center' }}>
                                      <Typography variant="body2" sx={{ textTransform: 'capitalize', color: 'text.secondary' }}>
                                          {key.replace(/_/g, ' ')}
                                      </Typography>
                                      <Typography variant="h6">{value}</Typography>
                                  </Paper>
                              </Grid>
                          ))}

                      {selectedReport.coaching_summary && (
                          <Grid item xs={12} sx={{ mt: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                  Coaching Summary
                              </Typography>
                              <Paper elevation={0} sx={{ p: 2, border: '1px solid #eee', whiteSpace: 'pre-wrap', maxHeight: '30vh', overflowY: 'auto' }}>
                                  <Typography variant="body2">
                                      {selectedReport.coaching_summary}
                                  </Typography>
                              </Paper>
                          </Grid>
                      )}
                  </Grid>
              )}
          </Box>
      </Modal>
    </div>
  );
};

export default UsersAndSessions; 