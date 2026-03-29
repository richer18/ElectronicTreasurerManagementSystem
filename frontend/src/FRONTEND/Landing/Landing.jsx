import AssessmentIcon from "@mui/icons-material/Assessment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

const uiColors = {
  navy: "#1b2740",
  navyDeep: "#0f182b",
  blue: "#275fce",
  text: "#1c2437",
  muted: "#5d6678",
  line: "rgba(17,26,44,0.10)",
  bg: "#f7faff",
};

const modules = [
  {
    title: "Revenue Collection",
    description:
      "Manage real property tax, general fund, trust fund, and cedula records in one treasury workspace.",
    icon: <ReceiptLongIcon />,
  },
  {
    title: "Treasury Reports",
    description:
      "Prepare daily summaries, receipt checking, reconciliation, ESRE outputs, and report of collection views.",
    icon: <AssessmentIcon />,
  },
  {
    title: "Operations Calendar",
    description:
      "Keep office schedules, activity reminders, notices, and reporting coordination in one place.",
    icon: <CalendarMonthIcon />,
  },
];

function NavLink({ children }) {
  return (
    <Typography
      sx={{
        color: uiColors.navyDeep,
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
      }}
    >
      {children}
    </Typography>
  );
}

function ModuleCard({ title, description, icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        borderRadius: 4,
        border: `1px solid ${uiColors.line}`,
        backgroundColor: "#fff",
        boxShadow: "0 18px 40px rgba(20, 33, 61, 0.05)",
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          display: "grid",
          placeItems: "center",
          borderRadius: "16px",
          backgroundColor: alpha(uiColors.blue, 0.10),
          color: uiColors.blue,
          mb: 2,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ color: uiColors.text, fontWeight: 900, fontSize: 22 }}>
        {title}
      </Typography>
      <Typography sx={{ mt: 1.2, color: uiColors.muted, lineHeight: 1.8 }}>
        {description}
      </Typography>
    </Paper>
  );
}

function Landing() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 88% 18%, rgba(39,95,206,0.12), transparent 18%), radial-gradient(circle at 96% 85%, rgba(39,95,206,0.10), transparent 24%), #ffffff",
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 3, md: 6 }, pt: 2.5, pb: { xs: 8, md: 10 } }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
            spacing={3}
          >
            <Stack direction="row" spacing={1.6} alignItems="center">
              <Box
                component="img"
                src="/assets/images/ZAMBO_LOGO_P.png"
                alt="Municipality of Zamboanguita"
                sx={{ width: 54, height: 54, objectFit: "contain" }}
              />
              <Box>
                <Typography sx={{ color: uiColors.text, fontWeight: 900, fontSize: 18 }}>
                  Municipality of Zamboanguita
                </Typography>
                <Typography sx={{ color: uiColors.muted, fontWeight: 600 }}>
                  Province of Negros Oriental
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={{ xs: 2, lg: 5 }}
              alignItems={{ xs: "flex-start", lg: "center" }}
            >
              <Stack direction="row" spacing={5} sx={{ display: { xs: "none", md: "flex" } }}>
                <NavLink>Home</NavLink>
                <NavLink>News</NavLink>
                <NavLink>Privacy Policy</NavLink>
                <NavLink>Terms & Conditions</NavLink>
              </Stack>

              <Stack direction="row" spacing={1.2}>
                <Button
                  variant="outlined"
                  sx={{
                    minWidth: 138,
                    height: 42,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 800,
                    borderColor: uiColors.line,
                    color: uiColors.text,
                    backgroundColor: "#fff",
                  }}
                >
                  Sign Up
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  sx={{
                    minWidth: 122,
                    height: 42,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 900,
                    backgroundColor: uiColors.navy,
                    color: "#fff",
                    "&:hover": { backgroundColor: uiColors.navyDeep },
                  }}
                >
                  Log in
                </Button>
              </Stack>
            </Stack>
          </Stack>

          <Grid container spacing={4} alignItems="center" sx={{ mt: { xs: 4, md: 6 } }}>
            <Grid item xs={12} lg={4.5}>
              <Stack spacing={2.8}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                    component="img"
                    src="/assets/images/logo-ct.png"
                    alt="eLGU"
                    sx={{ width: 34, height: 34, objectFit: "contain" }}
                  />
                  <Typography
                    sx={{
                      color: uiColors.text,
                      fontSize: { xs: 32, md: 42 },
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    eLGU
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    color: uiColors.navyDeep,
                    fontWeight: 950,
                    fontSize: { xs: "3rem", md: "4.4rem" },
                    lineHeight: 0.96,
                    letterSpacing: "-0.05em",
                    maxWidth: 560,
                  }}
                >
                  Electronic Treasurer Management System
                </Typography>

                <Typography
                  sx={{
                    color: uiColors.muted,
                    fontSize: { xs: 18, md: 20 },
                    lineHeight: 1.75,
                    maxWidth: 520,
                  }}
                >
                  Supporting the Filipino local treasury office with a more
                  organized digital workspace for collections, reports,
                  reconciliation, and internal operations.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.6} sx={{ pt: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    endIcon={<KeyboardDoubleArrowRightRoundedIcon />}
                    sx={{
                      width: { xs: "100%", sm: 260 },
                      height: 52,
                      borderRadius: 2.5,
                      textTransform: "none",
                      fontWeight: 900,
                      backgroundColor: uiColors.navy,
                      color: "#fff",
                    }}
                  >
                    Open Treasury Portal
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/my-app"
                    variant="outlined"
                    sx={{
                      width: { xs: "100%", sm: 200 },
                      height: 52,
                      borderRadius: 2.5,
                      textTransform: "none",
                      fontWeight: 800,
                      borderColor: uiColors.line,
                      color: uiColors.text,
                    }}
                  >
                    View Workspace
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={7.5}>
              <Box sx={{ position: "relative", minHeight: { xs: 280, md: 560 } }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: { xs: 20, md: 30 },
                    right: { xs: 0, md: 40 },
                    width: { xs: "100%", md: "88%" },
                    borderRadius: "28px",
                    overflow: "hidden",
                    boxShadow: "0 42px 80px rgba(15, 25, 50, 0.18)",
                    border: "1px solid rgba(17,26,44,0.08)",
                    backgroundColor: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.1,
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      borderBottom: `1px solid ${uiColors.line}`,
                      backgroundColor: "#fbfcff",
                    }}
                  >
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#28c840" }} />
                  </Box>
                  <Box
                    component="img"
                    src="/assets/images/patsada_zamboanguita_70.png"
                    alt="Treasury dashboard preview"
                    sx={{
                      width: "100%",
                      display: "block",
                      backgroundColor: "#fff",
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: uiColors.bg, py: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {modules.map((item) => (
              <Grid item xs={12} md={4} key={item.title}>
                <ModuleCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                />
              </Grid>
            ))}
          </Grid>

          <Paper
            elevation={0}
            sx={{
              mt: 5,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: `1px solid ${uiColors.line}`,
              backgroundColor: "#fff",
              boxShadow: "0 18px 40px rgba(20, 33, 61, 0.05)",
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography
                  sx={{
                    color: uiColors.blue,
                    fontWeight: 900,
                    fontSize: 13,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                  }}
                >
                  Official LGU Treasury Workspace
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    color: uiColors.text,
                    fontWeight: 950,
                    fontSize: { xs: 30, md: 40 },
                    lineHeight: 1.05,
                  }}
                >
                  Built for accountable municipal treasury operations
                </Typography>
                <Typography
                  sx={{
                    mt: 1.6,
                    color: uiColors.muted,
                    lineHeight: 1.8,
                    maxWidth: 680,
                  }}
                >
                  The landing page now focuses on a clean official-looking entry
                  experience, while the system itself remains centered on
                  treasury workflows, collection review, and daily reporting.
                </Typography>
              </Grid>

              <Grid item xs={12} md={5}>
                <Stack spacing={1.3}>
                  {[
                    "Revenue monitoring and receipt checking",
                    "Collection reports and treasury summaries",
                    "Calendar coordination and internal notices",
                    "Staff access to operational treasury modules",
                  ].map((item) => (
                    <Stack
                      key={item}
                      direction="row"
                      spacing={1.2}
                      alignItems="center"
                      sx={{
                        px: 1.5,
                        py: 1.2,
                        borderRadius: 2.5,
                        backgroundColor: alpha(uiColors.blue, 0.06),
                      }}
                    >
                      <SecurityRoundedIcon sx={{ color: uiColors.blue }} />
                      <Typography sx={{ color: uiColors.text, fontWeight: 700 }}>
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default Landing;
