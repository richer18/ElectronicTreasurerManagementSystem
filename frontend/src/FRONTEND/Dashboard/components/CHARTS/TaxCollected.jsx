import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {
  Box,
  Card,
  Fade,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { SparkLineChart } from "@mui/x-charts";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function TaxCollected() {
  const [sparkData, setSparkData] = useState([]);
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

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    axiosInstance
      .get("/tax/monthly")
      .then((res) => {
        const values = res.data.map((item) => toNumber(item?.value));
        setSparkData(values);
        setTotal(values.reduce((sum, val) => sum + val, 0));
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
        border: "1px solid #e5e8eb",
        boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
        color: "#1b1b1b",
        overflow: "hidden",
        transition: "all 0.3s ease",
        width: "100%",
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
            <AccountBalanceIcon sx={{ fontSize: 26, color: "#fff" }} />
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
            Tax Collected
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
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
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

        <Box
          sx={{
            width: "100%",
            height: 220,
            mb: 2,
            p: 1.5,
            borderRadius: "16px",
            backgroundColor: "#f9fafb",
            border: "1px solid #e0e3e7",
          }}
        >
          {loading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              sx={{
                borderRadius: "16px",
                bgcolor: "#f2f4f5",
              }}
            />
          ) : (
            <Fade in={!loading} timeout={600}>
              <Box>
                <SparkLineChart
                  data={sparkData}
                  width={isMobile ? 320 : 500}
                  height={220}
                  area
                  showTooltip
                  showHighlight
                  xAxis={{
                    scaleType: "point",
                    data: months,
                    valueFormatter: (v) => v,
                  }}
                  highlightScope={{ highlighted: "item", faded: "global" }}
                  color="#1976d2"
                  areaGradient={{
                    from: "rgba(25,118,210,0.25)",
                    to: "rgba(25,118,210,0.05)",
                  }}
                  valueFormatter={(val) =>
                    `PHP ${toNumber(val).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  }
                  margin={{ top: 10, bottom: 20 }}
                  disableClipping
                />
              </Box>
            </Fade>
          )}
        </Box>

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
            Monthly Trend
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

export default TaxCollected;
