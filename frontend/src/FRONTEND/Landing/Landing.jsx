import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import GppGoodOutlinedIcon from "@mui/icons-material/GppGoodOutlined";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ScheduleSendRoundedIcon from "@mui/icons-material/ScheduleSendRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

const uiColors = {
  navy: "#102946",
  navyDeep: "#0a1d33",
  navySoft: "#193c62",
  teal: "#0e6f67",
  tealSoft: "#dbf1ee",
  amber: "#b87809",
  amberSoft: "#fff1d6",
  red: "#b33d2e",
  bg: "#f5f8fc",
  line: "rgba(16,41,70,0.08)",
  hero: "linear-gradient(135deg, #0b1d33 0%, #163a63 50%, #0e6f67 100%)",
};

const highlights = [
  {
    title: "Centralized Collection Workflows",
    description:
      "Handle RPT, General Fund, Trust Fund, Cedula, and related treasury functions inside one operational workspace.",
    icon: <ReceiptLongIcon />,
  },
  {
    title: "Daily Reporting Discipline",
    description:
      "Support summary reports, ESRE, reconciliation views, and daily collection monitoring for office use.",
    icon: <AssessmentIcon />,
  },
  {
    title: "Structured Treasury Coordination",
    description:
      "Organize schedules, deadlines, supporting records, and module access for consistent office operations.",
    icon: <CalendarMonthIcon />,
  },
];

const workflow = [
  {
    step: "01",
    title: "Capture Collections",
    description:
      "Record and review transactions across core revenue modules with consistent treasury data handling.",
  },
  {
    step: "02",
    title: "Monitor and Reconcile",
    description:
      "Check receipts, compare daily totals, and maintain follow-through on under, over, and due-from items.",
  },
  {
    step: "03",
    title: "Prepare Office Reports",
    description:
      "Generate summaries and internal treasury outputs for management review, monitoring, and accountability.",
  },
];

const moduleCards = [
  {
    title: "Revenue Modules",
    description:
      "Real Property Tax, General Fund, Trust Fund, and Community Tax Certificate workflows for daily treasury use.",
    icon: <AccountBalanceIcon />,
    items: ["RPT", "General Fund", "Trust Fund", "Cedula"],
    accent: uiColors.navy,
  },
  {
    title: "Report Controls",
    description:
      "Collection and deposit reports, full report consolidation, ESRE preparation, and receipt checking.",
    icon: <InsightsRoundedIcon />,
    items: ["RCD", "Full Report", "ESRE", "Check Receipt"],
    accent: uiColors.teal,
  },
  {
    title: "Office Support",
    description:
      "Calendar scheduling, business support modules, templates, and other operational treasury tools.",
    icon: <GridViewRoundedIcon />,
    items: ["Calendar", "Business Support", "Templates", "Office Utilities"],
    accent: uiColors.amber,
  },
];

const benefits = [
  {
    title: "Operational Clarity",
    description:
      "Treasury staff can work from one shared system instead of jumping across disconnected files and manual trackers.",
    icon: <FactCheckOutlinedIcon />,
  },
  {
    title: "Internal Accountability",
    description:
      "The platform is structured for traceable reporting, clearer summaries, and stronger day-to-day record discipline.",
    icon: <ShieldOutlinedIcon />,
  },
  {
    title: "Practical LGU Fit",
    description:
      "The page and modules are tailored to municipal treasury operations rather than a generic back-office dashboard.",
    icon: <GppGoodOutlinedIcon />,
  },
];

const stats = [
  { value: "8+", label: "Treasury work areas" },
  { value: "1", label: "Internal operations workspace" },
  { value: "Daily", label: "Collection monitoring focus" },
  { value: "LGU", label: "Philippine treasury context" },
];

function StatCard({ value, label }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: "100%",
        borderRadius: 3.5,
        border: `1px solid ${uiColors.line}`,
        backgroundColor: "#fff",
        boxShadow: "0 16px 30px rgba(16,41,70,0.06)",
      }}
    >
      <Typography
        sx={{
          color: uiColors.navy,
          fontWeight: 900,
          fontSize: { xs: "1.8rem", md: "2.1rem" },
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ mt: 0.9, color: "#5b6b7c", fontWeight: 600 }}>
        {label}
      </Typography>
    </Paper>
  );
}

function Landing() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${alpha(
          uiColors.navy,
          0.04
        )} 0%, #ffffff 18%, ${uiColors.bg} 100%)`,
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background: uiColors.hero,
          color: "#fff",
          pb: { xs: 10, md: 13 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 28%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08), transparent 24%)",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ py: 2.5 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                component="img"
                src="/assets/images/ZAMBO_LOGO_P.png"
                alt="Municipal logo"
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  p: 0.5,
                }}
              />
              <Box>
                <Typography sx={{ fontWeight: 900, letterSpacing: 0.15 }}>
                  Electronic Treasurer Management System
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: 13 }}>
                  Office of the Municipal Treasurer
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                sx={{
                  borderRadius: "999px",
                  px: 3,
                  py: 1.15,
                  textTransform: "none",
                  fontWeight: 900,
                  backgroundColor: "#f4c265",
                  color: uiColors.navyDeep,
                  "&:hover": {
                    backgroundColor: "#e3b355",
                  },
                }}
              >
                Staff Login
              </Button>
              <Button
                component={RouterLink}
                to="/my-app"
                variant="outlined"
                sx={{
                  borderRadius: "999px",
                  px: 3,
                  py: 1.15,
                  textTransform: "none",
                  fontWeight: 800,
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.28)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.48)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                Open Application
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={5} alignItems="center" sx={{ pt: { xs: 3, md: 6 } }}>
            <Grid item xs={12} md={7}>
              <Chip
                icon={<ShieldOutlinedIcon sx={{ color: "#fff !important" }} />}
                label="Internal LGU Treasury Operations Platform"
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  mt: 2.5,
                  maxWidth: 760,
                  fontSize: { xs: "2.7rem", md: "4.8rem" },
                  lineHeight: 0.98,
                  letterSpacing: "-0.05em",
                  fontWeight: 950,
                }}
              >
                A more organized treasury workspace for local government revenue operations
              </Typography>

              <Typography
                sx={{
                  mt: 2.4,
                  maxWidth: 700,
                  color: "rgba(255,255,255,0.82)",
                  fontSize: { xs: "1rem", md: "1.08rem" },
                  lineHeight: 1.8,
                }}
              >
                Built for the Office of the Municipal Treasurer to support
                collections, receipt checking, daily reports, calendar
                coordination, and accountability-focused record handling in a
                single internal system.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  endIcon={<KeyboardDoubleArrowRightRoundedIcon />}
                  sx={{
                    borderRadius: "16px",
                    px: 3.5,
                    py: 1.45,
                    textTransform: "none",
                    fontWeight: 900,
                    backgroundColor: "#ffffff",
                    color: uiColors.navy,
                    "&:hover": { backgroundColor: "#edf3f8" },
                  }}
                >
                  Enter Treasury Portal
                </Button>
                <Button
                  component={RouterLink}
                  to="/my-app"
                  variant="outlined"
                  sx={{
                    borderRadius: "16px",
                    px: 3.5,
                    py: 1.45,
                    textTransform: "none",
                    fontWeight: 800,
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.30)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.48)",
                      backgroundColor: "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  Open Workspace
                </Button>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mt: 4.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TaskAltIcon sx={{ color: "#8be4d5" }} />
                  <Typography sx={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>
                    Daily collection monitoring
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TaskAltIcon sx={{ color: "#8be4d5" }} />
                  <Typography sx={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>
                    Internal report preparation
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TaskAltIcon sx={{ color: "#8be4d5" }} />
                  <Typography sx={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>
                    LGU treasury record discipline
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4.5,
                  backgroundColor: "rgba(255,255,255,0.09)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 22px 40px rgba(0,0,0,0.14)",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    component="img"
                    src="/assets/images/TreasurerPNG.png"
                    alt="Treasurer office"
                    sx={{
                      width: 88,
                      height: 88,
                      objectFit: "contain",
                      borderRadius: 3,
                      backgroundColor: "rgba(255,255,255,0.10)",
                      p: 1.2,
                    }}
                  />
                  <Box>
                    <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
                      Office Overview
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      Municipal Treasury System
                    </Typography>
                    <Typography sx={{ mt: 0.5, color: "rgba(255,255,255,0.74)" }}>
                      Built for structured internal treasury operations.
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2.5, borderColor: "rgba(255,255,255,0.12)" }} />

                <Stack spacing={1.35}>
                  {[
                    "Real Property Tax and collection review",
                    "General Fund and Trust Fund monitoring",
                    "Cedula transactions and receipt validation",
                    "Full report and reconciliation tracking",
                    "Calendar, reporting schedules, and notices",
                  ].map((item) => (
                    <Stack
                      key={item}
                      direction="row"
                      spacing={1.2}
                      alignItems="flex-start"
                      sx={{
                        px: 1.35,
                        py: 1.2,
                        borderRadius: 2.5,
                        backgroundColor: "rgba(255,255,255,0.08)",
                      }}
                    >
                      <TaskAltIcon sx={{ color: "#8be4d5", mt: "2px" }} />
                      <Typography sx={{ fontWeight: 700 }}>{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{ mt: { xs: -5, md: -6 }, pb: 12, position: "relative", zIndex: 1 }}
      >
        <Grid container spacing={2.5}>
          {stats.map((item) => (
            <Grid item xs={6} md={3} key={item.label}>
              <StatCard value={item.value} label={item.label} />
            </Grid>
          ))}
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mt: 3.5,
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            border: `1px solid ${uiColors.line}`,
            backgroundColor: "#fff",
            boxShadow: "0 18px 34px rgba(16,41,70,0.06)",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography
                variant="overline"
                sx={{ color: uiColors.amber, fontWeight: 900, letterSpacing: 1.2 }}
              >
                Why This Platform
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, color: uiColors.navy, fontWeight: 900 }}>
                Treasury work needs one reliable operating space
              </Typography>
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                {highlights.map((item, index) => (
                  <Grid item xs={12} md={4} key={item.title}>
                    <Card
                      sx={{
                        p: 2.5,
                        height: "100%",
                        borderRadius: 3.5,
                        border: `1px solid ${uiColors.line}`,
                        background:
                          index === 1
                            ? "linear-gradient(180deg, #ffffff 0%, #f3fbf9 100%)"
                            : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                        boxShadow: "none",
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: "16px",
                          color: index === 1 ? uiColors.teal : uiColors.navy,
                          backgroundColor:
                            index === 1
                              ? alpha(uiColors.teal, 0.12)
                              : alpha(uiColors.navy, 0.08),
                          mb: 1.8,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography sx={{ color: uiColors.navy, fontWeight: 900 }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ mt: 1, color: "#5b6b7c", lineHeight: 1.7 }}>
                        {item.description}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3} sx={{ mt: 1.5 }}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                border: `1px solid ${uiColors.line}`,
                boxShadow: "0 18px 34px rgba(16,41,70,0.05)",
                backgroundColor: "#fff",
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: uiColors.teal, fontWeight: 900, letterSpacing: 1.2 }}
              >
                How It Supports the Office
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: uiColors.navy, fontWeight: 950 }}>
                A practical workflow for daily treasury operations
              </Typography>
              <Stack spacing={2.2} sx={{ mt: 3 }}>
                {workflow.map((item) => (
                  <Stack
                    key={item.step}
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: alpha(uiColors.navy, 0.03),
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 52,
                        height: 52,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "16px",
                        backgroundColor: alpha(uiColors.navy, 0.08),
                        color: uiColors.navy,
                        fontWeight: 900,
                      }}
                    >
                      {item.step}
                    </Box>
                    <Box>
                      <Typography sx={{ color: uiColors.navy, fontWeight: 900 }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ mt: 0.7, color: "#5b6b7c", lineHeight: 1.7 }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                border: `1px solid ${uiColors.line}`,
                boxShadow: "0 18px 34px rgba(16,41,70,0.05)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)",
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: uiColors.amber, fontWeight: 900, letterSpacing: 1.2 }}
              >
                What the Office Gains
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: uiColors.navy, fontWeight: 950 }}>
                Better visibility, better control, better reporting rhythm
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                {benefits.map((item, index) => (
                  <Stack
                    key={item.title}
                    direction="row"
                    spacing={1.6}
                    alignItems="flex-start"
                    sx={{
                      p: 2.2,
                      borderRadius: 3,
                      backgroundColor:
                        index === 1
                          ? alpha(uiColors.teal, 0.08)
                          : alpha(uiColors.amber, 0.08),
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "14px",
                        backgroundColor: "#fff",
                        color: index === 1 ? uiColors.teal : uiColors.amber,
                        boxShadow: "0 8px 18px rgba(16,41,70,0.06)",
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ color: uiColors.navy, fontWeight: 900 }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ mt: 0.7, color: "#5b6b7c", lineHeight: 1.7 }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 5 }}>
          <Typography
            variant="overline"
            sx={{ color: uiColors.teal, fontWeight: 900, letterSpacing: 1.2 }}
          >
            Core Areas
          </Typography>
          <Typography variant="h3" sx={{ mt: 1, color: uiColors.navy, fontWeight: 950 }}>
            Modules aligned to treasury office work
          </Typography>
          <Typography
            sx={{
              mt: 1.6,
              maxWidth: 760,
              color: "#5b6b7c",
              lineHeight: 1.8,
            }}
          >
            The system is structured around real treasury tasks: revenue
            encoding, receipt checking, report preparation, daily control, and
            internal office coordination.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {moduleCards.map((item) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: 3.2,
                  borderRadius: 4,
                  border: `1px solid ${uiColors.line}`,
                  boxShadow: "0 18px 34px rgba(16,41,70,0.05)",
                  backgroundColor: "#fff",
                }}
              >
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "18px",
                    backgroundColor: alpha(item.accent, 0.10),
                    color: item.accent,
                    mb: 2,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h5" sx={{ color: uiColors.navy, fontWeight: 900 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ mt: 1.1, color: "#5b6b7c", lineHeight: 1.75 }}>
                  {item.description}
                </Typography>

                <Stack spacing={1.1} sx={{ mt: 2.4 }}>
                  {item.items.map((entry) => (
                    <Stack
                      key={entry}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        px: 1.5,
                        py: 1.2,
                        borderRadius: 2.5,
                        backgroundColor: alpha(item.accent, 0.06),
                      }}
                    >
                      <Typography sx={{ color: uiColors.navy, fontWeight: 700 }}>
                        {entry}
                      </Typography>
                      <KeyboardDoubleArrowRightRoundedIcon
                        sx={{ color: item.accent }}
                      />
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mt: 5,
            p: { xs: 3, md: 4.5 },
            borderRadius: 4.5,
            border: `1px solid ${uiColors.line}`,
            background:
              "linear-gradient(135deg, rgba(16,41,70,1) 0%, rgba(14,111,103,1) 100%)",
            color: "#fff",
            boxShadow: "0 24px 42px rgba(16,41,70,0.16)",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="overline"
                sx={{ color: "rgba(255,255,255,0.78)", fontWeight: 900, letterSpacing: 1.2 }}
              >
                Treasury Access
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 950, lineHeight: 1.08 }}>
                Ready for authorized staff to continue office operations
              </Typography>
              <Typography
                sx={{
                  mt: 1.5,
                  maxWidth: 620,
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.8,
                }}
              >
                Proceed to the internal portal to access collection modules,
                reporting pages, office calendar tools, and operational treasury
                records intended for authorized LGU staff use.
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack spacing={1.5}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  startIcon={<ScheduleSendRoundedIcon />}
                  sx={{
                    borderRadius: "16px",
                    py: 1.45,
                    textTransform: "none",
                    fontWeight: 900,
                    backgroundColor: "#ffffff",
                    color: uiColors.navy,
                    "&:hover": { backgroundColor: "#edf3f8" },
                  }}
                >
                  Sign In to Treasury Portal
                </Button>
                <Button
                  component={RouterLink}
                  to="/my-app"
                  variant="outlined"
                  sx={{
                    borderRadius: "16px",
                    py: 1.45,
                    textTransform: "none",
                    fontWeight: 800,
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.26)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.42)",
                      backgroundColor: "rgba(255,255,255,0.06)",
                    },
                  }}
                >
                  Open Application Workspace
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default Landing;
