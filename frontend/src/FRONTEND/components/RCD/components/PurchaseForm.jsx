import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../api/axiosInstance";
function PurchaseForm({ onSaved, onCancel }) {
  const getTypeLabel = (type) => type?.description ?? type?.name ?? "";
  const getTypeKey = (type) => type?.code ?? type?.id ?? getTypeLabel(type);

  const [formData, setFormData] = useState({
    purchase_date: "",
    form_type: "",
    serial_no: "",
    receipt_range_from: "",
    receipt_range_to: "",
    stock: "50",
    status: "AVAILABLE",
  });

  const [formTypes, setFormTypes] = useState([]);

  useEffect(() => {
    axiosInstance.get("/form-types")
      .then(res => setFormTypes(res.data))
      .catch(err => console.error("Failed to fetch form types:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...formData, [name]: value, stock: "50" };

    if (name === "receipt_range_from") {
      const from = Number(value);
      if (Number.isFinite(from) && from > 0) {
        nextForm.receipt_range_to = String(from + 49);
      } else {
        nextForm.receipt_range_to = "";
      }
    }

    setFormData(nextForm);
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  // Prepare payload for Laravel
  const payload = {
    purchase_date: formData.purchase_date,
    form_type: formData.form_type,
    serial_no: formData.serial_no,
    receipt_range_from: formData.receipt_range_from,
    receipt_range_to: formData.receipt_range_to,
    stock: formData.stock,
    status: formData.status,
  };

  axiosInstance.post("/purchases", payload)
    .then((res) => {
      console.log("Saved:", res.data);

      // Optional: reset form
      const resetForm = {
        purchase_date: "",
        form_type: "",
        serial_no: "",
        receipt_range_from: "",
        receipt_range_to: "",
        stock: "50",
        status: "AVAILABLE",
      };
      setFormData(resetForm);
      onSaved?.(res.data);
    })
    .catch((err) => {
      console.error("Error saving purchase:", err.response?.data || err);
      alert("Failed to save purchase.");
    });
};


  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        mt: 1,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Purchase Accountable Form
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Fill the form details. Qty is fixed to 50 per batch.
          </Typography>
        </Box>
        <Chip
          label="Qty: 50"
          sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white", fontWeight: 700 }}
        />
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary" }}>
          Form Details
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Date"
            type="date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={handleChange}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* Form Type Combo Box */}
        <TextField
          select
          label="Form Type"
          name="form_type"
          value={formData.form_type}
          onChange={handleChange}
          required
          fullWidth
        >
          <MenuItem value="">-- Select Form Type --</MenuItem>
          {formTypes.map((type) => (
            <MenuItem key={getTypeKey(type)} value={getTypeLabel(type)}>
              {getTypeLabel(type)}
            </MenuItem>
          ))}
        </TextField>

          <TextField
            label="Serial No."
            name="serial_no"
            value={formData.serial_no}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
            <MenuItem value="USED">USED</MenuItem>
            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
          </TextField>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary" }}>
          Receipt Range
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Receipt Range From"
            type="number"
            name="receipt_range_from"
            value={formData.receipt_range_from}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            label="Receipt Range To"
            type="number"
            name="receipt_range_to"
            value={formData.receipt_range_to}
            onChange={handleChange}
            required
            fullWidth
            helperText="Editable"
          />

          <TextField
            label="Qty / Stock"
            type="number"
            name="stock"
            value={formData.stock}
            required
            fullWidth
            InputProps={{ readOnly: true }}
            helperText="Fixed value"
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 3 }}>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              Back
            </Button>
          )}
          <Button type="submit" variant="contained" size="large" sx={{ px: 4, fontWeight: 700 }}>
            Save Purchase
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default PurchaseForm;
