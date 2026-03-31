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
import React, { useEffect, useMemo, useState } from "react";
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

const formatCurrency = (value) =>
  `PHP ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const createEmptyData = () => ({
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
  total: 0,
});

function ReportTable({ onBack, initialMonth, initialYear }) {
  const currentYear = new Date().getFullYear().toString();
  const [month, setMonth] = useState(
    months.find((option) => option.value === String(initialMonth || new Date().getMonth() + 1)) || months[0]
  );
  const [year, setYear] = useState(
    years.find((option) => option.value === String(initialYear || currentYear)) || years[0]
  );
  const [data, setData] = useState(createEmptyData());

  useEffect(() => {
    if (initialMonth) {
      setMonth(months.find((option) => option.value === String(initialMonth)) || months[0]);
    }
  }, [initialMonth]);

  useEffect(() => {
    if (initialYear) {
      setYear(years.find((option) => option.value === String(initialYear)) || years[0]);
    }
  }, [initialYear]);

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

        const row = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null;

        if (!row) {
          setData(createEmptyData());
          return;
        }

        setData({
          building_local_80: parseFloat(row.LOCAL_80_PERCENT) || 0,
          building_trust_15: parseFloat(row.TRUST_FUND_15_PERCENT) || 0,
          building_national_5: parseFloat(row.NATIONAL_5_PERCENT) || 0,
          electricalfee: parseFloat(row.ELECTRICAL_FEE) || 0,
          zoningfee: parseFloat(row.ZONING_FEE) || 0,
          livestock_local_80: parseFloat(row.LOCAL_80_PERCENT_LIVESTOCK) || 0,
          livestock_national_20: parseFloat(row.NATIONAL_20_PERCENT) || 0,
          diving_local_40: parseFloat(row.LOCAL_40_PERCENT_DIVE_FEE) || 0,
          diving_brgy_30: parseFloat(row.BRGY_30_PERCENT) || 0,
          diving_fishers_30: parseFloat(row.FISHERS_30_PERCENT) || 0,
          total: parseFloat(row.TOTAL) || 0,
        });
      } catch (error) {
        console.error("Error fetching trust fund report data:", error.response?.data || error.message);
        setData(createEmptyData());
      }
    };

    fetchData();
  }, [month, year]);

  const totals = useMemo(() => {
    const national = (data.building_national_5 || 0) + (data.livestock_national_20 || 0);
    const municipalGeneral =
      (data.building_local_80 || 0) +
      (data.electricalfee || 0) +
      (data.zoningfee || 0) +
      (data.livestock_local_80 || 0) +
      (data.diving_local_40 || 0);
    const municipalTrust = data.building_trust_15 || 0;

    return {
      totalCollection: data.total || 0,
      national,
      municipalGeneral,
      municipalTrust,
      municipalTotal: municipalGeneral + municipalTrust,
      barangay: data.diving_brgy_30 || 0,
      fisheries: data.diving_fishers_30 || 0,
    };
  }, [data]);

  const reportRows = useMemo(
    () => [
      {
        label: "Building Permit Fee",
        totalCollection: (data.building_local_80 || 0) + (data.building_trust_15 || 0) + (data.building_national_5 || 0),
        national: data.building_national_5 || 0,
        municipalGeneral: data.building_local_80 || 0,
        municipalTrust: data.building_trust_15 || 0,
        municipalTotal: (data.building_local_80 || 0) + (data.building_trust_15 || 0),
      },
      {
        label: "Electrical Permit Fee",
        totalCollection: data.electricalfee || 0,
        municipalGeneral: data.electricalfee || 0,
        municipalTotal: data.electricalfee || 0,
      },
      {
        label: "Zoning Fee",
        totalCollection: data.zoningfee || 0,
        municipalGeneral: data.zoningfee || 0,
        municipalTotal: data.zoningfee || 0,
      },
      {
        label: "Livestock",
        totalCollection: (data.livestock_local_80 || 0) + (data.livestock_national_20 || 0),
        national: data.livestock_national_20 || 0,
        municipalGeneral: data.livestock_local_80 || 0,
        municipalTotal: data.livestock_local_80 || 0,
      },
      {
        label: "Diving Fee",
        totalCollection: (data.diving_local_40 || 0) + (data.diving_brgy_30 || 0) + (data.diving_fishers_30 || 0),
        municipalGeneral: data.diving_local_40 || 0,
        municipalTotal: data.diving_local_40 || 0,
        barangay: data.diving_brgy_30 || 0,
        fisheries: data.diving_fishers_30 || 0,
      },
    ],
    [data]
  );

  const handleMonthChange = (event, value) => {
    setMonth(value || months[0]);
  };

  const handleYearChange = (event, value) => {
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
            @page { size: legal landscape; margin: 12mm; }
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 0 4mm; color: #000; background: #fff; }
            table { border-collapse: collapse; width: 100%; table-layout: fixed; font-size: 11px; }
            th, td { border: 1px solid black; padding: 8px 6px; text-align: center; vertical-align: middle; word-wrap: break-word; }
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
            h2, h4, p { margin: 0 0 6px 0; text-align: center; width: 100%; }
            th { background: #f3f3f3; font-weight: 700; }
            td:first-child, th:first-child { text-align: left; padding-left: 10px; }
          </style>
        </head>
        <body>
          <div>${printContents}</div>
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

    worksheet.addRow(["SUMMARY OF COLLECTIONS"]);
    worksheet.addRow(["ZAMBOANGUITA, NEGROS ORIENTAL"]);
    worksheet.addRow(["LGU"]);
    worksheet.addRow([`Month of ${month.label} ${year.label}`]);
    worksheet.addRow([]);

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

    const excelCurrency = (value) =>
      Number(value || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    reportRows.forEach((row) => {
      worksheet.addRow([
        row.label,
        excelCurrency(row.totalCollection),
        row.national ? excelCurrency(row.national) : "",
        "",
        "",
        "",
        row.municipalGeneral ? excelCurrency(row.municipalGeneral) : "",
        "",
        row.municipalTrust ? excelCurrency(row.municipalTrust) : "",
        row.municipalTotal ? excelCurrency(row.municipalTotal) : "",
        row.barangay ? excelCurrency(row.barangay) : "",
        row.fisheries ? excelCurrency(row.fisheries) : "",
      ]);
    });

    worksheet.addRow([
      "TOTAL",
      excelCurrency(totals.totalCollection),
      excelCurrency(totals.national),
      "",
      "",
      "",
      excelCurrency(totals.municipalGeneral),
      "",
      excelCurrency(totals.municipalTrust),
      excelCurrency(totals.municipalTotal),
      excelCurrency(totals.barangay),
      excelCurrency(totals.fisheries),
    ]);

    worksheet.mergeCells("A1:L1");
    worksheet.mergeCells("A2:L2");
    worksheet.mergeCells("A3:L3");
    worksheet.mergeCells("A4:L4");
    worksheet.mergeCells("D6:F6");
    worksheet.mergeCells("G6:J6");

    for (let i = 1; i <= 4; i += 1) {
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

    worksheet.columns = Array(12).fill({ width: 18 });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Summary_of_Collections_TrustFund_${month.label}_${year.label}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
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
            options={months}
            isOptionEqualToValue={(option, value) => option.value === value?.value}
            sx={{ width: { xs: "100%", sm: 180 }, "& .MuiInputBase-root": { borderRadius: "8px" } }}
            onChange={handleMonthChange}
            value={month}
            renderInput={(params) => <TextField {...params} label="Select Month" variant="outlined" />}
          />
          <Autocomplete
            disablePortal
            options={years}
            isOptionEqualToValue={(option, value) => option.value === value?.value}
            sx={{ width: { xs: "100%", sm: 180 }, "& .MuiInputBase-root": { borderRadius: "8px" } }}
            onChange={handleYearChange}
            value={year}
            renderInput={(params) => <TextField {...params} label="Select Year" variant="outlined" />}
          />
        </Box>
      </Box>

      <div id="printableArea">
        <Box mb={4} sx={{ width: "100%", textAlign: "center" }}>
          <h2 style={{ margin: 0, textAlign: "center" }}>SUMMARY OF COLLECTIONS</h2>
          <h4 style={{ margin: "6px 0 0", textAlign: "center" }}>ZAMBOANGUITA, NEGROS ORIENTAL</h4>
          <p style={{ margin: "6px 0 0", textAlign: "center" }}>LGU</p>
          <p style={{ margin: "6px 0 0", textAlign: "center" }}>
            Month of {month.label} {year.label}
          </p>
        </Box>

        <TableContainer component={Paper}>
          <Table sx={{ border: "1px solid black" }}>
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                  SOURCES OF COLLECTIONS
                </TableCell>
                <TableCell rowSpan={2} align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                  TOTAL COLLECTIONS
                </TableCell>
                <TableCell rowSpan={2} align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                  NATIONAL
                </TableCell>
                <TableCell colSpan={3} align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                  PROVINCIAL
                </TableCell>
                <TableCell colSpan={4} align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                  MUNICIPAL
                </TableCell>
                <TableCell rowSpan={2} align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                  BARANGAY SHARE
                </TableCell>
                <TableCell rowSpan={2} align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>
                  FISHERIES
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>GENERAL FUND</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>SPECIAL EDUC. FUND</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>TOTAL</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>GENERAL FUND</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>SPECIAL EDUC. FUND</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>TRUST FUND</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>TOTAL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportRows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell align="left" sx={{ border: "1px solid black" }}>{row.label}</TableCell>
                  <TableCell align="center" sx={{ border: "1px solid black" }}>{formatCurrency(row.totalCollection)}</TableCell>
                  <TableCell align="center" sx={{ border: "1px solid black" }}>{row.national ? formatCurrency(row.national) : ""}</TableCell>
                  <TableCell align="center" sx={{ border: "1px solid black" }} />
                  <TableCell align="center" sx={{ border: "1px solid black" }} />
                  <TableCell align="center" sx={{ border: "1px solid black" }} />
                  <TableCell align="center" sx={{ border: "1px solid black" }}>{row.municipalGeneral ? formatCurrency(row.municipalGeneral) : ""}</TableCell>
                  <TableCell align="center" sx={{ border: "1px solid black" }} />
                  <TableCell align="center" sx={{ border: "1px solid black" }}>{row.municipalTrust ? formatCurrency(row.municipalTrust) : ""}</TableCell>
                  <TableCell align="center" sx={{ border: "1px solid black" }}>{row.municipalTotal ? formatCurrency(row.municipalTotal) : ""}</TableCell>
                  <TableCell align="center" sx={{ border: "1px solid black" }}>{row.barangay ? formatCurrency(row.barangay) : ""}</TableCell>
                  <TableCell align="center" sx={{ border: "1px solid black" }}>{row.fisheries ? formatCurrency(row.fisheries) : ""}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell align="left" sx={{ border: "1px solid black", fontWeight: "bold" }}>TOTAL</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>{formatCurrency(totals.totalCollection)}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>{formatCurrency(totals.national)}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black" }} />
                <TableCell align="center" sx={{ border: "1px solid black" }} />
                <TableCell align="center" sx={{ border: "1px solid black" }} />
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>{formatCurrency(totals.municipalGeneral)}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black" }} />
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>{formatCurrency(totals.municipalTrust)}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>{formatCurrency(totals.municipalTotal)}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>{formatCurrency(totals.barangay)}</TableCell>
                <TableCell align="center" sx={{ border: "1px solid black", fontWeight: "bold" }}>{formatCurrency(totals.fisheries)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
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
  initialMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onBack: PropTypes.func.isRequired,
};

export default ReportTable;
