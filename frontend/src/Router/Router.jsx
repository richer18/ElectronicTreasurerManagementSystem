import {
  BrowserRouter as Router,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import Dashboard from "../FRONTEND/Dashboard/Home";
import Landing from "../FRONTEND/Landing/Landing";
import Login from "../FRONTEND/SignIn/SignIn";
import { useAuth } from "../auth/AuthContext";
import { hasAnyPermission } from "../auth/permissions";

import Cedula from "../FRONTEND/components/ABSTRACT/CEDULA/Cedula";
import GeneralFund from "../FRONTEND/components/ABSTRACT/GF/GeneralFund";
import RealPropertyTax from "../FRONTEND/components/ABSTRACT/RPT/RealPropertyTax";
import TrustFund from "../FRONTEND/components/ABSTRACT/TF/TrustFund";
import Zawde from "../FRONTEND/components/WATERWORKS";

import Calendar from "../FRONTEND/components/CALENDAR/index";

import BusinessCard from "../FRONTEND/components/REPORT/BusinessCard/BusinessCard";
import Esre from "../FRONTEND/components/REPORT/ESRE/esre";
import FullReport from "../FRONTEND/components/REPORT/FullReport/FullReport";
import RptCard from "../FRONTEND/components/REPORT/RPTCARD/realpropertytax_card";

import BusinessRegistration from "../FRONTEND/components/BUSINESS/BusinessRegistration/BusinessRegistration";
import RenewalForm from "../FRONTEND/components/BUSINESS/BusinessRegistration/components/BRenew";
import BusinessAddress from "../FRONTEND/components/BUSINESS/BusinessRegistration/components/BusinessAdress";
import BusinessOperation from "../FRONTEND/components/BUSINESS/BusinessRegistration/components/BusinessOperation";
import NewForm from "../FRONTEND/components/BUSINESS/BusinessRegistration/components/NewFormWrapper";
import BusinessReviewDataNew from "../FRONTEND/components/BUSINESS/BusinessRegistration/components/ReviewDataNew";
import EbikeTrisikad from "../FRONTEND/components/BUSINESS/E-BIKE_TRISIKAD/ebiketrisikad";
import Mch from "../FRONTEND/components/BUSINESS/MCH/mch";
import Collection from "../FRONTEND/components/REPORT/Collection/collection";
import RCD from "../FRONTEND/components/RCD/ReportCollectionDeposit";
import UserManagement from "../FRONTEND/components/ADMIN/UserManagement";

function ProtectedRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Navigate to="/my-app" replace /> : <Outlet />;
}

function PermissionRoute({ permissions, element }) {
  const { user } = useAuth();

  if (!hasAnyPermission(user, permissions)) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
        }}
      >
        <Box sx={{ textAlign: "center", maxWidth: 560 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
            Access Restricted
          </Typography>
          <Typography color="text.secondary">
            Your current role does not have permission to open this module.
          </Typography>
        </Box>
      </Box>
    );
  }

  return element;
}

const routeAliases = [
  { from: "/General-Fund", to: "/my-app/general-fund" },
  { from: "/general-fund", to: "/my-app/general-fund" },
  { from: "/Trust-Fund", to: "/my-app/trust-fund" },
  { from: "/trust-fund", to: "/my-app/trust-fund" },
  { from: "/Real-Property-Tax", to: "/my-app/real-property-tax" },
  { from: "/real-property-tax", to: "/my-app/real-property-tax" },
  {
    from: "/community-tax-certificate",
    to: "/my-app/community-tax-certificate",
  },
  { from: "/calendar", to: "/my-app/calendar" },
  { from: "/rcd", to: "/my-app/rcd" },
  { from: "/business-registration", to: "/my-app/business-registration" },
  { from: "/mch", to: "/my-app/mch" },
  { from: "/e-bike-trisikad", to: "/my-app/e-bike-trisikad" },
  { from: "/business-card", to: "/my-app/business-card" },
  { from: "/rpt-card", to: "/my-app/rpt-card" },
  { from: "/full-report", to: "/my-app/full-report" },
  { from: "/esre", to: "/my-app/esre" },
  { from: "/collection", to: "/my-app/collection" },
  { from: "/register-user", to: "/my-app/register-user" },
  { from: "/new-application", to: "/my-app/new-application" },
  { from: "/renew-application", to: "/my-app/renew-application" },
  { from: "/business-operation", to: "/my-app/business-operation" },
  { from: "/business-address", to: "/my-app/business-address" },
  { from: "/business-submit", to: "/my-app/business-submit" },
  { from: "/water-works", to: "/my-app/water-works" },
];

function Routers() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        {routeAliases.map(({ from, to }) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/my-app"
            element={<PermissionRoute permissions={["dashboard.view"]} element={<Dashboard />} />}
          >
            <Route index element={<Navigate to="." replace />} />
            <Route
              path="real-property-tax"
              element={<PermissionRoute permissions={["rpt.view"]} element={<RealPropertyTax />} />}
            />
            <Route
              path="general-fund"
              element={
                <PermissionRoute
                  permissions={["general_fund.view"]}
                  element={<GeneralFund />}
                />
              }
            />
            <Route
              path="trust-fund"
              element={
                <PermissionRoute
                  permissions={["trust_fund.view"]}
                  element={<TrustFund />}
                />
              }
            />
            <Route
              path="community-tax-certificate"
              element={<PermissionRoute permissions={["cedula.view"]} element={<Cedula />} />}
            />

            <Route
              path="calendar"
              element={<PermissionRoute permissions={["calendar.view"]} element={<Calendar />} />}
            />
            <Route
              path="rcd"
              element={<PermissionRoute permissions={["rcd.view"]} element={<RCD />} />}
            />
            {/* <Route path="dive-ticket" element={<DiveTicket />} /> */}
            {/* <Route path="cash-ticket" element={<CashTicket />} /> */}

            <Route
              path="business-card"
              element={<PermissionRoute permissions={["reports.view"]} element={<BusinessCard />} />}
            />
            <Route
              path="rpt-card"
              element={<PermissionRoute permissions={["reports.view"]} element={<RptCard />} />}
            />
            <Route
              path="full-report"
              element={<PermissionRoute permissions={["reports.view"]} element={<FullReport />} />}
            />
            <Route
              path="esre"
              element={<PermissionRoute permissions={["reports.view"]} element={<Esre />} />}
            />
            <Route
              path="collection"
              element={<PermissionRoute permissions={["reports.view"]} element={<Collection />} />}
            />

            <Route
              path="business-registration"
              element={
                <PermissionRoute
                  permissions={["business.view"]}
                  element={<BusinessRegistration />}
                />
              }
            />
            <Route
              path="mch"
              element={<PermissionRoute permissions={["business.view"]} element={<Mch />} />}
            />
            <Route
              path="e-bike-trisikad"
              element={<PermissionRoute permissions={["business.view"]} element={<EbikeTrisikad />} />}
            />

            <Route
              path="new-application"
              element={<PermissionRoute permissions={["business.view"]} element={<NewForm />} />}
            />
            <Route
              path="renew-application"
              element={<PermissionRoute permissions={["business.view"]} element={<RenewalForm />} />}
            />
            <Route
              path="business-operation"
              element={
                <PermissionRoute
                  permissions={["business.view"]}
                  element={<BusinessOperation />}
                />
              }
            />
            <Route
              path="business-address"
              element={
                <PermissionRoute
                  permissions={["business.view"]}
                  element={<BusinessAddress />}
                />
              }
            />
            <Route
              path="business-submit"
              element={
                <PermissionRoute
                  permissions={["business.view"]}
                  element={<BusinessReviewDataNew />}
                />
              }
            />

            <Route
              path="water-works"
              element={<PermissionRoute permissions={["waterworks.view"]} element={<Zawde />} />}
            />
            <Route
              path="register-user"
              element={<PermissionRoute permissions={["users.view"]} element={<UserManagement />} />}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default Routers;
