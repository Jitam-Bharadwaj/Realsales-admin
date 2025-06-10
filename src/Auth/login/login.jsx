import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { axioInstance } from "../../api/axios/axios";
import { endpoints } from "../../api/endpoints/endpoints";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'info' | 'warning'
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const payload = {
      email: data.email,
      password: data.password,
    };

    try {
      setLoading(true);
      const res = await axioInstance.post(`${endpoints.auth.login}`, payload);
      localStorage.setItem("x-access-token", res?.data?.token);
      console.log(res?.status, "login");

      setLoading(false);
      reset();

      // Show success snackbar
      setSnackbar({
        open: true,
        message: res.data.message,
        severity: "success",
      });

      if (res?.status === 200) {
        navigate("/drawer");
      }

      // You can do further actions here like redirecting user or storing token
    } catch (err) {
      setLoading(false);

      // Show error snackbar
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || "Login failed. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#000000",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            minHeight: "200px",
            minWidth: { xs: "250px", sm: "400px" },
            border: "1px solid #fbdc5c",
            padding: "40px 20px 60px 20px",
            bgcolor: "#000000",
            borderRadius: "8px",
            color: "#fbdc5c",
          }}
        >
          <Typography sx={{ color: "#fbdc5c" }}>
            Please Enter Your Details
          </Typography>
          <Typography
            sx={{
              fontSize: "28px",
              fontWeight: "600",
              pb: "20px",
              color: "#fbdc5c",
            }}
          >
            Welcome Back!
          </Typography>

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            sx={{
              pb: "20px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#fbdc5c",
                },
                "&:hover fieldset": {
                  borderColor: "#fbdc5c",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#fbdc5c",
                },
                backgroundColor: "#000",
              },
              "& .MuiInputLabel-root": {
                color: "#fbdc5c",
              },
              "& .MuiInputBase-input": {
                color: "#fff",
                backgroundColor: "#000",
              },
              // Autofill fix
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 100px #000 inset",
                WebkitTextFillColor: "#fff",
              },
            }}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email address",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            sx={{
              pb: "40px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#fbdc5c",
                },
                "&:hover fieldset": {
                  borderColor: "#fbdc5c",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#fbdc5c",
                },
                backgroundColor: "#000",
              },
              "& .MuiInputLabel-root": {
                color: "#fbdc5c",
              },
              "& .MuiInputBase-input": {
                color: "#fff",
                backgroundColor: "#000",
              },
              // Autofill fix
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 100px #000 inset",
                WebkitTextFillColor: "#fff",
              },
            }}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              padding: "12px 0px",
              borderRadius: "8px",
              bgcolor: "#fbdc5c",
              color: "#000000",
              "&:hover": {
                bgcolor: "#e6c753",
              },
            }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign-in"}
          </Button>

          <Typography
            sx={{ textAlign: "center", paddingTop: "20px", color: "#fbdc5c" }}
          >
            Don't have an account?&nbsp;
            <span>
              <Link
                style={{ textDecoration: "none", color: "#fbdc5c" }}
                to="/register"
              >
                Sign-up
              </Link>
            </span>
          </Typography>
        </Box>
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Login;
