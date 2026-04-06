import ScubaDivingRoundedIcon from "@mui/icons-material/ScubaDivingRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { Box, Chip, Fade, Skeleton, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function DivingTicketTopChart({ year }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/dashboard/diving-ticket-top", { params: { year } })
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((error) => {
        console.error("Failed to load diving ticket chart:", error);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [year]);

  const chartRows = useMemo(() => {
    const mapped = new Map(
      rows.map((row) => [Number(row?.month_number || 0), Number(row?.amount || 0)])
    );

    return monthLabels.map((label, index) => ({
      label,
      fullLabel: label,
      amount: mapped.get(index + 1) ?? 0,
    }));
  }, [rows]);

  const pieRows = useMemo(
    () =>
      chartRows
        .filter((row) => row.amount > 0)
        .map((row, index) => ({
          id: index,
          label: row.label,
          value: row.amount,
        })),
    [chartRows]
  );

  const topEntry = useMemo(
    () =>
      chartRows.reduce((best, row) => {
        if (!best || row.amount > best.amount) {
          return row;
        }
        return best;
      }, null),
    [chartRows]
  );
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
              background: "linear-gradient(135deg, #00695c 0%, #26a69a 100%)",
            }}
          >
            <ScubaDivingRoundedIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#102a43" }}>
              Diving Ticket Best Sales
            </Typography>
            <Typography variant="body2" sx={{ color: "#627d98" }}>
              Monthly diving ticket sales for the selected year
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`Year ${year}`}
          sx={{
            bgcolor: "#eef9f7",
            color: "#0f5132",
            fontWeight: 700,
            border: "1px solid #cce9e4",
          }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(220px, 0.9fr)" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            border: "1px solid #d9e2ec",
            bgcolor: "#fbfffe",
            minHeight: 360,
            display: "flex",
            alignItems: "center",
          }}
        >
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2.5 }} />
          ) : pieRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No diving ticket sales found for the selected year.
            </Typography>
          ) : (
            <Fade in={!loading} timeout={350}>
              <Box sx={{ width: "100%" }}>
                <PieChart
                  series={[
                    {
                      data: pieRows,
                      innerRadius: 55,
                      outerRadius: 110,
                      paddingAngle: 2,
                      cornerRadius: 4,
                      highlightScope: { fade: "global", highlight: "item" },
                      highlighted: { additionalRadius: 10 },
                      faded: { additionalRadius: -4, color: "#dce9e6" },
                      cx: 170,
                      cy: 150,
                      valueFormatter: (value) =>
                        `PHP ${Number(value?.value || 0).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`,
                    },
                  ]}
                  height={320}
                  margin={{ top: 24, right: 180, bottom: 24, left: 24 }}
                  slotProps={{
                    legend: {
                      direction: "column",
                      position: { vertical: "middle", horizontal: "right" },
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
              background: "linear-gradient(135deg, #00695c 0%, #26a69a 100%)",
              color: "#ffffff",
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>
              Best Sale Month
            </Typography>
            <Typography sx={{ mt: 1, fontSize: { xs: 22, md: 28 }, fontWeight: 900 }}>
              {topEntry?.fullLabel ?? "No data"}
            </Typography>
            <Typography sx={{ mt: 0.8, fontSize: 13, opacity: 0.88 }}>
              PHP{" "}
              {Number(topEntry?.amount || 0).toLocaleString("en-PH", {
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
              <TrendingUpRoundedIcon sx={{ color: "#00897b", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 800, color: "#102a43" }}>
                Yearly Diving Sales
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
              Combined sales across 12 calendar months
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

DivingTicketTopChart.propTypes = {
  year: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default DivingTicketTopChart;
