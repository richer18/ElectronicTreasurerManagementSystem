import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import ArticleIcon from "@mui/icons-material/Article";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
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
import ReceiptIcon from "@mui/icons-material/Receipt";

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
        segment: "real-property-tax",
        title: "Real Property Tax",
        icon: <HouseIcon sx={{ color: "primary.main" }} />,
      },
      {
        segment: "general-fund",
        title: "General Fund",
        icon: <AccountBalanceWalletIcon sx={{ color: "success.main" }} />,
      },
      {
        segment: "trust-fund",
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
  const normalizedPathname =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const isDashboard =
    normalizedPathname === "/my-app" || normalizedPathname === "/";
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

  const formatCurrency = React.useCallback(
    (value) =>
      new Intl.NumberFormat("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value || 0)),
    []
  );

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
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRows = React.useMemo(() => {
    const monthIndex = Number(month) - 1;
    const selectedYear = Number(year);

    return data.filter((row) => {
      const rawDate = row?.date ? new Date(row.date) : null;
      if (!rawDate || Number.isNaN(rawDate.getTime())) return false;
      return (
        rawDate.getMonth() === monthIndex &&
        rawDate.getFullYear() === selectedYear
      );
    });
  }, [data, month, year]);

  const overview = React.useMemo(() => {
    const totals = filteredRows.reduce(
      (acc, row) => {
        acc.rcdTotal += Number(row?.rcdTotal || 0);
        acc.rpt += Number(row?.rpt || 0);
        acc.ctc += Number(row?.ctc || 0);
        acc.gfAndTf += Number(row?.gfAndTf || 0);
        acc.dueFrom += Number(row?.dueFrom || 0);
        if ((row?.comment || "").trim()) acc.remarksCount += 1;
        return acc;
      },
      {
        rcdTotal: 0,
        rpt: 0,
        ctc: 0,
        gfAndTf: 0,
        dueFrom: 0,
        remarksCount: 0,
      }
    );

    const bestCollectionDay = filteredRows.reduce((best, row) => {
      const currentTotal = Number(row?.rcdTotal || 0);
      if (!best || currentTotal > Number(best?.rcdTotal || 0)) return row;
      return best;
    }, null);

    return {
      ...totals,
      activeDays: filteredRows.length,
      bestCollectionDay,
    };
  }, [filteredRows]);

  const attentionItems = React.useMemo(
    () =>
      filteredRows
        .filter(
          (row) =>
            Number(row?.dueFrom || 0) > 0 || (row?.comment || "").trim()
        )
        .slice(-5)
        .reverse(),
    [filteredRows]
  );

  const recentRows = React.useMemo(
    () => filteredRows.slice(-6).reverse(),
    [filteredRows]
  );

  const exportCsv = () => {
    const rows = filteredRows;
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

  const overviewCards = [
    {
      title: "RCD Total",
      value: `PHP ${formatCurrency(overview.rcdTotal)}`,
      subtitle: `${overview.activeDays} active collection day${
        overview.activeDays === 1 ? "" : "s"
      }`,
      icon: <AssessmentIcon sx={{ color: "#0f2747" }} />,
      accent: "#0f2747",
      bg: "linear-gradient(135deg, #ffffff 0%, #eef3fb 100%)",
    },
    {
      title: "Real Property Tax",
      value: `PHP ${formatCurrency(overview.rpt)}`,
      subtitle: "Filtered RPT collection",
      icon: <ReceiptIcon sx={{ color: "#0f6b62" }} />,
      accent: "#0f6b62",
      bg: "linear-gradient(135deg, #ffffff 0%, #eef9f7 100%)",
    },
    {
      title: "Cedula",
      value: `PHP ${formatCurrency(overview.ctc)}`,
      subtitle: "Filtered CTC collection",
      icon: <AssignmentIndIcon sx={{ color: "#7a4b00" }} />,
      accent: "#a66700",
      bg: "linear-gradient(135deg, #ffffff 0%, #fff6e8 100%)",
    },
    {
      title: "GF + TF",
      value: `PHP ${formatCurrency(overview.gfAndTf)}`,
      subtitle: `Due from collectors: PHP ${formatCurrency(overview.dueFrom)}`,
      icon: <AccountTreeIcon sx={{ color: "#7b1f3a" }} />,
      accent: "#7b1f3a",
      bg: "linear-gradient(135deg, #ffffff 0%, #fff0f4 100%)",
    },
  ];

  return (
    <Box
      sx={{
        px: { xs: 0.5, md: 1 },
        pb: 2,
        background:
          "linear-gradient(180deg, #f7f9fc 0%, #f7f9fc 58%, #ffffff 100%)",
      }}
    >
      <Paper
        sx={{
          mb: 2,
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          border: "1px solid #d9e2ec",
          backgroundColor: "#ffffff",
          boxShadow: "0 8px 22px rgba(15,39,71,0.06)",
        }}
      >
        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} lg={7}>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, letterSpacing: 0.1, color: "#102a43" }}
              >
                Treasury Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: "#486581", mt: 0.8 }}>
                Operational snapshot for {months[month - 1]} {year}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#627d98", mt: 1.2, maxWidth: 680 }}
              >
                Review filtered totals, collection activity, and exception items
                from the existing treasury reporting feed.
              </Typography>

              <Box sx={{ mt: 1.8, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  icon={<CalendarMonthIcon />}
                  label={`${months[month - 1]} ${year}`}
                  size="small"
                  sx={{
                    bgcolor: "#eef4fb",
                    color: "#102a43",
                    border: "1px solid #d9e2ec",
                  }}
                />
                <Chip
                  label={loading ? "Refreshing" : "Ready"}
                  size="small"
                  sx={{
                    bgcolor: loading ? "#fff3cd" : "#e8f7ee",
                    color: loading ? "#8a6d1f" : "#186a3b",
                    border: "1px solid",
                    borderColor: loading ? "#f3d98b" : "#b7e3c4",
                  }}
                />
                <Chip
                  label={`Remarks: ${overview.remarksCount}`}
                  size="small"
                  sx={{
                    bgcolor: "#f7f9fc",
                    color: "#486581",
                    border: "1px solid #d9e2ec",
                  }}
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "#f8fbff",
                border: "1px solid #d9e2ec",
                color: "#102a43",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Reporting Filter
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel id="month-label">
                    Month
                  </InputLabel>
                  <Select
                    labelId="month-label"
                    value={month}
                    label="Month"
                    onChange={(e) => setMonth(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {months.map((m, i) => (
                      <MenuItem key={m} value={i + 1}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="year-label">
                    Year
                  </InputLabel>
                  <Select
                    labelId="year-label"
                    value={year}
                    label="Year"
                    onChange={(e) => setYear(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "#ffffff",
                    }}
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
                  onClick={fetchData}
                  sx={{
                    bgcolor: "#102a43",
                    color: "#ffffff",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#0b1f33" },
                  }}
                >
                  Refresh
                </Button>

                <Button
                  variant="outlined"
                  onClick={exportCsv}
                  sx={{
                    color: "#334e68",
                    borderColor: "#bcccdc",
                    "&:hover": {
                      borderColor: "#829ab1",
                      bgcolor: "#ffffff",
                    },
                  }}
                >
                  Export CSV
                </Button>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: "#627d98" }}>
                  Best collection day
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, mt: 0.4, color: "#102a43" }}
                >
                  {overview.bestCollectionDay?.date || "No data"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#627d98" }}>
                  {overview.bestCollectionDay
                    ? `PHP ${formatCurrency(
                        overview.bestCollectionDay?.rcdTotal
                      )} total collected`
                    : "No recorded collections for this period"}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 10 }} />}

      <Grid container spacing={2}>
        {overviewCards.map((card) => (
          <Grid item xs={12} sm={6} xl={3} key={card.title}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #d9e2ec",
                boxShadow: "0 6px 18px rgba(15,39,71,0.05)",
                height: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 6,
                  height: "100%",
                  backgroundColor: card.accent,
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1.5,
                  pl: 1,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: card.accent,
                      letterSpacing: 0.3,
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: "#102a43", mt: 0.8 }}
                  >
                    {card.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#627d98", mt: 0.6 }}
                  >
                    {card.subtitle}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#f7f9fc",
                    border: "1px solid #d9e2ec",
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: "1px solid #d9e2ec",
              boxShadow: "0 6px 18px rgba(15,39,71,0.05)",
              height: "100%",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: "#102a43", px: 1, pt: 0.5, mb: 1 }}
            >
              Tax Collection Trend
            </Typography>
            <TaxCollected />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: "1px solid #d9e2ec",
              boxShadow: "0 6px 18px rgba(15,39,71,0.05)",
              height: "100%",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: "#102a43", px: 1, pt: 0.5, mb: 1 }}
            >
              Cedula Collection Trend
            </Typography>
            <CedulaCollected />
          </Paper>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #d9e2ec",
              boxShadow: "0 6px 18px rgba(15,39,71,0.05)",
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              Recent Collection Activity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Latest reporting days from the selected month and year.
            </Typography>

            {recentRows.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No collection entries found for this reporting period.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1.2 }}>
                {recentRows.map((row) => (
                  <Box
                    key={row.date}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid #e6edf3",
                      bgcolor: "#ffffff",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {row.date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        RPT: PHP {formatCurrency(row.rpt)} • CTC: PHP{" "}
                        {formatCurrency(row.ctc)} • GF+TF: PHP{" "}
                        {formatCurrency(row.gfAndTf)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        PHP {formatCurrency(row.rcdTotal)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Due from: PHP {formatCurrency(row.dueFrom)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #d9e2ec",
              boxShadow: "0 6px 18px rgba(15,39,71,0.05)",
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              Operations Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Key review items from the selected reporting period.
            </Typography>

            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: "#f8fbff",
                border: "1px solid #d9e2ec",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "#102a43" }}
              >
                Filter Snapshot
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                {filteredRows.length} row{filteredRows.length === 1 ? "" : "s"}{" "}
                loaded for {months[month - 1]} {year}.
              </Typography>
            </Box>

            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: "#f8fbff",
                border: "1px solid #d9e2ec",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "#102a43" }}
              >
                Best Collection Day
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                {overview.bestCollectionDay
                  ? `${overview.bestCollectionDay.date} | PHP ${formatCurrency(
                      overview.bestCollectionDay.rcdTotal
                    )}`
                  : "No recorded collections for this period"}
              </Typography>
            </Box>

            {attentionItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No remarks or due-from alerts for this reporting period.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1.2 }}>
                {attentionItems.map((row) => (
                  <Box
                    key={`${row.date}-${row.comment}`}
                    sx={{
                      p: 1.4,
                      borderRadius: 2,
                      bgcolor: "#fffaf0",
                      border: "1px solid #f2ddaa",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {row.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Due from: PHP {formatCurrency(row.dueFrom)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.8 }}>
                      {(row.comment || "No remark text provided").trim()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardLayoutBranding;
