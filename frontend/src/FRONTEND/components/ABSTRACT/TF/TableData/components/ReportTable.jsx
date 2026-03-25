import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import ExcelJS from "exceljs";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../../../api/axiosInstance";

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

const years = Array.from({ length: 100 }, (_, i) => ({
  label: String(2050 - i),
  value: String(2050 - i),
}));

// Helper function to format currency
const formatCurrency = (value) => {
  return value > 0
    ? `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    : "₱0.00"; // Changed to display '₱0.00' instead of empty string
};

function ReportTable({ onBack }) {
  const [month, setMonth] = useState(months[0]);
  const [year, setYear] = useState(() => {
    const currentYear = new Date().getFullYear().toString();
    return years.find((option) => option.value === currentYear) || years[0];
  });

  const [data, setData] = useState({
    building_local_80: 0,
    building_trust_15: 0,
    building_national_5: 0,
    electricalfee: 0,
    zoningfee: 0,
    livestock_local_80: 0,
    livestock_national_20: 0,
    diving_local_40: 0,
    diving_brgy_30: 0,
    diving_fishers_30: 0,
  });

  useEffect(() => {
    if (!month || !year) {
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("trustFundDataReport", {
          params: {
            month: month.value,
            year: year.value,
          },
        });

        const rows = Array.isArray(response.data) ? response.data : [];

        if (rows.length > 0) {
          const filteredData = rows.reduce(
            (acc, row) => ({
              building_local_80:
                acc.building_local_80 + (parseFloat(row.LOCAL_80_PERCENT) || 0),
              building_trust_15:
                acc.building_trust_15 +
                (parseFloat(row.TRUST_FUND_15_PERCENT) || 0),
              building_national_5:
                acc.building_national_5 +
                (parseFloat(row.NATIONAL_5_PERCENT) || 0),

              electricalfee:
                acc.electricalfee + (parseFloat(row.ELECTRICAL_FEE) || 0),
              zoningfee: acc.zoningfee + (parseFloat(row.ZONING_FEE) || 0),

              livestock_local_80:
                acc.livestock_local_80 +
                (parseFloat(row.LOCAL_80_PERCENT_LIVESTOCK) || 0),
              livestock_national_20:
                acc.livestock_national_20 +
                (parseFloat(row.NATIONAL_20_PERCENT) || 0),

              diving_local_40:
                acc.diving_local_40 +
                (parseFloat(row.LOCAL_40_PERCENT_DIVE_FEE) || 0),
              diving_brgy_30:
                acc.diving_brgy_30 + (parseFloat(row.BRGY_30_PERCENT) || 0),
              diving_fishers_30:
                acc.diving_fishers_30 +
                (parseFloat(row.FISHERS_30_PERCENT) || 0),
            }),
            {
              building_local_80: 0,
              building_trust_15: 0,
              building_national_5: 0,
              electricalfee: 0,
              zoningfee: 0,
              livestock_local_80: 0,
              livestock_national_20: 0,
              diving_local_40: 0,
              diving_brgy_30: 0,
              diving_fishers_30: 0,
            }
          );

          setData(filteredData);
        } else {
          console.warn("No data available for selected month and year");
          setData({
            building_local_80: 0,
            building_trust_15: 0,
            building_national_5: 0,
            electricalfee: 0,
            zoningfee: 0,
            livestock_local_80: 0,
            livestock_national_20: 0,
            diving_local_40: 0,
            diving_brgy_30: 0,
            diving_fishers_30: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [month, year]);

  const handleMonthChange = (event, value) => {
    setMonth(value || months[0]);
  };

  const handleYearChange = (event, value) => {
    const currentYear = new Date().getFullYear().toString();
    setYear(value || years.find((option) => option.value === currentYear) || years[0]);
  };

  const handlePrint = () => {
    const printableArea = document.getElementById("printableArea");
    if (!printableArea) return;

    const printContents = printableArea.innerHTML;
    const printWindow = window.open("", "", "width=900,height=700");

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>SOC_TrustFundReport_${month.label}_${year.label}</title>
          <style>
            @page {
              size: legal landscape;
              margin: 12mm;
            }
            body {
              font-family: "Arial", sans-serif;
              font-size: 12px;
              margin: 0;
              padding: 0 4mm;
              color: #000;
              background: #fff;
            }
            .print-wrap {
              width: 100%;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              table-layout: fixed;
              font-size: 11px;
            }
            th, td {
              border: 1px solid black;
              padding: 8px 6px;
              text-align: center;
              vertical-align: middle;
              word-wrap: break-word;
            }
            thead {
              display: table-header-group;
            }
            tr {
              page-break-inside: avoid;
            }
            h2, h4, p {
              margin: 0 0 6px 0;
              text-align: center;
              width: 100%;
            }
            h2 {
              font-size: 20px;
              letter-spacing: 0.4px;
            }
            h4 {
              font-size: 14px;
              font-weight: 700;
            }
            .print-subtitle {
              font-size: 13px;
              font-weight: 700;
              margin-bottom: 14px;
              text-align: center;
              width: 100%;
            }
            .print-box {
              margin-top: 10px;
            }
            .print-box .MuiPaper-root {
              box-shadow: none !important;
            }
            th {
              background: #f3f3f3;
              font-weight: 700;
            }
            td:first-child,
            th:first-child {
              text-align: left;
              padding-left: 10px;
            }
          </style>
        </head>
        <body>
          <div class="print-wrap">${printContents}</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Summary of Collection Trust Fund");

    // HEADER
    worksheet.addRow(["SUMMARY OF COLLECTIONS"]);
    worksheet.addRow(["ZAMBOANGUITA, NEGROS ORIENTAL"]);
    worksheet.addRow(["LGU"]);
    worksheet.addRow([`Month of ${month.label} ${year.label}`]);
    worksheet.addRow([]);

    // COLUMN HEADERS
    worksheet.addRow([
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
    ]);

    worksheet.addRow([
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
    ]);

    // CURRENCY FORMATTER
    const formatCurrency = (val) =>
      `₱${Number(val || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    // DATA ROWS FROM DATABASE STATE
    const rows = [
      [
        "Building Permit Fee",
        formatCurrency(
          data.building_local_80 +
            data.building_trust_15 +
            data.building_national_5
        ),
        formatCurrency(data.building_national_5),
        "",
        "",
        "",
        formatCurrency(data.building_local_80),
        "",
        formatCurrency(data.building_trust_15),
        formatCurrency(data.building_local_80 + data.building_trust_15),
        "",
        "",
      ],
      [
        "Electrical Permit Fee",
        formatCurrency(data.electricalfee),
        "",
        "",
        "",
        "",
        formatCurrency(data.electricalfee),
        "",
        "",
        formatCurrency(data.electricalfee),
        "",
        "",
      ],
      [
        "Zoning Fee",
        formatCurrency(data.zoningfee),
        "",
        "",
        "",
        "",
        formatCurrency(data.zoningfee),
        "",
        "",
        formatCurrency(data.zoningfee),
        "",
        "",
      ],
      [
        "Livestock",
        formatCurrency(data.livestock_local_80 + data.livestock_national_20),
        formatCurrency(data.livestock_national_20),
        "",
        "",
        "",
        formatCurrency(data.livestock_local_80),
        "",
        "",
        formatCurrency(data.livestock_local_80),
        "",
        "",
      ],
      [
        "Diving Fee",
        formatCurrency(
          data.diving_local_40 + data.diving_brgy_30 + data.diving_fishers_30
        ),
        "",
        "",
        "",
        "",
        formatCurrency(data.diving_local_40),
        "",
        "",
        formatCurrency(data.diving_local_40),
        formatCurrency(data.diving_brgy_30),
        formatCurrency(data.diving_fishers_30),
      ],
    ];

    rows.forEach((row) => worksheet.addRow(row));

    // TOTALS
    const totalCollection = Object.values(data).reduce(
      (sum, val) => sum + (val || 0),
      0
    );
    worksheet.addRow([
      "TOTAL",
      formatCurrency(totalCollection),
      formatCurrency(data.building_national_5 + data.livestock_national_20),
      "",
      "",
      "",
      formatCurrency(
        data.building_local_80 +
          data.electricalfee +
          data.zoningfee +
          data.livestock_local_80 +
          data.diving_local_40
      ),
      "",
      formatCurrency(data.building_trust_15),
      formatCurrency(
        data.building_local_80 +
          data.electricalfee +
          data.zoningfee +
          data.livestock_local_80 +
          data.diving_local_40 +
          data.building_trust_15
      ),
      formatCurrency(data.diving_brgy_30),
      formatCurrency(data.diving_fishers_30),
    ]);

    // MERGE HEADER CELLS
    worksheet.mergeCells("A1:L1");
    worksheet.mergeCells("A2:L2");
    worksheet.mergeCells("A3:L3");
    worksheet.mergeCells("A4:L4");
    worksheet.mergeCells("D6:F6");
    worksheet.mergeCells("G6:J6");

    // STYLING
    for (let i = 1; i <= 4; i++) {
      worksheet.getRow(i).font = { bold: true };
      worksheet.getRow(i).alignment = { horizontal: "center" };
    }

    worksheet.getRow(6).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    worksheet.getRow(7).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    // COLUMN WIDTHS
    worksheet.columns = Array(12).fill({ width: 18 });

    // EXPORT FILE
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Summary_of_Collections_TrustFund_${month.label}_${year.label}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
      {/* Header Section */}
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
            isOptionEqualToValue={(option, value) =>
              option.value === value?.value
            }
            sx={{
              width: { xs: "100%", sm: 180 },
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={handleMonthChange}
            value={month}
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
            isOptionEqualToValue={(option, value) =>
              option.value === value?.value
            }
            sx={{
              width: { xs: "100%", sm: 180 },
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={handleYearChange}
            value={year}
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

      <div id="printableArea">
        <Box>
          <Box>
            {/* Title Section */}
            <Box
              mb={4}
              sx={{
                width: "100%",
                textAlign: "center",
              }}
            >
              <h2 style={{ margin: 0, textAlign: "center" }}>
                SUMMARY OF COLLECTIONS
              </h2>
              <h4 style={{ margin: "6px 0 0", textAlign: "center" }}>
                ZAMBOANGUITA, NEGROS ORIENTAL
              </h4>
              <p style={{ margin: "6px 0 0", textAlign: "center" }}>LGU</p>
              <p style={{ margin: "6px 0 0", textAlign: "center" }}>
                Month of {month.label} {year.label}
              </p>
            </Box>

            <TableContainer component={Paper}>
              <Table sx={{ border: "1px solid black" }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      SOURCES OF COLLECTIONS
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      TOTAL COLLECTIONS
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
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
                      rowSpan={2}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      BARANGAY SHARE
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      FISHERIES
                    </TableCell>
                  </TableRow>
                  {/* Second Row */}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      GENERAL FUND
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      SPECIAL EDUC. FUND
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      TOTAL
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      GENERAL FUND
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      SPECIAL EDUC. FUND
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      TRUST FUND
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      TOTAL
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Building Permit Fee */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Building Permit Fee
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        (data.building_national_5 || 0) +
                          (data.building_local_80 || 0) +
                          (data.building_trust_15 || 0)
                      )}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.building_national_5 || 0)}
                    </TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.building_local_80 || 0)}
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
                    >
                      {formatCurrency(data.building_trust_15 || 0)}
                    </TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        (data.building_local_80 || 0) +
                          (data.building_trust_15 || 0)
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
                  {/* Electrical Permit Fee */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Electrical Permit Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.electricalfee || 0)}
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
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
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.electricalfee || 0)}
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
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.electricalfee || 0)}
                    </TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                  </TableRow>
                  {/* Zoning Fee */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Zoning Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.zoningfee || 0)}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.zoningfee || 0)}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.zoningfee || 0)}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Livestock */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Livestock
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        (data.livestock_national_20 || 0) +
                          (data.livestock_local_80 || 0)
                      )}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.livestock_national_20 || 0)}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.livestock_local_80 || 0)}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.livestock_local_80 || 0)}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Diving Fee */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Diving Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        (data.diving_local_40 || 0) +
                          (data.diving_brgy_30 || 0) +
                          (data.diving_fishers_30 || 0)
                      )}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.diving_local_40 || 0)}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.diving_local_40 || 0)}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.diving_brgy_30 || 0)}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.diving_fishers_30 || 0)}
                    </TableCell>
                  </TableRow>

                  {/* OVERALL TOTAL */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      TOTAL
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        (data.building_local_80 || 0) +
                          (data.building_trust_15 || 0) +
                          (data.building_national_5 || 0) +
                          (data.electricalfee || 0) +
                          (data.zoningfee || 0) +
                          (data.livestock_local_80 || 0) +
                          (data.livestock_national_20 || 0) +
                          (data.diving_local_40 || 0) +
                          (data.diving_brgy_30 || 0) +
                          (data.diving_fishers_30 || 0)
                      )}
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        (data.building_national_5 || 0) +
                          (data.livestock_national_20 || 0)
                      )}
                    </TableCell>
                    {/* TOTAL NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* TOTAL PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* TOTAL PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* TOTAL PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        (data.building_local_80 || 0) +
                          (data.electricalfee || 0) +
                          (data.zoningfee || 0) +
                          (data.livestock_local_80 || 0) +
                          (data.diving_local_40 || 0)
                      )}
                    </TableCell>
                    {/* TOTAL MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* TOTAL MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.building_trust_15 || 0)}
                    </TableCell>
                    {/* TOTAL MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(
                        (data.building_local_80 || 0) +
                          (data.building_trust_15 || 0) +
                          (data.electricalfee || 0) +
                          (data.zoningfee || 0) +
                          (data.livestock_local_80 || 0) +
                          (data.diving_local_40 || 0)
                      )}
                    </TableCell>
                    {/* TOTAL MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.diving_brgy_30 || 0)}
                    </TableCell>
                    {/* TOTAL BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formatCurrency(data.diving_fishers_30)}
                    </TableCell>
                    {/* TOTAL FISHERIES */}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </div>

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
        {/* Print PDF Button */}
        <Button
          variant="contained"
          onClick={handlePrint}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textTransform: "none",
            borderRadius: "10px",
            padding: "10px 22px",
            fontWeight: 700,
            backgroundColor: "#0f2747",
            boxShadow: "0 4px 10px rgba(15, 39, 71, 0.25)",
            "&:hover": {
              backgroundColor: "#0b1e38",
              boxShadow: "0 6px 14px rgba(15, 39, 71, 0.35)",
            },
          }}
          startIcon={<PrintIcon />}
        >
          Print PDF
        </Button>

        {/* Download Excel Button */}
        <Button
          variant="outlined"
          onClick={handleDownloadExcel}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textTransform: "none",
            borderRadius: "10px",
            padding: "10px 22px",
            fontWeight: 700,
            borderColor: "#0f2747",
            color: "#0f2747",
            "&:hover": {
              borderColor: "#0b1e38",
              backgroundColor: "rgba(15, 39, 71, 0.08)",
            },
          }}
          startIcon={<FileDownloadIcon />}
        >
          Download Excel
        </Button>
      </Box>
    </Box>
  );
}

ReportTable.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default ReportTable;
