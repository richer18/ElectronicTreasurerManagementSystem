import { Alert, Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";

const cashierOptions = [
  { label: "FLORA MY", value: "flora" },
  { label: "IRIS", value: "angelique" },
  { label: "RICARDO", value: "ricardo" },
  { label: "AGNES", value: "agnes" },
  { label: "AMABELLA", value: "amabella" },
];

function TrustFundPaymentEditForm({ data }) {
  const paymentId = data?.PAYMENT_ID ?? data?.payment_id ?? data?.ID ?? data?.id;
  const [receiptTypeOptions, setReceiptTypeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: "",
    name: "",
    receipt_no: "",
    type_receipt: "",
    cashier: "",
  });
  const [details, setDetails] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const toCashierLabel = (rawValue) => {
    const value = String(rawValue || "").trim().toLowerCase();
    const matchByValue = cashierOptions.find((c) => c.value.toLowerCase() === value);
    if (matchByValue) return matchByValue.label;
    const matchByLabel = cashierOptions.find((c) => c.label.toLowerCase() === value);
    if (matchByLabel) return matchByLabel.label;
    return "";
  };

  const toCashierValue = (label) => {
    const match = cashierOptions.find((c) => c.label === label);
    return match ? match.value : "";
  };

  useEffect(() => {
    const fetchReceiptTypes = async () => {
      try {
        const response = await axiosInstance.get("form-types");
        setReceiptTypeOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setReceiptTypeOptions([]);
      }
    };

    fetchReceiptTypes();
  }, []);

  useEffect(() => {
    const fetchEditData = async () => {
      if (!paymentId) return;
      try {
        setLoading(true);
        const response = await axiosInstance.get(`trustFundPaymentEdit/${paymentId}`);
        const payment = response.data?.payment || {};
        const rows = Array.isArray(response.data?.details) ? response.data.details : [];
        const normalizedDate = String(payment.DATE || "")
          .split(" ")[0]
          .split("T")[0];

        setForm({
          date: normalizedDate,
          name: payment.NAME || "",
          receipt_no: payment.RECEIPT_NO || "",
          type_receipt: payment.TYPE_OF_RECEIPT || "",
          cashier: toCashierLabel(payment.CASHIER || ""),
        });
        setDetails(
          rows.map((row) => ({
            paymentdetail_id: row.PAYMENTDETAIL_ID,
            description: row.DESCRIPTION || "-",
            amount: Number(row.AMOUNTPAID || 0),
          }))
        );
      } catch (error) {
        setMessage({ type: "error", text: "Failed to load edit data." });
      } finally {
        setLoading(false);
      }
    };

    fetchEditData();
  }, [paymentId]);

  const total = useMemo(
    () => details.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [details]
  );
  const visibleDetails = useMemo(
    () => details.filter((row) => Number(row.amount || 0) !== 0),
    [details]
  );

  const handleAmountChange = (index, value) => {
    setDetails((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, amount: value === "" ? "" : Number(value) } : row
      )
    );
  };

  const handleSave = async () => {
    if (!form.date || !form.name || !form.receipt_no || !form.type_receipt || !form.cashier) {
      setMessage({ type: "error", text: "Please fill out all required fields." });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      await axiosInstance.put(`trustFundPaymentEdit/${paymentId}`, {
        ...form,
        cashier: toCashierValue(form.cashier),
        details: details.map((row) => ({
          paymentdetail_id: row.paymentdetail_id,
          amount: Number(row.amount || 0),
        })),
      });
      setMessage({ type: "success", text: "Payment updated successfully." });
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.response?.data?.message || "Failed to update payment.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Edit Trust Fund Payment
      </Typography>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, mb: 2 }}>
        <TextField label="Date" type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
        <TextField label="Receipt No." value={form.receipt_no} onChange={(e) => setForm((prev) => ({ ...prev, receipt_no: e.target.value }))} fullWidth />
        <TextField label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} fullWidth />
        <TextField
          label="Cashier"
          select
          value={form.cashier}
          onChange={(e) => setForm((prev) => ({ ...prev, cashier: e.target.value }))}
          fullWidth
          SelectProps={{ native: true }}
        >
          <option value="">Select cashier</option>
          {cashierOptions.map((cashier) => (
            <option key={cashier.value} value={cashier.label}>
              {cashier.label}
            </option>
          ))}
        </TextField>
        <TextField
          label="Type of Receipt"
          select
          value={form.type_receipt}
          onChange={(e) => setForm((prev) => ({ ...prev, type_receipt: e.target.value }))}
          fullWidth
          SelectProps={{ native: true }}
        >
          <option value="">Select receipt type</option>
          {receiptTypeOptions.map((option) => (
            <option key={option.code || option.id} value={option.code}>
              {option.description || option.name || option.code}
            </option>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #d8e2ee" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#0f2747" }}>
              <TableCell sx={{ color: "#fff", fontWeight: 700, width: 70 }}>#</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700, width: 220 }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleDetails.map((row, index) => (
              <TableRow key={row.paymentdetail_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.amount}
                    onChange={(e) =>
                      handleAmountChange(
                        details.findIndex((item) => item.paymentdetail_id === row.paymentdetail_id),
                        e.target.value
                      )
                    }
                    fullWidth
                    inputProps={{ min: 0, step: "0.01" }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Typography variant="h6" fontWeight={700}>
          Total:{" "}
          {new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
          }).format(total)}
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type === "success" ? "success" : "error"} sx={{ mt: 2 }}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Update"}
        </Button>
      </Box>
    </Box>
  );
}

TrustFundPaymentEditForm.propTypes = {
  data: PropTypes.shape({
    PAYMENT_ID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    payment_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default TrustFundPaymentEditForm;
