import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // Updated import for Grid
import { styled } from "@mui/system";
import { useCallback, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import axios from "../../../../../api/axiosInstance";

// Custom styles
const StyledTableCell = styled(TableCell)(() => ({
  whiteSpace: "nowrap",
  fontWeight: 700,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  fontSize: 11.5,
  background: "#f7f9fc",
  color: "#0f2747",
  borderBottom: "2px solid #d6a12b",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const TotalBox = styled(Box)(() => ({
  marginTop: 16,
  marginBottom: 16,
  padding: 16,
  background: "linear-gradient(135deg, #0f2747, #2f4f7f)",
  color: "#ffffff",
  border: "1px solid #d6a12b",
  borderRadius: 12,
  boxShadow: "0 6px 16px rgba(15, 39, 71, 0.18)",
  "@media print": {
    color: "#000000",
    background: "#ffffff",
    border: "1px solid #000000",
    boxShadow: "none",
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },
}));

// Constants for months, days, and years
const months = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const days = Array.from({ length: 31 }, (_, i) => ({
  label: `${i + 1}`,
  value: `${i + 1}`,
}));

const years = [
  { label: "2023", value: "2023" },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
  { label: "2030", value: "2030" },
];

const formatDisplayNumber = (value, options = {}) =>
  Number(
    options.absolute ? Math.abs(Number(value || 0)) : Number(value || 0)
  ).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Summary({ month, year, onMonthChange, onYearChange, onBack }) {
  const printRef = useRef(null);
  // State variables
  const [data1, setData1] = useState({ land: [] });
  const [data2, setData2] = useState({ bldg: [] });
  const [sefLandData, setSefLandData] = useState({ land: [] });
  const [sefBldgData, setSefBldgData] = useState({ bldg: [] });
  const [landSharingData, setLandSharingData] = useState([]);
  const [bldgSharingData, setBldgSharingData] = useState([]);
  const [grandSharingTotal, setGrandSharingTotal] = useState(null);
  const [sefGrandSharingTotal, setSefGrandSharingTotal] = useState(null);
  const [basicSefOverAllTotal, setBasicSefOverAllTotal] = useState(null);
  const [
    basicSefOverAllGrandSharingTotal,
    setBasicSefOverAllGrandSharingTotal,
  ] = useState(null);
  const [sefLandSharingData, setSefLandSharingData] = useState([]);
  const [sefBuildingSharingData, setSefBuildingSharingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Internal state for day only; month/year come from the main table filters
  const [day, setDayInternal] = useState(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = { month, day, year };

      const endpoints = [
        "/landData",
        "/bldgData",
        "/seflandData",
        "/sefbldgData",
        "/LandSharingData",
        "/buildingSharingData",
        "/grandTotalSharing",
        "/sefLandSharingData",
        "/sefBuildingSharingData",
        "/sefGrandTotalSharing",
        "/overallTotalBasicAndSEF",
        "/overallTotalBasicAndSEFSharing",
      ];

      const responses = await Promise.all(
        endpoints.map((endpoint) => axios.get(endpoint, { params }))
      );

      // Assign responses
      setData1({ land: responses[0].data });
      setData2({ bldg: responses[1].data });
      setSefLandData({ land: responses[2].data });
      setSefBldgData({ bldg: responses[3].data });

      setLandSharingData(responses[4].data);
      setBldgSharingData(responses[5].data);

      setGrandSharingTotal(responses[6].data?.[0]?.["Grand Total"] || 0);
      setSefLandSharingData(responses[7].data);
      setSefBuildingSharingData(responses[8].data);
      setSefGrandSharingTotal(responses[9].data?.[0]?.["Grand Total"] || 0);

      setBasicSefOverAllTotal(responses[10].data?.[0]?.["Grand Total"] || 0);
      setBasicSefOverAllGrandSharingTotal(
        responses[11].data?.[0]?.["Grand Total"] || 0
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [month, day, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate totals
  const calculateTotalSum = (data) => {
    return data.reduce((acc, row) => {
      if (row.category === "TOTAL") {
        return (
          acc +
          row.current -
          row.discount +
          row.prior +
          row.penaltiesCurrent +
          row.penaltiesPrior
        );
      }
      return acc;
    }, 0);
  };

  const landTotalsSum = calculateTotalSum(data1.land);
  const bldgTotalsSum = calculateTotalSum(data2.bldg);
  const sefLandTotalsSum = calculateTotalSum(sefLandData.land);
  const sefBldgTotalsSum = calculateTotalSum(sefBldgData.bldg);

  // Format totals
  const formatTotal = (total) => {
    return isLoading
      ? "Loading..."
      : total != null
        ? formatDisplayNumber(total)
        : "0";
  };

  const tableCardSx = {
    mb: 2,
    borderRadius: 3,
    border: "1px solid #d6a12b",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
    "& .MuiTableCell-root": {
      py: 1.35,
      px: 1.6,
    },
    "@media print": {
      boxShadow: "none",
      border: "1px solid #000000",
      overflow: "visible",
      breakInside: "avoid",
      pageBreakInside: "avoid",
      "& .MuiTable-root": {
        width: "100%",
      },
    },
  };

  const sectionTitleSx = {
    fontWeight: 700,
    color: "#0f2747",
    letterSpacing: 0.3,
  };

  const buildExportRows = () => {
    const rows = [];
    const pushSectionTitle = (title) => {
      rows.push([title]);
    };
    const pushSpacer = () => rows.push([]);

    const pushBasicOrSefTable = (title, data, totalLabel, totalValue) => {
      pushSectionTitle(title);
      rows.push([
        "Category",
        "Current",
        "Discount",
        "Prior",
        "Penalties Current",
        "Penalties Prior",
      ]);
      data.forEach((row) => {
        rows.push([
          row.category,
          Number(row.current || 0),
          Math.abs(Number(row.discount || 0)),
          Number(row.prior || 0),
          Number(row.penaltiesCurrent || 0),
          Number(row.penaltiesPrior || 0),
        ]);
      });
      rows.push([totalLabel, Number(totalValue || 0)]);
      pushSpacer();
    };

    const pushSharingTable = (
      title,
      data,
      valueKey,
      shareKey1,
      shareKey2,
      shareKey3 = null
    ) => {
      pushSectionTitle(title);
      rows.push(
        shareKey3
          ? ["Category", valueKey, shareKey1, shareKey2, shareKey3]
          : ["Category", valueKey, shareKey1, shareKey2]
      );

      data.forEach((row) => {
        const values = [
          row.category,
          Number(row[valueKey] || 0),
          Number(row[shareKey1] || 0),
          Number(row[shareKey2] || 0),
        ];
        if (shareKey3) values.push(Number(row[shareKey3] || 0));
        rows.push(values);
      });
      pushSpacer();
    };

    pushBasicOrSefTable("Basic Land", data1.land, "Land Total", landTotalsSum);
    pushBasicOrSefTable(
      "Basic Building",
      data2.bldg,
      "Building Total",
      bldgTotalsSum
    );
    rows.push(["BASIC GRAND TOTAL", Number(landTotalsSum + bldgTotalsSum || 0)]);
    pushSpacer();

    pushSharingTable(
      "Land Sharing",
      landSharingData,
      "LAND",
      "35% Provâ€™l Share",
      "40% Mun. Share",
      "25% Brgy. Share"
    );
    pushSharingTable(
      "Building Sharing",
      bldgSharingData,
      "BUILDING",
      "35% Provâ€™l Share",
      "40% Mun. Share",
      "25% Brgy. Share"
    );
    rows.push(["SHARING TOTAL", Number(grandSharingTotal || 0)]);
    pushSpacer();
    rows.push(["Overall Total for Basic and SEF", Number(basicSefOverAllTotal || 0)]);
    pushSpacer();

    pushBasicOrSefTable(
      "SEF Land",
      sefLandData.land,
      "SEF Land Total",
      sefLandTotalsSum
    );
    pushBasicOrSefTable(
      "SEF Building",
      sefBldgData.bldg,
      "SEF Building Total",
      sefBldgTotalsSum
    );
    rows.push([
      "SEF GRAND TOTAL",
      Number(sefLandTotalsSum + sefBldgTotalsSum || 0),
    ]);
    pushSpacer();

    pushSharingTable(
      "SEF Land Sharing",
      sefLandSharingData,
      "LAND",
      "50% Provâ€™l Share",
      "50% Mun. Share"
    );
    pushSharingTable(
      "SEF Building Sharing",
      sefBuildingSharingData,
      "BUILDING",
      "50% Provâ€™l Share",
      "50% Mun. Share"
    );
    rows.push(["SHARING TOTAL", Number(sefGrandSharingTotal || 0)]);
    pushSpacer();
    rows.push([
      "Overall Total for Basic and SEF Sharing",
      Number(basicSefOverAllGrandSharingTotal || 0),
    ]);

    return rows;
  };

  const buildFileName = (extension) =>
    `rpt-summary-${year || "all"}-${month || "all"}${
      day ? `-${day}` : ""
    }.${extension}`;

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(buildExportRows());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
    XLSX.writeFile(workbook, buildFileName("xlsx"));
  };

  const handleExportCsv = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(buildExportRows());
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildFileName("csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return;

    const reportTitle = `RPT Summary - ${month || ""}${day ? `-${day}` : ""}-${year || ""}`;
    const printContent = printRef.current.innerHTML;

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
              background: #fff;
            }
            h1, h2, h3, h4, h5, h6, p, div, span {
              color: #000 !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              font-size: 12px;
            }
            th {
              background: #f2f2f2 !important;
            }
            .MuiGrid-root {
              display: block !important;
            }
            .MuiGrid-item {
              width: 100% !important;
              max-width: 100% !important;
              display: block !important;
            }
            .MuiPaper-root,
            .MuiBox-root {
              box-shadow: none !important;
              background: #fff !important;
            }
            @page {
              size: auto;
              margin: 12mm;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <Box
      sx={{
        px: { xs: 1, md: 2 },
        pb: 4,
        "@media print": {
          px: 0,
          pb: 0,
          backgroundColor: "#ffffff",
          color: "#000000",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 2,
          mb: 5,
          p: { xs: 2.5, md: 4 },
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "1px solid #d6a12b",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
          gap: 2,
          flexWrap: "wrap",
          "@media print": {
            boxShadow: "none",
            border: "1px solid #000000",
            mb: 2,
          },
        }}
      >
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 700,
            backgroundColor: "#0f2747",
            boxShadow: "0 4px 10px rgba(15, 39, 71, 0.25)",
            "&:hover": {
              backgroundColor: "#0b1e38",
              boxShadow: "0 6px 14px rgba(15, 39, 71, 0.35)",
            },
            "@media print": {
              display: "none",
            },
          }}
        >
          Back
        </Button>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#0f2747",
            letterSpacing: 1,
            textTransform: "uppercase",
            "@media print": {
              color: "#000000",
              width: "100%",
              textAlign: "center",
            },
          }}
        >
          Summary
        </Typography>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
          sx={{
            "@media print": {
              display: "none",
            },
          }}
        >
          <Button
            variant="outlined"
            onClick={handleExportExcel}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              borderColor: "#0f2747",
              color: "#0f2747",
              "&:hover": {
                borderColor: "#0b1e38",
                backgroundColor: "rgba(15, 39, 71, 0.08)",
              },
            }}
          >
            Download Excel
          </Button>
          <Button
            variant="outlined"
            onClick={handleExportCsv}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              borderColor: "#0f2747",
              color: "#0f2747",
              "&:hover": {
                borderColor: "#0b1e38",
                backgroundColor: "rgba(15, 39, 71, 0.08)",
              },
            }}
          >
            Download CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              borderColor: "#0f2747",
              color: "#0f2747",
              "&:hover": {
                borderColor: "#0b1e38",
                backgroundColor: "rgba(15, 39, 71, 0.08)",
              },
              "@media print": {
                display: "none",
              },
            }}
          >
            Print
          </Button>
          <Autocomplete
            disablePortal
            id="month-selector"
            options={months}
            sx={{
              width: 150,
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={(_, value) =>
              onMonthChange(value ? value.value : null)
            }
            value={months.find((option) => option.value === month) ?? null}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Month"
                variant="outlined"
                sx={{
                  "& .MuiInputBase-input": {
                    color: (theme) => theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: (theme) => theme.palette.text.secondary,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: (theme) => theme.palette.text.primary,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) => theme.palette.divider,
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) => theme.palette.text.secondary,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) => theme.palette.text.primary,
                  },
                }}
              />
            )}
          />
          <Autocomplete
            disablePortal
            id="day-selector"
            options={days}
            sx={{
              width: 150,
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={(_, value) => setDayInternal(value ? value.value : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Day"
                variant="outlined"
                sx={{
                  "& .MuiInputBase-input": {
                    color: (theme) => theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: (theme) => theme.palette.text.secondary,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: (theme) => theme.palette.text.primary,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) => theme.palette.divider,
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) => theme.palette.text.secondary,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) => theme.palette.text.primary,
                  },
                }}
              />
            )}
          />
          <Autocomplete
            disablePortal
            id="year-selector"
            options={years}
            sx={{
              width: 150,
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={(_, value) => onYearChange(value ? value.value : null)}
            value={years.find((option) => option.value === year) ?? null}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Year"
                variant="outlined"
                sx={{
                  "& .MuiInputBase-input": {
                    color: (theme) => theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: (theme) => theme.palette.text.secondary,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: (theme) => theme.palette.text.primary,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) => theme.palette.divider,
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) => theme.palette.text.secondary,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) => theme.palette.text.primary,
                  },
                }}
              />
            )}
          />
        </Box>
      </Box>

      <Box ref={printRef}>
        <Grid
          container
          spacing={{ xs: 3, md: 5 }}
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{
            "@media print": {
              display: "block",
            },
          }}
        >
        {/* BASIC SECTION */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            "@media print": {
              display: "block",
              width: "100%",
              maxWidth: "100%",
            },
          }}
        >
          <Box sx={{ p: { xs: 2, md: 3 }, width: "100%" }}>
            <Typography variant="h5" gutterBottom sx={sectionTitleSx}>
              Basic
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* LAND TABLE */}
            <TableContainer component={Paper} sx={tableCardSx}>
              <Table aria-label="basic land table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell rowSpan={2}>LAND</StyledTableCell>
                    <StyledTableCell colSpan={3} align="center">
                      BASIC
                    </StyledTableCell>
                    <StyledTableCell colSpan={2} align="center">
                      PENALTIES
                    </StyledTableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="right">CURRENT</TableCell>
                    <TableCell align="right">DISCOUNT</TableCell>
                    <TableCell align="right">PRIOR</TableCell>
                    <TableCell align="right">CURRENT</TableCell>
                    <TableCell align="right">PRIOR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    data1.land.map((row) => (
                      <StyledTableRow key={row.category}>
                        <TableCell component="th" scope="row">
                          {row.category}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.current)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.discount, { absolute: true })}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.prior)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.penaltiesCurrent)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.penaltiesPrior)}
                        </TableCell>
                      </StyledTableRow>
                    ))
                  )}
                  <StyledTableRow>
                    <TableCell colSpan={5} style={{ textAlign: "left" }}>
                      Land Total
                    </TableCell>
                    <TableCell align="right" colSpan={2}>
                      {formatTotal(landTotalsSum)}
                    </TableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* BUILDING TABLE */}
            <TableContainer component={Paper} sx={tableCardSx}>
              <Table aria-label="basic building table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell rowSpan={2}>BUILDING</StyledTableCell>
                    <StyledTableCell colSpan={3} align="center">
                      BASIC
                    </StyledTableCell>
                    <StyledTableCell colSpan={2} align="center">
                      PENALTIES
                    </StyledTableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="right">CURRENT</TableCell>
                    <TableCell align="right">DISCOUNT</TableCell>
                    <TableCell align="right">PRIOR</TableCell>
                    <TableCell align="right">CURRENT</TableCell>
                    <TableCell align="right">PRIOR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    data2.bldg.map((row) => (
                      <StyledTableRow key={row.category}>
                        <TableCell component="th" scope="row">
                          {row.category}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.current)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.discount, { absolute: true })}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.prior)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.penaltiesCurrent)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.penaltiesPrior)}
                        </TableCell>
                      </StyledTableRow>
                    ))
                  )}
                  <StyledTableRow>
                    <TableCell colSpan={5} style={{ textAlign: "left" }}>
                      Building Total
                    </TableCell>
                    <TableCell align="right" colSpan={2}>
                      {formatTotal(bldgTotalsSum)}
                    </TableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* BASIC GRAND TOTAL */}
            <TotalBox>
              <Typography variant="h6" color="white">
                BASIC GRAND TOTAL: {formatTotal(landTotalsSum + bldgTotalsSum)}
              </Typography>
            </TotalBox>

            {/* LAND SHARING */}
            <Typography variant="h5" gutterBottom sx={sectionTitleSx}>
              Land Sharing
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} sx={tableCardSx}>
              <Table aria-label="land sharing table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Category</StyledTableCell>
                    <StyledTableCell align="right">LAND</StyledTableCell>
                    <StyledTableCell align="right">
                      35% Prov’l Share
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      40% Mun. Share
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      25% Brgy. Share
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    landSharingData.map((row) => (
                      <StyledTableRow key={row.category}>
                        <TableCell component="th" scope="row">
                          {row.category}
                        </TableCell>
                        <TableCell align="right">
                          {row.LAND !== undefined
                            ? formatDisplayNumber(row.LAND)
                            : "0.00"}
                        </TableCell>
                        <TableCell align="right">
                          {row["35% Prov’l Share"] !== undefined
                            ? formatDisplayNumber(row["35% Prov’l Share"])
                            : "0.00"}
                        </TableCell>
                        <TableCell align="right">
                          {row["40% Mun. Share"] !== undefined
                            ? formatDisplayNumber(row["40% Mun. Share"])
                            : "0.00"}
                        </TableCell>
                        <TableCell align="right">
                          {row["25% Brgy. Share"] !== undefined
                            ? formatDisplayNumber(row["25% Brgy. Share"])
                            : "0.00"}
                        </TableCell>
                      </StyledTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* BUILDING SHARING */}
            <Typography variant="h5" gutterBottom sx={sectionTitleSx}>
              Building Sharing
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} sx={tableCardSx}>
              <Table aria-label="building sharing table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Category</StyledTableCell>
                    <StyledTableCell align="right">BUILDING</StyledTableCell>
                    <StyledTableCell align="right">
                      35% Prov’l Share
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      40% Mun. Share
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      25% Brgy. Share
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    bldgSharingData.map((row) => (
                      <StyledTableRow key={row.category}>
                        <TableCell component="th" scope="row">
                          {row.category}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.BUILDING)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row["35% Prov’l Share"])}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row["40% Mun. Share"])}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row["25% Brgy. Share"])}
                        </TableCell>
                      </StyledTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* SHARING TOTAL */}
            <TotalBox>
              <Typography variant="h6" color="white">
                SHARING TOTAL: {formatTotal(grandSharingTotal)}
              </Typography>
            </TotalBox>

            {/* OVERALL TOTAL */}
            <Typography variant="h5" gutterBottom sx={sectionTitleSx}>
              Overall Total for Basic and SEF
            </Typography>
            <TotalBox>
              <Typography variant="h6" color="white">
                TOTAL: {formatTotal(basicSefOverAllTotal)}
              </Typography>
            </TotalBox>
          </Box>
        </Grid>

        {/* SEF SECTION */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            "@media print": {
              display: "block",
              width: "100%",
              maxWidth: "100%",
            },
          }}
        >
          <Box sx={{ p: { xs: 2, md: 3 }, width: "100%" }}>
            <Typography variant="h5" gutterBottom sx={sectionTitleSx}>
              SEF
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* SEF LAND TABLE */}
            <TableContainer component={Paper} sx={tableCardSx}>
              <Table aria-label="sef land table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell rowSpan={2}>LAND</StyledTableCell>
                    <StyledTableCell colSpan={3} align="center">
                      SEF
                    </StyledTableCell>
                    <StyledTableCell colSpan={2} align="center">
                      PENALTIES
                    </StyledTableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="right">CURRENT</TableCell>
                    <TableCell align="right">DISCOUNT</TableCell>
                    <TableCell align="right">PRIOR</TableCell>
                    <TableCell align="right">CURRENT</TableCell>
                    <TableCell align="right">PRIOR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    sefLandData.land.map((row) => (
                      <StyledTableRow key={row.category}>
                        <TableCell component="th" scope="row">
                          {row.category}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.current)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.discount, { absolute: true })}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.prior)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.penaltiesCurrent)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.penaltiesPrior)}
                        </TableCell>
                      </StyledTableRow>
                    ))
                  )}
                  <StyledTableRow>
                    <TableCell colSpan={5} style={{ textAlign: "left" }}>
                      SEF Land Total
                    </TableCell>
                    <TableCell align="right" colSpan={2}>
                      {formatTotal(sefLandTotalsSum)}
                    </TableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* SEF BUILDING TABLE */}
            <TableContainer component={Paper} sx={tableCardSx}>
              <Table aria-label="sef building table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell rowSpan={2}>BUILDING</StyledTableCell>
                    <StyledTableCell colSpan={3} align="center">
                      SEF
                    </StyledTableCell>
                    <StyledTableCell colSpan={2} align="center">
                      PENALTIES
                    </StyledTableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="right">CURRENT</TableCell>
                    <TableCell align="right">DISCOUNT</TableCell>
                    <TableCell align="right">PRIOR</TableCell>
                    <TableCell align="right">CURRENT</TableCell>
                    <TableCell align="right">PRIOR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    sefBldgData.bldg.map((row) => (
                      <StyledTableRow key={row.category}>
                        <TableCell component="th" scope="row">
                          {row.category}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.current)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.discount, { absolute: true })}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.prior)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.penaltiesCurrent)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.penaltiesPrior)}
                        </TableCell>
                      </StyledTableRow>
                    ))
                  )}
                  <StyledTableRow>
                    <TableCell colSpan={5} style={{ textAlign: "left" }}>
                      SEF Building Total
                    </TableCell>
                    <TableCell align="right" colSpan={2}>
                      {formatTotal(sefBldgTotalsSum)}
                    </TableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* SEF GRAND TOTAL */}
            <TotalBox>
              <Typography variant="h6" color="white">
                SEF GRAND TOTAL:{" "}
                {formatTotal(sefLandTotalsSum + sefBldgTotalsSum)}
              </Typography>
            </TotalBox>

            {/* SEF LAND SHARING */}
            <Typography variant="h5" gutterBottom sx={sectionTitleSx}>
              SEF Land Sharing
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} sx={tableCardSx}>
              <Table aria-label="sef land sharing table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Category</StyledTableCell>
                    <StyledTableCell align="right">LAND</StyledTableCell>
                    <StyledTableCell align="right">
                      50% Prov’l Share
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      50% Mun. Share
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    sefLandSharingData.map((row) => (
                      <StyledTableRow key={row.category}>
                        <TableCell component="th" scope="row">
                          {row.category}
                        </TableCell>
                        <TableCell align="right">
                          {row.LAND !== undefined
                            ? formatDisplayNumber(row.LAND)
                            : "0.00"}
                        </TableCell>
                        <TableCell align="right">
                          {row["50% Prov’l Share"] !== undefined
                            ? formatDisplayNumber(row["50% Prov’l Share"])
                            : "0.00"}
                        </TableCell>
                        <TableCell align="right">
                          {row["50% Mun. Share"] !== undefined
                            ? formatDisplayNumber(row["50% Mun. Share"])
                            : "0.00"}
                        </TableCell>
                      </StyledTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* SEF BUILDING SHARING */}
            <Typography variant="h5" gutterBottom sx={sectionTitleSx}>
              SEF Building Sharing
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} sx={tableCardSx}>
              <Table aria-label="sef building sharing table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Category</StyledTableCell>
                    <StyledTableCell align="right">BUILDING</StyledTableCell>
                    <StyledTableCell align="right">
                      50% Prov’l Share
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      50% Mun. Share
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    sefBuildingSharingData.map((row) => (
                      <StyledTableRow key={row.category}>
                        <TableCell component="th" scope="row">
                          {row.category}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row.BUILDING)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row["50% Prov’l Share"])}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayNumber(row["50% Mun. Share"])}
                        </TableCell>
                      </StyledTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* SHARING TOTAL */}
            <TotalBox>
              <Typography variant="h6" color="white">
                SHARING TOTAL: {formatTotal(sefGrandSharingTotal)}
              </Typography>
            </TotalBox>

            {/* OVERALL TOTAL FOR SHARING */}
            <Typography variant="h5" gutterBottom sx={sectionTitleSx}>
              Overall Total for Basic and SEF Sharing
            </Typography>
            <TotalBox>
              <Typography variant="h6" color="white">
                TOTAL: {formatTotal(basicSefOverAllGrandSharingTotal)}
              </Typography>
            </TotalBox>
          </Box>
        </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Summary;
