import { Box, Card, Grid, Typography } from "@mui/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { useNavigate } from "react-router-dom";
import { procurementList } from "./shared/procurementConfigs";

export default function ProcurementPortal() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(214,161,43,0.14), transparent 20%), linear-gradient(180deg, #f5f7fb 0%, #eef3f7 100%)",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f2747", mb: 1 }}>
        Procurement Portal
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        Open a procurement document module to manage records, update entries, view details, delete records, and print documents.
      </Typography>
      <Grid container spacing={2}>
        {procurementList.map((item) => (
          <Grid item xs={12} sm={6} lg={4} key={item.type}>
            <Card
              onClick={() => navigate(`/my-app/procurement-portal/${item.type}`)}
              sx={{
                p: 2.5,
                borderRadius: 4,
                cursor: "pointer",
                border: "1px solid #dbe4ee",
                boxShadow: "0 12px 32px rgba(15,39,71,0.08)",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 18px 36px rgba(15,39,71,0.14)",
                },
              }}
            >
              <DescriptionRoundedIcon sx={{ fontSize: 38, color: "#0f2747", mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f2747" }}>
                {item.title}
              </Typography>
              <Typography sx={{ color: "text.secondary", mt: 1 }}>
                {item.description}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
