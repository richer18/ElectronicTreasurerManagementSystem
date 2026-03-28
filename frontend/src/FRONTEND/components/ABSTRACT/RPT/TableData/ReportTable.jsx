import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import {
  Autocomplete,
  Box,
  Button,
  Grid,
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
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import axios from "../../../../../api/axiosInstance";
const months = [
  { label: "January", value: "1", days: 31 },
  { label: "February", value: "2", days: 28 }, // Dynamically adjust for leap years
  { label: "March", value: "3", days: 31 },
  { label: "April", value: "4", days: 30 },
  { label: "May", value: "5", days: 31 },
  { label: "June", value: "6", days: 30 },
  { label: "July", value: "7", days: 31 },
  { label: "August", value: "8", days: 31 },
  { label: "September", value: "9", days: 30 },
  { label: "October", value: "10", days: 31 },
  { label: "November", value: "11", days: 30 },
  { label: "December", value: "12", days: 31 },
];

const years = [
  { label: "2023", value: "2023" },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
];

function ReportTable({ month, year, onMonthChange, onYearChange, onBack }) {
  const selectedMonth = months.find((option) => option.value === month) || {
    label: "January",
    value: "1",
  };
  const selectedYear = years.find((option) => option.value === year) || {
    label: "2025",
    value: "2025",
  };

  // Memoize defaultFields to ensure it's stable across renders
  const defaultFields = useMemo(
    () => ({
      "Total Collections": 0,
      National: 0,
      "35% Prov’l Share": 0,
      "Provincial Special Ed Fund": 0,
      "Provincial General Fund": 0,
      "Municipal General Fund": 0,
      "Municipal Special Ed Fund": 0,
      "Municipal Trust Fund": 0,
      "Barangay Share": 0,
      Fisheries: 0,
    }),
    []
  ); // Empty dependency array ensures this object is created once

  // Define the unified state object
  const [sharingData, setSharingData] = useState({
    LandSharingData: {
      Current: { ...defaultFields },
      Prior: { ...defaultFields },
      Penalties: { ...defaultFields },
      TOTAL: { ...defaultFields },
    },
    sefLandSharingData: {
      Current: { ...defaultFields },
      Prior: { ...defaultFields },
      Penalties: { ...defaultFields },
      TOTAL: { ...defaultFields },
    },
    buildingSharingData: {
      Current: { ...defaultFields },
      Prior: { ...defaultFields },
      Penalties: { ...defaultFields },
      TOTAL: { ...defaultFields },
    },
    sefBuildingSharingData: {
      Current: { ...defaultFields },
      Prior: { ...defaultFields },
      Penalties: { ...defaultFields },
      TOTAL: { ...defaultFields },
    },
  });

  // Helper function to format currency
  const formatCurrency = (value) => {
    const numericValue = Number(value) || 0;

    return `₱${numericValue.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    const apiEndpoints = [
      { key: "LandSharingData", url: "LandSharingData" },
      { key: "sefLandSharingData", url: "sefLandSharingData" },
      { key: "buildingSharingData", url: "buildingSharingData" },
      { key: "sefBuildingSharingData", url: "sefBuildingSharingData" },
    ];

    const fetchAllData = async () => {
      try {
        const params = {
          month: selectedMonth.value || "",
          year: selectedYear.value || "",
        };

        const responses = await Promise.all(
          apiEndpoints.map(
            (api) => axios.get(api.url, { params }) // ✅ No BASE_URL needed
          )
        );

        const updatedSharingData = Object.fromEntries(
          apiEndpoints.map(({ key }) => [
            key,
            {
              Current: { ...defaultFields },
              Prior: { ...defaultFields },
              Penalties: { ...defaultFields },
              TOTAL: { ...defaultFields },
            },
          ])
        );

        responses.forEach((response, index) => {
          const apiKey = apiEndpoints[index].key;
          const data = response.data;

          if (!Array.isArray(data)) {
            console.error(
              `Invalid data format for ${apiKey}: Expected an array.`
            );
            return;
          }

          data.forEach((item) => {
            if (updatedSharingData[apiKey]?.[item.category]) {
              updatedSharingData[apiKey][item.category] = {
                ...defaultFields,
                ...item,
              };
            } else {
              console.warn(
                `Unexpected category: ${item.category} in ${apiKey}`
              );
            }
          });
        });

        setSharingData(updatedSharingData);
      } catch (err) {
        console.error("Error fetching sharing data:", err);
      }
    };

    fetchAllData();
  }, [selectedMonth.value, selectedYear.value, defaultFields]);

  const handleMonthChange = (event, value) => {
    onMonthChange(value?.value ?? null);
  };

  const handleYearChange = (event, value) => {
    onYearChange(value?.value ?? null);
  };

  // Inject print-specific styles
  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    @media print {
      @page {
        size: 8.5in 13in portrait; /* Legal size, adjust to '8.5in 11in' for letter */
        margin: 10mm; /* Increased margin for better readability */
      }
      body * {
        visibility: hidden; /* Hide everything except the printable area */
      }
      #printableArea, #printableArea * {
        visibility: visible;
      }
      #printableArea {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%; /* Use full width of the page */
      }
      table {
        width: 100%; /* Ensure table spans the full width */
        border-collapse: collapse;
        font-family: Arial, sans-serif; /* Use a standard font */
        font-size: 10px; /* Adjust font size for readability */
      }
      th, td {
        border: 1px solid black;
        padding: 6px; /* Slightly increase padding for better spacing */
        text-align: center;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
        font-size: 11px; /* Slightly larger for headers */
      }
      h6, .subtitle {
        font-size: 12px;
        text-align: center;
        font-weight: bold;
        margin: 6px 0;
        font-family: Arial, sans-serif;
      }
      tr {
        page-break-inside: avoid; /* Prevent rows from splitting across pages */
      }
      /* Adjust column widths */
      th:nth-child(1), td:nth-child(1) { width: 18%; }
      th:nth-child(2), td:nth-child(2) { width: 14%; }
      th:nth-child(3), td:nth-child(3) { width: 10%; }
      th:nth-child(4), td:nth-child(4) { width: 9%; }
      th:nth-child(5), td:nth-child(5) { width: 9%; }
      th:nth-child(6), td:nth-child(6) { width: 9%; }
      th:nth-child(7), td:nth-child(7) { width: 9%; }
      th:nth-child(8), td:nth-child(8) { width: 9%; }
      th:nth-child(9), td:nth-child(9) { width: 9%; }
      th:nth-child(10), td:nth-child(10) { width: 9%; }
      th:nth-child(11), td:nth-child(11) { width: 6%; }
      th:nth-child(12), td:nth-child(12) { width: 6%; }
    }
  `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const generateHeaders = () => {
    return [
      [
        "SOURCES OF COLLECTIONS",
        "TOTAL COLLECTIONS",
        "NATIONAL",
        "PROVINCIAL",
        "",
        "",
        "MUNICIPAL",
        "",
        "",
        "",
        "BARANGAY SHARE",
        "FISHERIES",
      ],
      [
        "",
        "",
        "",
        "GENERAL FUND",
        "SPECIAL EDUC. FUND",
        "TOTAL",
        "GENERAL FUND",
        "SPECIAL EDUC. FUND",
        "TRUST FUND",
        "TOTAL",
        "",
        "",
      ],
    ];
  };

  const readableCategories = {
    LandSharingData: "Real Property Tax - Basic/Land",
    sefLandSharingData: "Real Property Tax - SEF/Land",
    buildingSharingData: "Real Property Tax - Basic/Bldg.",
    sefBuildingSharingData: "Real Property Tax - SEF/Bldg.",
  };

  const handleDownloadExcel = () => {
    const headers = generateHeaders();
    const dataToExport = [];

    // Total accumulators
    let totals = {
      totalCollections: 0,
      national: 0,
      prov35: 0,
      prov50: 0,
      mun40: 0,
      mun50: 0,
      trust: 0,
      brgy: 0,
      fisheries: 0,
    };

    // Helper to safely parse numbers
    const safeNum = (v) => Number(v || 0);

    Object.keys(sharingData).forEach((key) => {
      const categoryData = sharingData[key];

      const hasData = Object.values(categoryData).some((row) =>
        Object.values(row).some(
          (value) => value !== 0 && value !== "" && value !== null
        )
      );

      if (!hasData) return;

      const categoryLabel = readableCategories[key] || key;
      dataToExport.push([categoryLabel]);

      Object.keys(categoryData).forEach((subKey) => {
        if (subKey === "TOTAL") return;

        const rowData = categoryData[subKey];

        let totalCollections = 0;

        if (key === "LandSharingData" || key === "buildingSharingData") {
          totalCollections =
            safeNum(rowData["35% Prov’l Share"]) +
            safeNum(rowData["40% Mun. Share"]) +
            safeNum(rowData["25% Brgy. Share"]);
        } else if (
          key === "sefLandSharingData" ||
          key === "sefBuildingSharingData"
        ) {
          totalCollections =
            safeNum(rowData["50% Prov’l Share"]) +
            safeNum(rowData["50% Mun. Share"]);
        }

        // Accumulate totals
        totals.totalCollections += totalCollections;
        totals.national += safeNum(rowData["National"]);
        totals.prov35 += safeNum(rowData["35% Prov’l Share"]);
        totals.prov50 += safeNum(rowData["50% Prov’l Share"]);
        totals.mun40 += safeNum(rowData["40% Mun. Share"]);
        totals.mun50 += safeNum(rowData["50% Mun. Share"]);
        totals.trust += safeNum(rowData["Municipal Trust Fund"]);
        totals.brgy += safeNum(rowData["25% Brgy. Share"]);
        totals.fisheries += safeNum(rowData["Fisheries"]);

        dataToExport.push([
          subKey === "Current"
            ? "Current Year"
            : subKey === "Prior"
              ? "Previous Years"
              : "Penalties",
          formatCurrency(totalCollections),
          formatCurrency(safeNum(rowData["National"])),
          formatCurrency(safeNum(rowData["35% Prov’l Share"])),
          formatCurrency(safeNum(rowData["50% Prov’l Share"])),
          formatCurrency(
            safeNum(rowData["35% Prov’l Share"]) +
              safeNum(rowData["50% Prov’l Share"])
          ),
          formatCurrency(safeNum(rowData["40% Mun. Share"])),
          formatCurrency(safeNum(rowData["50% Mun. Share"])),
          formatCurrency(safeNum(rowData["Municipal Trust Fund"])),
          formatCurrency(
            safeNum(rowData["40% Mun. Share"]) +
              safeNum(rowData["50% Mun. Share"]) +
              safeNum(rowData["Municipal Trust Fund"])
          ),
          formatCurrency(safeNum(rowData["25% Brgy. Share"])),
          formatCurrency(safeNum(rowData["Fisheries"])),
        ]);
      });
    });

    // Add final TOTAL row
    dataToExport.push([
      "TOTAL",
      formatCurrency(totals.totalCollections),
      formatCurrency(totals.national),
      formatCurrency(totals.prov35),
      formatCurrency(totals.prov50),
      formatCurrency(totals.prov35 + totals.prov50),
      formatCurrency(totals.mun40),
      formatCurrency(totals.mun50),
      formatCurrency(totals.trust),
      formatCurrency(totals.mun40 + totals.mun50 + totals.trust),
      formatCurrency(totals.brgy),
      formatCurrency(totals.fisheries),
    ]);

    // Generate worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...dataToExport]);

    worksheet["!merges"] = [
      { s: { r: 0, c: 2 }, e: { r: 0, c: 2 } }, // NATIONAL
      { s: { r: 0, c: 3 }, e: { r: 0, c: 5 } }, // PROVINCIAL
      { s: { r: 0, c: 6 }, e: { r: 0, c: 9 } }, // MUNICIPAL
      { s: { r: 0, c: 10 }, e: { r: 0, c: 10 } }, // BARANGAY
      { s: { r: 0, c: 11 }, e: { r: 0, c: 11 } }, // FISHERIES
    ];

    worksheet["!freeze"] = { xSplit: 0, ySplit: 2 };
    worksheet["!cols"] = headers[0].map(() => ({ wpx: 160 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    XLSX.writeFile(workbook, `SOCRPT_${selectedMonth.label}_${selectedYear.label}.xlsx`);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          mb: 4,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "1px solid #d6a12b",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
          gap: 2,
          flexWrap: "wrap",
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
          }}
        >
          Back
        </Button>

        <Box display="flex" gap={2} flexWrap="wrap">
          <Autocomplete
            disablePortal
            id="month-selector"
            options={months}
            sx={{
              width: 180,
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={handleMonthChange}
            value={selectedMonth}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Month"
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
              width: 180,
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={handleYearChange}
            value={selectedYear}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Year"
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

      {/* Printable Area Starts Here */}
      <div id="printableArea">
        <Box>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            spacing={0}
            direction="column"
            mb={2}
          >
            <Grid item>
              <Typography variant="h6" fontWeight="bold" align="center">
                SUMMARY OF COLLECTIONS
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1" fontWeight="bold" align="center">
                ZAMBOANGUITA, NEGROS ORIENTAL
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1" fontStyle="bold" align="center">
                LGU
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" fontStyle="bold" align="center">
                Month of {selectedMonth.label} {selectedYear.label}
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ overflowX: "auto", maxWidth: "100%" }}>
            <TableContainer component={Paper}>
              <Table sx={{ border: "1px solid black", minWidth: "1200px" }}>
                <TableHead>
                  {/* First Row */}
                  <TableRow>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "100px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      SOURCES OF COLLECTIONS
                    </TableCell>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "50px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      TOTAL COLLECTIONS
                    </TableCell>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "100px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      NATIONAL
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      PROVINCIAL
                    </TableCell>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      MUNICIPAL
                    </TableCell>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "100px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      BARANGAY SHARE
                    </TableCell>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "100px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      FISHERIES
                    </TableCell>
                  </TableRow>
                  {/* Second Row */}
                  <TableRow>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "100px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      GENERAL FUND
                    </TableCell>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "130px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      SPECIAL EDUC. FUND
                    </TableCell>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "100px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      TOTAL
                    </TableCell>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "100px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      GENERAL FUND
                    </TableCell>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "130px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      SPECIAL EDUC. FUND
                    </TableCell>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "100px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      TRUST FUND
                    </TableCell>
                    <TableCell
                      rowSpan={2} // Spans across two rows
                      align="center" // Centers the text horizontally
                      sx={{
                        border: "1px solid black", // Adds border styling
                        fontWeight: "bold", // Makes the text bold
                        padding: "8px 16px", // Adds spacing inside the cell
                        verticalAlign: "middle", // Aligns the text vertically in the middle
                        width: "100px", // Sets a fixed width for consistent column sizing
                      }}
                    >
                      TOTAL
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Real Property Tax-Basic/Land */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      Real Property Tax-Basic/Land
                    </TableCell>
                    {/* Empty cells for the rest of the columns */}
                    {Array.from({ length: 11 }).map((_, index) => (
                      <TableCell
                        key={index}
                        sx={{ border: "1px solid black" }}
                      />
                    ))}
                  </TableRow>
                  {/* Child items for Real Property Tax-Basic/Land */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Current Year
                    </TableCell>

                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData?.LandSharingData?.Current?.[
                            "35% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData?.LandSharingData?.Current?.[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData?.LandSharingData?.Current?.[
                              "25% Brgy. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>

                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>

                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData?.LandSharingData?.Current?.[
                          "35% Prov’l Share"
                        ] || 0
                      )}
                    </TableCell>

                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>

                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData?.LandSharingData?.Current?.[
                          "35% Prov’l Share"
                        ] || 0
                      )}
                    </TableCell>

                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData?.LandSharingData?.Current?.[
                          "40% Mun. Share"
                        ] || 0
                      )}
                    </TableCell>

                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>

                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>

                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData?.LandSharingData?.Current?.[
                          "40% Mun. Share"
                        ] || 0
                      )}
                    </TableCell>

                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData?.LandSharingData?.Current?.[
                          "25% Brgy. Share"
                        ] || 0
                      )}
                    </TableCell>

                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Previous Years */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Previous Years
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.LandSharingData.Prior[
                            "35% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.LandSharingData.Prior[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Prior[
                              "25% Brgy. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.LandSharingData.Prior["35% Prov’l Share"]
                      )}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.LandSharingData.Prior["35% Prov’l Share"]
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.LandSharingData.Prior["40% Mun. Share"]
                      )}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.LandSharingData.Prior["40% Mun. Share"]
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.LandSharingData.Prior["25% Brgy. Share"]
                      )}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Penalties */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Penalties
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.LandSharingData.Penalties[
                            "35% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.LandSharingData.Penalties[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Penalties[
                              "25% Brgy. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.LandSharingData.Penalties[
                          "35% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.LandSharingData.Penalties[
                          "35% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.LandSharingData.Penalties["40% Mun. Share"]
                      )}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.LandSharingData.Penalties["40% Mun. Share"]
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.LandSharingData.Penalties["25% Brgy. Share"]
                      )}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Real Property Tax-SEF/Land */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      Real Property Tax-SEF/Land
                    </TableCell>
                    {Array.from({ length: 11 }).map((_, index) => (
                      <TableCell
                        key={index}
                        sx={{ border: "1px solid black" }}
                      />
                    ))}
                  </TableRow>
                  {/* Child items */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Current Year
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.sefLandSharingData.Current[
                            "50% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.sefLandSharingData.Current[
                              "50% Mun. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Current[
                          "50% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Current[
                          "50% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Current["50% Mun. Share"]
                      )}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Current["50% Mun. Share"]
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Previous Years */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Previous Years
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.sefLandSharingData.Prior[
                            "50% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.sefLandSharingData.Prior[
                              "50% Mun. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Prior["50% Prov’l Share"]
                      )}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Prior["50% Prov’l Share"]
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Prior["50% Mun. Share"]
                      )}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Prior["50% Mun. Share"]
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Penalties */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Penalties
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.sefLandSharingData.Penalties[
                            "50% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.sefLandSharingData.Penalties[
                              "50% Mun. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Penalties[
                          "50% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Penalties[
                          "50% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Penalties[
                          "50% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefLandSharingData.Penalties[
                          "50% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Real Property Tax-Basic/Bldg. */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      Real Property Tax-Basic/Bldg.
                    </TableCell>
                    {Array.from({ length: 11 }).map((_, index) => (
                      <TableCell
                        key={index}
                        sx={{ border: "1px solid black" }}
                      />
                    ))}
                  </TableRow>
                  {/* Child items */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Current Year
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.buildingSharingData.Current[
                            "35% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.buildingSharingData.Current[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Current[
                              "25% Brgy. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Current[
                          "35% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Current[
                          "35% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Current[
                          "40% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Current[
                          "40% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Current[
                          "25% Brgy. Share"
                        ]
                      )}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Previous Years */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Previous Years
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.buildingSharingData.Prior[
                            "35% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.buildingSharingData.Prior[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Prior[
                              "25% Brgy. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Prior[
                          "35% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Prior[
                          "35% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Prior["40% Mun. Share"]
                      )}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Prior["40% Mun. Share"]
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Prior["25% Brgy. Share"]
                      )}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Penalties */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Penalties
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.buildingSharingData.Penalties[
                            "35% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.buildingSharingData.Penalties[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Penalties[
                              "25% Brgy. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Penalties[
                          "35% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Penalties[
                          "35% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Penalties[
                          "40% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Penalties[
                          "40% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.buildingSharingData.Penalties[
                          "25% Brgy. Share"
                        ]
                      )}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Real Property Tax-SEF/Bldg. */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      Real Property Tax-SEF/Bldg.
                    </TableCell>
                    {Array.from({ length: 11 }).map((_, index) => (
                      <TableCell
                        key={index}
                        sx={{ border: "1px solid black" }}
                      />
                    ))}
                  </TableRow>
                  {/* Child items */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Current Year
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.sefBuildingSharingData.Current[
                            "50% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.sefBuildingSharingData.Current[
                              "50% Mun. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Current[
                          "50% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Current[
                          "50% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Current[
                          "50% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Current[
                          "50% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Previous Years */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Previous Years
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.sefBuildingSharingData.Prior[
                            "50% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.sefBuildingSharingData.Prior[
                              "50% Mun. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Prior[
                          "50% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Prior[
                          "50% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Prior[
                          "50% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Prior[
                          "50% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Penalties */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Penalties
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.sefBuildingSharingData.Penalties[
                            "50% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.sefBuildingSharingData.Penalties[
                              "50% Mun. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Penalties[
                          "50% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Penalties[
                          "50% Prov’l Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Penalties[
                          "50% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        sharingData.sefBuildingSharingData.Penalties[
                          "50% Mun. Share"
                        ]
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* TOTAL */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      TOTAL
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.LandSharingData.Current[
                            "35% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.LandSharingData.Current[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Current[
                              "25% Brgy. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Prior[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Prior[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Prior[
                              "25% Brgy. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Penalties[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Penalties[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Penalties[
                              "25% Brgy. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Current[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Current[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Prior[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Prior[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Penalties[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Penalties[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Current[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Current[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Current[
                              "25% Brgy. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Prior[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Prior[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Prior[
                              "25% Brgy. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Penalties[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Penalties[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Penalties[
                              "25% Brgy. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Current[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Current[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Prior[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Prior[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Penalties[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Penalties[
                              "50% Mun. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.LandSharingData.Current[
                            "35% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.LandSharingData.Prior[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Penalties[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Current[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Prior[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Penalties[
                              "35% Prov’l Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.sefLandSharingData.Current[
                            "50% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.sefLandSharingData.Prior[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Penalties[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Current[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Prior[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Penalties[
                              "50% Prov’l Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.LandSharingData.Current[
                            "35% Prov’l Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.LandSharingData.Prior[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Penalties[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Current[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Prior[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Penalties[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Current[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Prior[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Penalties[
                              "35% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Current[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Prior[
                              "50% Prov’l Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Penalties[
                              "50% Prov’l Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.LandSharingData.Current[
                            "40% Mun. Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.LandSharingData.Prior[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Penalties[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Current[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Prior[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Penalties[
                              "40% Mun. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.sefLandSharingData.Current[
                            "50% Mun. Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.sefLandSharingData.Prior[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Penalties[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Current[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Prior[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Penalties[
                              "50% Mun. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.LandSharingData.Current[
                            "40% Mun. Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.LandSharingData.Prior[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Penalties[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Current[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Prior[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefLandSharingData.Penalties[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Current[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Prior[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Penalties[
                              "40% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Current[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Prior[
                              "50% Mun. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.sefBuildingSharingData.Penalties[
                              "50% Mun. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        Number(
                          sharingData.LandSharingData.Current[
                            "25% Brgy. Share"
                          ] || 0
                        ) +
                          Number(
                            sharingData.LandSharingData.Prior[
                              "25% Brgy. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.LandSharingData.Penalties[
                              "25% Brgy. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Current[
                              "25% Brgy. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Prior[
                              "25% Brgy. Share"
                            ] || 0
                          ) +
                          Number(
                            sharingData.buildingSharingData.Penalties[
                              "25% Brgy. Share"
                            ] || 0
                          )
                      )}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </div>

      {/* Printable Area Ends Here */}
      {/* Print Button */}
      <Box
        mt={3}
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #d6a12b",
          bgcolor: "background.paper",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Button
          variant="contained"
          onClick={handlePrint}
          className="print-button"
          startIcon={<PrintIcon />}
          sx={{
            px: 3.25,
            py: 1.15,
            fontWeight: 700,
            fontSize: "0.9rem",
            borderRadius: "10px",
            backgroundColor: "#0f2747",
            color: "#fff",
            boxShadow: "0 4px 10px rgba(15, 39, 71, 0.25)",
            textTransform: "none",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#0b1e38",
              boxShadow: "0 6px 14px rgba(15, 39, 71, 0.35)",
              transform: "translateY(-1px)",
            },
          }}
        >
          Print PDF
        </Button>

        <Button
          variant="outlined"
          onClick={handleDownloadExcel}
          startIcon={<FileDownloadIcon />}
          sx={{
            px: 3.25,
            py: 1.15,
            fontWeight: 700,
            fontSize: "0.9rem",
            borderRadius: "10px",
            borderColor: "#0f2747",
            color: "#0f2747",
            textTransform: "none",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#0b1e38",
              backgroundColor: "rgba(15, 39, 71, 0.08)",
              transform: "translateY(-1px)",
            },
          }}
        >
          Download to Excel
        </Button>
      </Box>
    </>
  );
}

ReportTable.propTypes = {
  month: PropTypes.string,
  year: PropTypes.string,
  onMonthChange: PropTypes.func.isRequired,
  onYearChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ReportTable;
