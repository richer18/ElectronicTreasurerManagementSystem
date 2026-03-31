import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";

const pick = (row, keys) => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && row?.[key] !== "") {
      return row[key];
    }
  }
  return "";
};

const normalizeDigits = (value) => String(value ?? "").replace(/\D/g, "");

const toInt = (value) => {
  const digits = normalizeDigits(value);
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
};

const resolveAvailableRange = (row) => {
  if (!row) return { from: "", to: "", qty: 0 };
  const endingFrom = pick(row, ["Ending_Balance_receipt_from"]);
  const endingTo = pick(row, ["Ending_Balance_receipt_to"]);
  const endingQty = Number(pick(row, ["Ending_Balance_receipt_qty"]) || 0);
  if (endingQty > 0 && toInt(endingFrom) > 0 && toInt(endingTo) >= toInt(endingFrom)) {
    return { from: endingFrom, to: endingTo, qty: endingQty };
  }

  return {
    from: pick(row, ["Receipt_Range_From"]),
    to: pick(row, ["Receipt_Range_To"]),
    qty: Number(pick(row, ["Stock"]) || 0),
  };
};

function ReturnAccountableForm({ onSaved, onCancel }) {
  const [issuedForms, setIssuedForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({
    return_date: new Date().toISOString().split("T")[0],
    issued_accountable_form_id: "",
    returned_receipt_from: "",
    returned_receipt_to: "",
    processed_by: "",
    returned_to: "",
    custodian_received_by: "",
    return_signature_reference: "",
    logbook_reference_no: "",
    remarks: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/issued-forms")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        const active = rows.filter((row) => Number(pick(row, ["Stock", "stock"]) || 0) > 0);
        setIssuedForms(active);
      })
      .catch((error) => {
        console.error("Failed to load issued forms for return:", error);
        setIssuedForms([]);
      });
  }, []);

  const availableRange = useMemo(() => {
    return resolveAvailableRange(selectedForm);
  }, [selectedForm]);

  const handleFormSelect = (event, value) => {
    const nextRange = resolveAvailableRange(value);
    setSelectedForm(value);
    setFormData((prev) => ({
      ...prev,
      issued_accountable_form_id: pick(value, ["ID", "id"]) || "",
      returned_receipt_from: nextRange.from || "",
      returned_receipt_to: nextRange.to || "",
    }));
  };

  useEffect(() => {
    if (!selectedForm) return;
    setFormData((prev) => ({
      ...prev,
      returned_receipt_from: availableRange.from || "",
      returned_receipt_to: availableRange.to || "",
    }));
  }, [selectedForm, availableRange.from, availableRange.to]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("receipt") ? normalizeDigits(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await axiosInstance.post("/accountable-form-returns", formData);
      onSaved?.(response.data);
    } catch (error) {
      console.error("Failed to return accountable form:", error);
      setErrorMessage(error?.response?.data?.message || "Failed to save return.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} elevation={0} sx={{ p: 1 }}>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f2747" }}>
            Return Accountable Form
          </Typography>
          <Typography variant="body2" sx={{ color: "#4b5d73" }}>
            Record the unused accountable forms returned by the collector.
          </Typography>
        </Box>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Autocomplete
          options={issuedForms}
          value={selectedForm}
          onChange={handleFormSelect}
          getOptionLabel={(option) =>
            `${pick(option, ["Collector"])} | ${pick(option, ["Form_Type"])} | ${pick(option, ["Serial_No"])}`
          }
          renderInput={(params) => (
            <TextField {...params} label="Issued Form" required helperText="Select the issued accountable form to return." />
          )}
        />

        {selectedForm && (
          <Alert severity="info">
            Available balance: {availableRange.from || "0"} to {availableRange.to || "0"} ({availableRange.qty} receipts)
          </Alert>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField
            label="Return Date"
            type="date"
            name="return_date"
            value={formData.return_date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
          <TextField
            label="Processed By"
            name="processed_by"
            value={formData.processed_by}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Returned To"
            name="returned_to"
            value={formData.returned_to}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Custodian Received By"
            name="custodian_received_by"
            value={formData.custodian_received_by}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Return Signature Reference"
            name="return_signature_reference"
            value={formData.return_signature_reference}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Logbook Reference No."
            name="logbook_reference_no"
            value={formData.logbook_reference_no}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Returned Receipt From"
            name="returned_receipt_from"
            value={formData.returned_receipt_from}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Returned Receipt To"
            name="returned_receipt_to"
            value={formData.returned_receipt_to}
            onChange={handleChange}
            required
            fullWidth
          />
        </Box>

        <TextField
          label="Remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          multiline
          minRows={3}
          fullWidth
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting || !formData.issued_accountable_form_id}>
            {submitting ? "Saving..." : "Save Return"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default ReturnAccountableForm;
