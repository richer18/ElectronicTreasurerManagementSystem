import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import axiosInstance from "../../../../api/axiosInstance";
import { useEffect, useMemo, useState } from "react";

const pick = (row, keys) => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && row?.[key] !== "") {
      return row[key];
    }
  }
  return "";
};

function CheckStocks({ onBack }) {
  const [purchases, setPurchases] = useState([]);
  const [issuedForms, setIssuedForms] = useState([]);
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    axiosInstance.get("/purchases").then((res) => setPurchases(Array.isArray(res.data) ? res.data : [])).catch(() => setPurchases([]));
    axiosInstance.get("/issued-forms").then((res) => setIssuedForms(Array.isArray(res.data) ? res.data : [])).catch(() => setIssuedForms([]));
    axiosInstance.get("/accountable-form-returns").then((res) => setReturns(Array.isArray(res.data) ? res.data : [])).catch(() => setReturns([]));
  }, []);

  const stockRows = useMemo(() => {
    const map = new Map();

    purchases.forEach((row) => {
      const serialNo = pick(row, ["Serial_No", "serial_no"]);
      const formType = pick(row, ["Form_Type", "form_type"]);
      const key = `${formType}__${serialNo}`;
      map.set(key, {
        key,
        formType,
        serialNo,
        purchasedQty: Number(pick(row, ["Stock", "stock"]) || 0),
        purchasedRange: `${pick(row, ["Receipt_Range_From", "receipt_range_from"]) || "-"} - ${pick(row, ["Receipt_Range_To", "receipt_range_to"]) || "-"}`,
        issuedQty: 0,
        remainingQty: 0,
        returnedQty: 0,
        lastCollector: "-",
        status: pick(row, ["Status", "status"]) || "AVAILABLE",
      });
    });

    issuedForms.forEach((row) => {
      const serialNo = pick(row, ["Serial_No", "serial_no"]);
      const formType = pick(row, ["Form_Type", "form_type"]);
      const key = `${formType}__${serialNo}`;
      const existing = map.get(key) || {
        key,
        formType,
        serialNo,
        purchasedQty: 0,
        purchasedRange: "-",
        issuedQty: 0,
        remainingQty: 0,
        returnedQty: 0,
        lastCollector: "-",
        status: "-",
      };

      existing.issuedQty += Number(pick(row, ["Receipt_Range_qty", "Stock", "stock"]) || 0);
      existing.remainingQty = Number(pick(row, ["Stock", "stock"]) || 0);
      existing.lastCollector = pick(row, ["Collector", "collector"]) || existing.lastCollector;
      existing.status = pick(row, ["Status", "status"]) || existing.status;
      map.set(key, existing);
    });

    returns.forEach((row) => {
      const serialNo = pick(row, ["serial_no", "Serial_No"]);
      const formType = pick(row, ["form_type", "Form_Type"]);
      const key = `${formType}__${serialNo}`;
      const existing = map.get(key);
      if (!existing) return;
      existing.returnedQty += Number(pick(row, ["returned_receipt_qty"]) || 0);
      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) =>
      `${a.formType}-${a.serialNo}`.localeCompare(`${b.formType}-${b.serialNo}`, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }, [purchases, issuedForms, returns]);

  const summary = useMemo(() => {
    return stockRows.reduce(
      (acc, row) => {
        acc.totalPurchased += row.purchasedQty;
        acc.totalRemaining += row.remainingQty;
        acc.totalReturned += row.returnedQty;
        if (String(row.status).toUpperCase() === "ISSUED") acc.activeIssued += 1;
        if (row.remainingQty <= 0) acc.zeroBalance += 1;
        return acc;
      },
      {
        totalPurchased: 0,
        totalRemaining: 0,
        totalReturned: 0,
        activeIssued: 0,
        zeroBalance: 0,
      }
    );
  }, [stockRows]);

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f2747" }}>
              Stock Checking
            </Typography>
            <Typography variant="body2" sx={{ color: "#4b5d73" }}>
              View purchased stock, assigned forms, remaining balance, and returned accountable forms in one place.
            </Typography>
          </Box>
          {onBack && (
            <Button variant="outlined" onClick={onBack}>
              Back to Workspace
            </Button>
          )}
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {[
          { label: "Purchased Qty", value: summary.totalPurchased },
          { label: "Remaining Qty", value: summary.totalRemaining },
          { label: "Returned Qty", value: summary.totalReturned },
          { label: "Active Issued Forms", value: summary.activeIssued },
          { label: "Zero Balance Forms", value: summary.zeroBalance },
        ].map((item) => (
          <Paper key={item.label} sx={{ p: 2, minWidth: 180, borderRadius: 3, border: "1px solid #d8e2ee", boxShadow: "none" }}>
            <Typography variant="caption" sx={{ color: "#4b5d73" }}>{item.label}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f2747" }}>{item.value}</Typography>
          </Paper>
        ))}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Form</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Serial</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Purchased Range</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Purchased</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Remaining</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Returned</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Collector</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Alert severity="info">No stock records found yet.</Alert>
                </TableCell>
              </TableRow>
            ) : (
              stockRows.map((row) => (
                <TableRow key={row.key} hover>
                  <TableCell align="center">{row.formType || "-"}</TableCell>
                  <TableCell align="center">{row.serialNo || "-"}</TableCell>
                  <TableCell align="center">{row.purchasedRange}</TableCell>
                  <TableCell align="center">{row.purchasedQty}</TableCell>
                  <TableCell align="center">{row.remainingQty}</TableCell>
                  <TableCell align="center">{row.returnedQty}</TableCell>
                  <TableCell align="center">{row.lastCollector}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.status || "-"}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: row.remainingQty > 0 ? "rgba(15,107,98,0.12)" : "rgba(75,93,115,0.12)",
                        color: row.remainingQty > 0 ? "#0f6b62" : "#4b5d73",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default CheckStocks;
