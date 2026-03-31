import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AppRegistrationRoundedIcon from "@mui/icons-material/AppRegistrationRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import BookOnlineRoundedIcon from "@mui/icons-material/BookOnlineRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DirectionsBusRoundedIcon from "@mui/icons-material/DirectionsBusRounded";
import ElectricRickshawRoundedIcon from "@mui/icons-material/ElectricRickshawRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import ImportExportRoundedIcon from "@mui/icons-material/ImportExportRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
// import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ScubaDivingRoundedIcon from "@mui/icons-material/ScubaDivingRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";

import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { createTheme } from "@mui/material/styles";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { DemoProvider } from "@toolpad/core/internal";
import PropTypes from "prop-types";
import * as React from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../auth/AuthContext";
import { hasAnyPermission } from "../../auth/permissions";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import TaxCollected from "./components/CHARTS/TaxCollected";
import CedulaCollected from "./components/CHARTS/CedulaCollected";
// import GeneralFundCollected from "./components/CHARTS/GeneralFundCollected";
import "./system.css";
// import TrustFundCollected from "./components/CHARTS/TrustFundCollected";
// import RealPropertyTaxCollected from "./components/CHARTS/RealPropertyTaxCollected";
// import Status from "./components/CHARTS/status";

const navIconPrimary = { color: "#355070" };
const navIconAccent = { color: "#4f6d8c" };
const navIconMuted = { color: "#6b7c93" };

const NAVIGATION = [
  {
    kind: "header",
    title: "Dashboard",
  },
  {
    segment: "my-app",
    title: "Dashboard",
    icon: <DashboardCustomizeRoundedIcon sx={navIconPrimary} />,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Daily Operations",
  },
  {
    segment: "rcd",
    title: "Collection and Deposit",
    icon: <SummarizeRoundedIcon sx={navIconPrimary} />,
  },
  {
    segment: "calendar",
    title: "Calendar",
    icon: <CalendarMonthRoundedIcon sx={navIconPrimary} />,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Collections",
  },
  {
    title: "Abstract Collections",
    icon: <ArticleRoundedIcon sx={navIconAccent} />,
    children: [
      {
        segment: "real-property-tax",
        title: "Real Property Tax",
        icon: <HomeWorkRoundedIcon sx={navIconPrimary} />,
      },
      {
        segment: "general-fund",
        title: "General Fund",
        icon: <AccountBalanceWalletRoundedIcon sx={navIconAccent} />,
      },
      {
        segment: "trust-fund",
        title: "Trust Fund",
        icon: <BalanceRoundedIcon sx={navIconAccent} />,
      },
      {
        segment: "community-tax-certificate",
        title: "Community Tax Certificate",
        icon: <AssignmentIndRoundedIcon sx={navIconMuted} />,
      },
    ],
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Business and Utilities",
  },
  {
    title: "Business",
    icon: <BusinessRoundedIcon sx={navIconAccent} />,
    children: [
      {
        segment: "business-registration",
        title: "Business Registration",
        icon: <AppRegistrationRoundedIcon sx={navIconPrimary} />,
      },
      {
        segment: "mch",
        title: "MCH Franchise",
        icon: <DirectionsBusRoundedIcon sx={navIconAccent} />,
      },
      {
        segment: "e-bike-trisikad",
        title: "E-Bike / Trisikad",
        icon: <ElectricRickshawRoundedIcon sx={navIconMuted} />,
      },
    ],
  },
  {
    title: "Tickets",
    icon: <BookOnlineRoundedIcon sx={navIconAccent} />,
    children: [
      {
        segment: "dive-ticket",
        title: "Diving Ticket",
        icon: <ScubaDivingRoundedIcon sx={navIconMuted} />,
      },
      {
        segment: "cash-ticket",
        title: "Cash Ticket",
        icon: <SellRoundedIcon sx={navIconMuted} />,
      },
    ],
  },
  {
    title: "Document Stamp",
    icon: <DescriptionRoundedIcon sx={navIconPrimary} />,
  },
  {
    segment: "water-works",
    title: "Water Works",
    icon: <WaterDropRoundedIcon sx={navIconAccent} />,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Administration and Setup",
  },
  {
    title: "Import Data",
    requiredPermissions: ["users.update"],
    icon: <ImportExportRoundedIcon sx={navIconAccent} />,
    children: [
      {
        segment: "import-general-fund",
        title: "General Fund",
        icon: <AccountBalanceWalletRoundedIcon sx={navIconAccent} />,
      },
      {
        segment: "import-trust-fund",
        title: "Trust Fund",
        icon: <BalanceRoundedIcon sx={navIconMuted} />,
      },
      {
        segment: "import-real-property-tax",
        title: "Real Property Tax",
        icon: <HomeWorkRoundedIcon sx={navIconPrimary} />,
      },
      {
        segment: "import-cedula",
        title: "Cedula",
        icon: <AssignmentIndRoundedIcon sx={navIconMuted} />,
      },
    ],
  },
  {
    title: "Document Templates",
    requiredPermissions: ["reports.export"],
    icon: <DescriptionRoundedIcon sx={navIconAccent} />,
    children: [
      {
        segment: "email-inbox",
        title: "Voucher",
        icon: <DescriptionRoundedIcon sx={navIconPrimary} />,
      },
      {
        segment: "email-sent-rcd-gf",
        title: "RCD GF",
        icon: <ArticleRoundedIcon sx={navIconAccent} />,
      },
      {
        segment: "email-sent-rcd-sef",
        title: "RCD SEF",
        icon: <BookOnlineRoundedIcon sx={navIconAccent} />,
      },
      {
        segment: "email-sent-mch-application",
        title: "MCH Application",
        icon: <DirectionsBusRoundedIcon sx={navIconMuted} />,
      },
      {
        segment: "email-sent-mch-certification",
        title: "MCH Certification",
        icon: <AppRegistrationRoundedIcon sx={navIconPrimary} />,
      },
      {
        segment: "email-sent-mch-order",
        title: "MCH Order",
        icon: <SellRoundedIcon sx={navIconMuted} />,
      },
      {
        segment: "email-sent-mch-clearance",
        title: "MCH Clearance",
        icon: <BalanceRoundedIcon sx={navIconMuted} />,
      },
    ],
  },
  {
    title: "Email and Notices",
    requiredPermissions: ["reports.view"],
    icon: <MailRoundedIcon sx={navIconAccent} />,
    children: [
      {
        segment: "email-inbox",
        title: "Inbox",
        icon: <InboxRoundedIcon sx={navIconPrimary} />,
      },
      {
        segment: "email-sent",
        title: "Sent",
        icon: <SendRoundedIcon sx={navIconAccent} />,
      },
    ],
  },
  {
    title: "Income Target",
    requiredPermissions: ["users.update"],
    icon: <TrendingUpRoundedIcon sx={navIconAccent} />,
  },
  {
    segment: "register-user",
    title: "User Registration",
    requiredPermissions: ["users.view"],
    icon: <AppRegistrationRoundedIcon sx={navIconPrimary} />,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Reports and Analytics",
  },
  {
    title: "Reports",
    icon: <BarChartRoundedIcon sx={navIconPrimary} />,
    children: [
      {
        segment: "business-card",
        title: "Business Card",
        icon: <DescriptionRoundedIcon sx={navIconMuted} />,
      },
      {
        segment: "rpt-card",
        title: "RPT Card",
        icon: <ReceiptLongRoundedIcon sx={navIconMuted} />,
      },
      {
        segment: "full-report",
        title: "Full Report",
        icon: <AssessmentRoundedIcon sx={navIconMuted} />,
      },
      {
        segment: "esre",
        title: "ESRE",
        icon: <AssessmentRoundedIcon sx={navIconMuted} />,
      },
      {
        segment: "collection",
        title: "Summary of Collection",
        icon: <SummarizeRoundedIcon sx={navIconMuted} />,
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

const filterNavigationByRole = (items, user) => {
  const visibleItems = items
    .map((item) => {
      if (item.kind) {
        return item;
      }

      const filteredChildren = item.children
        ? filterNavigationByRole(item.children, user)
        : undefined;

      const passesPermissionCheck = hasAnyPermission(
        user,
        item.requiredPermissions || []
      );

      if (!passesPermissionCheck) {
        return null;
      }

      if (item.children && (!filteredChildren || filteredChildren.length === 0)) {
        return null;
      }

      return filteredChildren
        ? {
            ...item,
            children: filteredChildren,
          }
        : item;
    })
    .filter(Boolean);

  const cleanedItems = [];

  for (let index = 0; index < visibleItems.length; index += 1) {
    const item = visibleItems[index];

    if (item.kind === "header") {
      let hasSectionContent = false;

      for (let lookAhead = index + 1; lookAhead < visibleItems.length; lookAhead += 1) {
        const nextItem = visibleItems[lookAhead];

        if (nextItem.kind === "header") {
          break;
        }

        if (!nextItem.kind) {
          hasSectionContent = true;
          break;
        }
      }

      if (hasSectionContent) {
        cleanedItems.push(item);
      }

      continue;
    }

    if (item.kind === "divider") {
      const previousItem = cleanedItems[cleanedItems.length - 1];
      const nextContentItem = visibleItems
        .slice(index + 1)
        .find((candidate) => !candidate.kind || candidate.kind === "header");

      if (!previousItem || previousItem.kind === "divider" || !nextContentItem) {
        continue;
      }

      if (nextContentItem.kind === "header") {
        continue;
      }
    }

    cleanedItems.push(item);
  }

  while (
    cleanedItems.length > 0 &&
    (cleanedItems[cleanedItems.length - 1].kind === "divider" ||
      cleanedItems[cleanedItems.length - 1].kind === "header")
  ) {
    cleanedItems.pop();
  }

  return cleanedItems;
};

const buildDashboardNotifications = ({
  summaryRows = [],
  calendarRows = [],
  fetchError = "",
  formatCurrency,
  formatDate,
}) => {
  const items = [];
  const dueFromTotal = summaryRows.reduce(
    (total, row) => total + Number(row?.dueFrom || 0),
    0
  );
  const hasMissingRemarks = summaryRows.some(
    (row) => Number(row?.dueFrom || 0) > 0 && !(row?.comment || "").trim()
  );
  const upcomingEvents = calendarRows
    .filter((event) => {
      const eventDate = new Date(event?.start || event?.start_at || event?.date);
      if (Number.isNaN(eventDate.getTime())) return false;
      const now = new Date();
      const inTwoWeeks = new Date();
      inTwoWeeks.setDate(now.getDate() + 14);
      return eventDate >= now && eventDate <= inTwoWeeks;
    })
    .sort(
      (left, right) =>
        new Date(left?.start || left?.start_at || left?.date).getTime() -
        new Date(right?.start || right?.start_at || right?.date).getTime()
    )
    .slice(0, 4);

  if (fetchError) {
    items.push({
      id: "fetch-error",
      title: fetchError,
      subtitle: "System alert",
    });
  }

  if (dueFromTotal > 0) {
    items.push({
      id: "due-from",
      title: `Due from collectors: PHP ${formatCurrency(dueFromTotal)}`,
      subtitle: "Pending treasury follow-up",
    });
  }

  if (hasMissingRemarks) {
    items.push({
      id: "missing-remarks",
      title: "Some collection days still need remarks.",
      subtitle: "Exception monitoring",
    });
  }

  upcomingEvents.forEach((event) => {
    items.push({
      id: `event-${event.id}`,
      title: event.title || "Upcoming event",
      subtitle: formatDate(event.start || event.start_at || event.date),
    });
  });

  return items.slice(0, 8);
};

const resolveNavigationTitle = (pathname, items = NAVIGATION) => {
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

function DashboardToolbarActions() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const lastLoginAt = React.useMemo(
    () => localStorage.getItem("lastLoginAt"),
    []
  );
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);

  const formatCurrency = React.useCallback(
    (value) =>
      new Intl.NumberFormat("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value || 0)),
    []
  );

  const formatDate = React.useCallback((value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const responses = await Promise.allSettled([
          axiosInstance.get("fetch-report"),
          axiosInstance.get("calendar-events"),
        ]);

        const summaryRows =
          responses[0]?.status === "fulfilled" &&
          Array.isArray(responses[0].value.data)
            ? responses[0].value.data
            : [];
        const calendarRows =
          responses[1]?.status === "fulfilled" &&
          Array.isArray(responses[1].value.data)
            ? responses[1].value.data
            : [];
        const fetchError = responses.some((item) => item.status === "rejected")
          ? "Some dashboard alerts could not be loaded."
          : "";

        if (isMounted) {
          setNotifications(
            buildDashboardNotifications({
              summaryRows,
              calendarRows,
              fetchError,
              formatCurrency,
              formatDate,
            })
          );
        }
      } catch (error) {
        if (isMounted) {
          setNotifications([
            {
              id: "toolbar-fetch-error",
              title: "Notifications could not be loaded.",
              subtitle: "Please refresh the dashboard.",
            },
          ]);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [formatCurrency, formatDate]);

  const handleLogout = React.useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right", mr: 0.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#102a43", lineHeight: 1.2 }}>
          {authUser?.username || "Treasury Staff"}
        </Typography>
        <Typography variant="caption" sx={{ color: "#6b7c93" }}>
          {authUser?.effective_role || authUser?.role || "Staff"}
          {lastLoginAt ? ` • ${formatDate(lastLoginAt)}` : ""}
        </Typography>
      </Box>

      <Tooltip title="Notifications">
        <IconButton onClick={(event) => setNotificationAnchorEl(event.currentTarget)}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title="User Settings">
        <IconButton onClick={(event) => setProfileAnchorEl(event.currentTarget)}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#102a43" }}>
            {(authUser?.username || "T").charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={() => setNotificationAnchorEl(null)}
        PaperProps={{ sx: { width: 360, maxWidth: "92vw", p: 0.5 } }}
      >
        <Typography sx={{ px: 2, py: 1.2, fontWeight: 800, color: "#102a43" }}>
          Notification Center
        </Typography>
        {notifications.length === 0 ? (
          <MenuItem disabled>No unread notifications</MenuItem>
        ) : (
          notifications.map((item) => (
            <MenuItem key={item.id} onClick={() => setNotificationAnchorEl(null)}>
              <ListItemIcon>
                <NotificationsRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.title} secondary={item.subtitle} />
            </MenuItem>
          ))
        )}
      </Menu>

      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={() => setProfileAnchorEl(null)}
        PaperProps={{ sx: { width: 260 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 800, color: "#102a43" }}>
            {authUser?.username || "Treasury Staff"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {authUser?.effective_role || authUser?.role || "Staff"}
          </Typography>
        </Box>
        <MenuItem onClick={() => setProfileAnchorEl(null)}>
          <ListItemIcon>
            <PersonRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem onClick={() => setProfileAnchorEl(null)}>
          <ListItemIcon>
            <SettingsRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <MenuItem onClick={() => setProfileAnchorEl(null)}>
          <ListItemIcon>
            <SecurityRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Change Password" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setProfileAnchorEl(null);
            handleLogout();
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </Stack>
  );
}

function DashboardLayoutBranding(props) {
  const { window } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const pathname = `/my-app${location.pathname.startsWith("/my-app") ? location.pathname.slice(7) : location.pathname}`;
  const navigationItems = React.useMemo(
    () => filterNavigationByRole(NAVIGATION, authUser),
    [authUser]
  );

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
    () => resolveNavigationTitle(router.pathname, navigationItems),
    [navigationItems, router.pathname]
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
        navigation={navigationItems}
        branding={{
          logo: <img src="/assets/images/ZAMBO_LOGO_P.png" alt="LGU logo" />,
          title: brandingTitle,
          // homeUrl: "/toolpad/core/introduction",
        }}
        router={router}
        theme={demoTheme}
        window={demoWindow}
      >
        <DashboardLayout slots={{ toolbarActions: DashboardToolbarActions }}>
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
  const navigate = useNavigate();
  const [month, setMonth] = React.useState(new Date().getMonth() + 1);
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [data, setData] = React.useState([]);
  const [rptRows, setRptRows] = React.useState([]);
  const [gfRows, setGfRows] = React.useState([]);
  const [tfRows, setTfRows] = React.useState([]);
  const [cedulaRows, setCedulaRows] = React.useState([]);
  const [calendarEvents, setCalendarEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState("");

  const { user: authUser } = useAuth();
  const lastLoginAt = localStorage.getItem("lastLoginAt");

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

  const formatDate = React.useCallback((value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const getRowDate = React.useCallback((row) => {
    const candidate =
      row?.date ||
      row?.DATE ||
      row?.Date ||
      row?.start ||
      row?.start_at ||
      row?.DATEISSUED ||
      null;
    const parsed = candidate ? new Date(candidate) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
  }, []);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const responses = await Promise.allSettled([
        axiosInstance.get("fetch-report"),
        axiosInstance.get("allData"),
        axiosInstance.get("generalFundDataAll"),
        axiosInstance.get("table-trust-fund-all"),
        axiosInstance.get("cedula"),
        axiosInstance.get("calendar-events"),
      ]);

      const [
        summaryResp,
        rptResp,
        gfResp,
        tfResp,
        cedulaResp,
        calendarResp,
      ] = responses;

      setData(
        summaryResp.status === "fulfilled" && Array.isArray(summaryResp.value.data)
          ? summaryResp.value.data
          : []
      );
      setRptRows(
        rptResp.status === "fulfilled" && Array.isArray(rptResp.value.data)
          ? rptResp.value.data
          : []
      );
      setGfRows(
        gfResp.status === "fulfilled" && Array.isArray(gfResp.value.data)
          ? gfResp.value.data
          : []
      );
      setTfRows(
        tfResp.status === "fulfilled" && Array.isArray(tfResp.value.data)
          ? tfResp.value.data
          : []
      );
      setCedulaRows(
        cedulaResp.status === "fulfilled" && Array.isArray(cedulaResp.value.data)
          ? cedulaResp.value.data
          : []
      );
      setCalendarEvents(
        calendarResp.status === "fulfilled" && Array.isArray(calendarResp.value.data)
          ? calendarResp.value.data
          : []
      );

      if (responses.some((item) => item.status === "rejected")) {
        setFetchError("Some dashboard feeds could not be loaded. Showing available data.");
      }
    } catch (error) {
      console.error("Dashboard fetch failed", error);
      setData([]);
      setRptRows([]);
      setGfRows([]);
      setTfRows([]);
      setCedulaRows([]);
      setCalendarEvents([]);
      setFetchError("Dashboard data could not be loaded.");
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
      const rawDate = getRowDate(row);
      if (!rawDate) return false;
      return (
        rawDate.getMonth() === monthIndex &&
        rawDate.getFullYear() === selectedYear
      );
    });
  }, [data, getRowDate, month, year]);

  const filterModuleRows = React.useCallback(
    (rows) => {
      const monthIndex = Number(month) - 1;
      const selectedYear = Number(year);

      return rows.filter((row) => {
        const rawDate = getRowDate(row);
        if (!rawDate) return false;
        return (
          rawDate.getMonth() === monthIndex &&
          rawDate.getFullYear() === selectedYear
        );
      });
    },
    [getRowDate, month, year]
  );

  const filteredRptRows = React.useMemo(
    () => filterModuleRows(rptRows),
    [filterModuleRows, rptRows]
  );
  const filteredGfRows = React.useMemo(
    () => filterModuleRows(gfRows),
    [filterModuleRows, gfRows]
  );
  const filteredTfRows = React.useMemo(
    () => filterModuleRows(tfRows),
    [filterModuleRows, tfRows]
  );
  const filteredCedulaRows = React.useMemo(
    () => filterModuleRows(cedulaRows),
    [cedulaRows, filterModuleRows]
  );

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

  const collectorSnapshot = React.useMemo(() => {
    const today = new Date();
    const allRows = [
      ...rptRows.map((row) => ({
        date: row.date,
        collector: row.cashier || "Unassigned",
        amount: Number(row.gf_total || 0),
      })),
      ...cedulaRows.map((row) => ({
        date: row.DATE,
        collector: row.CASHIER || "Unassigned",
        amount: Number(row.TOTALAMOUNTPAID || row.TOTAL || 0),
      })),
      ...gfRows.map((row) => ({
        date: row.date,
        collector: row.cashier || "Treasury Staff",
        amount: Number(row.total || 0),
      })),
      ...tfRows.map((row) => ({
        date: row.DATE || row.date,
        collector: row.CASHIER || "Treasury Staff",
        amount: Number(row.TOTAL || row.total || 0),
      })),
    ];

    const grouped = allRows.reduce((acc, row) => {
      const rowDate = getRowDate(row);
      if (
        !rowDate ||
        rowDate.getDate() !== today.getDate() ||
        rowDate.getMonth() !== today.getMonth() ||
        rowDate.getFullYear() !== today.getFullYear()
      ) {
        return acc;
      }

      const key = row.collector;
      if (!acc[key]) {
        acc[key] = { collector: key, receiptCount: 0, total: 0 };
      }
      acc[key].receiptCount += 1;
      acc[key].total += Number(row.amount || 0);
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [cedulaRows, getRowDate, gfRows, rptRows, tfRows]);

  const topBarangays = React.useMemo(() => {
    const grouped = filteredRptRows.reduce((acc, row) => {
      const barangay = row.barangay || "Unassigned";
      if (!acc[barangay]) {
        acc[barangay] = { label: barangay, amount: 0, receipts: 0 };
      }
      acc[barangay].amount += Number(row.gf_total || 0);
      acc[barangay].receipts += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [filteredRptRows]);

  const recentTransactions = React.useMemo(() => {
    return filteredRows
      .slice(-8)
      .reverse()
      .map((row, index) => ({
        ...row,
        id: `${row.date}-${index}`,
        module: "Daily Summary",
        collector: "Treasury Summary",
        reference: row.date,
        detail: `RPT: PHP ${formatCurrency(row.rpt)} | CTC: PHP ${formatCurrency(
          row.ctc
        )} | GF+TF: PHP ${formatCurrency(row.gfAndTf)}`,
        amount: Number(row.rcdTotal || 0),
      }));
  }, [filteredRows, formatCurrency]);

  const moduleHealth = React.useMemo(
    () => [
      {
        label: "RPT Rows",
        count: filteredRptRows.length,
        total: filteredRptRows.reduce(
          (sum, row) => sum + Number(row.gf_total || 0),
          0
        ),
      },
      {
        label: "Cedula Rows",
        count: filteredCedulaRows.length,
        total: filteredCedulaRows.reduce(
          (sum, row) => sum + Number(row.TOTALAMOUNTPAID || row.TOTAL || 0),
          0
        ),
      },
      {
        label: "GF Rows",
        count: filteredGfRows.length,
        total: filteredGfRows.reduce((sum, row) => sum + Number(row.total || 0), 0),
      },
      {
        label: "TF Rows",
        count: filteredTfRows.length,
        total: filteredTfRows.reduce(
          (sum, row) => sum + Number(row.TOTAL || row.total || 0),
          0
        ),
      },
    ],
    [filteredCedulaRows, filteredGfRows, filteredRptRows, filteredTfRows]
  );

  const upcomingEvents = React.useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 14);

    return calendarEvents
      .filter((event) => {
        const start = event?.start ? new Date(event.start) : null;
        return start && !Number.isNaN(start.getTime()) && start >= now && start <= cutoff;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 5);
  }, [calendarEvents]);

  const notifications = React.useMemo(
    () =>
      buildDashboardNotifications({
        summaryRows: filteredRows,
        calendarRows: upcomingEvents,
        fetchError,
        formatCurrency,
        formatDate,
      }),
    [fetchError, filteredRows, formatCurrency, formatDate, upcomingEvents]
  );

  const monthlyTarget = React.useMemo(
    () => Number(localStorage.getItem("incomeTarget") || 0),
    []
  );

  const targetProgress = React.useMemo(() => {
    if (!monthlyTarget) return 0;
    return Math.min((overview.rcdTotal / monthlyTarget) * 100, 100);
  }, [monthlyTarget, overview.rcdTotal]);

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
      icon: <AssessmentRoundedIcon sx={{ color: "#0f2747" }} />,
      accent: "#0f2747",
      bg: "linear-gradient(135deg, #ffffff 0%, #eef3fb 100%)",
    },
    {
      title: "Real Property Tax",
      value: `PHP ${formatCurrency(overview.rpt)}`,
      subtitle: "Filtered RPT collection",
      icon: <ReceiptLongRoundedIcon sx={{ color: "#0f6b62" }} />,
      accent: "#0f6b62",
      bg: "linear-gradient(135deg, #ffffff 0%, #eef9f7 100%)",
    },
    {
      title: "Cedula",
      value: `PHP ${formatCurrency(overview.ctc)}`,
      subtitle: "Filtered CTC collection",
      icon: <AssignmentIndRoundedIcon sx={{ color: "#7a4b00" }} />,
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
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={`Logged in as: ${authUser?.username || "Treasury Staff"}`}
              sx={{
                bgcolor: "#eef4fb",
                border: "1px solid #d9e2ec",
                color: "#102a43",
                fontWeight: 700,
              }}
            />
            <Chip
              label={`Role: ${authUser?.effective_role || authUser?.role || "Staff"}`}
              sx={{
                bgcolor: "#f8fbff",
                border: "1px solid #d9e2ec",
                color: "#486581",
                fontWeight: 700,
              }}
            />
            <Chip
              label={`Last login: ${lastLoginAt ? formatDate(lastLoginAt) : "Not recorded"}`}
              sx={{
                bgcolor: "#f8fbff",
                border: "1px solid #d9e2ec",
                color: "#486581",
                fontWeight: 700,
              }}
            />
          </Stack>

        </Stack>

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
                Review filtered totals, collection activity, exceptions,
                notifications, and treasury follow-up items from the live
                reporting feeds.
              </Typography>

              <Box sx={{ mt: 1.8, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  icon={<CalendarMonthRoundedIcon />}
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

              <Box sx={{ mt: 1.8, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {[
                  { label: "Open RPT", path: "/my-app/real-property-tax" },
                  { label: "Open GF", path: "/my-app/general-fund" },
                  { label: "Open TF", path: "/my-app/trust-fund" },
                  { label: "Open Cedula", path: "/my-app/community-tax-certificate" },
                  { label: "Open Full Report", path: "/my-app/full-report" },
                  { label: "Open Calendar", path: "/my-app/calendar" },
                ].map((action) => (
                  <Button
                    key={action.path}
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(action.path)}
                    sx={{
                      color: "#334e68",
                      borderColor: "#bcccdc",
                      fontWeight: 700,
                      "&:hover": {
                        borderColor: "#829ab1",
                        bgcolor: "#ffffff",
                      },
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
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

                <Button
                  variant="outlined"
                  startIcon={<PrintRoundedIcon />}
                  onClick={() => window.print()}
                  sx={{
                    color: "#334e68",
                    borderColor: "#bcccdc",
                    "&:hover": {
                      borderColor: "#829ab1",
                      bgcolor: "#ffffff",
                    },
                  }}
                >
                  Print
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
            <TaxCollected year={year} />
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
            <CedulaCollected year={year} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
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
              Today's Collector Snapshot
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Receipt count and total collections per collector for today.
            </Typography>

            {collectorSnapshot.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No collector activity recorded today.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1.2 }}>
                {collectorSnapshot.map((collector) => (
                  <Box
                    key={collector.collector}
                    sx={{
                      p: 1.4,
                      borderRadius: 2,
                      bgcolor: "#f8fbff",
                      border: "1px solid #d9e2ec",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {collector.collector}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {collector.receiptCount} receipt{collector.receiptCount === 1 ? "" : "s"}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.6, fontWeight: 700 }}>
                      PHP {formatCurrency(collector.total)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
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
              Top Barangay / Revenue Source
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Highest RPT collection barangays for the selected period.
            </Typography>

            {topBarangays.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No barangay collection data found for this period.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1.2 }}>
                {topBarangays.map((row) => (
                  <Box
                    key={row.label}
                    sx={{
                      p: 1.4,
                      borderRadius: 2,
                      bgcolor: "#f8fbff",
                      border: "1px solid #d9e2ec",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {row.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {row.receipts} receipt{row.receipts === 1 ? "" : "s"}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.6, fontWeight: 700 }}>
                      PHP {formatCurrency(row.amount)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
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
              Monthly Progress vs Target
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selected period collections compared with the configured target.
            </Typography>

            <Typography variant="body2" sx={{ color: "#486581" }}>
              Current Collection
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.4 }}>
              PHP {formatCurrency(overview.rcdTotal)}
            </Typography>

            <Typography variant="body2" sx={{ color: "#486581", mt: 1.8 }}>
              Monthly Target
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 0.4 }}>
              {monthlyTarget ? `PHP ${formatCurrency(monthlyTarget)}` : "No target configured"}
            </Typography>

            <LinearProgress
              variant={monthlyTarget ? "determinate" : "indeterminate"}
              value={targetProgress}
              sx={{ mt: 2, height: 10, borderRadius: 10, bgcolor: "#eef4fb" }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {monthlyTarget
                ? `${formatCurrency(targetProgress)}% of target reached`
                : "Set localStorage incomeTarget to enable fixed target tracking."}
            </Typography>
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
              Recent Transactions Feed
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Latest RPT, Cedula, GF, and TF entries from the selected reporting period.
            </Typography>

            {recentTransactions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No recent transactions found for this reporting period.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1.2 }}>
                {recentTransactions.map((row) => (
                  <Box
                    key={row.id}
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
                        {formatDate(row.date)}
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
              Pending Exceptions and Alerts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Due from balances, missing remarks, system notices, and upcoming deadlines.
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
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                {notifications.length
                  ? `${notifications.length} active notice(s) for follow-up`
                  : "No active notifications"}
              </Typography>
            </Box>

            {attentionItems.length === 0 && upcomingEvents.length === 0 && !fetchError ? (
              <Typography variant="body2" color="text.secondary">
                No remarks, due-from alerts, or upcoming schedule items for this reporting period.
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
                {upcomingEvents.slice(0, 2).map((event) => (
                  <Box
                    key={`upcoming-${event.id}`}
                    sx={{
                      p: 1.4,
                      borderRadius: 2,
                      bgcolor: "#eef7ff",
                      border: "1px solid #cfe0f3",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatDate(event.start)} • {event.category || "Calendar"}
                    </Typography>
                  </Box>
                ))}
                {fetchError ? (
                  <Box
                    sx={{
                      p: 1.4,
                      borderRadius: 2,
                      bgcolor: "#fff1f0",
                      border: "1px solid #f0c3bf",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#b42318" }}>
                      System Alert
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.6, color: "#7a271a" }}>
                      {fetchError}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
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
              Upcoming Schedule / Deadline Widget
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upcoming holidays, office reminders, and calendar-based treasury notices.
            </Typography>

            {upcomingEvents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No upcoming calendar events in the next 14 days.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1.2 }}>
                {upcomingEvents.map((event) => (
                  <Box
                    key={event.id}
                    sx={{
                      p: 1.4,
                      borderRadius: 2,
                      bgcolor: "#f8fbff",
                      border: "1px solid #d9e2ec",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatDate(event.start)} • {event.category || "Calendar"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
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
              Module Health Cards
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Quick record counts and totals for the selected month and year.
            </Typography>

            <Grid container spacing={1.5}>
              {moduleHealth.map((item) => (
                <Grid item xs={12} sm={6} key={item.label}>
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "#f8fbff",
                      border: "1px solid #d9e2ec",
                      boxShadow: "none",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#486581", fontWeight: 700 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800 }}>
                      {item.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                      PHP {formatCurrency(item.total)}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

    </Box>
  );
}

export default DashboardLayoutBranding;
