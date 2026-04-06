import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { Box, Chip, Fade, Skeleton, Typography } from "@mui/material";
import { pieArcLabelClasses, PieChart } from "@mui/x-charts";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function TaxCollected({ year }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/tax/yearly-breakdown", {
        params: { year },
      })
      .then((res) => {
        const values = Array.isArray(res.data)
          ? res.data.map((item, index) => ({
              id: index,
              label: item?.label ?? `Series ${index + 1}`,
              value: toNumber(item?.value),
            }))
          : [];
        setChartData(values);
      })
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, [year]);

  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + toNumber(item?.value), 0),
    [chartData]
  );

  const average = useMemo(() => (chartData.length ? total / chartData.length : 0), [chartData, total]);

  const peak = useMemo(() => {
    if (!chartData.length) return { month: "No data", value: 0 };
    let bestIndex = 0;
    let bestValue = toNumber(chartData[0]?.value);

    chartData.forEach((item, index) => {
      const currentValue = toNumber(item?.value);
      if (currentValue > bestValue) {
        bestValue = currentValue;
        bestIndex = index;
      }
    });

    return {
      month: chartData[bestIndex]?.label || "N/A",
      value: bestValue,
    };
  }, [chartData]);

  const totalValue = useMemo(
    () => chartData.reduce((sum, item) => sum + toNumber(item?.value), 0),
    [chartData]
  );

  const getArcLabel = (item) => {
    const value = toNumber(item?.value);
    if (!value || !totalValue) return "";
    const percent = Math.round((value / totalValue) * 100);
    return `${item?.label} ${percent}%`;
  };

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
              background: "linear-gradient(135deg, #0f4c81 0%, #1976d2 100%)",
            }}
          >
            <AccountBalanceIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#102a43" }}>
              Tax Collection Trend
            </Typography>
            <Typography variant="body2" sx={{ color: "#627d98" }}>
              Whole-year collection breakdown across RPT, Cedula, General Fund, and Trust Fund
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={<CalendarMonthRoundedIcon />}
          label={`Year ${year}`}
          sx={{
            bgcolor: "#eef4fb",
            color: "#102a43",
            fontWeight: 700,
            border: "1px solid #d9e2ec",
          }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 2.6fr) minmax(240px, 0.7fr)" },
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
          ) : chartData.every((item) => toNumber(item?.value) === 0) ? (
            <Typography variant="body2" color="text.secondary">
              No tax collection data found for {year}.
            </Typography>
          ) : (
            <Fade in={!loading} timeout={350}>
              <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <PieChart
                  width={520}
                  series={[
                    {
                      data: chartData,
                      innerRadius: 72,
                      outerRadius: 138,
                      arcLabel: getArcLabel,
                      arcLabelMinAngle: 8,
                      arcLabelRadius: "112%",
                      paddingAngle: 2,
                      cornerRadius: 4,
                      highlightScope: { fade: "global", highlight: "item" },
                      highlighted: { additionalRadius: 10 },
                      faded: { additionalRadius: -4, color: "#dce6f2" },
                      cx: 220,
                      cy: 160,
                      valueFormatter: (value) =>
                        `PHP ${toNumber(value?.value).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`,
                    },
                  ]}
                  height={340}
                  margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
                  slotProps={{
                    legend: { hidden: true },
                  }}
                  sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                      fill: "#102a43",
                      fontSize: 12,
                      fontWeight: 700,
                    },
                  }}
                />
              </Box>
            </Fade>
          )}
        </Box>

        <Box sx={{ display: "grid", gap: 1.5 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: "linear-gradient(135deg, #0f4c81 0%, #1976d2 100%)",
              color: "#ffffff",
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>
              Total Collection
            </Typography>
            <Typography sx={{ mt: 1, fontSize: { xs: 28, md: 34 }, fontWeight: 900 }}>
              PHP{" "}
              {toNumber(total).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
            <Typography sx={{ mt: 0.8, fontSize: 13, opacity: 0.88 }}>
              Aggregated tax inflow for {year}
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
              <TrendingUpRoundedIcon sx={{ color: "#1565c0", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 800, color: "#102a43" }}>
                Top Collection Source
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#102a43" }}>
              {peak.month}
            </Typography>
            <Typography sx={{ mt: 0.4, color: "#486581", fontWeight: 600 }}>
              PHP {toNumber(peak.value).toLocaleString("en-PH", {
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
              bgcolor: "#f8fbff",
            }}
          >
              <Typography sx={{ fontWeight: 800, color: "#102a43", mb: 0.8 }}>
                Average Per Source
            </Typography>
            <Typography sx={{ color: "#486581", fontWeight: 700 }}>
              PHP {toNumber(average).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

TaxCollected.propTypes = {
  year: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default TaxCollected;
