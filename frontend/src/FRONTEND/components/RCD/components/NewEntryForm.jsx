import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";

function NewEntryForm({ onSaved, onCancel, initialValues = null }) {
  const normalizeDigits = (value) => String(value ?? "").replace(/\D/g, "");
  const toInt = (value) => {
    const digits = normalizeDigits(value);
    if (!digits) return 0;
    return Number.parseInt(digits, 10);
  };

  const buildInitialFormData = () => ({
    issued_date: initialValues?.issued_date || new Date().toISOString().split("T")[0],
    fund: initialValues?.fund || "100 General Fund",
    collector: initialValues?.collector || "",
    type_of_receipt: initialValues?.type_of_receipt || "",
    serial_no: initialValues?.serial_no || "",
    receipt_no_from: normalizeDigits(initialValues?.receipt_no_from || ""),
    receipt_no_to: normalizeDigits(initialValues?.receipt_no_to || ""),
    total:
      initialValues?.total !== undefined && initialValues?.total !== null
        ? String(initialValues.total)
        : "",
    status: initialValues?.status || "Not Remit",
  });

  const [formData, setFormData] = useState(buildInitialFormData);
  const [issuedForms, setIssuedForms] = useState([]);
  const [receiptTypeOptions, setReceiptTypeOptions] = useState([]);
  const [duplicateDialog, setDuplicateDialog] = useState({
    open: false,
    message: "",
  });

  const sameIdentity = (row, payload) => {
    const rowDate = String(row?.issued_date || row?.Date || row?.date || "").slice(0, 10);
    const rowCollector = String(row?.collector || row?.Collector || "").trim().toLowerCase();
    const rowSerial = String(row?.serial_no || row?.Serial_No || "").trim().toLowerCase();
    const rowType = String(row?.type_of_receipt || row?.Type_Of_Receipt || "").trim().toLowerCase();
    const rowFrom = normalizeDigits(row?.receipt_no_from || row?.Receipt_No_From || "");
    const rowTo = normalizeDigits(row?.receipt_no_to || row?.Receipt_No_To || "");

    return (
      rowDate === payload.issued_date &&
      rowCollector === String(payload.collector || "").trim().toLowerCase() &&
      rowSerial === String(payload.serial_no || "").trim().toLowerCase() &&
      rowType === String(payload.type_of_receipt || "").trim().toLowerCase() &&
      rowFrom === normalizeDigits(payload.receipt_no_from) &&
      rowTo === normalizeDigits(payload.receipt_no_to)
    );
  };

  const overlapsIdentityRange = (row, payload) => {
    const rowDate = String(row?.issued_date || row?.Date || row?.date || "").slice(0, 10);
    const rowCollector = String(row?.collector || row?.Collector || "").trim().toLowerCase();
    const rowSerial = String(row?.serial_no || row?.Serial_No || "").trim().toLowerCase();
    const rowType = String(row?.type_of_receipt || row?.Type_Of_Receipt || "").trim().toLowerCase();

    if (
      rowDate !== payload.issued_date ||
      rowCollector !== String(payload.collector || "").trim().toLowerCase() ||
      rowSerial !== String(payload.serial_no || "").trim().toLowerCase() ||
      rowType !== String(payload.type_of_receipt || "").trim().toLowerCase()
    ) {
      return false;
    }

    const existingFrom = toInt(row?.receipt_no_from || row?.Receipt_No_From || 0);
    const existingTo = toInt(row?.receipt_no_to || row?.Receipt_No_To || 0);
    const nextFrom = toInt(payload.receipt_no_from);
    const nextTo = toInt(payload.receipt_no_to);

    return nextFrom <= existingTo && nextTo >= existingFrom;
  };

  useEffect(() => {
    axiosInstance
      .get("/issued-forms")
      .then((res) => setIssuedForms(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Failed to load issued forms:", err);
        setIssuedForms([]);
      });
  }, []);

  useEffect(() => {
    axiosInstance
      .get("/form-types")
      .then((res) => setReceiptTypeOptions(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Failed to load receipt types:", err);
        setReceiptTypeOptions([]);
      });
  }, []);

  useEffect(() => {
    setFormData(buildInitialFormData());
  }, [initialValues]);

  const collectors = useMemo(() => {
    const unique = new Set(
      issuedForms
        .filter((item) => String(item?.Status ?? item?.status ?? "").toUpperCase() === "ISSUED")
        .filter((item) => Number(item?.Stock ?? item?.stock ?? 0) > 0)
        .map((item) => item?.Collector ?? item?.collector)
        .filter(Boolean)
    );
    return Array.from(unique);
  }, [issuedForms]);

  const getReceiptTypeLabel = useMemo(() => {
    const byValue = new Map();

    receiptTypeOptions.forEach((option) => {
      const code = String(option?.code ?? option?.id ?? "").trim();
      const description = String(
        option?.description ?? option?.name ?? option?.code ?? option?.id ?? ""
      ).trim();

      if (code) {
        byValue.set(code.toLowerCase(), description || code);
      }

      if (description) {
        byValue.set(description.toLowerCase(), description);
      }
    });

    return (value) => {
      const normalized = String(value ?? "").trim();
      if (!normalized) return "";
      return byValue.get(normalized.toLowerCase()) || normalized;
    };
  }, [receiptTypeOptions]);

  const formTypes = useMemo(() => {
    const unique = new Set(
      issuedForms
        .filter((item) => (item?.Collector ?? item?.collector) === formData.collector)
        .filter((item) => String(item?.Status ?? item?.status ?? "").toUpperCase() === "ISSUED")
        .filter((item) => Number(item?.Stock ?? item?.stock ?? 0) > 0)
        .map((item) => item?.Form_Type ?? item?.form_type)
        .filter(Boolean)
    );
    return Array.from(unique).map((value) => ({
      value,
      label: getReceiptTypeLabel(value),
    }));
  }, [issuedForms, formData.collector, getReceiptTypeLabel]);

  const serialOptions = useMemo(() => {
    const unique = new Set(
      issuedForms
        .filter((item) => (item?.Collector ?? item?.collector) === formData.collector)
        .filter((item) => (item?.Form_Type ?? item?.form_type) === formData.type_of_receipt)
        .filter((item) => String(item?.Status ?? item?.status ?? "").toUpperCase() === "ISSUED")
        .filter((item) => Number(item?.Stock ?? item?.stock ?? 0) > 0)
        .map((item) => item?.Serial_No ?? item?.serial_no)
        .filter(Boolean)
    );
    return Array.from(unique).sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" })
    );
  }, [issuedForms, formData.collector, formData.type_of_receipt]);

  const activeAssignment = useMemo(() => {
    const candidates = issuedForms
      .filter((item) => (item?.Collector ?? item?.collector) === formData.collector)
      .filter((item) => (item?.Form_Type ?? item?.form_type) === formData.type_of_receipt)
      .filter((item) =>
        formData.serial_no
          ? (item?.Serial_No ?? item?.serial_no) === formData.serial_no
          : true
      )
      .filter((item) => String(item?.Status ?? item?.status ?? "").toUpperCase() === "ISSUED")
      .filter((item) => Number(item?.Stock ?? item?.stock ?? 0) > 0);

    if (candidates.length === 0) return null;

    const sorted = [...candidates].sort((a, b) => {
      const dateA = new Date(a?.Date ?? a?.date ?? a?.Date_Issued ?? a?.date_issued ?? 0).getTime();
      const dateB = new Date(b?.Date ?? b?.date ?? b?.Date_Issued ?? b?.date_issued ?? 0).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return Number(b?.ID ?? b?.id ?? 0) - Number(a?.ID ?? a?.id ?? 0);
    });

    return sorted[0];
  }, [issuedForms, formData.collector, formData.type_of_receipt, formData.serial_no]);

  const availableRange = useMemo(() => {
    if (!activeAssignment) return { from: "", to: "" };

    const endingFrom = normalizeDigits(activeAssignment?.Ending_Balance_receipt_from);
    const endingTo = normalizeDigits(activeAssignment?.Ending_Balance_receipt_to);
    const beginningFrom = normalizeDigits(activeAssignment?.Begginning_Balance_receipt_from);
    const beginningTo = normalizeDigits(activeAssignment?.Begginning_Balance_receipt_to);
    const rangeFrom = normalizeDigits(activeAssignment?.Receipt_Range_From ?? activeAssignment?.receipt_range_from);
    const rangeTo = normalizeDigits(activeAssignment?.Receipt_Range_To ?? activeAssignment?.receipt_range_to);

    if (toInt(endingFrom) > 0 && toInt(endingTo) >= toInt(endingFrom)) {
      return { from: endingFrom, to: endingTo };
    }
    if (toInt(beginningFrom) > 0 && toInt(beginningTo) >= toInt(beginningFrom)) {
      return { from: beginningFrom, to: beginningTo };
    }
    return { from: rangeFrom, to: rangeTo };
  }, [activeAssignment]);

  const validationErrors = useMemo(() => {
    const errors = {};
    const from = normalizeDigits(formData.receipt_no_from);
    const to = normalizeDigits(formData.receipt_no_to);

    if (!formData.serial_no) {
      errors.serial_no = "Please select a serial number.";
    }

    if (formData.receipt_no_from && !/^\d+$/.test(from)) {
      errors.receipt_no_from = "Receipt No. From must contain digits only.";
    }

    if (formData.receipt_no_to && !/^\d+$/.test(to)) {
      errors.receipt_no_to = "Receipt No. To must contain digits only.";
    }

    if (!errors.receipt_no_from && !errors.receipt_no_to && from && to && toInt(to) < toInt(from)) {
      errors.receipt_no_to = "Receipt No. To must be greater than or equal to Receipt No. From.";
    }

    if (activeAssignment && !errors.receipt_no_from && !errors.receipt_no_to && from && to) {
      const availableFrom = toInt(availableRange.from);
      const availableTo = toInt(availableRange.to);
      if (availableFrom > 0 && availableTo >= availableFrom) {
        if (toInt(from) < availableFrom || toInt(to) > availableTo) {
          const message = `Allowed range for selected serial is ${availableRange.from} to ${availableRange.to}.`;
          errors.receipt_no_from = message;
          errors.receipt_no_to = message;
        }
      }
    }

    return errors;
  }, [formData.serial_no, formData.receipt_no_from, formData.receipt_no_to, activeAssignment, availableRange]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "receipt_no_from" || name === "receipt_no_to") {
      setFormData((prev) => ({ ...prev, [name]: normalizeDigits(value) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    try {
      const targetDate = formData.issued_date;
      const targetCollector = String(formData.collector || "").trim().toLowerCase();
      const targetSerial = String(formData.serial_no || "").trim().toLowerCase();
      if (targetDate && targetCollector && targetSerial) {
        const month = Number(targetDate.slice(5, 7));
        const year = Number(targetDate.slice(0, 4));
        const existingRes = await axiosInstance.get("/rcd-entries", {
          params: { month, year },
        });
        const existingRows = Array.isArray(existingRes?.data) ? existingRes.data : [];
        const duplicate = existingRows.find((row) => sameIdentity(row, formData));

        if (duplicate) {
          setDuplicateDialog({
            open: true,
            message: "There is already an entry for this Date + Collector + Serial No. + Receipt Type + Receipt Range.",
          });
          return;
        }

        const overlap = existingRows.find((row) => overlapsIdentityRange(row, formData));

        if (overlap) {
          setDuplicateDialog({
            open: true,
            message: "The receipt range overlaps an existing entry for this Date + Collector + Serial No. + Receipt Type.",
          });
          return;
        }
      }

      await axiosInstance.post("/rcd-entries", {
        ...formData,
        receipt_no_from: normalizeDigits(formData.receipt_no_from),
        receipt_no_to: normalizeDigits(formData.receipt_no_to),
        total: Number(formData.total),
      });
      if (typeof onSaved === "function") {
        onSaved();
      }
    } catch (err) {
      console.error(err);
      const apiMessage = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        setDuplicateDialog({
          open: true,
          message:
            apiMessage ||
            "There is already an entry for this Date + Collector + Serial No. + Receipt Type + Receipt Range.",
        });
        return;
      }
      alert(apiMessage || "Failed to save entry.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
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
          name="issued_date"
          value={formData.issued_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
        />

        <TextField
          select
          label="Fund"
          name="fund"
          value={formData.fund}
          onChange={handleChange}
          required
          fullWidth
        >
          <MenuItem value="100 General Fund">General Fund = 100 General Fund</MenuItem>
          <MenuItem value="200 Special Education Fund">
            Special Education Fund = 200 Special Education Fund
          </MenuItem>
        </TextField>

        <TextField
          select
          label="Collector"
          name="collector"
          value={formData.collector}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              collector: e.target.value,
              type_of_receipt: "",
              serial_no: "",
              receipt_no_from: "",
              receipt_no_to: "",
            }))
          }
          required
          fullWidth
        >
          {collectors.map((collector) => (
            <MenuItem key={collector} value={collector}>
              {collector}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Type of Receipt"
          name="type_of_receipt"
          value={formData.type_of_receipt}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              type_of_receipt: e.target.value,
              serial_no: "",
              receipt_no_from: "",
              receipt_no_to: "",
            }))
          }
          required
          fullWidth
          disabled={!formData.collector}
        >
          {formTypes.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Serial No."
          name="serial_no"
          value={formData.serial_no}
          onChange={handleChange}
          required
          fullWidth
          disabled={!formData.type_of_receipt}
          error={Boolean(validationErrors.serial_no)}
          helperText={
            validationErrors.serial_no ||
            (activeAssignment && availableRange.from && availableRange.to
              ? `Available: ${availableRange.from} to ${availableRange.to}`
              : "")
          }
        >
          {serialOptions.map((serial) => (
            <MenuItem key={serial} value={serial}>
              {serial}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Receipt No. From"
          type="text"
          name="receipt_no_from"
          value={formData.receipt_no_from}
          onChange={handleChange}
          required
          fullWidth
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          error={Boolean(validationErrors.receipt_no_from)}
          helperText={validationErrors.receipt_no_from || ""}
        />

        <TextField
          label="Receipt No. To"
          type="text"
          name="receipt_no_to"
          value={formData.receipt_no_to}
          onChange={handleChange}
          required
          fullWidth
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          error={Boolean(validationErrors.receipt_no_to)}
          helperText={validationErrors.receipt_no_to || ""}
        />

        <TextField
          label="Total"
          type="number"
          name="total"
          value={formData.total}
          onChange={handleChange}
          required
          fullWidth
          inputProps={{ min: 0, step: "0.01" }}
        />

        <TextField
          select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          fullWidth
        >
          <MenuItem value="Not Remit">Draft</MenuItem>
          <MenuItem value="Remit">Submitted</MenuItem>
          <MenuItem value="Approve">Approved</MenuItem>
          <MenuItem value="Deposit">Deposited</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 3 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          Save Entry
        </Button>
      </Box>

      <Dialog open={duplicateDialog.open} onClose={() => setDuplicateDialog((prev) => ({ ...prev, open: false }))}>
        <DialogTitle>Duplicate Entry</DialogTitle>
        <DialogContent>
          <Typography>{duplicateDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDuplicateDialog((prev) => ({ ...prev, open: false }));
            }}
            variant="outlined"
          >
            Edit
          </Button>
          <Button
            onClick={() => {
              setDuplicateDialog((prev) => ({ ...prev, open: false }));
              if (typeof onCancel === "function") onCancel();
            }}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default NewEntryForm;
