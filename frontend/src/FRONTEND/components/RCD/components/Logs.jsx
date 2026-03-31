import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
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
import axiosInstance from "../../../../api/axiosInstance";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

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
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
];

const eventColor = {
  PURCHASE: { bg: "rgba(47,109,181,0.12)", color: "#2f6db5" },
  ASSIGN: { bg: "rgba(15,107,98,0.12)", color: "#0f6b62" },
  RETURN: { bg: "rgba(143,61,46,0.12)", color: "#8f3d2e" },
};

function Logs({ onBack }) {
  const [rows, setRows] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState({ label: "2026", value: "2026" });

  useEffect(() => {
    axiosInstance
      .get("/accountability/logs", {
        params: {
          month: selectedMonth?.value,
          year: selectedYear?.value,
        },
      })
      .then((res) => setRows(Array.isArray(res.data) ? res.data : []))
      .catch((error) => {
        console.error("Failed to load accountability logs:", error);
        setRows([]);
      });
  }, [selectedMonth, selectedYear]);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const eventType = String(row?.event_type || "");
        acc.total += 1;
        if (eventType === "PURCHASE") acc.purchase += 1;
        if (eventType === "ASSIGN") acc.assign += 1;
        if (eventType === "RETURN") acc.return += 1;
        return acc;
      },
      { total: 0, purchase: 0, assign: 0, return: 0 }
    );
  }, [rows]);

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f2747" }}>
              Accountability Logbook
            </Typography>
            <Typography variant="body2" sx={{ color: "#4b5d73" }}>
              Purchase, assignment, and return events for accountable forms.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            {onBack && (
              <Button variant="outlined" onClick={onBack}>
                Back to Workspace
              </Button>
            )}
            <Autocomplete
              options={months}
              value={selectedMonth}
              onChange={(event, value) => setSelectedMonth(value)}
              sx={{ width: 160 }}
              renderInput={(params) => <TextField {...params} label="Month" />}
            />
            <Autocomplete
              options={years}
              value={selectedYear}
              onChange={(event, value) => setSelectedYear(value)}
              sx={{ width: 160 }}
              renderInput={(params) => <TextField {...params} label="Year" />}
            />
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {[
          { label: "Total Events", value: summary.total },
          { label: "Purchases", value: summary.purchase },
          { label: "Assignments", value: summary.assign },
          { label: "Returns", value: summary.return },
        ].map((item) => (
          <Paper
            key={item.label}
            sx={{
              p: 2,
              minWidth: 180,
              borderRadius: 3,
              border: "1px solid #d8e2ee",
              boxShadow: "none",
            }}
          >
            <Typography variant="caption" sx={{ color: "#4b5d73" }}>
              {item.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f2747" }}>
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Event</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Collector</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Form</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Serial</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Range</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Logbook Ref</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Signature Ref</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Processed By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={11}>
                  <Alert severity="info">No accountability log entries found for the selected filter.</Alert>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, index) => {
              const color = eventColor[row.event_type] || { bg: "rgba(75,93,115,0.12)", color: "#4b5d73" };
              return (
                <TableRow key={`${row.event_type}-${row.serial_no}-${index}`} hover>
                  <TableCell align="center">{row.event_date ? dayjs(row.event_date).format("MMM D, YYYY") : "-"}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.event_type}
                      size="small"
                      sx={{ fontWeight: 700, backgroundColor: color.bg, color: color.color }}
                    />
                  </TableCell>
                  <TableCell align="center">{row.collector || "Custodian"}</TableCell>
                  <TableCell align="center">{row.form_type || "-"}</TableCell>
                  <TableCell align="center">{row.serial_no || "-"}</TableCell>
                  <TableCell align="center">
                    {row.range_from && row.range_to ? `${row.range_from} - ${row.range_to}` : "-"}
                  </TableCell>
                  <TableCell align="center">{row.quantity ?? "-"}</TableCell>
                  <TableCell align="center">{row.status || "-"}</TableCell>
                  <TableCell align="center">{row.reference_no || "-"}</TableCell>
                  <TableCell align="center">{row.signature_reference || "-"}</TableCell>
                  <TableCell align="center">{row.processed_by || "-"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Logs;
