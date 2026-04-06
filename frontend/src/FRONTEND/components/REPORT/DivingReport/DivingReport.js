import FileDownloadIcon from "@mui/icons-material/FileDownload";
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
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import axiosInstance from "../../../../api/axiosInstance";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, index) => {
  const year = String(currentYear - 2 + index);
  return { label: year, value: year };
});

function DivingReport() {
  const [year, setYear] = useState(
    years.find((item) => item.value === String(currentYear)) ?? years[years.length - 1]
  );
  const [rows, setRows] = useState([]);

  const formatAmount = (value) => Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    axiosInstance
      .get("/diving-report", {
        params: {
          year: year?.value,
        },
      })
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((error) => {
        console.error("Failed to fetch diving report:", error);
        setRows([]);
      });
  }, [year?.value]);

  const exportRows = useMemo(
    () =>
      rows.map((row) => ({
        NAME: row.NAME ?? "",
        AMOUNT: Number(row.AMOUNT || 0),
      })),
    [rows]
  );

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diving Report");
    XLSX.writeFile(workbook, `diving_report_${year?.value ?? "year"}.xlsx`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Diving Report
            </Typography>
            <Typography color="text.secondary">
              Top yearly diving ticket collections based on `ITAXTYPE_CT = IFD`.
            </Typography>
          </Box>

          <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={handleExport}>
            Export
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Autocomplete
            options={years}
            value={year}
            onChange={(_, value) => setYear(value ?? years[years.length - 1])}
            sx={{ minWidth: 180 }}
            renderInput={(params) => <TextField {...params} label="Year" />}
          />
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.NAME}>
                    <TableCell>{row.NAME ?? "-"}</TableCell>
                    <TableCell align="right">{formatAmount(row.AMOUNT)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No diving report data found for the selected year.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default DivingReport;
