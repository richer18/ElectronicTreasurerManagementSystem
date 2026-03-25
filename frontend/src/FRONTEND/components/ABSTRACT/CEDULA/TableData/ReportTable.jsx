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
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../../api/axiosInstance";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

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

const formatToPeso = (amount) =>
  `${(parseFloat(amount) || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

function ReportTable({ onBack }) {
  const [month, setMonth] = useState(months[0]);
  const [year, setYear] = useState(
    years.find((y) => y.value === new Date().getFullYear().toString())
  );

  const [data, setData] = useState({
    TOTALAMOUNTPAID: 0,
  });

  useEffect(() => {
    if (!month || !year) return;

    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          "cedulaSummaryCollectionDataReport",
          {
            params: { month: month.value, year: year.value },
          }
        );

        const amount = Number(response.data?.Totalamountpaid) || 0;
        setData({ TOTALAMOUNTPAID: amount });
      } catch (error) {
        console.error("Error fetching data:", error);
        setData({ TOTALAMOUNTPAID: 0 });
      }
    };

    fetchData();
  }, [month, year]); // Dependency array ensures re-fetching when month/year changes

  const handlePrint = () => {
    const printableArea = document.getElementById("printableArea");
    if (!printableArea) return;

    const printContents = printableArea.innerHTML;
    const printWindow = window.open("", "", "width=900,height=700");

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>SOC_CEDULAReport_${month.label}_${year.label}</title>
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

  // 📊 Download to Excel Function
  const handleDownloadExcel = async (month, year) => {
    const formatNumber = (num) => Number(num).toFixed(2);

    try {
      const response = await fetch("/CEDULA_TEMPLATE.xlsx");
      if (!response.ok) throw new Error("Failed to fetch the Excel template.");

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const totalAmount = formatNumber(data?.TOTALAMOUNTPAID || 0);

      // ✅ Helper function to update cell while preserving styles
      const updateCell = (cellRef, value) => {
        worksheet[cellRef] = worksheet[cellRef] || {};
        worksheet[cellRef].v = value;
        worksheet[cellRef].s = {
          font: { bold: true, sz: 12 },
          alignment: { horizontal: "center", vertical: "center" },
        };
      };

      // ✅ Update the red box (Row 3, spanning E3 to H3) with dynamic month and year
      updateCell(
        "E3",
        `Month of ${month?.label || "Unknown"} ${year?.label || "Year"}`
      );

      // Ensure valid merge range (E3 to H3)
      worksheet["!merges"] = worksheet["!merges"] || [];
      worksheet["!merges"].push({ s: { r: 2, c: 4 }, e: { r: 2, c: 7 } });

      // ✅ Update other cells (example data)
      updateCell("A7", "Com Tax Cert.");
      updateCell("B7", totalAmount);
      updateCell("G7", totalAmount);
      updateCell("J7", totalAmount);

      updateCell("A8", "TOTAL");
      updateCell("B8", totalAmount);
      updateCell("G8", totalAmount);
      updateCell("J8", totalAmount);

      // ✅ Dynamic filename
      const now = new Date();
      const formattedDateTime = now
        .toISOString()
        .replace(/:/g, "-")
        .replace("T", "_")
        .split(".")[0];
      const fileName = `Summary_of_Collections_${formattedDateTime}.xlsx`;

      // ✅ Write and download the updated Excel
      const updatedExcel = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      saveAs(
        new Blob([updatedExcel], { type: "application/octet-stream" }),
        fileName
      );

      console.log("✅ Excel successfully generated with dynamic Month & Year!");
    } catch (error) {
      console.error("❌ Error handling Excel template: ", error);
    }
  };

  const handleMonthChange = (event, value) => {
    setMonth(value || { label: "January", value: "1" });
  };

  const handleYearChange = (event, value) => {
    setYear(value || { label: "2024", value: "2024" });
  };
  return (
    <>
      <Box
        className="no-print"
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

        <Box display="flex" gap={2}>
          <Autocomplete
            disablePortal
            id="month-selector"
            options={months}
            sx={{
              width: 180,
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
            sx={{
              width: 180,
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
      <Box id="printableArea">
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <div style={{ textAlign: "center", marginBottom: "20px", width: "100%" }}>
            <h2 style={{ margin: "0 0 8px 0", textAlign: "center" }}>
              SUMMARY OF COLLECTIONS
            </h2>
            <h4 style={{ margin: "0 0 8px 0", textAlign: "center" }}>
              ZAMBOANGUITA, NEGROS ORIENTAL
            </h4>
            <h4 style={{ margin: "0 0 8px 0", textAlign: "center" }}>LGU</h4>
            <h4 style={{ margin: 0, textAlign: "center" }}>
              Month of {month.label} {year.label}
            </h4>
          </div>
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ border: "1px solid black" }}>
            <TableHead>
              {/* First Row */}
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
              {/* Community Tax Certification */}
              <TableRow>
                <React.Fragment>
                  <TableCell align="left" sx={{ border: "1px solid black" }}>
                    Com Tax Cert.
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {formatToPeso(data.TOTALAMOUNTPAID)}
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
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {formatToPeso(data.TOTALAMOUNTPAID)}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    align="center"
                  ></TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    align="center"
                  ></TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {formatToPeso(data.TOTALAMOUNTPAID)}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    align="center"
                  ></TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    align="center"
                  ></TableCell>
                </React.Fragment>
              </TableRow>
              {/* OVERALL TOTAL */}
              <TableRow>
                <React.Fragment>
                  <TableCell align="left" sx={{ border: "1px solid black" }}>
                    TOTAL
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {formatToPeso(data.TOTALAMOUNTPAID)}
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
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {formatToPeso(data.TOTALAMOUNTPAID)}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    align="center"
                  ></TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    align="center"
                  ></TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {formatToPeso(data.TOTALAMOUNTPAID)}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    align="center"
                  ></TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    align="center"
                  ></TableCell>
                </React.Fragment>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box
        className="no-print"
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
          onClick={() => handleDownloadExcel(month, year)}
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
    </>
  );
}

ReportTable.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default ReportTable;
