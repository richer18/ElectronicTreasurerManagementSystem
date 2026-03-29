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

function CedulaCollected({ year }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/cedula/monthly", {
        params: { year },
      })
      .then((res) => {
        const values = (Array.isArray(res.data) ? res.data : []).map((item) => ({
          month: item?.month ?? "",
          collected: toNumber(item?.collected ?? item?.value),
        }));
        setChartData(values);
      })
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, [year]);

  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + toNumber(item.collected), 0),
    [chartData]
  );

  const peak = useMemo(() => {
    if (!chartData.length) return { month: "No data", value: 0 };
    return chartData.reduce(
      (best, item) =>
        item.collected > best.value
          ? { month: item.month || "N/A", value: item.collected }
          : best,
      { month: chartData[0]?.month || "N/A", value: chartData[0]?.collected || 0 }
    );
  }, [chartData]);

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
              Cedula Collection Trend
            </Typography>
            <Typography variant="body2" sx={{ color: "#627d98" }}>
              Monthly Community Tax Certificate collections for the selected year
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
          ) : (
            <Fade in={!loading} timeout={350}>
              <Box sx={{ width: "100%" }}>
                <BarChart
                  dataset={chartData}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "month",
                    },
                  ]}
                  series={[
                    {
                      dataKey: "collected",
                      label: "Cedula Collection",
                      color: "#18a0b6",
                      valueFormatter: (value) =>
                        `PHP ${toNumber(value).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`,
                    },
                  ]}
                  height={320}
                  margin={{ top: 24, right: 24, bottom: 24, left: 64 }}
                  grid={{ horizontal: true }}
                  slotProps={{
                    legend: { hidden: true },
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
              background: "linear-gradient(135deg, #0f7b8c 0%, #18a0b6 100%)",
              color: "#ffffff",
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>
              Total Cedula Collection
            </Typography>
            <Typography sx={{ mt: 1, fontSize: { xs: 28, md: 34 }, fontWeight: 900 }}>
              PHP{" "}
              {toNumber(total).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
            <Typography sx={{ mt: 0.8, fontSize: 13, opacity: 0.88 }}>
              Cedula collections recorded for {year}
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
                Peak Month
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
              Reporting Note
            </Typography>
            <Typography sx={{ color: "#486581", fontWeight: 600, lineHeight: 1.7 }}>
              This view helps monitor monthly cedula activity and spot low-issuance months quickly.
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
