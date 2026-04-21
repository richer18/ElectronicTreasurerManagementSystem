import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { Box, Chip, Fade, Skeleton, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const collectorColors = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const shorten = (value) => {
  const text = String(value || "");
  return text.length > 14 ? `${text.slice(0, 14)}...` : text;
};

function CollectorYearlyChart({ year }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/dashboard/collector-yearly", { params: { year } })
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((error) => {
        console.error("Failed to load collector yearly chart:", error);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [year]);

  const chartRows = useMemo(
    () =>
      rows.map((row) => ({
        collector: row?.collector ?? "Unknown",
        shortCollector: shorten(row?.collector),
        amount: toNumber(row?.amount),
      })),
    [rows]
  );

  const topCollector = chartRows[0] ?? null;
  const total = useMemo(
    () => chartRows.reduce((sum, row) => sum + row.amount, 0),
    [chartRows]
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        border: "1px solid #d9e2ec",
        bgcolor: "#ffffff",
        boxShadow: "0 8px 22px rgba(15,39,71,0.05)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)",
            }}
          >
            <GroupsRoundedIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#102a43" }}>
              Collector Total Collection
            </Typography>
            <Typography variant="body2" sx={{ color: "#627d98" }}>
              Whole-year total collections by collector
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`Year ${year}`}
          sx={{
            bgcolor: "#f4efff",
            color: "#4c1d95",
            fontWeight: 700,
            border: "1px solid #ddd6fe",
          }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2.2fr) minmax(240px, 0.8fr)" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            border: "1px solid #d9e2ec",
            bgcolor: "#fbfaff",
            minHeight: 360,
            display: "flex",
            alignItems: "center",
          }}
        >
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2.5 }} />
          ) : chartRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No collector totals found for {year}.
            </Typography>
          ) : (
            <Fade in={!loading} timeout={350}>
              <Box sx={{ width: "100%" }}>
                <BarChart
                  dataset={chartRows}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "shortCollector",
                      colorMap: {
                        type: "ordinal",
                        values: chartRows.map((row) => row.shortCollector),
                        colors: collectorColors,
                      },
                    },
                  ]}
                  yAxis={[
                    {
                      valueFormatter: (value) => {
                        const amount = toNumber(value);
                        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
                        if (amount >= 1000) return `${Math.round(amount / 1000)}K`;
                        return String(amount);
                      },
                    },
                  ]}
                  series={[
                    {
                      dataKey: "amount",
                      label: "Collector Total",
                      color: "#7c3aed",
                      valueFormatter: (value) =>
                        `PHP ${toNumber(value).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`,
                      highlightScope: { highlight: "item", fade: "global" },
                    },
                  ]}
                  height={320}
                  borderRadius={8}
                  margin={{ top: 24, right: 24, bottom: 24, left: 72 }}
                  grid={{ horizontal: true }}
                  sx={{
                    "& .MuiChartsAxis-directionX .MuiChartsAxis-tickLabel": {
                      opacity: 0,
                    },
                  }}
                  slotProps={{ legend: { hidden: true } }}
                />
                <Box
                  sx={{
                    ml: "72px",
                    mr: "24px",
                    mt: 0.5,
                    display: "grid",
                    gridTemplateColumns: `repeat(${chartRows.length}, minmax(0, 1fr))`,
                    alignItems: "start",
                    minHeight: 72,
                  }}
                >
                  {chartRows.map((row) => (
                    <Box
                      key={row.collector}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        overflow: "visible",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 11,
                          color: "#334e68",
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                          transform: "rotate(-35deg)",
                          transformOrigin: "top center",
                        }}
                      >
                        {row.shortCollector}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Fade>
          )}
        </Box>

        <Box sx={{ display: "grid", gap: 1.5 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)",
              color: "#ffffff",
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>
              Top Collector
            </Typography>
            <Typography sx={{ mt: 1, fontSize: { xs: 22, md: 28 }, fontWeight: 900 }}>
              {topCollector?.collector ?? "No data"}
            </Typography>
            <Typography sx={{ mt: 0.8, fontSize: 13, opacity: 0.88 }}>
              PHP{" "}
              {toNumber(topCollector?.amount).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid #d9e2ec",
              bgcolor: "#ffffff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <TrendingUpRoundedIcon sx={{ color: "#7c3aed", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 800, color: "#102a43" }}>
                Total for Top Collectors
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#102a43" }}>
              PHP{" "}
              {total.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
            <Typography sx={{ mt: 0.4, color: "#486581", fontWeight: 600 }}>
              Combined total of the visible collectors
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

CollectorYearlyChart.propTypes = {
  year: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default CollectorYearlyChart;
