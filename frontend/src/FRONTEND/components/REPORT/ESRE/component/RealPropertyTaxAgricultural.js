import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../../api/axiosInstance"; // Update with actual path

const CATEGORY_MAPPING = [
  { label: "Current" },
  { label: "Prior" },
  { label: "Penalties" },
];

const convertQuarterToMonths = (quarter) => {
  const quarterMap = {
    "Q1 - Jan, Feb, Mar": [1, 2, 3],
    "Q2 - Apr, May, Jun": [4, 5, 6],
    "Q3 - Jul, Aug, Sep": [7, 8, 9],
    "Q4 - Oct, Nov, Dec": [10, 11, 12],
  };
  return quarterMap[quarter] || [];
};

const formatCurrency = (value) => {
  const number = Number(value);
  return isNaN(number)
    ? "PHP 0.00"
    : new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }).format(number);
};

const transform = (rows, keyName) => {
  const lookup = {};
  rows.forEach((row) => {
    const category = row.category?.trim();
    if (category) {
      lookup[category] = row[keyName] || 0;
    }
  });

  return CATEGORY_MAPPING.map(({ label }) => ({
    label,
    value: formatCurrency(lookup[label] || 0),
  }));
};

const calculateTotal = (dataArr) =>
  dataArr.reduce(
    (sum, item) => sum + Number(item.value.replace(/[^0-9.-]+/g, "")),
    0
  );

function RealPropertyTaxBasicDialogContent({ quarter, year }) {
  const [landData, setLandData] = useState([]);
  const [bldgData, setBldgData] = useState([]);
  const [landTotal, setLandTotal] = useState("PHP 0.00");
  const [bldgTotal, setBldgTotal] = useState("PHP 0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBreakdown = async (url, year, months) => {
    try {
      const response = await axiosInstance.get(url, {
        params: {
          year,
          month: months.join(","), // âœ… send all months
          _: Date.now(), // Cache busting
        },
      });
      console.log(`${url} API response:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      throw new Error(`Failed to fetch ${url}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const months = convertQuarterToMonths(quarter);

        const [landResponse, bldgResponse] = await Promise.all([
          fetchBreakdown("LandSharingData", year, months),
          fetchBreakdown("sefLandSharingData", year, months),
        ]);

        const landMapped = transform(landResponse, "LAND");
        const bldgMapped = transform(bldgResponse, "LAND");

        setLandData(landMapped);
        setBldgData(bldgMapped);
        setLandTotal(formatCurrency(calculateTotal(landMapped)));
        setBldgTotal(formatCurrency(calculateTotal(bldgMapped)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quarter, year]);

  const renderBreakdown = (title, data, total) => (
    <Box mb={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {year} Total
        </Typography>
      </Box>

      {data.map((item, index) => (
        <Box
          key={item.label}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py={1}
          borderBottom={index !== data.length - 1 ? 1 : 0}
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
      {renderBreakdown(
        "Real Property Tax-Basic/LAND Breakdown",
        landData,
        landTotal
      )}
      {renderBreakdown(
        "Real Property Tax-SEF/LAND Breakdown",
        bldgData,
        bldgTotal
      )}
    </Box>
  );
}

export default RealPropertyTaxBasicDialogContent;

