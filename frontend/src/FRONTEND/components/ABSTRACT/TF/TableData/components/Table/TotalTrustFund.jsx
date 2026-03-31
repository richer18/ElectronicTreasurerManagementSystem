import { Alert, Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../../../../api/axiosInstance";

function TotalTrustFund({ month, year }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get("trust-fund-dashboard-summary", {
          params: { month: month || undefined, year: year || undefined },
        });
        setSummary(response.data || {});
      } catch (fetchError) {
        setError(fetchError.response?.data?.error || "Failed to load trust fund summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [month, year]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const rows = [
    ["Building Permit Fee", Number(summary?.building_permit_fee || 0)],
    ["Electrical Fee", Number(summary?.electrical_fee || 0)],
    ["Zoning Fee", Number(summary?.zoning_fee || 0)],
    ["Livestock Dev Fund", Number(summary?.livestock_dev_fund || 0)],
    ["Diving Fee", Number(summary?.diving_fee || 0)],
    ["Total", Number(summary?.total || 0)],
  ];

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Taxes</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(([label, value]) => (
            <TableRow key={label}>
              <TableCell>{label}</TableCell>
              <TableCell align="right">
                {value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

TotalTrustFund.propTypes = {
  month: PropTypes.string,
  year: PropTypes.string,
};

export default TotalTrustFund;
