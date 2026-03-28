import {
  BrowserRouter as Router,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "../FRONTEND/Dashboard/Home";
import Login from "../FRONTEND/SignIn/SignIn";

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

function ProtectedRoute() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
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
        <Route path="/" element={<Login />} />
        {routeAliases.map(({ from, to }) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-app" element={<Dashboard />}>
            <Route index element={<Navigate to="." replace />} />
            <Route path="real-property-tax" element={<RealPropertyTax />} />
            <Route path="general-fund" element={<GeneralFund />} />
            <Route path="trust-fund" element={<TrustFund />} />
            <Route path="community-tax-certificate" element={<Cedula />} />

            <Route path="calendar" element={<Calendar />} />
            <Route path="rcd" element={<RCD />} />
            {/* <Route path="dive-ticket" element={<DiveTicket />} /> */}
            {/* <Route path="cash-ticket" element={<CashTicket />} /> */}

            <Route path="business-card" element={<BusinessCard />} />
            <Route path="rpt-card" element={<RptCard />} />
            <Route path="full-report" element={<FullReport />} />
            <Route path="esre" element={<Esre />} />
            <Route path="collection" element={<Collection />} />

            <Route
              path="business-registration"
              element={<BusinessRegistration />}
            />
            <Route path="mch" element={<Mch />} />
            <Route path="e-bike-trisikad" element={<EbikeTrisikad />} />

            <Route path="new-application" element={<NewForm />} />
            <Route path="renew-application" element={<RenewalForm />} />
            <Route path="business-operation" element={<BusinessOperation />} />
            <Route path="business-address" element={<BusinessAddress />} />
            <Route path="business-submit" element={<BusinessReviewDataNew />} />

            <Route path="water-works" element={<Zawde />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default Routers;
