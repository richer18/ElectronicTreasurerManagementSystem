import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const cashierOptions = ["flora", "angelique", "ricardo", "agnes"];
const basicCommunityTax = 5.0;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formColors = {
  navy: "#0f2747",
  navyDeep: "#0b1e38",
  steel: "#4b5d73",
  teal: "#0f6b62",
  amber: "#a66700",
  bg: "#f5f7fb",
  card: "#ffffff",
  border: "#d8e2ee",
};

const stepCircleSx = {
  height: 28,
  px: 1.5,
  borderRadius: "999px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: formColors.navy,
  color: "#fff",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.6px",
};

const roundedFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#fbfcfe",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: formColors.steel,
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: formColors.navy,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: formColors.amber,
  },
};

const sectionPaperSx = {
  p: { xs: 2, md: 2.5 },
  borderRadius: "14px",
  backgroundColor: formColors.card,
  border: `1px solid ${formColors.border}`,
};

const sectionHeaderSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mb: 2,
  px: 1.5,
  py: 1,
  borderRadius: "10px",
  border: `1px solid ${formColors.amber}`,
  background: `linear-gradient(180deg, ${formColors.navy} 0%, ${formColors.navyDeep} 100%)`,
  color: "#ffffff",
};

const sectionTitleSx = {
  fontWeight: 800,
  letterSpacing: "0.3px",
  color: "#ffffff",
};

const certificateShellSx = {
  p: { xs: 2, md: 3 },
  borderRadius: "18px",
  background: `linear-gradient(180deg, ${formColors.bg} 0%, #eef2f7 100%)`,
  border: `1px solid ${formColors.border}`,
};

const sectionNoteSx = { color: "#dbe5f2", fontSize: "0.8rem" };

function Cedula({ data, mode, onSaved, onClose }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [originalReceipt, setOriginalReceipt] = useState("");
  const [savingInProgress, setSavingInProgress] = useState(false);
  const [taxpayerOptions, setTaxpayerOptions] = useState([]);
  const [taxpayerLoading, setTaxpayerLoading] = useState(false);

  const [formData, setFormData] = useState({
    receipt: "",
    localTin: "",
    fullName: "",
    ctcYear: dayjs().year(),
    businessGrossReceipts: "",
    salariesProfessionEarnings: "",
    realPropertyIncome: "",
    interest: "",
    userid: "",
  });

  useEffect(() => {
    if (!data) return;

    const mappedReceipt = String(data?.["CTC NO"] ?? data?.CTCNO ?? "");
    const mappedDate = data?.DATE ?? data?.DATEISSUED ?? "";
    const mappedYear = Number(
      data?.CTCYEAR ?? (mappedDate ? dayjs(mappedDate).year() : dayjs().year())
    );

    setOriginalReceipt(mappedReceipt);
    setSelectedDate(mappedDate ? dayjs(mappedDate).format("YYYY-MM-DD") : "");
    setFormData({
      receipt: mappedReceipt,
      localTin: String(data?.LOCAL ?? data?.LOCAL_TIN ?? ""),
      fullName: String(data?.NAME ?? data?.OWNERNAME ?? ""),
      ctcYear: Number.isFinite(mappedYear) ? mappedYear : dayjs().year(),
      businessGrossReceipts: String(data?.BUSTAXDUE ?? data?.TAX_DUE ?? ""),
      salariesProfessionEarnings: String(data?.SALTAXDUE ?? 0),
      realPropertyIncome: String(data?.RPTAXDUE ?? 0),
      interest: String(data?.INTEREST ?? ""),
      userid: String(data?.CASHIER ?? data?.USERID ?? ""),
    });
  }, [data]);

  useEffect(() => {
    let active = true;

    const search = formData.fullName.trim();
    if (search.length < 2) {
      setTaxpayerOptions([]);
      return undefined;
    }

    setTaxpayerLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axiosInstance.get("taxpayers", {
          params: { search },
        });

        if (!active) return;

        const options = Array.isArray(response.data) ? response.data : [];
        setTaxpayerOptions(options);
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
  }, [formData.fullName]);

  const selectedTaxpayer = useMemo(() => {
    if (!formData.fullName && !formData.localTin) return null;

    return (
      taxpayerOptions.find(
        (option) =>
          option?.ownerName === formData.fullName &&
          String(option?.localTin || "") === String(formData.localTin || "")
      ) || {
        ownerName: formData.fullName,
        localTin: formData.localTin,
      }
    );
  }, [formData.fullName, formData.localTin, taxpayerOptions]);

  const totals = useMemo(() => {
    const business = toNumber(formData.businessGrossReceipts);
    const salaries = toNumber(formData.salariesProfessionEarnings);
    const realProperty = toNumber(formData.realPropertyIncome);
    const interest = toNumber(formData.interest);
    const total = basicCommunityTax + business + salaries + realProperty + interest;
    return { business, salaries, realProperty, interest, total };
  }, [
    formData.businessGrossReceipts,
    formData.salariesProfessionEarnings,
    formData.realPropertyIncome,
    formData.interest,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      receipt: "",
      localTin: "",
      fullName: "",
      ctcYear: dayjs().year(),
      businessGrossReceipts: "",
      salariesProfessionEarnings: "",
      realPropertyIncome: "",
      interest: "",
      userid: "",
    });
    setSelectedDate("");
  };

  const handleSave = async () => {
    if (!formData.receipt || !selectedDate || savingInProgress) return;

    setSavingInProgress(true);
    const now = new Date();
    const formatDateTime = (date) => date.toISOString().slice(0, 19).replace("T", " ");

    const payload = {
      DATEISSUED: selectedDate,
      TRANSDATE: formatDateTime(now),
      CTCNO: formData.receipt,
      CTCTYPE: "CTCI",
      OWNERNAME: formData.fullName,
      LOCAL_TIN: formData.localTin,
      BASICTAXDUE: basicCommunityTax,
      BUSTAXDUE: totals.business,
      SALTAXDUE: totals.salaries,
      RPTAXDUE: totals.realProperty,
      INTEREST: totals.interest,
      TOTALAMOUNTPAID: totals.total,
      USERID: formData.userid,
      CTCYEAR: toNumber(formData.ctcYear) || dayjs().year(),
      DATALASTEDITED: formatDateTime(now),
    };

    const isEditMode = mode === "edit";
    const updateKey = originalReceipt || formData.receipt;
    const url = isEditMode
      ? `updateCedulaData/${encodeURIComponent(updateKey)}`
      : "saveCedulaData";

    try {
      await axiosInstance[isEditMode ? "put" : "post"](url, payload);
      alert(isEditMode ? "Data updated successfully" : "Data saved successfully");
      if (typeof onSaved === "function") await onSaved();
      if (typeof onClose === "function") onClose();
      if (!isEditMode) handleReset();
    } catch (error) {
      console.error("Error during save:", error);
      alert("An error occurred while saving. Please try again.");
    } finally {
      setSavingInProgress(false);
    }
  };

  const calculateTotal = () => totals.total.toFixed(2);

  return (
    <Box sx={{ maxWidth: 1220, mx: "auto", p: { xs: 1, md: 2 } }}>
      <Box sx={certificateShellSx}>
      <Row className="g-0" style={{ marginTop: 0 }}>
        <Col xs={12}>
          <Paper
            elevation={0}
            sx={{ ...sectionPaperSx, mb: 2 }}
          >
            <Box sx={sectionHeaderSx}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box sx={stepCircleSx}>SECTION 1</Box>
                <Typography variant="h6" sx={sectionTitleSx}>
                  Cedula Information
                </Typography>
              </Box>
              <Typography variant="caption" sx={sectionNoteSx}>
                Applicant identity and certificate reference
              </Typography>
            </Box>

            <Row  className="g-2 align-items-center"
              style={{
                border: `1px solid ${formColors.amber}`,
                backgroundColor: "rgba(166, 103, 0, 0.08)",
                borderRadius: "12px",
                padding: "12px",
              }}>
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date Issued"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  sx={roundedFieldSx}
                />
              </Col>
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CTC No."
                  name="receipt"
                  value={formData.receipt}
                  onChange={handleChange}
                  variant="outlined"
                  sx={roundedFieldSx}
                />
              </Col>
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Local TIN"
                  name="localTin"
                  value={formData.localTin}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  sx={roundedFieldSx}
                />
              </Col>
              <Col xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="tax-year-label">CTC Year</InputLabel>
                  <Select
                    labelId="tax-year-label"
                    label="CTC Year"
                    name="ctcYear"
                    value={formData.ctcYear}
                    onChange={handleChange}
                    sx={{ borderRadius: "12px" }}
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Col>
              <Col xs={12}>
                <Autocomplete
                  fullWidth
                  options={taxpayerOptions}
                  loading={taxpayerLoading}
                  value={selectedTaxpayer}
                  onChange={(_, value) => {
                    setFormData((prev) => ({
                      ...prev,
                      fullName: value?.ownerName || "",
                      localTin: value?.localTin || "",
                    }));
                  }}
                  onInputChange={(_, value, reason) => {
                    if (reason === "input") {
                      setFormData((prev) => ({
                        ...prev,
                        fullName: value,
                        localTin: "",
                      }));
                    }
                  }}
                  getOptionLabel={(option) =>
                    typeof option === "string"
                      ? option
                      : option?.ownerName || ""
                  }
                  isOptionEqualToValue={(option, value) =>
                    option?.ownerName === value?.ownerName &&
                    String(option?.localTin || "") === String(value?.localTin || "")
                  }
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: formColors.navy }}>
                          {option.ownerName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: formColors.steel }}>
                          Local TIN: {option.localTin || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Full Name"
                      variant="outlined"
                      sx={roundedFieldSx}
                      helperText="Search taxpayer records by name or Local TIN"
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
              </Col>
            </Row>
          </Paper>

          <Paper
            elevation={0}
            sx={sectionPaperSx}
          >
            <Box sx={sectionHeaderSx}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box sx={stepCircleSx}>SECTION 2</Box>
                <Typography variant="h6" sx={sectionTitleSx}>
                  Tax Breakdown
                </Typography>
              </Box>
              <Typography variant="caption" sx={sectionNoteSx}>
                Assessment of community tax dues
              </Typography>
            </Box>

            <Row
              className="g-2 align-items-center"
              style={{
                border: `1px solid ${formColors.amber}`,
                backgroundColor: "rgba(166, 103, 0, 0.08)",
                borderRadius: "12px",
                padding: "12px",
              }}
            >
              <Col xs={12} md={8}>
                <Typography sx={{ fontWeight: 600, color: formColors.navy }}>
                  Basic Community Tax
                </Typography>
              </Col>
              <Col xs={12} md={4}>
                <TextField
                isEditMode ="false"
                  fullWidth
                  value={basicCommunityTax.toFixed(2)}
                  InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">PHP</InputAdornment> }}
                  sx={roundedFieldSx}
                />
              </Col>

              <Col xs={12} md={8}>
                <Typography sx={{ fontWeight: 600, color: formColors.navy }}>
                  Business Gross Receipts
                </Typography>
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  name="businessGrossReceipts"
                  value={formData.businessGrossReceipts}
                  onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start">PHP</InputAdornment> }}
                  sx={roundedFieldSx}
                />
              </Col>

              <Col xs={12} md={8}>
                <Typography sx={{ fontWeight: 600, color: formColors.navy }}>
                  Salaries / Profession Earnings
                </Typography>
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  name="salariesProfessionEarnings"
                  value={formData.salariesProfessionEarnings}
                  onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start">PHP</InputAdornment> }}
                  sx={roundedFieldSx}
                />
              </Col>

              <Col xs={12} md={8}>
                <Typography sx={{ fontWeight: 600, color: formColors.navy }}>
                  Real Property Income
                </Typography>
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  name="realPropertyIncome"
                  value={formData.realPropertyIncome}
                  onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start">PHP</InputAdornment> }}
                  sx={roundedFieldSx}
                />
              </Col>

              <Col xs={12} md={8}>
                <Typography sx={{ fontWeight: 600, color: formColors.navy }}>
                  Interest
                </Typography>
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  name="interest"
                  value={formData.interest}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">PHP</InputAdornment>,
                  }}
                  sx={roundedFieldSx}
                />
              </Col>

              <Col xs={12}>
                <Divider sx={{ my: 1, borderColor: formColors.border }} />
              </Col>

              <Col xs={12} md={8}>
                <Typography sx={{ fontWeight: 800, color: formColors.navy }}>
                  Total Amount Paid
                </Typography>
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  value={calculateTotal()}
                  InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">PHP</InputAdornment> }}
                  sx={roundedFieldSx}
                />
              </Col>

              <Col xs={12} md={8}>
                <Typography sx={{ fontWeight: 600, color: formColors.navy }}>
                  Cashier
                </Typography>
              </Col>
              <Col xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="cashier-label">Select Cashier</InputLabel>
                  <Select
                    labelId="cashier-label"
                    name="userid"
                    label="Select Cashier"
                    value={formData.userid}
                    onChange={handleChange}
                    sx={{ borderRadius: "12px" }}
                  >
                    <MenuItem value="">
                      <em>Assign Later</em>
                    </MenuItem>
                    {cashierOptions.map((cashier) => (
                      <MenuItem key={cashier} value={cashier}>
                        {cashier.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Col>
            </Row>

            <Row className="g-2 m-2 align-items-center"
              style={{
                border: `1px solid ${formColors.amber}`,
                backgroundColor: "rgba(166, 103, 0, 0.08)",
                borderRadius: "12px",
                padding: "12px",
              }}>
              <Col xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<RestartAltIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderColor: formColors.navy,
                    color: formColors.navy,
                    "&:hover": {
                      borderColor: formColors.navy,
                      backgroundColor: "rgba(15, 39, 71, 0.08)",
                    },
                  }}
                >
                  RESET
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSave}
                  disabled={savingInProgress}
                  startIcon={<SaveIcon />}
                  sx={{
                    fontWeight: 700,
                    textTransform: "none",
                    backgroundColor: formColors.navy,
                    "&:hover": {
                      backgroundColor: formColors.navyDeep,
                    },
                  }}
                >
                  {savingInProgress ? "SAVING..." : "SAVE"}
                </Button>
              </Col>
            </Row>
          </Paper>
        </Col>

        <Col xs={12} />
      </Row>
      </Box>
    </Box>
  );
}

Cedula.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    CTCNO: PropTypes.string,
    OWNERNAME: PropTypes.string,
    LOCAL_TIN: PropTypes.string,
    CTCYEAR: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    BUSTAXDUE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    SALTAXDUE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    RPTAXDUE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    INTEREST: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    TOTALAMOUNTPAID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    USERID: PropTypes.string,
  }),
  mode: PropTypes.string,
  onSaved: PropTypes.func,
  onClose: PropTypes.func,
};

export default Cedula;
