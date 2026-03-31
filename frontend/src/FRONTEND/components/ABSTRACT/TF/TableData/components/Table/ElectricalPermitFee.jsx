import { Alert, Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../../../../api/axiosInstance";

function ElectricalPermitFee({ month, year }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get("trust-fund-dashboard-summary", {
          params: { month: month || undefined, year: year || undefined },
        });
        setAmount(Number(response.data?.electrical_fee || 0));
      } catch (fetchError) {
        setError(fetchError.response?.data?.error || "Failed to load electrical fee summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [month, year]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

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
          <TableRow>
            <TableCell>Electrical Fee</TableCell>
            <TableCell align="right">
              {Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

ElectricalPermitFee.propTypes = {
  month: PropTypes.string,
  year: PropTypes.string,
};

export default ElectricalPermitFee;
