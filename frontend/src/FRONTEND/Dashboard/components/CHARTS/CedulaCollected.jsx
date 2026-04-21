import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
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

const taxpayerColors = [
  "#1e88e5",
  "#26a69a",
  "#7cb342",
  "#f9a825",
  "#fb8c00",
  "#ef5350",
  "#ab47bc",
  "#5c6bc0",
  "#29b6f6",
  "#8d6e63",
];

const shorten = (value) => {
  const text = String(value || "");
  return text.length > 16 ? `${text.slice(0, 16)}...` : text;
};

function CedulaCollected({ year }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/tax/top-taxpayers", {
        params: { year },
      })
      .then((res) => {
        const values = (Array.isArray(res.data) ? res.data : []).map((item) => ({
          taxpayer: item?.taxpayer ?? "Unknown",
          shortTaxpayer: shorten(item?.taxpayer ?? "Unknown"),
          amount: toNumber(item?.amount),
        }));
        setChartData(values);
      })
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, [year]);

  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + toNumber(item.amount), 0),
    [chartData]
  );

  const topTaxpayer = useMemo(() => chartData[0] ?? null, [chartData]);

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
              background: "linear-gradient(135deg, #0f7b8c 0%, #18a0b6 100%)",
            }}
          >
            <AssignmentIndIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#102a43" }}>
              Top 10 Taxpayer
            </Typography>
            <Typography variant="body2" sx={{ color: "#627d98" }}>
              Highest taxpayers across the LGU for the selected year
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={<CalendarMonthRoundedIcon />}
          label={`Year ${year}`}
          sx={{
            bgcolor: "#eef7fb",
            color: "#102a43",
            fontWeight: 700,
            border: "1px solid #d9e2ec",
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
            bgcolor: "#fbfdff",
            minHeight: 360,
            display: "flex",
            alignItems: "center",
          }}
        >
          {loading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: 2.5, bgcolor: "#eef2f6" }}
            />
          ) : chartData.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No taxpayer collection data found for {year}.
            </Typography>
          ) : (
            <Fade in={!loading} timeout={350}>
              <Box sx={{ width: "100%" }}>
                <BarChart
                  dataset={chartData}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "shortTaxpayer",
                      colorMap: {
                        type: "ordinal",
                        values: chartData.map((item) => item.shortTaxpayer),
                        colors: taxpayerColors,
                      },
                    },
                  ]}
                  yAxis={[
                    {
                      valueFormatter: (value) => {
                        const amount = toNumber(value);
                        if (amount >= 1000000) {
                          return `${(amount / 1000000).toFixed(1)}M`;
                        }
                        if (amount >= 1000) {
                          return `${Math.round(amount / 1000)}K`;
                        }
                        return String(amount);
                      },
                    },
                  ]}
                  series={[
                    {
                      dataKey: "amount",
                      label: "Tax Paid",
                      color: "#18a0b6",
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
                  slotProps={{
                    legend: { hidden: true },
                  }}
                />
                <Box
                  sx={{
                    ml: "72px",
                    mr: "24px",
                    mt: 0.5,
                    display: "grid",
                    gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))`,
                    alignItems: "start",
                    minHeight: 72,
                  }}
                >
                  {chartData.map((item) => (
                    <Box
                      key={item.taxpayer}
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
                        {item.shortTaxpayer}
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
              background: "linear-gradient(135deg, #0f7b8c 0%, #18a0b6 100%)",
              color: "#ffffff",
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>
              Top Taxpayer
            </Typography>
            <Typography sx={{ mt: 1, fontSize: { xs: 22, md: 28 }, fontWeight: 900 }}>
              {topTaxpayer?.taxpayer ?? "No data"}
            </Typography>
            <Typography sx={{ mt: 0.8, fontSize: 13, opacity: 0.88 }}>
              PHP{" "}
              {toNumber(topTaxpayer?.amount).toLocaleString("en-PH", {
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
              <TrendingUpRoundedIcon sx={{ color: "#18a0b6", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 800, color: "#102a43" }}>
                Top 10 Total
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
              Combined amount of the visible top taxpayers across all modules
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

CedulaCollected.propTypes = {
  year: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default CedulaCollected;
