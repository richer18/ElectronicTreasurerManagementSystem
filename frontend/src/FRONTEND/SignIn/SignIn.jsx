import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CssBaseline,
  Fade,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import {
  AccountBalanceOutlined,
  LockOutlined,
  PersonOutline,
  ShieldOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./components/ForgotPassword";

const lguTheme = createTheme({
  palette: {
    primary: {
      main: "#1a237e",
      light: "#534bae",
      dark: "#000051",
    },
    secondary: {
      main: "#f57f17",
    },
    background: {
      default: "#f4f6f8",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const handleClose = () => {
    setOpen(false);
  };

  const validateInputs = (formData) => {
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    let isValid = true;

    if (!username) {
      setUsernameError(true);
      setUsernameErrorMessage("Username is required.");
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage("");
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (!validateInputs(formData)) return;

    setIsLoading(true);
    setLoginError("");

    const payload = {
      username: String(formData.get("username") || "").trim(),
      password: String(formData.get("password") || ""),
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}login`,
        payload
      );
      localStorage.setItem("isAuthenticated", "true");
      if (response?.data?.user) {
        localStorage.setItem("authUser", JSON.stringify(response.data.user));
      } else {
        localStorage.removeItem("authUser");
      }
      localStorage.setItem("lastLoginAt", new Date().toISOString());
      navigate("/my-app");
    } catch (error) {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("authUser");
      setLoginError(error.response?.data?.message || "Invalid credentials. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={lguTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          background: "linear-gradient(130deg, #f7f9fc 0%, #d4deef 100%)",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 6,
            background:
              "linear-gradient(rgba(26,35,126,0.9), rgba(26,35,126,0.92)), url('https://images.unsplash.com/photo-1577416414929-7a4c9f1d9487?auto=format&fit=crop&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "white",
            textAlign: "center",
          }}
        >
          <AccountBalanceOutlined sx={{ fontSize: 80, mb: 2, color: "secondary.main" }} />
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Office of the Treasurer
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 500, fontWeight: 300 }}>
            LGU Official Management Portal. Ensuring transparency and excellence in local fiscal
            administration.
          </Typography>
          <Stack direction="row" spacing={3} sx={{ mt: 8 }}>
            <Box sx={{ textAlign: "center" }}>
              <ShieldOutlined sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="caption" display="block">
                Secure Access
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <LockOutlined sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="caption" display="block">
                Encrypted Data
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: { xs: 1, md: 0.6, lg: 0.4 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 2, sm: 4 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 6 },
              width: "100%",
              maxWidth: 450,
              borderRadius: 4,
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              backgroundColor: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                component="img"
                src="/assets/images/ZAMBO_LOGO_P.png"
                alt="LGU Logo"
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.1))",
                }}
              />
              <Typography variant="h4" color="primary" gutterBottom>
                Staff Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please enter your credentials to access the system.
              </Typography>
            </Box>

            {loginError && (
              <Fade in={Boolean(loginError)}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {loginError}
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="username" sx={{ mb: 1, fontWeight: 600, fontSize: "0.85rem" }}>
                    Username
                  </FormLabel>
                  <TextField
                    id="username"
                    name="username"
                    placeholder="e.g. jdoe_treasury"
                    autoComplete="username"
                    autoFocus
                    variant="outlined"
                    error={usernameError}
                    helperText={usernameErrorMessage}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutline color={usernameError ? "error" : "action"} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <FormLabel htmlFor="password" sx={{ mb: 1, fontWeight: 600, fontSize: "0.85rem" }}>
                    Password
                  </FormLabel>
                  <TextField
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    variant="outlined"
                    error={passwordError}
                    helperText={passwordErrorMessage}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined color={passwordError ? "error" : "action"} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <FormControlLabel
                    control={<Checkbox value="remember" color="primary" size="small" />}
                    label={<Typography variant="body2">Keep me logged in</Typography>}
                  />
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setOpen(true)}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Forgot Password?
                  </Button>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(26,35,126,0.3)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(26,35,126,0.4)",
                    },
                  }}
                >
                  {isLoading ? "Authenticating..." : "Sign In to Portal"}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                © {new Date().getFullYear()} Municipal Government Revenue System
                <br />
                Security Level: High (Internal Access Only)
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
      <ForgotPassword open={open} handleClose={handleClose} />
    </ThemeProvider>
  );
}
