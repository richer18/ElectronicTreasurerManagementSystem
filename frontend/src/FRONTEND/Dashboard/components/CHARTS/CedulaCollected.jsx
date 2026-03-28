import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import {
  Box,
  Card,
  Fade,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function CedulaCollected() {
  const [chartData, setChartData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { animatedTotal } = useSpring({
    from: { animatedTotal: 0 },
    to: { animatedTotal: total },
    config: { tension: 100, friction: 24 },
    reset: true,
  });

  useEffect(() => {
    axiosInstance
      .get("/cedulaSummaryCollectionDataReport")
      .then((res) => {
        const values = res.data.map((item) => ({
          ...item,
          month: item?.month ?? "",
          collected: toNumber(item?.collected ?? item?.value),
        }));
        setChartData(values);
        setTotal(values.reduce((sum, item) => sum + item.collected, 0));
      })
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card
      sx={{
        p: 0,
        borderRadius: "20px",
        backgroundColor: "#ffffff",
        color: "#1b1b1b",
        border: "1px solid #e5e8eb",
        boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AssignmentIndIcon sx={{ fontSize: 26, color: "#fff" }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: isMobile ? "1rem" : "1.3rem",
              color: "#1b1b1b",
              letterSpacing: 0.3,
            }}
          >
            Cedula Collection
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          {loading ? (
            <>
              <Skeleton
                width="85%"
                sx={{ mb: 1, bgcolor: "#f2f4f5", height: 40 }}
              />
              <Skeleton width="65%" sx={{ bgcolor: "#f2f4f5", height: 24 }} />
            </>
          ) : (
            <Fade in={!loading} timeout={500}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: isMobile ? "2rem" : "2.8rem",
                      color: "#1976d2",
                    }}
                  >
                    PHP
                  </Typography>
                  <animated.div
                    style={{
                      fontSize: isMobile ? "2rem" : "2.8rem",
                      fontWeight: 800,
                      color: "#1b1b1b",
                    }}
                  >
                    {animatedTotal.to((x) =>
                      toNumber(x).toLocaleString("en-PH", {
                        maximumFractionDigits: 0,
                      })
                    )}
                  </animated.div>
                </Box>
                <Typography
                  sx={{
                    opacity: 0.8,
                    fontWeight: 500,
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    color: "#555",
                  }}
                >
                  Year-to-Date Collection • {new Date().getFullYear()}
                </Typography>
              </Box>
            </Fade>
          )}
        </Box>

        {loading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={220}
            sx={{
              borderRadius: "16px",
              bgcolor: "#f2f4f5",
            }}
          />
        ) : (
          <Fade in={!loading} timeout={800}>
            <Box
              sx={{
                width: "100%",
                height: 220,
                p: 1.5,
                borderRadius: "16px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e0e3e7",
              }}
            >
              <BarChart
                dataset={chartData}
                xAxis={[
                  {
                    scaleType: "band",
                    dataKey: "month",
                    label: "Month",
                  },
                ]}
                series={[
                  {
                    dataKey: "collected",
                    label: "Collected",
                    color: "#1976d2",
                    valueFormatter: (value) =>
                      `PHP ${toNumber(value).toLocaleString("en-PH", {
                        maximumFractionDigits: 0,
                      })}`,
                  },
                ]}
                width={isMobile ? 320 : 500}
                height={220}
                margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
                slotProps={{
                  legend: { hidden: true },
                }}
              />
            </Box>
          </Fade>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2,
            mt: 2,
            borderTop: "1px solid #e5e8eb",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "#555",
            }}
          >
            Monthly Distribution
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "#888",
            }}
          >
            {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

export default CedulaCollected;
