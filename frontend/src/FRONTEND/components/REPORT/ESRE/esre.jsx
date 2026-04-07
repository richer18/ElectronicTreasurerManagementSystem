import AssessmentIcon from "@mui/icons-material/Assessment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DescriptionIcon from "@mui/icons-material/Description";
import EventNoteIcon from "@mui/icons-material/EventNote";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Box,
  Button,
  Card,
  Chip,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import RealPropertyTaxAgricultural from "./component/RealPropertyTaxAgricultural";
import RealPropertyTaxResidential from "./component/RealPropertyTaxResidential";
import OtherTaxes from "./component/OtherTaxesDialogContent";
import EconomicEnterprise from "./component/ReceiptsFromEconomicEnterprisesDialogContent.js";
import RegulatoryFeesAndCharges from "./component/RegulatoryFeeAndChargesDialogContent.js";
import ServiceUserCharges from "./component/ServiceUserChargesDialogContent.js";
import TaxOnBusiness from "./component/TaxOnBusinessDialogContent.js";

const REPORT_TYPES = [
  "Real Property Tax - Agricultural",
  "Real Property Tax - Residential",
  "Tax on Business",
  "Service/User Charges",
  "Receipt from Economic Enterprise",
  "Other Taxes",
  "Regulatory Fees and Charges",
];

const QUARTER_LABELS = {
  "First Quarter Report": "Q1 - Jan, Feb, Mar",
  "Second Quarter Report": "Q2 - Apr, May, Jun",
  "Third Quarter Report": "Q3 - Jul, Aug, Sep",
  "Fourth Quarter Report": "Q4 - Oct, Nov, Dec",
};

const uiColors = {
  navy: "#0f2747",
  navyHover: "#0b1e38",
  steel: "#4b5d73",
  teal: "#0f6b62",
  amber: "#a66700",
  bg: "#f5f7fb",
  cardGradients: [
    "linear-gradient(135deg, #0f2747, #2f4f7f)",
    "linear-gradient(135deg, #0f6b62, #2a8a7f)",
    "linear-gradient(135deg, #4b5d73, #6a7f99)",
    "linear-gradient(135deg, #a66700, #c98a2a)",
  ],
};

const getReportComponent = (type, quarter, year) => {
  switch (type) {
    case "Real Property Tax - Agricultural":
      return <RealPropertyTaxAgricultural quarter={quarter} year={year} />;
    case "Real Property Tax - Residential":
      return <RealPropertyTaxResidential quarter={quarter} year={year} />;
    case "Tax on Business":
      return <TaxOnBusiness quarter={quarter} year={year} />;
    case "Other Taxes":
      return <OtherTaxes quarter={quarter} year={year} />;
    case "Receipt from Economic Enterprise":
      return <EconomicEnterprise quarter={quarter} year={year} />;
    case "Service/User Charges":
      return <ServiceUserCharges quarter={quarter} year={year} />;
    case "Regulatory Fees and Charges":
      return <RegulatoryFeesAndCharges quarter={quarter} year={year} />;
    default:
      return null;
  }
};

function Esre() {
  const [selectedReport, setSelectedReport] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [appliedFilters, setAppliedFilters] = useState(null);

  const resolvedQuarter = QUARTER_LABELS[selectedQuarter];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const formReady = Boolean(selectedReport && resolvedQuarter && selectedYear);
  const reportReady =
    Boolean(appliedFilters) &&
    appliedFilters.report === selectedReport &&
    appliedFilters.quarter === resolvedQuarter &&
    appliedFilters.year === selectedYear;

  const summaryLabel = useMemo(() => {
    if (!reportReady) return "Choose a report, quarter, and year";
    return `${selectedReport} | ${resolvedQuarter} | ${selectedYear}`;
  }, [reportReady, resolvedQuarter, selectedReport, selectedYear]);

  const handleViewReport = () => {
    if (!formReady) return;

    setAppliedFilters({
      report: selectedReport,
      quarter: resolvedQuarter,
      year: selectedYear,
    });
  };

  const handleReset = () => {
    setSelectedReport("");
    setSelectedQuarter("");
    setSelectedYear(currentYear);
    setAppliedFilters(null);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: `linear-gradient(180deg, ${alpha(
          uiColors.navy,
          0.05
        )} 0%, ${uiColors.bg} 30%, #ffffff 100%)`,
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          border: `1px solid ${alpha(uiColors.navy, 0.08)}`,
          boxShadow: "0 18px 45px rgba(15, 39, 71, 0.08)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 2.5,
            alignItems: "stretch",
            mb: 3,
          }}
        >
          <Box
            sx={{
              flex: 1,
              p: { xs: 2.25, md: 3 },
              borderRadius: 3,
              background: uiColors.cardGradients[0],
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 12px 30px rgba(15, 39, 71, 0.20)",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0.12), transparent 42%)",
              },
            }}
          >
            <Typography
              variant="overline"
              sx={{ letterSpacing: 1.4, fontWeight: 700, opacity: 0.92 }}
            >
              Treasury Reporting
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.4 }}>
              ESRE Report Viewer
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.1, opacity: 0.88, maxWidth: 680 }}>
              Review quarterly ESRE reports through a cleaner selection flow for
              property tax, business-related collections, enterprise receipts,
              and charges.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.25,
              alignItems: "stretch",
            }}
          >
            <Chip
              icon={<AssessmentIcon />}
              label={selectedReport || "No report selected"}
              sx={{
                height: 40,
                borderRadius: 999,
                fontWeight: 700,
                color: uiColors.navy,
                backgroundColor: alpha(uiColors.navy, 0.08),
                border: `1px solid ${alpha(uiColors.navy, 0.18)}`,
              }}
            />
            <Chip
              icon={<CalendarMonthIcon />}
              label={resolvedQuarter || "No quarter selected"}
              sx={{
                height: 40,
                borderRadius: 999,
                fontWeight: 700,
                color: uiColors.teal,
                backgroundColor: alpha(uiColors.teal, 0.1),
                border: `1px solid ${alpha(uiColors.teal, 0.18)}`,
              }}
            />
            <Chip
              icon={<EventNoteIcon />}
              label={selectedYear}
              sx={{
                height: 40,
                borderRadius: 999,
                fontWeight: 700,
                color: uiColors.amber,
                backgroundColor: alpha(uiColors.amber, 0.1),
                border: `1px solid ${alpha(uiColors.amber, 0.18)}`,
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", xl: "row" },
            gap: 2,
            alignItems: { xs: "stretch", xl: "center" },
            mb: 3,
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            backgroundColor: "#fff",
            border: `1px solid ${alpha(uiColors.navy, 0.08)}`,
            boxShadow: "0 10px 24px rgba(15, 39, 71, 0.06)",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
              gap: 2,
              flex: 1,
            }}
          >
            <TextField
              select
              label="Type of Report"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "background.default",
                },
              }}
            >
              <MenuItem value="">Select report type</MenuItem>
              {REPORT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Quarter"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "background.default",
                },
              }}
            >
              <MenuItem value="">Select quarter</MenuItem>
              {Object.keys(QUARTER_LABELS).map((label) => (
                <MenuItem key={label} value={label}>
                  {label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "background.default",
                },
              }}
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={handleViewReport}
              disabled={!formReady}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                px: 3,
                backgroundColor: uiColors.navy,
                boxShadow: "0 10px 22px rgba(15, 39, 71, 0.20)",
                "&:hover": {
                  backgroundColor: uiColors.navyHover,
                },
              }}
            >
              View Report
            </Button>
            <Button
              variant="text"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                px: 2,
                color: uiColors.steel,
                backgroundColor: alpha(uiColors.steel, 0.06),
                "&:hover": {
                  backgroundColor: alpha(uiColors.steel, 0.12),
                },
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
            mb: 3,
          }}
        >
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${alpha(uiColors.navy, 0.1)}`,
              boxShadow: "0 8px 18px rgba(15,39,71,0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DescriptionIcon sx={{ color: uiColors.navy }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: uiColors.steel }}>
                Selected Report
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, color: uiColors.navy }}>
              {selectedReport || "No report selected"}
            </Typography>
          </Card>

          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${alpha(uiColors.teal, 0.1)}`,
              boxShadow: "0 8px 18px rgba(15,39,71,0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CalendarMonthIcon sx={{ color: uiColors.teal }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: uiColors.steel }}>
                Quarter Coverage
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, color: uiColors.navy }}>
              {resolvedQuarter || "Choose a quarter"}
            </Typography>
          </Card>

          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: uiColors.cardGradients[1],
              color: "#fff",
              boxShadow: "0 12px 24px rgba(15,107,98,0.16)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AssessmentIcon sx={{ color: "#fff" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, opacity: 0.9 }}>
                Ready State
              </Typography>
            </Box>
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                {reportReady
                  ? "Report loaded"
                  : formReady
                    ? "Ready to display"
                    : "Waiting for filter selection"}
              </Typography>
            </Card>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            border: `1px solid ${alpha(uiColors.navy, 0.08)}`,
            boxShadow: "0 14px 32px rgba(15,39,71,0.06)",
            minHeight: 320,
          }}
        >
          {reportReady ? (
            <>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: uiColors.navy, mb: 0.5 }}
              >
                {selectedReport}
              </Typography>
              <Typography variant="body2" sx={{ color: uiColors.steel, mb: 3 }}>
                {summaryLabel}
              </Typography>
              {getReportComponent(selectedReport, resolvedQuarter, selectedYear)}
            </>
          ) : (
            <Box
              sx={{
                minHeight: 260,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: uiColors.steel,
                px: 2,
              }}
            >
              <AssessmentIcon sx={{ fontSize: 54, color: alpha(uiColors.navy, 0.28), mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: uiColors.navy }}>
                Select an ESRE report to continue
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75, maxWidth: 520 }}>
                Choose the report type, quarter, and year from the filter panel
                above, then click View Report to load the appropriate ESRE
                report view.
              </Typography>
            </Box>
          )}
        </Paper>
      </Paper>
    </Box>
  );
}

export default Esre;
