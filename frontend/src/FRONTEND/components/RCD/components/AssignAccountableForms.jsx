import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import axiosInstance from "../../../../api/axiosInstance";

const collectors = [
  { name: "Flora My D. Ferrer" },
  { name: "Agnes Ello" },
  { name: "Ricardo T. Enopia" },
  { name: "Emily E. Credo" },
];

const sortBySerialNo = (a, b) =>
  String(a?.serial_no ?? a?.Serial_No ?? "").localeCompare(String(b?.serial_no ?? b?.Serial_No ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });

const getFormType = (form) => form?.form_type ?? form?.Form_Type ?? "";
const getSerialNo = (form) => form?.serial_no ?? form?.Serial_No ?? "";
const getRangeFrom = (form) => form?.receipt_range_from ?? form?.Receipt_Range_From ?? "";
const getRangeTo = (form) => form?.receipt_range_to ?? form?.Receipt_Range_To ?? "";
const getStock = (form) => form?.stock ?? form?.Stock ?? 50;
const getMasterFormTypeLabel = (type) => type?.description ?? type?.name ?? "";

function AssignAccountableForms({ onSaved, onCancel }) {
  const [formData, setFormData] = useState({
    Date: new Date().toISOString().split("T")[0],
    Collector: "",
    Form_Type: "",
    Serial_No: "",
    Receipt_Range_From: "",
    Receipt_Range_To: "",
    Issued_receipt_qty: 50,
    Stock: 50,
    Status: "ISSUED",
    assigned_by: "",
    collector_received_by: "",
    collector_signature_reference: "",
    logbook_reference_no: "",
  });

  const [availableForms, setAvailableForms] = useState([]);
  const [formTypes, setFormTypes] = useState([]);

  useEffect(() => {
    axiosInstance.get('/available-forms')
      .then(res => setAvailableForms(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err));

    axiosInstance.get('/form-types')
      .then(res => setFormTypes(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Failed to fetch form types:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...formData, [name]: value, Issued_receipt_qty: 50, Stock: 50 };

    if (name === "Receipt_Range_From") {
      const from = Number(value);
      nextForm.Receipt_Range_To =
        Number.isFinite(from) && from > 0 ? String(from + 49) : "";
    }

    setFormData(nextForm);
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  axiosInstance.post('/assign-forms', formData)
    .then(res => {
      // Update inventory: mark the assigned Purchase Accountable Form as USED
      axiosInstance.put(`/update-purchase-form/${formData.Serial_No}`, { Status: 'USED' })
        .then(() => {
          // Refresh available forms
          axiosInstance.get('/available-forms')
            .then(res => setAvailableForms(res.data));
        });
      onSaved?.(res.data);
    })
    .catch(err => {
      console.error(err);
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
      alert(apiMessage ? `Failed to assign form: ${apiMessage}` : 'Failed to assign form.');
    });
};

  const availableTypeNames = new Set(
    availableForms.map((f) => getFormType(f)).filter(Boolean)
  );
  const formTypeOptions = formTypes.filter((type) => availableTypeNames.has(getMasterFormTypeLabel(type)));
  const serialOptions = availableForms
    .filter((f) => getFormType(f) === formData.Form_Type)
    .sort(sortBySerialNo);

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
          background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Assign Accountable Form
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Assign 50 receipt forms to a collector.
          </Typography>
        </Box>
        <Chip
          label="Qty: 50"
          sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white", fontWeight: 700 }}
        />
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary" }}>
          Assignment Details
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
            name="Date"
            value={formData.Date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Autocomplete
  options={collectors}
  getOptionLabel={(option) => option.name}
  value={collectors.find((c) => c.name === formData.Collector) || null}
  onChange={(e, newValue) =>
    setFormData({ ...formData, Collector: newValue?.name || "" })
  }
  renderInput={(params) => <TextField {...params} label="Collector" required />}
/>

         <TextField
  select
  label="Form Type"
  name="Form_Type"
  value={formData.Form_Type}
  onChange={(e) => {
    const selectedType = e.target.value;
    const formsByType = availableForms
      .filter((f) => getFormType(f) === selectedType)
      .sort(sortBySerialNo);
    const firstFormInOrder = formsByType[0];

    setFormData((prev) => ({
      ...prev,
      Form_Type: selectedType,
      Serial_No: getSerialNo(firstFormInOrder) || "",
      Receipt_Range_From: getRangeFrom(firstFormInOrder) || "",
      Receipt_Range_To: getRangeTo(firstFormInOrder) || "",
      Stock: getStock(firstFormInOrder),
    }));
  }}
  fullWidth
  required
>
  {formTypeOptions.map((type) => (
    <MenuItem
      key={type.code ?? type.id ?? getMasterFormTypeLabel(type)}
      value={getMasterFormTypeLabel(type)}
    >
      {getMasterFormTypeLabel(type)}
    </MenuItem>
  ))}
</TextField>

         <TextField
  select
  label="Serial No."
  name="Serial_No"
  value={formData.Serial_No}
  onChange={(e) => {
    const selectedSerial = e.target.value;
    const form = availableForms.find((f) => getSerialNo(f) === selectedSerial);

    if (form) {
      setFormData((prev) => ({
        ...prev,
        Serial_No: getSerialNo(form),
        Receipt_Range_From: getRangeFrom(form),
        Receipt_Range_To: getRangeTo(form),
        Stock: getStock(form),
      }));
    }
  }}
  fullWidth
  required
>
  {serialOptions.map((f) => {
    const serial = getSerialNo(f);
    return (
      <MenuItem key={serial} value={serial}>
        {serial}
      </MenuItem>
    );
  })}
</TextField>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary" }}>
          Logbook Compliance
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Assigned By"
            name="assigned_by"
            value={formData.assigned_by}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Collector Received By"
            name="collector_received_by"
            value={formData.collector_received_by}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Collector Signature Reference"
            name="collector_signature_reference"
            value={formData.collector_signature_reference}
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
  name="receipt_range_from"
  value={formData.Receipt_Range_From}
  InputProps={{ readOnly: true }}
  fullWidth
/>

<TextField
  label="Receipt Range To"
  name="Receipt_Range_To"
  value={formData.Receipt_Range_To}
  onChange={handleChange}
  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
  fullWidth
/>

          <TextField
            label="Issued Qty / Stock"
            name="stock"
            value={formData.Stock}
            InputProps={{ readOnly: true }}
            fullWidth
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
            Assign Form
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default AssignAccountableForms;
