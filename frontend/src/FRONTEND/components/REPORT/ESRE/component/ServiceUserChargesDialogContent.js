import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../../api/axiosInstance";

// ðŸ‘‡ Category keys must match those from backend 'category'
const CATEGORY_MAPPING = [
  { label: "Police Clearance" },
  { label: "Secretaries Fee" },
  { label: "Garbage Fees" },
  { label: "Med./Lab Fees" },
];

// ðŸ‘‡ Convert quarter label into list of months
const convertQuarterToMonths = (quarter) => {
  const map = {
    "Q1 - Jan, Feb, Mar": [1, 2, 3],
    "Q2 - Apr, May, Jun": [4, 5, 6],
    "Q3 - Jul, Aug, Sep": [7, 8, 9],
    "Q4 - Oct, Nov, Dec": [10, 11, 12],
  };
  return map[quarter] || [];
};

// ðŸ‘‡ PHP currency formatting
const formatCurrency = (value) => {
  const num = Number(value);
  return isNaN(num)
    ? "PHP 0.00"
    : new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }).format(num);
};

function ServiceUserChargesDialogContent({ quarter, year }) {
  const [breakdownData, setBreakdownData] = useState([]);
  const [total, setTotal] = useState("PHP 0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const months = convertQuarterToMonths(quarter);

        const response = await axiosInstance.get(
          "ServiceUserChargesBreakdown",
          {
            params: {
              year,
              months: months.join(","),
              _: Date.now(), // Cache buster
            },
          }
        );

        const data = response.data;
        const breakdown = data.breakdown || [];

        // ðŸ” Transform response array into object keyed by category
        const categoryMap = {};
        breakdown.forEach((item) => {
          categoryMap[item.category] = item.total_amount;
        });

        // ðŸ”„ Map to chart-friendly format
        const transformed = CATEGORY_MAPPING.map(({ label }) => ({
          label,
          value: formatCurrency(categoryMap[label] || 0),
        }));

        const totalAmount = transformed.reduce(
          (sum, item) => sum + Number(item.value.replace(/[^0-9.-]+/g, "")),
          0
        );

        setBreakdownData(transformed);
        setTotal(formatCurrency(totalAmount));
      } catch (err) {
        console.error("Axios error:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quarter, year]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">Error loading data: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          Service/User Charges Breakdown
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {year} Total
        </Typography>
      </Box>

      {breakdownData.map((item, index) => (
        <Box
          key={item.label}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py={1}
          borderBottom={index !== breakdownData.length - 1 ? 1 : 0}
          borderColor="divider"
        >
          <Typography variant="body2">{item.label}</Typography>
          <Typography variant="body2" fontWeight={500}>
            {item.value}
          </Typography>
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />
      <Box display="flex" justifyContent="space-between">
        <Typography variant="subtitle1" fontWeight="bold">
          Overall Total
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          {total}
        </Typography>
      </Box>
    </Box>
  );
}

export default ServiceUserChargesDialogContent;

