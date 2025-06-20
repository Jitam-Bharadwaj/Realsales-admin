import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { axioInstance } from "../../api/axios/axios";
import { endpoints } from "../../api/endpoints/endpoints";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const onSubmit = async (data) => {
    const payload = {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      password: data.password,
    };

    try {
      setLoading(true);
      const res = await axioInstance.post(endpoints.auth.register, payload);

      setLoading(false);
      reset();

      setSnackbar({
        open: true,
        message: res?.data?.message,
        severity: "success",
      });
    } catch (err) {
      setLoading(false);
      setSnackbar({
        open: true,
        message:
          err?.response?.data?.message || "Registration failed. Try again.",
        severity: "error",
      });
    }
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
            padding: "30px 20px",
            bgcolor: "#000000",
            borderRadius: "8px",
            maxWidth: "600px",
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
            Please Register First!
          </Typography>

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            sx={{
              pb: "15px",
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
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 100px #000 inset",
                WebkitTextFillColor: "#fff",
              },
            }}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email format",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            fullWidth
            label="First Name"
            type="text"
            sx={{
              pb: "15px",
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
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 100px #000 inset",
                WebkitTextFillColor: "#fff",
              },
            }}
            {...register("first_name", { required: "First name is required" })}
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
          />

          <TextField
            fullWidth
            label="Last Name"
            type="text"
            sx={{
              pb: "15px",
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
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 100px #000 inset",
                WebkitTextFillColor: "#fff",
              },
            }}
            {...register("last_name", { required: "Last name is required" })}
            error={!!errors.last_name}
            helperText={errors.last_name?.message}
          />

          <TextField
            fullWidth
            label="Phone"
            type="tel"
            sx={{
              pb: "15px",
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
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 100px #000 inset",
                WebkitTextFillColor: "#fff",
              },
            }}
            {...register("phone_number", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10-digit phone number",
              },
            })}
            error={!!errors.phone_number}
            helperText={errors.phone_number?.message}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            sx={{
              pb: "30px",
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
              padding: "10px 0px",
              borderRadius: "8px",
              bgcolor: "#fbdc5c",
              color: "#000000",
              "&:hover": {
                bgcolor: "#e6c753",
              },
            }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "SIGN-UP"}
          </Button>

          <Typography
            sx={{ textAlign: "center", paddingTop: "20px", color: "#fbdc5c" }}
          >
            Already have an account?&nbsp;
            <Link style={{ textDecoration: "none", color: "#fbdc5c" }} to="/">
              Sign-in
            </Link>
          </Typography>
        </Box>
      </Box>

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

export default Register;
