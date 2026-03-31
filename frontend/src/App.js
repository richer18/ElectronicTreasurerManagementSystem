import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Routers from "./Router/Router";
import { AuthProvider } from "./auth/AuthContext";

function App() {
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#1f3a5f" },
      secondary: { main: "#a66700" },
      background: { default: "#f5f7fb", paper: "#ffffff" },
      // Custom gradient palette
      gradients: {
        primary: {
          main: "#1f3a5f",
          state: "#2f4f7f",
        },
        dark: {
          main: "#0f1117",
          state: "#1b2230",
        },
      },
    },

    typography: {
      fontFamily: "Roboto, Arial, sans-serif",
    },

    // Custom functions allowed (MUI supports theme augmentation)
    functions: {
      linearGradient: (color1, color2) =>
        `linear-gradient(to bottom, ${color1}, ${color2})`,
    },
  });

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routers />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
