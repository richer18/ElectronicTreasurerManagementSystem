import "bootstrap/dist/css/bootstrap.min.css";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import {
  Alert,
  Button,
  Col,
  Form,
  InputGroup,
  ProgressBar,
  Row,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaCashRegister,
  FaFileInvoice,
  FaIdCard,
  FaListAlt,
  FaPlus,
  FaSave,
  FaTrash,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import axiosInstance from "../../../api/axiosInstance";

const cashier = [
  "Please select",
  "FLORA MY",
  "IRIS",
  "RICARDO",
  "AGNES",
  "AMABELLA",
];

const uiColors = {
  navy: "#0f2747",
  navyHover: "#0b1e38",
  amber: "#d6a12b",
  amberSoft: "rgba(214, 161, 43, 0.12)",
  border: "#d8e2ee",
  bg: "#f7f9fc",
  card: "#ffffff",
  textMuted: "#5b7088",
};

const labelStyle = { fontWeight: 600, color: uiColors.navy };
const inputStyle = {
  borderRadius: "10px",
  borderColor: uiColors.border,
  boxShadow: "none",
};
const AUTO_RECEIPT_PATTERN = /^00\d{8}$/;

function AbstractGF() {
  const [selectedDate, setSelectedDate] = useState("");
  const [taxpayerName, setTaxpayerName] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [typeReceipt, setTypeReceipt] = useState("");
  const [selectedCashier, setSelectedCashier] = useState("");
  const [fields, setFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [selectedField, setSelectedField] = useState("");
  const [showSelect, setShowSelect] = useState(true);
  const [total, setTotal] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("info");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rateOptions, setRateOptions] = useState([]);
  const [rateLoading, setRateLoading] = useState(false);
  const [receiptTypeOptions, setReceiptTypeOptions] = useState([]);
  const [taxpayerOptions, setTaxpayerOptions] = useState([]);
  const [taxpayerLoading, setTaxpayerLoading] = useState(false);

  const rateById = useMemo(() => {
    const map = new Map();
    (Array.isArray(rateOptions) ? rateOptions : []).forEach((rate) => {
      map.set(String(rate.oprate_id), rate);
    });
    return map;
  }, [rateOptions]);

  const buildCashTicketsReceiptNumber = useCallback((dateValue) => {
    const parsedDate = dayjs(dateValue);
    if (!parsedDate.isValid()) {
      return "";
    }

    return `00${parsedDate.format("YYYYMMDD")}`;
  }, []);

  const autoGenerateReceipt = useCallback(
    (dateValue = selectedDate) => {
      try {
        const newReceiptNum = buildCashTicketsReceiptNumber(dateValue);
        if (newReceiptNum) {
          setReceiptNumber(newReceiptNum);
        }
      } catch (error) {
        console.error("Error generating receipt:", error);
      }
    },
    [buildCashTicketsReceiptNumber, selectedDate]
  );

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setRateLoading(true);
        const response = await axiosInstance.get("generalFundPaymentRates");
        setRateOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching payment rate options:", error);
        setRateOptions([]);
      } finally {
        setRateLoading(false);
      }
    };

    fetchRates();
  }, []);

  useEffect(() => {
    const fetchReceiptTypes = async () => {
      try {
        const response = await axiosInstance.get("form-types");
        setReceiptTypeOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching receipt types:", error);
        setReceiptTypeOptions([]);
      }
    };

    fetchReceiptTypes();
  }, []);

  useEffect(() => {
    let active = true;
    const search = taxpayerName.trim();

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
  }, [taxpayerName]);

  const getFieldLabel = useCallback(
    (fieldId) => {
      const key = String(fieldId);
      return rateById.get(key)?.description || key;
    },
    [rateById]
  );

  const isCashTicketsSelected = useMemo(
    () =>
      fields.some(
        (fieldId) =>
          getFieldLabel(fieldId).trim().toLowerCase() === "cash tickets"
      ),
    [fields, getFieldLabel]
  );

  const selectedTaxpayer = useMemo(() => {
    if (!taxpayerName) return null;

    return (
      taxpayerOptions.find((option) => option?.ownerName === taxpayerName) || {
        ownerName: taxpayerName,
        localTin: "",
      }
    );
  }, [taxpayerName, taxpayerOptions]);

  useEffect(() => {
    const totalSum = Object.values(fieldValues).reduce(
      (acc, value) => acc + parseFloat(value || 0),
      0
    );
    setTotal(totalSum);
  }, [fieldValues]);

  useEffect(() => {
    if (!isCashTicketsSelected) {
      return;
    }

    if (!selectedDate) {
      if (!receiptNumber || AUTO_RECEIPT_PATTERN.test(receiptNumber)) {
        setReceiptNumber("");
      }
      return;
    }

    const generatedReceipt = buildCashTicketsReceiptNumber(selectedDate);
    if (
      generatedReceipt &&
      (!receiptNumber || AUTO_RECEIPT_PATTERN.test(receiptNumber)) &&
      receiptNumber !== generatedReceipt
    ) {
      setReceiptNumber(generatedReceipt);
    }
  }, [
    buildCashTicketsReceiptNumber,
    isCashTicketsSelected,
    receiptNumber,
    selectedDate,
  ]);

  const handleFieldChange = (field, value) => {
    setFieldValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemoveField = (removedField) => {
    setFields((prev) => prev.filter((field) => field !== removedField));

    setFieldValues((prev) => {
      const updatedValues = { ...prev };
      delete updatedValues[removedField];
      return updatedValues;
    });

    setSelectedField("");
    setShowSelect(true);
  };

  const handleFieldSelect = (event) => {
    const newSelectedField = String(event.target.value || "").trim();

    if (!newSelectedField || fields.includes(newSelectedField)) {
      return;
    }

    setFields((prev) => [...prev, newSelectedField]);
    setFieldValues((prev) => ({ ...prev, [newSelectedField]: "" }));
    setSelectedField("");
    setShowSelect(false);

    if (getFieldLabel(newSelectedField).toLowerCase() === "cash tickets") {
      autoGenerateReceipt();
    }
  };

  const handleClearFields = useCallback(() => {
    setSelectedDate("");
    setTaxpayerName("");
    setReceiptNumber("");
    setTypeReceipt("");
    setSelectedCashier("");
    setSelectedField("");
    setShowSelect(true);
    setFieldValues({});
    setFields([]);
    setAlertMessage("");
    setAlertVariant("info");
    setLoading(false);
    setProgress(0);
  }, []);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();

      if (
        !selectedDate ||
        !taxpayerName ||
        !receiptNumber ||
        !typeReceipt ||
        !selectedCashier
      ) {
        setAlertMessage("Please fill out all required fields.");
        setAlertVariant("danger");
        return;
      }

      for (const [field, value] of Object.entries(fieldValues)) {
        if (!value) {
          setAlertMessage(`Please fill out the field: ${getFieldLabel(field)}.`);
          setAlertVariant("danger");
          return;
        }
      }

      if (!fields.length) {
        setAlertMessage("Please add at least one payment item.");
        setAlertVariant("danger");
        return;
      }

      const payload = {
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
        name: taxpayerName,
        receipt_no: receiptNumber,
        type_receipt: typeReceipt,
        cashier: selectedCashier,
        details: fields.map((sourceId) => ({
          source_id: String(sourceId),
          amount: Number(fieldValues[sourceId] || 0),
        })),
      };

      try {
        setLoading(true);
        setProgress(0);

        await axiosInstance.post("generalFundPayment", payload);

        setAlertMessage("Payment saved successfully.");
        setAlertVariant("success");

        setTimeout(() => {
          handleClearFields();
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error("Operation failed:", error);
        setAlertMessage(
          error.response?.data?.message || "Failed to save payment."
        );
        setAlertVariant("danger");
        setLoading(false);
      }
    },
    [
      fields,
      fieldValues,
      getFieldLabel,
      handleClearFields,
      receiptNumber,
      selectedCashier,
      selectedDate,
      taxpayerName,
      typeReceipt,
    ]
  );

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => {
        setProgress((prev) => {
          const diff = Math.random() * 10;
          return Math.min(prev + diff, 100);
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const availableOptions = rateOptions.filter(
    (option) => !fields.includes(String(option?.oprate_id))
  );

  return (
    <div
      style={{
        background: "transparent",
        padding: 0,
        boxShadow: "none",
      }}
    >
      <h4
        className="mb-4 text-center"
        style={{ color: uiColors.navy, fontWeight: 800 }}
      >
        General Fund Abstracts
      </h4>

      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Row className="g-3 mb-4">
          <Col md={12}>
            <Form.Group controlId="formDate">
              <Form.Label style={labelStyle}>
                <FaCalendarAlt style={{ marginRight: 8 }} />
                Date
              </Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                style={inputStyle}
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group controlId="formTaxpayer">
              <Form.Label style={labelStyle}>
                <FaUser style={{ marginRight: 8 }} />
                Name of Taxpayer
              </Form.Label>
              <Autocomplete
                fullWidth
                freeSolo
                options={taxpayerOptions}
                loading={taxpayerLoading}
                value={selectedTaxpayer}
                onChange={(_, value) => {
                  setTaxpayerName(value?.ownerName || "");
                }}
                onInputChange={(_, value, reason) => {
                  if (reason === "input") {
                    setTaxpayerName(value);
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
                  <li {...props}>
                    <div>
                      <div style={{ fontWeight: 700, color: uiColors.navy }}>
                        {option.ownerName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: uiColors.textMuted,
                        }}
                      >
                        Local TIN: {option.localTin || "-"}
                      </div>
                    </div>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Full Name"
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        backgroundColor: "#fff",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: uiColors.border,
                      },
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: uiColors.border,
                        },
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: uiColors.navy,
                        },
                    }}
                  />
                )}
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group controlId="formReceipt">
              <Form.Label style={labelStyle}>
                <FaFileInvoice style={{ marginRight: 8 }} />
                Receipt No. P.F. No. 25(A)
              </Form.Label>
              <Form.Control
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                required
                style={inputStyle}
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group controlId="formReceiptType">
              <Form.Label style={labelStyle}>
                <FaIdCard style={{ marginRight: 8 }} />
                Type of Receipt
              </Form.Label>
              <Form.Select
                value={typeReceipt}
                onChange={(e) => setTypeReceipt(e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Select receipt type</option>
                {receiptTypeOptions.map((option) => (
                  <option key={option.code || option.id} value={option.code}>
                    {option.description || option.name || option.code}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group controlId="formCashier">
              <Form.Label style={labelStyle}>
                <FaUsers style={{ marginRight: 8 }} />
                Select Cashier
              </Form.Label>
              <Form.Select
                value={selectedCashier}
                onChange={(e) => setSelectedCashier(e.target.value)}
                required
                style={inputStyle}
              >
                {cashier.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {fields.map((field) => (
            <Col md={12} key={field}>
              <Form.Group controlId={`form-${field}`}>
                <Form.Label style={labelStyle}>
                  <FaListAlt style={{ marginRight: 8 }} />
                  {getFieldLabel(field)}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    value={fieldValues[field] || ""}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    required
                    style={inputStyle}
                  />
                  <Button
                    variant="outline-danger"
                    onClick={() => handleRemoveField(field)}
                  >
                    <FaTrash />
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          ))}

          {showSelect && (
            <Col md={12}>
              <Form.Group controlId="formFieldSelect">
                <Form.Label style={labelStyle}>
                  <FaListAlt style={{ marginRight: 8 }} />
                  Select Field
                </Form.Label>
                <Form.Select
                  value={selectedField}
                  onChange={handleFieldSelect}
                  required
                  style={inputStyle}
                  disabled={rateLoading}
                >
                  <option value="">
                    {rateLoading ? "Loading..." : "Select a field"}
                  </option>
                  {availableOptions.map((option) => (
                    <option key={option.oprate_id} value={option.oprate_id}>
                      {option.description}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          )}

          <Col md={12}>
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                setSelectedField("");
                setShowSelect(true);
              }}
              className="mt-2"
              style={{
                backgroundColor: uiColors.navy,
                borderColor: uiColors.navy,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              <FaPlus style={{ marginRight: 8 }} />
              Add New Field
            </Button>
          </Col>

          <Col md={12}>
            <h5
              className="mt-3"
              style={{ color: uiColors.navy, fontWeight: 700 }}
            >
              <FaCashRegister style={{ marginRight: 8 }} />
              Total: PHP {total.toFixed(2)}
            </h5>
          </Col>
        </Row>

        {alertMessage && (
          <Alert variant={alertVariant} className="mt-3">
            {alertMessage}
          </Alert>
        )}

        {loading && (
          <ProgressBar
            now={progress}
            label={`${progress.toFixed(0)}%`}
            animated
            className="mt-3"
          />
        )}

        <div className="d-flex w-100 mt-4 gap-2">
          <Button
            variant="secondary"
            onClick={handleClearFields}
            className="flex-fill"
            style={{
              borderColor: uiColors.amber,
              color: uiColors.navy,
              backgroundColor: "rgba(214, 161, 43, 0.08)",
              fontWeight: 700,
              textTransform: "none",
              padding: "10px 18px",
              borderRadius: "10px",
            }}
          >
            <FaTrash style={{ marginRight: 8 }} />
            Reset
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleSave}
            className="flex-fill"
            style={{
              backgroundColor: uiColors.navy,
              borderColor: uiColors.navy,
              fontWeight: 700,
              textTransform: "none",
              padding: "10px 22px",
              borderRadius: "10px",
              boxShadow: "0 6px 14px rgba(15, 39, 71, 0.25)",
            }}
          >
            <FaSave style={{ marginRight: 8 }} />
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default AbstractGF;
