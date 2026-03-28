import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
import PropTypes from "prop-types";
import { styled } from "@mui/system";
import { useMemo } from "react";

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

const formatMoney = (value) =>
  new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function BarangaySharesTable({
  data,
  month,
  year,
  onMonthChange,
  onYearChange,
  onBack,
}) {
  const rows = useMemo(() => {
    const filteredRows = Array.isArray(data)
      ? data.filter((row) => {
          if (!row?.date) {
            return false;
          }

          const rowDate = new Date(row.date);
          if (Number.isNaN(rowDate.getTime())) {
            return false;
          }

          const monthMatches = month
            ? rowDate.getMonth() + 1 === Number(month)
            : true;
          const yearMatches = year
            ? rowDate.getFullYear() === Number(year)
            : true;

          return monthMatches && yearMatches;
        })
      : [];

    const grouped = filteredRows.reduce((acc, row) => {
      const barangay = (row?.barangay || "Unknown Barangay").trim() || "Unknown Barangay";
      if (!acc[barangay]) {
        acc[barangay] = {
          barangay,
          share: 0,
          totalRevenue: 0,
          receipts: 0,
        };
      }

      acc[barangay].share += Number(row?.share || 0);
      acc[barangay].totalRevenue += Number(row?.gf_total || 0);
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) =>
      a.barangay.localeCompare(b.barangay)
    );
  }, [data, month, year]);

  const totalShare = useMemo(
    () => rows.reduce((sum, row) => sum + row.share, 0),
    [rows]
  );

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, pb: 4 }}>
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

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#0f2747",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Barangay Shares
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap">
          <Autocomplete
            disablePortal
            options={months}
            sx={{ width: 180, "& .MuiInputBase-root": { borderRadius: "8px" } }}
            value={months.find((option) => option.value === month) ?? null}
            onChange={(_, value) => onMonthChange(value?.value ?? null)}
            renderInput={(params) => (
              <TextField {...params} label="Select Month" variant="outlined" />
            )}
          />
          <Autocomplete
            disablePortal
            options={years}
            sx={{ width: 150, "& .MuiInputBase-root": { borderRadius: "8px" } }}
            value={years.find((option) => option.value === year) ?? null}
            onChange={(_, value) => onYearChange(value?.value ?? null)}
            renderInput={(params) => (
              <TextField {...params} label="Select Year" variant="outlined" />
            )}
          />
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          boxShadow: 3,
          overflow: "hidden",
          "& .MuiTableCell-root": {
            py: 1.75,
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell sx={{ textAlign: "left" }}>Barangay</StyledTableCell>
              <StyledTableCell sx={{ textAlign: "center" }}>25% Share</StyledTableCell>
              <StyledTableCell sx={{ textAlign: "center" }}>Total Revenue</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <StyledTableRow key={row.barangay}>
                <TableCell align="left">{row.barangay}</TableCell>
                <TableCell align="center">{formatMoney(row.share)}</TableCell>
                <TableCell align="center">{formatMoney(row.totalRevenue)}</TableCell>
              </StyledTableRow>
            ))}
            <StyledTableRow>
              <TableCell align="left" sx={{ fontWeight: 700 }}>
                Total
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                {formatMoney(totalShare)}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                {formatMoney(rows.reduce((sum, row) => sum + row.totalRevenue, 0))}
              </TableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

BarangaySharesTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  month: PropTypes.string,
  year: PropTypes.string,
  onMonthChange: PropTypes.func.isRequired,
  onYearChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default BarangaySharesTable;
