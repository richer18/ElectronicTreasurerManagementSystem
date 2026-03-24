import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import ArticleIcon from "@mui/icons-material/Article";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BarChartIcon from "@mui/icons-material/BarChart";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import DirectionsTransitFilledIcon from "@mui/icons-material/DirectionsTransitFilled";
import ElectricScooterIcon from "@mui/icons-material/ElectricScooter";
import EmailIcon from "@mui/icons-material/Email";
import GavelIcon from "@mui/icons-material/Gavel";
import HouseIcon from "@mui/icons-material/House";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import InboxIcon from "@mui/icons-material/Inbox";
// import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ScubaDivingIcon from "@mui/icons-material/ScubaDiving";
import SellIcon from "@mui/icons-material/Sell";
import SendIcon from "@mui/icons-material/Send";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { createTheme } from "@mui/material/styles";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { DemoProvider } from "@toolpad/core/internal";
import PropTypes from "prop-types";
import * as React from "react";
import axiosInstance from "../../api/axiosInstance";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import TaxCollected from "./components/CHARTS/TaxCollected";
import CedulaCollected from "./components/CHARTS/CedulaCollected";
// import GeneralFundCollected from "./components/CHARTS/GeneralFundCollected";
import "./system.css";
// import TrustFundCollected from "./components/CHARTS/TrustFundCollected";
// import RealPropertyTaxCollected from "./components/CHARTS/RealPropertyTaxCollected";
// import Status from "./components/CHARTS/status";

const NAVIGATION = [
  {
    kind: "header",
    title: "Core Operations",
  },
  {
    segment: "my-app",
    title: "Dashboard",
    icon: <DashboardIcon sx={{ color: "primary.main" }} />,
  },
  {
    segment: "rcd",
    title: "Report of Collection and Deposit",
    icon: <AssignmentIcon sx={{ color: "primary.main" }} />,
  },
  {
    segment: "calendar",
    title: "Calendar",
    icon: <CalendarMonthIcon sx={{ color: "primary.main" }} />,
  },
  {
    title: "Abstract",
    icon: <ArticleIcon sx={{ color: "secondary.main" }} />,
    children: [
      {
        segment: "Real-Property-Tax",
        title: "Real Property Tax",
        icon: <HouseIcon sx={{ color: "primary.main" }} />,
      },
      {
        segment: "General-Fund",
        title: "General Fund",
        icon: <AccountBalanceWalletIcon sx={{ color: "success.main" }} />,
      },
      {
        segment: "Trust-Fund",
        title: "Trust Fund",
        icon: <GavelIcon sx={{ color: "success.main" }} />,
      },
      {
        segment: "community-tax-certificate",
        title: "Community Tax Certificate",
        icon: <AssignmentIndIcon sx={{ color: "warning.main" }} />,
      },
    ],
  },
  {
    title: "Business",
    icon: <BusinessIcon sx={{ color: "warning.main" }} />,
    children: [
      {
        segment: "business-registration",
        title: "Business Registration",
        icon: <HowToRegIcon sx={{ color: "primary.main" }} />,
      },
      {
        segment: "mch",
        title: "MCH FRANCHISE",
        icon: <DirectionsTransitFilledIcon sx={{ color: "warning.main" }} />,
      },
      {
        segment: "e-bike-trisikad",
        title: "E_BIKE-TRISIKAD",
        icon: <ElectricScooterIcon sx={{ color: "info.main" }} />,
      },
    ],
  },
  {
    title: "Tickets",
    icon: <BookOnlineIcon sx={{ color: "info.main" }} />,
    children: [
      {
        segment: "dive-ticket",
        title: "Diving Ticket",
        icon: <ScubaDivingIcon sx={{ color: "info.dark" }} />,
      },
      {
        segment: "cash-ticket",
        title: "Cash Ticket",
        icon: <SellIcon sx={{ color: "secondary.main" }} />,
      },
    ],
  },
  {
    title: "Doc Stamp",
    icon: <AssignmentIcon sx={{ color: "primary.main" }} />,
  },
  {
    segment: "water-works",
    title: "Water Works",
    icon: <WaterDropIcon sx={{ color: "info.main" }} />,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Administration",
  },
  {
    title: "Import Data",
    icon: <ImportExportIcon sx={{ color: "info.main" }} />,
    children: [
      {
        segment: "import-general-fund",
        title: "General Fund",
        icon: <AccountBalanceWalletIcon sx={{ color: "success.main" }} />,
      },
      {
        segment: "import-trust-fund",
        title: "Trust Fund",
        icon: <GavelIcon sx={{ color: "warning.main" }} />,
      },
      {
        segment: "import-real-property-tax",
        title: "Real Property Tax",
        icon: <HouseIcon sx={{ color: "primary.main" }} />,
      },
      {
        segment: "import-cedula",
        title: "Cedula",
        icon: <AssignmentIndIcon sx={{ color: "info.main" }} />,
      },
    ],
  },
  {
    title: "Templates",
    icon: <DescriptionIcon sx={{ color: "info.main" }} />,
    children: [
      {
        segment: "email-inbox",
        title: "Voucher",
        icon: <AssignmentIcon sx={{ color: "primary.main" }} />,
      },
      {
        segment: "email-sent-rcd-gf",
        title: "RCD GF",
        icon: <ArticleIcon sx={{ color: "success.main" }} />,
      },
      {
        segment: "email-sent-rcd-sef",
        title: "RCD SEF",
        icon: <BookOnlineIcon sx={{ color: "success.main" }} />,
      },
      {
        segment: "email-sent-mch-application",
        title: "MCH Application",
        icon: <DirectionsTransitFilledIcon sx={{ color: "warning.main" }} />,
      },
      {
        segment: "email-sent-mch-certification",
        title: "MCH Certification",
        icon: <HowToRegIcon sx={{ color: "info.main" }} />,
      },
      {
        segment: "email-sent-mch-order",
        title: "MCH Order",
        icon: <SellIcon sx={{ color: "secondary.main" }} />,
      },
      {
        segment: "email-sent-mch-clearance",
        title: "MCH Clearance",
        icon: <GavelIcon sx={{ color: "primary.main" }} />,
      },
    ],
  },
  {
    title: "Email",
    icon: <EmailIcon sx={{ color: "error.main" }} />,
    children: [
      {
        segment: "email-inbox",
        title: "Inbox",
        icon: <InboxIcon sx={{ color: "primary.main" }} />,
      },
      {
        segment: "email-sent",
        title: "Sent",
        icon: <SendIcon sx={{ color: "success.main" }} />,
      },
    ],
  },
  {
    title: "Income Target",
    icon: <TrendingUpIcon sx={{ color: "success.dark" }} />,
  },
  {
    segment: "register-user",
    title: "User Registration",
    icon: <AppRegistrationIcon sx={{ color: "info.main" }} />,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Analytics",
  },
  {
    title: "Reports",
    icon: <BarChartIcon sx={{ color: "primary.main" }} />,
    children: [
      {
        segment: "business-card",
        title: "Business Card",
        icon: <DescriptionIcon sx={{ color: "text.secondary" }} />,
      },
      {
        segment: "rpt-card",
        title: "RPT Card",
        icon: <DescriptionIcon sx={{ color: "text.secondary" }} />,
      },
      {
        segment: "full-report",
        title: "Full Report",
        icon: <DescriptionIcon sx={{ color: "text.secondary" }} />,
      },
      {
        segment: "esre",
        title: "ESRE",
        icon: <DescriptionIcon sx={{ color: "text.secondary" }} />,
      },
      {
        segment: "collection",
        title: "Summary of Collection Report",
        icon: <DescriptionIcon sx={{ color: "text.secondary" }} />,
      },
    ],
  },
];

const demoTheme = createTheme({
  colorSchemes: { light: true },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: "1px solid transparent",
          "&:hover": {
            borderColor: "#d6a12b",
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

const resolveNavigationTitle = (pathname) => {
  const segment = pathname.replace(/^\/my-app\/?/, "");
  const findTitle = (items) => {
    for (const item of items) {
      if (item.segment === segment) return item.title;
      if (item.children) {
        const childTitle = findTitle(item.children);
        if (childTitle) return childTitle;
      }
    }
    return null;
  };
  return findTitle(NAVIGATION) || "Dashboard";
};

function DemoPageContent({ pathname }) {
  const breadcrumbItems = pathname.split("/").filter(Boolean);

  const isDashboard = pathname === "/my-app" || pathname === "/";
  return (
    <Box
      sx={{
        py: 4,
        px: 2,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#">
            Home
          </Link>
          {breadcrumbItems.map((item, index) => (
            <Link
              key={item}
              color={
                breadcrumbItems[breadcrumbItems.length - 1] === item
                  ? "text.primary"
                  : "inherit"
              }
              href={`/${breadcrumbItems.slice(0, index + 1).join("/")}`}
              aria-current={
                breadcrumbItems[breadcrumbItems.length - 1] === item
                  ? "page"
                  : undefined
              }
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      <Box sx={{ textAlign: "center", flexGrow: 1 }}>
        {isDashboard ? <DashboardHome /> : <Outlet />}
      </Box>
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardLayoutBranding(props) {
  const { window } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = `/my-app${location.pathname.startsWith("/my-app") ? location.pathname.slice(7) : location.pathname}`;

  const router = React.useMemo(
    () => ({
      pathname,
      searchParams: new URLSearchParams(location.search),
      navigate: (path) => {
        const fullPath = path.startsWith("/my-app") ? path : `/my-app${path}`;
        console.log(`Navigating to: ${fullPath}`);
        navigate(fullPath);
      },
    }),
    [pathname, navigate, location.search]
  );
  const resolvePageTitle = React.useMemo(
    () => resolveNavigationTitle(router.pathname),
    [router.pathname]
  );
  const brandingTitle = (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Electronic Treasurer Management System</Box>
      <Box
        sx={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          top: 0,
          height: { xs: 56, sm: 64 },
          display: "flex",
          alignItems: "center",
          fontWeight: 700,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          textTransform: "uppercase",
          color: "#000000",
        }}
      >
        {resolvePageTitle}
      </Box>
    </Box>
  );

  const demoWindow = window !== undefined ? window() : undefined;

  return (
    // Remove this provider when copying and pasting into your project.
    <DemoProvider window={demoWindow}>
      {/* preview-start */}
      <AppProvider
        navigation={NAVIGATION}
        branding={{
          logo: <img src="/assets/images/ZAMBO_LOGO_P.png" alt="LGU logo" />,
          title: brandingTitle,
          // homeUrl: "/toolpad/core/introduction",
        }}
        router={router}
        theme={demoTheme}
        window={demoWindow}
      >
        <DashboardLayout>
          <DemoPageContent pathname={router.pathname} />
        </DashboardLayout>
      </AppProvider>
      {/* preview-end */}
    </DemoProvider>
  );
}

DashboardLayoutBranding.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};


function DashboardHome() {
  const [showFilter, setShowFilter] = React.useState(false);
  const [month, setMonth] = React.useState(new Date().getMonth() + 1);
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axiosInstance.get("fetch-report");
      const rows = Array.isArray(resp.data) ? resp.data : [];
      setData(rows);
    } catch (error) {
      console.error("Dashboard fetch failed", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplyFilter = () => {
    fetchData();
    setShowFilter(false);
  };

  const exportCsv = () => {
    const monthIndex = Number(month) - 1;
    const rows = data.filter((r) => {
      const d = r.date ? new Date(r.date) : null;
      if (!d) return false;
      return d.getMonth() === monthIndex && d.getFullYear() === Number(year);
    });
    const headers = Object.keys(rows[0] || {}).filter(Boolean);
    const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(",")]
      .concat(rows.map((r) => headers.map((h) => escape(r[h])).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard_export_${year}_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ px: { xs: 0.5, md: 1 }, pb: 2 }}>
      <Paper
        sx={{
          mb: 2,
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(15,39,71,0.98) 0%, rgba(15,39,71,0.92) 55%, rgba(214,161,43,0.25) 100%)",
          color: "white",
          boxShadow: "0 18px 36px rgba(9, 30, 66, 0.28)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
              Treasurer's Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.8 }}>
              Municipal Treasury Operations Overview, {year}
            </Typography>
            <Box sx={{ mt: 1.6, display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={`Month: ${months[month - 1]}`}
                size="small"
                sx={{ bgcolor: "rgba(214,161,43,0.25)", color: "white" }}
              />
              <Chip
                label={`Year: ${year}`}
                size="small"
                sx={{ bgcolor: "rgba(214,161,43,0.25)", color: "white" }}
              />
              <Chip
                label={loading ? "Syncing..." : "Data Ready"}
                size="small"
                sx={{
                  bgcolor: loading ? "rgba(214,161,43,0.35)" : "rgba(214,161,43,0.25)",
                  color: "white",
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => setShowFilter((s) => !s)}
              sx={{
                bgcolor: "rgba(214,161,43,0.28)",
                color: "white",
                "&:hover": { bgcolor: "rgba(214,161,43,0.4)" },
              }}
            >
              Filter Period
            </Button>
            <Button
              variant="outlined"
              onClick={exportCsv}
              sx={{
                color: "white",
                borderColor: "rgba(214,161,43,0.65)",
                "&:hover": {
                  borderColor: "rgba(214,161,43,0.95)",
                  bgcolor: "rgba(214,161,43,0.12)",
                },
              }}
            >
              Export Reports
            </Button>
          </Box>
        </Box>
      </Paper>

      {showFilter && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            border: "1px solid #d6a12b",
            boxShadow: "0 6px 16px rgba(15, 39, 71, 0.08)",
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <FormControl size="small">
              <InputLabel id="month-label">Month</InputLabel>
              <Select
                labelId="month-label"
                value={month}
                label="Month"
                onChange={(e) => setMonth(e.target.value)}
                sx={{ minWidth: 160, borderRadius: "10px" }}
              >
                {months.map((m, i) => (
                  <MenuItem key={m} value={i + 1}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel id="year-label">Year</InputLabel>
              <Select
                labelId="year-label"
                value={year}
                label="Year"
                onChange={(e) => setYear(e.target.value)}
                sx={{ minWidth: 120, borderRadius: "10px" }}
              >
                {Array.from({ length: 8 }).map((_, idx) => {
                  const y = new Date().getFullYear() - idx;
                  return (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleApplyFilter}
              sx={{
                bgcolor: "#0f2747",
                "&:hover": { bgcolor: "#0b1e38" },
              }}
            >
              Apply
            </Button>
            <Button
              variant="text"
              onClick={() => setShowFilter(false)}
              sx={{ color: "#0f2747", fontWeight: 700 }}
            >
              Close
            </Button>
          </Box>
        </Paper>
      )}

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 10 }} />}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TaxCollected />
        </Grid>
        <Grid item xs={12} md={6}>
          <CedulaCollected />
        </Grid>

        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "left",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.8 }}>
              Quick Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the month and year filter to align chart summaries and export the same reporting
              slice. This panel can be extended for alerts such as missed remittances, low
              collection days, or pending approvals.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardLayoutBranding;
