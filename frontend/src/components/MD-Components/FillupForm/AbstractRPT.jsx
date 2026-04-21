import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/system";
import "bootstrap/dist/css/bootstrap.min.css";
import { format, isValid, parseISO } from "date-fns";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../src/api/axiosInstance";
import "./style.css";

const uiColors = {
  navy: "#0f2747",
  navyHover: "#0b1e38",
  amber: "#d6a12b",
  border: "#d8e2ee",
  bg: "#f7f9fc",
  card: "#ffffff",
};

const Root = styled(Box)({
  padding: 0,
  borderRadius: "12px",
});

// InputField component for consistent styling
const InputField = styled(TextField)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  "& .MuiInputBase-root": {
    borderRadius: 10,
    backgroundColor: uiColors.card,
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: uiColors.navy,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: uiColors.border,
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#b8c9dd",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: uiColors.amber,
  },
}));

const selectControlSx = {
  "& .MuiInputLabel-root": {
    color: (theme) => theme.palette.text.secondary,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: uiColors.navy,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: uiColors.card,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: uiColors.border,
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#b8c9dd",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: uiColors.amber,
  },
};

const parseOrDefault = (value, defaultValue = 0) =>
  parseFloat(value) || defaultValue;

const extractMainData = (data) => ({
  date: data.date,
  name: data.name,
  receipt_no: data.receipt,
  barangay: data.barangay,
  status: data.status,
  cashier: data.cashier,
  advanced_payment: data.advanced_payment || "",
});

const extractCurrentData = (data) => ({
  current_year: parseOrDefault(data.currentYear),
  current_penalties: parseOrDefault(data.currentPenalties),
  current_discounts: parseOrDefault(data.currentDiscounts),
});

const extractPreviousData = (data) => ({
  prev_year: parseOrDefault(data.prevYear),
  prev_penalties: parseOrDefault(data.prevPenalties),
  prior_years: parseOrDefault(data.priorYears),
  prior_penalties: parseOrDefault(data.priorPenalties),
});

const extractAdditionalData = (data) => ({
  additional_current_year: parseOrDefault(data.additionalCurrentYear),
  additional_penalties: parseOrDefault(data.additionalCurrentPenalties),
  additional_discounts: parseOrDefault(data.additionalCurrentDiscounts),
  additional_prev_year: parseOrDefault(data.additionalPrevYear),
  additional_prev_penalties: parseOrDefault(data.additionalPrevPenalties),
  additional_prior_years: parseOrDefault(data.additionalPriorYears),
  additional_prior_penalties: parseOrDefault(data.additionalPriorPenalties),
});

const extractTotals = (data) => ({
  total: parseOrDefault(data.total),
  additional_total: parseOrDefault(data.additionalTotal),
  gf_total: parseOrDefault(data.gfTotal),
  share: parseOrDefault(data.share),
});

const createData = (data) => ({
  ...extractMainData(data),
  ...extractCurrentData(data),
  ...extractPreviousData(data),
  ...extractAdditionalData(data),
  ...extractTotals(data),
  advanced_payment: data.advanced_payment || "",
});

const initialFormData = {
  date: "",
  barangay: "",
  cashier: "",
  currentYear: 0,
  currentPenalties: 0,
  currentDiscounts: 0,
  prevYear: 0,
  prevPenalties: 0,
  priorYears: 0,
  priorPenalties: 0,
  total: 0,
  share: 0,
  additionalCurrentYear: 0,
  additionalCurrentPenalties: 0,
  additionalCurrentDiscounts: 0,
  additionalPrevYear: 0,
  additionalPrevPenalties: 0,
  additionalPriorYears: 0,
  additionalPriorPenalties: 0,
  additionalTotal: 0,
  gfTotal: 0,
  name: "",
  receipt: "",
  status: "",
  advanced_payment: "",
};

const normalizeValue = (value) => (value ?? "").toString().trim();

const normalizeBarangay = (value) => {
  const normalized = normalizeValue(value).toUpperCase().replace(/\s+/g, "-");
  const barangayMap = {
    BASAK: "BASAK",
    BASAC: "BASAK",
    CALANGO: "CALANGO",
    LUTOBAN: "LUTOBAN",
    "MALONGCAY-DIOT": "MALONGCAY-DIOT",
    MALUAY: "MALUAY",
    MAYABON: "MAYABON",
    NABAGO: "NABAGO",
    "NASIG-ID": "NASIG-ID",
    NAJANDIG: "NAJANDIG",
    POBLACION: "POBLACION",
  };

  return barangayMap[normalized] || normalized;
};

const normalizeCashier = (value) => normalizeValue(value).toLowerCase();

const normalizeStatus = (value) => {
  const normalized = normalizeValue(value).toUpperCase();
  const statusMap = {
    "LAND-COMML": "LAND-COMMERCIAL",
    "LAND-COMMERCIAL": "LAND-COMMERCIAL",
    "LAND-AGRI": "LAND-AGRICULTURAL",
    "LAND-AGRICULTURAL": "LAND-AGRICULTURAL",
    "LAND-RES": "LAND-RESIDENTIAL",
    "LAND-RESIDENTIAL": "LAND-RESIDENTIAL",
    "BLDG-RES": "BUILDING-RESIDENTIAL",
    "BUILDING-RESIDENTIAL": "BUILDING-RESIDENTIAL",
    "BLDG-COMML": "BUILDING-COMMERCIAL",
    "BUILDING-COMMERCIAL": "BUILDING-COMMERCIAL",
    "BLDG-AGRI": "BUILDING-AGRICULTURAL",
    "BUILDING-AGRICULTURAL": "BUILDING-AGRICULTURAL",
    MACHINERY: "MACHINERIES-COMMERCIAL",
    MACHINERIES: "MACHINERIES-COMMERCIAL",
    "MACHINERIES-COMMERCIAL": "MACHINERIES-COMMERCIAL",
    "MACHINERIES-AGRICULTURAL": "MACHINERIES-AGRICULTURAL",
    "MACHINERIES-RESIDENTIAL": "MACHINERIES-RESIDENTIAL",
    "BLDG-INDUS": "BUILDING-INDUSTRIAL",
    "BUILDING-INDUSTRIAL": "BUILDING-INDUSTRIAL",
    SPECIAL: "BUILDING-SS",
    "BUILDING-SS": "BUILDING-SS",
  };

  return statusMap[normalized] || normalized;
};

function LinearProgressWithLabel({ value }) {
  return (
    <Box display="flex" alignItems="center" mb={2}>
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Box minWidth={35}>
        <Typography
          variant="body2"
          color="textSecondary"
        >{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
}

function AbstractRPT({ data, onSave }) {
  const [formData, setFormData] = useState(data || initialFormData);
  const [taxpayerOptions, setTaxpayerOptions] = useState([]);
  const [taxpayerLoading, setTaxpayerLoading] = useState(false);

  const [showProgress, setShowProgress] = useState(false); // Progress visibility
  const [progress, setProgress] = useState(0); // Progress value for simulation

  // Simulate a progress update (optional)
  const simulateProgress = () => {
    let value = 0;
    const interval = setInterval(() => {
      value += 10;
      if (value >= 100) {
        clearInterval(interval);
        setProgress(100);
      } else {
        setProgress(value);
      }
    }, 200);
  };

  useEffect(() => {
    if (data) {
      const parsedDate = data.date ? parseISO(data.date) : null;

      const updatedFormData = {
        ...initialFormData,
        ...data,
        barangay: normalizeBarangay(data?.barangay),
        cashier: normalizeCashier(data?.cashier),
        status: normalizeStatus(data?.status),
        advanced_payment: normalizeValue(data?.advanced_payment),
        date:
          parsedDate && isValid(parsedDate)
            ? format(new Date(parsedDate), "yyyy-MM-dd") // <-- Only date
            : "",
      };

      setFormData(updatedFormData);
    } else {
      setFormData(initialFormData);
    }
  }, [data]);

  useEffect(() => {
    let active = true;
    const search = normalizeValue(formData.name);

    if (search.length < 2) {
      setTaxpayerOptions([]);
      setTaxpayerLoading(false);
      return undefined;
    }

    setTaxpayerLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axiosInstance.get("taxpayers", {
          params: { search },
        });

        if (!active) return;
        setTaxpayerOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (active) {
          console.error("Failed to load taxpayer options:", error);
          setTaxpayerOptions([]);
        }
      } finally {
        if (active) {
          setTaxpayerLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [formData.name]);

  const selectedTaxpayer = useMemo(() => {
    const name = normalizeValue(formData.name);
    if (!name) return null;

    return (
      taxpayerOptions.find((option) => option?.ownerName === name) || {
        ownerName: name,
        localTin: "",
      }
    );
  }, [formData.name, taxpayerOptions]);

  React.useEffect(() => {
    console.log("Received data in AbstractRPT:", data);
    if (data) {
      setFormData({
        ...initialFormData,
        ...data,
        barangay: normalizeBarangay(data?.barangay),
        cashier: normalizeCashier(data?.cashier),
        status: normalizeStatus(data?.status),
        advanced_payment: normalizeValue(data?.advanced_payment),
      });
    }
  }, [data]); // ✅ Now it's correctly inside AbstractRPT

  const [errors, setErrors] = useState({
    date: "",
    name: "",
    receipt: "",
    currentYear: "",
    currentPenalties: "",
    currentDiscounts: "",
    prevYear: "",
    prevPenalties: "",
    priorYears: "",
    priorPenalties: "",
    barangay: "",
    share: "",
    additionalCurrentYear: "",
    additionalCurrentPenalties: "",
    additionalCurrentDiscounts: "",
    additionalPrevYear: "",
    additionalPrevPenalties: "",
    additionalPriorYears: "",
    additionalPriorPenalties: "",
    additionalTotal: "",
    gfTotal: "",
    status: "",
    cashier: "",
    advanced_payment: "",
  });

  const validateForm = () => {
    const newErrors = {};

    // Convert falsy but valid values (like "0") to a valid check
    if (formData.currentPenalties === "" || formData.currentPenalties === null)
      newErrors.currentPenalties = "Penalties are required";

    if (formData.prevYear === "" || formData.prevYear === null)
      newErrors.prevYear = "Immediate Preceding Year is required";

    if (formData.prevPenalties === "" || formData.prevPenalties === null)
      newErrors.prevPenalties = "Penalties are required";

    if (formData.priorYears === "" || formData.priorYears === null)
      newErrors.priorYears = "Prior Years is required";

    if (formData.priorPenalties === "" || formData.priorPenalties === null)
      newErrors.priorPenalties = "Penalties are required";

    // Log formData to debug what's being checked
    console.log("formData before validation:", formData);

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchListings = async () => {};

    fetchListings();

    const parseNumber = (value) => parseFloat(value) || 0;

    const computedTotal =
      parseNumber(formData.currentYear) +
      parseNumber(formData.currentPenalties) -
      parseNumber(formData.currentDiscounts) +
      parseNumber(formData.prevYear) +
      parseNumber(formData.prevPenalties) +
      parseNumber(formData.priorYears) +
      parseNumber(formData.priorPenalties);

    const computedAdditionalTotal =
      parseNumber(formData.additionalCurrentYear) +
      parseNumber(formData.additionalCurrentPenalties) -
      parseNumber(formData.additionalCurrentDiscounts) +
      parseNumber(formData.additionalPrevYear) +
      parseNumber(formData.additionalPrevPenalties) +
      parseNumber(formData.additionalPriorYears) +
      parseNumber(formData.additionalPriorPenalties);

    setFormData((prevData) => ({
      ...prevData,
      total: computedTotal,
      additionalTotal: computedAdditionalTotal,
      share: computedTotal * 0.25,
      gfTotal: computedTotal + computedAdditionalTotal,
    }));
  }, [
    formData.currentYear,
    formData.currentPenalties,
    formData.currentDiscounts,
    formData.prevYear,
    formData.prevPenalties,
    formData.priorYears,
    formData.priorPenalties,
    formData.additionalCurrentYear,
    formData.additionalCurrentPenalties,
    formData.additionalCurrentDiscounts,
    formData.additionalPrevYear,
    formData.additionalPrevPenalties,
    formData.additionalPriorYears,
    formData.additionalPriorPenalties,
  ]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      // Form is valid, proceed with submission logic
      console.log("Form Data:", formData);
    }
  };

  const handleReset = () => {
    setErrors({});
    setFormData(initialFormData);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setShowProgress(true);
    simulateProgress();

    const newEntry = createData({ ...formData });

    try {
      let response;

      if (formData.id) {
        // Update endpoint (define this in Laravel if needed)
        response = await axiosInstance.put(
          `updaterptdata/${formData.id}`,
          newEntry
        );
        console.log("Update response:", response.data);
        alert("Data updated successfully");
      } else {
        // Laravel POST: /api/saverptdata
        response = await axiosInstance.post(`saverptdata`, newEntry);
        console.log("Insert response:", response.data);
        alert("Data inserted successfully");
      }

      setProgress(100);
      setTimeout(() => {
        setShowProgress(false);
        onSave(newEntry); // Callback
      }, 500);

      setTimeout(() => {
        window.location.reload(); // Or better: refresh state
      }, 1000);
    } catch (error) {
      console.error("Error saving data:", error);
      alert(error.response?.data?.error || "Error saving data");
      setShowProgress(false);
    }
  };

  const handleFormDataChange = (event) => {
    const { name, value } = event.target;

    const additionalFieldNameMap = {
      currentYear: "additionalCurrentYear",
      currentPenalties: "additionalCurrentPenalties",
      currentDiscounts: "additionalCurrentDiscounts",
      prevYear: "additionalPrevYear",
      prevPenalties: "additionalPrevPenalties",
      priorYears: "additionalPriorYears",
      priorPenalties: "additionalPriorPenalties",
    };

    setFormData((prevData) => {
      const numericFields = new Set([
        "currentYear",
        "currentPenalties",
        "currentDiscounts",
        "prevYear",
        "prevPenalties",
        "priorYears",
        "priorPenalties",
        "total",
        "share",
        "additionalCurrentYear",
        "additionalCurrentPenalties",
        "additionalCurrentDiscounts",
        "additionalPrevYear",
        "additionalPrevPenalties",
        "additionalPriorYears",
        "additionalPriorPenalties",
        "additionalTotal",
        "gfTotal",
        "advanced_payment",
      ]);

      // Check if field needs to be treated as a number
      const isNumericField = numericFields.has(name);
      const newValue = isNumericField ? parseFloat(value || 0) : value;

      // Build the updated state
      const updatedState = {
        ...prevData,
        [name]: newValue,
      };

      // Optional: update linked "additional" fields if mapping exists
      if (additionalFieldNameMap?.[name]) {
        updatedState[additionalFieldNameMap[name]] = newValue;
      }

      return updatedState;
    });
  };

  return (
    <Root>
      <Typography
        variant="h5"
        sx={{
          mb: 2.5,
          textAlign: "center",
          color: uiColors.navy,
          fontWeight: 800,
          letterSpacing: 0.3,
        }}
      >
        Real Property Tax Abstracts ({formData.id ? "Edit" : "Add"})
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            p: { xs: 1.5, md: 2 },
            borderRadius: "14px",
            border: "1px solid #d6a12b",
            backgroundColor: uiColors.bg,
          }}
        >
          <InputField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            name="date"
            value={formData.date}
            onChange={handleFormDataChange}
            required
            error={!!errors.date}
            helperText={errors.date}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            fullWidth
            freeSolo
            options={taxpayerOptions}
            loading={taxpayerLoading}
            value={selectedTaxpayer}
            onChange={(_, value) => {
              handleFormDataChange({
                target: {
                  name: "name",
                  value: (value?.ownerName || "").toUpperCase(),
                },
              });
            }}
            onInputChange={(_, value, reason) => {
              if (reason === "input") {
                handleFormDataChange({
                  target: {
                    name: "name",
                    value: value.toUpperCase(),
                  },
                });
              }
            }}
            getOptionLabel={(option) =>
              typeof option === "string"
                ? option
                : option?.ownerName || ""
            }
            isOptionEqualToValue={(option, value) =>
              option?.ownerName === value?.ownerName
            }
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: uiColors.navy }}>
                    {option.ownerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Local TIN: {option.localTin || "-"}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <InputField
                {...params}
                autoFocus
                margin="dense"
                label="Name of Taxpayer"
                fullWidth
                required
                error={!!errors.name}
                helperText={
                  errors.name || "Search taxpayer records by name or Local TIN"
                }
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {taxpayerLoading ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <InputField
            margin="dense"
            label="Receipt No. P.F. No. 25(A)"
            fullWidth
            name="receipt"
            value={formData.receipt}
            onChange={handleFormDataChange}
            required
            error={!!errors.receipt}
            helperText={errors.receipt}
          />
          <InputField
            margin="dense"
            label="Current Year"
            type="number"
            fullWidth
            name="currentYear"
            value={formData.currentYear}
            onChange={handleFormDataChange}
            InputProps={{
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />
          <InputField
            margin="dense"
            label="Penalties"
            type="number"
            fullWidth
            name="currentPenalties"
            value={formData.currentPenalties}
            onChange={handleFormDataChange}
            InputProps={{
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />
          <InputField
            margin="dense"
            label="Discounts"
            type="number"
            fullWidth
            name="currentDiscounts"
            value={formData.currentDiscounts}
            onChange={handleFormDataChange}
            InputProps={{
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />
          <InputField
            margin="dense"
            label="Immediate Preceding Year"
            type="number"
            fullWidth
            name="prevYear"
            value={formData.prevYear}
            onChange={handleFormDataChange}
            InputProps={{
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />
          <InputField
            margin="dense"
            label="Penalties"
            type="number"
            fullWidth
            name="prevPenalties"
            value={formData.prevPenalties}
            onChange={handleFormDataChange}
            InputProps={{
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />
          <InputField
            margin="dense"
            label="Prior Years"
            type="number"
            fullWidth
            name="priorYears"
            value={formData.priorYears}
            onChange={handleFormDataChange}
            InputProps={{
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />

          <InputField
            margin="dense"
            label="Penalties"
            type="number"
            fullWidth
            name="priorPenalties"
            value={formData.priorPenalties}
            onChange={handleFormDataChange}
            InputProps={{
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />

          <InputField
            margin="dense"
            label="Total"
            type="number"
            fullWidth
            InputProps={{
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
            value={formData.total}
          />
          <FormControl
            fullWidth
            margin="dense"
            error={!!errors.barangay}
            required
            sx={{ mb: 2 }}
          >
            <InputLabel>Barangay</InputLabel>
            <Select
              name="barangay"
              value={formData.barangay}
              onChange={handleFormDataChange}
              label="Barangay"
              sx={selectControlSx}
            >
              <MenuItem value="BASAK">BASAK</MenuItem>
              <MenuItem value="CALANGO">CALANGO</MenuItem>
              <MenuItem value="LUTOBAN">LUTOBAN</MenuItem>
              <MenuItem value="MALONGCAY-DIOT">MALONGCAY-DIOT</MenuItem>
              <MenuItem value="MALUAY">MALUAY</MenuItem>
              <MenuItem value="MAYABON">MAYABON</MenuItem>
              <MenuItem value="NABAGO">NABAGO</MenuItem>
              <MenuItem value="NASIG-ID">NASIG-ID</MenuItem>
              <MenuItem value="NAJANDIG">NAJANDIG</MenuItem>
              <MenuItem value="POBLACION">POBLACION</MenuItem>
            </Select>
            <FormHelperText>{errors.barangay}</FormHelperText>
          </FormControl>
          <InputField
            margin="dense"
            label="25% Share"
            type="number"
            fullWidth
            InputProps={{
              readOnly: true, // Prevents user input
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
            value={formData.share}
          />
          <InputField
            margin="dense"
            label="Additional Current Year"
            type="number"
            fullWidth
            name="additionalCurrentYear"
            value={formData.additionalCurrentYear}
            onChange={handleFormDataChange}
            InputProps={{
              readOnly: true, // Prevents user input
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />

          <InputField
            margin="dense"
            label="Additional Penalties"
            type="number"
            fullWidth
            name="additionalCurrentPenalties"
            value={formData.additionalCurrentPenalties}
            onChange={handleFormDataChange}
            InputProps={{
              readOnly: true, // Prevents user input
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />
          <InputField
            margin="dense"
            label="Additional Discounts"
            type="number"
            fullWidth
            name="additionalCurrentDiscounts"
            value={formData.additionalCurrentDiscounts}
            onChange={handleFormDataChange}
            InputProps={{
              readOnly: true, // Prevents user input
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />
          <InputField
            margin="dense"
            label="Additional Immediate Preceding Year"
            type="number"
            fullWidth
            name="additionalPrevYear"
            value={formData.additionalPrevYear}
            onChange={handleFormDataChange}
            InputProps={{
              readOnly: true, // Prevents user input
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />
          <InputField
            margin="dense"
            label="Additional Penalties"
            type="number"
            fullWidth
            name="additionalPrevPenalties"
            value={formData.additionalPrevPenalties}
            onChange={handleFormDataChange}
            InputProps={{
              readOnly: true, // Prevents user input
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />
          <InputField
            margin="dense"
            label="Additional Prior Years"
            type="number"
            fullWidth
            name="additionalPriorYears"
            value={formData.additionalPriorYears}
            onChange={handleFormDataChange}
            InputProps={{
              readOnly: true, // Prevents user input
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />
          <InputField
            margin="dense"
            label="Additional Penalties"
            type="number"
            fullWidth
            name="additionalPriorPenalties"
            value={formData.additionalPriorPenalties}
            onChange={handleFormDataChange}
            InputProps={{
              readOnly: true, // Prevents user input
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
          />
          <InputField
            margin="dense"
            label="Additional Total"
            type="number"
            fullWidth
            name="additionalTotal"
            InputProps={{
              readOnly: true, // Prevents user input
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
            value={formData.additionalTotal}
          />
          <InputField
            margin="dense"
            label="GF and SEF"
            fullWidth
            InputProps={{
              readOnly: true, // Prevents user input
              inputProps: { step: "any" },
              sx: {
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "input[type=number]": {
                  MozAppearance: "textfield",
                },
              },
            }}
            value={formData.gfTotal}
            onChange={(e) =>
              handleFormDataChange({
                target: { name: "gfTotal", value: e.target.value },
              })
            }
          />
          <FormControl
            fullWidth
            margin="dense"
            error={!!errors.status}
            required
            sx={selectControlSx}
          >
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleFormDataChange}
              label="Status"
            >
              <MenuItem value="LAND-COMMERCIAL">LAND-COMMERCIAL</MenuItem>
              <MenuItem value="LAND-AGRICULTURAL">LAND-AGRICULTURAL</MenuItem>
              <MenuItem value="LAND-RESIDENTIAL">LAND-RESIDENTIAL</MenuItem>
              <MenuItem value="BUILDING-RESIDENTIAL">
                BUILDING-RESIDENTIAL
              </MenuItem>
              <MenuItem value="BUILDING-COMMERCIAL">
                BUILDING-COMMERCIAL
              </MenuItem>
              <MenuItem value="BUILDING-AGRICULTURAL">
                BUILDING-AGRICULTURAL
              </MenuItem>
              <MenuItem value="MACHINERIES-COMMERCIAL">
                MACHINERIES-COMMERCIAL
              </MenuItem>
              <MenuItem value="MACHINERIES-AGRICULTURAL">
                MACHINERIES-AGRICULTURAL
              </MenuItem>
              <MenuItem value="MACHINERIES-RESIDENTIAL">
                MACHINERIES-RESIDENTIAL
              </MenuItem>
              <MenuItem value="BUILDING-INDUSTRIAL">
                BUILDING-INDUSTRIAL
              </MenuItem>
              <MenuItem value="BUILDING-SS">BUILDING-SS</MenuItem>
            </Select>
            <FormHelperText>{errors.status}</FormHelperText>
          </FormControl>
          <FormControl
            fullWidth
            margin="dense"
            error={!!errors.cashier}
            required
            sx={selectControlSx}
          >
            <InputLabel>Cashier</InputLabel>
            <Select
              name="cashier"
              value={formData.cashier}
              onChange={handleFormDataChange}
              label="Cashier"
            >
              <MenuItem value="angelique">ANGELIQUE</MenuItem>
              <MenuItem value="flora">FLORA</MenuItem>
              <MenuItem value="ricardo">RICARDO</MenuItem>
            </Select>
            <FormHelperText>{errors.cashier}</FormHelperText>
          </FormControl>

          <FormControl
            fullWidth
            margin="dense"
            error={!!errors.advanced_payment}
            sx={{ ...selectControlSx, mb: 2 }}
          >
            <InputLabel>Advance Payment Year</InputLabel>
            <Select
              name="advanced_payment"
              value={formData.advanced_payment}
              onChange={handleFormDataChange}
              label="Advance Payment Year"
            >
              {[...Array(3)].map((_, i) => {
                const year = new Date().getFullYear() + i;
                return (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>{errors.advanced_payment}</FormHelperText>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleReset}
              startIcon={<RestartAltIcon />}
              sx={{
                flex: 1,
                minWidth: 180,
                borderColor: uiColors.navy,
                color: uiColors.navy,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": {
                  borderColor: uiColors.navyHover,
                  backgroundColor: "rgba(15, 39, 71, 0.08)",
                },
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSave}
              startIcon={<SaveIcon />}
              sx={{
                flex: 1,
                minWidth: 180,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: uiColors.navy,
                boxShadow: "0 4px 10px rgba(15, 39, 71, 0.25)",
                "&:hover": {
                  backgroundColor: uiColors.navyHover,
                  boxShadow: "0 6px 14px rgba(15, 39, 71, 0.35)",
                },
              }}
            >
              Save
            </Button>
          </Box>

          {/* Loading Indicator */}
          {showProgress && (
            <Box sx={{ mt: 1 }}>
              <LinearProgressWithLabel value={progress} />
            </Box>
          )}
        </Box>
      </form>
    </Root>
  );
}

LinearProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
};

AbstractRPT.propTypes = {
  data: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default AbstractRPT;
