import {
  Add,
  LocalPrintshop,
  Remove,
  SaveAlt,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

const ui = {
  ink: "#122033",
  muted: "#5b6b7b",
  line: "#cad5e2",
  soft: "#eef4f8",
  paper: "#fffdf8",
  navy: "#0f2747",
  navyHover: "#0b1e38",
  gold: "#d6a12b",
  goldSoft: "#f5ecd4",
  success: "#0f6b62",
};

const modeOptions = ["Check", "Cash", "Others"];

const makeLine = () => ({ explanation: "", amount: "" });
const makeJournalLine = () => ({
  responsibilityCenter: "",
  accountExplanation: "",
  accountCode: "",
  ref: "",
  debit: "",
  credit: "",
});

const defaultVoucher = {
  voucherNo: "",
  modeOfPayment: "Cash",
  payee: "",
  tinEmployeeNo: "",
  obligationRequestNo: "",
  address: "",
  responsibilityCenter: "",
  officeUnitProject: "",
  code: "",
  certifiedAName: "JOSELITO M. TINAYTINAY",
  certifiedAPosition: "",
  certifiedADate: "",
  certifiedBName: "PAUL REE AMBROSE A. MARTINEZ",
  certifiedBPosition: "",
  certifiedBDate: "",
  approvedName: "JONAH PAT L. AVILES",
  approvedPosition: "",
  approvedDate: "",
  receivedName: "",
  receivedPosition: "",
  receivedDate: "",
  approvedBy: "JOSELITO M. TINAYTINAY",
  approvedByPosition: "Municipal Accountant",
};

const printableFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#fff",
  },
};

function SectionTitle({ children }) {
  return (
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: ui.navy,
      }}
    >
      {children}
    </Typography>
  );
}

function SignatureBlock({ letter, title, name, position, date }) {
  return (
    <Box
      sx={{
        border: `1px solid ${ui.line}`,
        borderRadius: 2,
        p: 1.5,
        minHeight: 150,
      }}
    >
      <Typography sx={{ fontWeight: 800, color: ui.navy, mb: 1 }}>
        {letter} {title}
      </Typography>
      <Typography sx={{ fontSize: 13, color: ui.muted, mb: 2 }}>
        {letter === "A"
          ? "Allotment obligated for the purpose as indicated above."
          : letter === "B"
            ? "Funds available."
            : letter === "C"
              ? "Approved for payment."
              : "Received of payment."}
      </Typography>
      <Stack spacing={1}>
        <Box>
          <Typography variant="caption" sx={{ color: ui.muted }}>
            Printed Name
          </Typography>
          <Typography sx={{ fontWeight: 700, color: ui.ink }}>{name || "-"}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: ui.muted }}>
            Position
          </Typography>
          <Typography sx={{ color: ui.ink }}>{position || "-"}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: ui.muted }}>
            Date
          </Typography>
          <Typography sx={{ color: ui.ink }}>{date || "-"}</Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default function DisbursementVoucher() {
  const [voucher, setVoucher] = useState(defaultVoucher);
  const [explanationLines, setExplanationLines] = useState([
    makeLine(),
    makeLine(),
    makeLine(),
  ]);
  const [journalLines, setJournalLines] = useState([
    makeJournalLine(),
    makeJournalLine(),
    makeJournalLine(),
  ]);

  const totalAmount = useMemo(
    () =>
      explanationLines.reduce((sum, line) => {
        const value = parseFloat(String(line.amount || "").replace(/,/g, ""));
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0),
    [explanationLines]
  );

  const totalDebit = useMemo(
    () =>
      journalLines.reduce((sum, line) => {
        const value = parseFloat(String(line.debit || "").replace(/,/g, ""));
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0),
    [journalLines]
  );

  const totalCredit = useMemo(
    () =>
      journalLines.reduce((sum, line) => {
        const value = parseFloat(String(line.credit || "").replace(/,/g, ""));
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0),
    [journalLines]
  );

  const handleVoucherChange = (field) => (event) => {
    setVoucher((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleLineChange = (index, field) => (event) => {
    setExplanationLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [field]: event.target.value } : line
      )
    );
  };

  const handleJournalChange = (index, field) => (event) => {
    setJournalLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [field]: event.target.value } : line
      )
    );
  };

  const handleExportDraft = () => {
    const payload = {
      voucher,
      explanationLines,
      journalLines,
      totalAmount,
      totalDebit,
      totalCredit,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `disbursement-voucher-draft-${voucher.voucherNo || "draft"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(214,161,43,0.16), transparent 22%), linear-gradient(180deg, #f5f7fb 0%, #edf2f7 100%)",
      }}
    >
      <Card
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 5,
          background: `linear-gradient(135deg, ${ui.navy} 0%, #214a74 70%, #396a8f 100%)`,
          color: "white",
          boxShadow: "0 24px 60px rgba(15,39,71,0.24)",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box sx={{ maxWidth: 760 }}>
            <Chip
              label="Reviewed from DOCUMENTS_TEMPLATE.xlsx"
              sx={{
                mb: 2,
                bgcolor: "rgba(255,255,255,0.12)",
                color: "white",
                fontWeight: 700,
              }}
            />
            <Typography sx={{ fontSize: { xs: 30, md: 42 }, fontWeight: 800, lineHeight: 1.02 }}>
              Disbursement Voucher workspace based on the Excel template.
            </Typography>
            <Typography sx={{ mt: 1.5, maxWidth: 640, color: "rgba(255,255,255,0.8)" }}>
              The template is a government-style Disbursement Voucher with four
              certification blocks and a Journal Entry Voucher section. This page
              mirrors that structure for on-screen preparation and printing.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignSelf="flex-start">
            <Button
              variant="contained"
              startIcon={<LocalPrintshop />}
              onClick={() => window.print()}
              sx={{
                bgcolor: ui.gold,
                color: ui.ink,
                textTransform: "none",
                fontWeight: 800,
                boxShadow: "none",
                "&:hover": { bgcolor: "#e2b84d", boxShadow: "none" },
              }}
            >
              Print Preview
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveAlt />}
              onClick={handleExportDraft}
              sx={{
                borderColor: "rgba(255,255,255,0.28)",
                color: "white",
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Save Draft
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} xl={4.5}>
          <Stack spacing={2}>
            <Card sx={{ p: 2.5, borderRadius: 4 }}>
              <SectionTitle>Voucher Details</SectionTitle>
              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Voucher No."
                    fullWidth
                    value={voucher.voucherNo}
                    onChange={handleVoucherChange("voucherNo")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mode of Payment"
                    select
                    fullWidth
                    value={voucher.modeOfPayment}
                    onChange={handleVoucherChange("modeOfPayment")}
                    sx={printableFieldSx}
                  >
                    {modeOptions.map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {mode}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Payee"
                    fullWidth
                    value={voucher.payee}
                    onChange={handleVoucherChange("payee")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="TIN / Employee No."
                    fullWidth
                    value={voucher.tinEmployeeNo}
                    onChange={handleVoucherChange("tinEmployeeNo")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Obligation Request No."
                    fullWidth
                    value={voucher.obligationRequestNo}
                    onChange={handleVoucherChange("obligationRequestNo")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    fullWidth
                    value={voucher.address}
                    onChange={handleVoucherChange("address")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Responsibility Center"
                    fullWidth
                    value={voucher.responsibilityCenter}
                    onChange={handleVoucherChange("responsibilityCenter")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Code"
                    fullWidth
                    value={voucher.code}
                    onChange={handleVoucherChange("code")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Office / Unit / Project"
                    fullWidth
                    value={voucher.officeUnitProject}
                    onChange={handleVoucherChange("officeUnitProject")}
                    sx={printableFieldSx}
                  />
                </Grid>
              </Grid>
            </Card>

            <Card sx={{ p: 2.5, borderRadius: 4 }}>
              <SectionTitle>Certification and Signatories</SectionTitle>
              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="A Printed Name"
                    fullWidth
                    value={voucher.certifiedAName}
                    onChange={handleVoucherChange("certifiedAName")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="A Position"
                    fullWidth
                    value={voucher.certifiedAPosition}
                    onChange={handleVoucherChange("certifiedAPosition")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="A Date"
                    type="date"
                    fullWidth
                    value={voucher.certifiedADate}
                    onChange={handleVoucherChange("certifiedADate")}
                    InputLabelProps={{ shrink: true }}
                    sx={printableFieldSx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="B Printed Name"
                    fullWidth
                    value={voucher.certifiedBName}
                    onChange={handleVoucherChange("certifiedBName")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="B Position"
                    fullWidth
                    value={voucher.certifiedBPosition}
                    onChange={handleVoucherChange("certifiedBPosition")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="B Date"
                    type="date"
                    fullWidth
                    value={voucher.certifiedBDate}
                    onChange={handleVoucherChange("certifiedBDate")}
                    InputLabelProps={{ shrink: true }}
                    sx={printableFieldSx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="C Printed Name"
                    fullWidth
                    value={voucher.approvedName}
                    onChange={handleVoucherChange("approvedName")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="C Position"
                    fullWidth
                    value={voucher.approvedPosition}
                    onChange={handleVoucherChange("approvedPosition")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="C Date"
                    type="date"
                    fullWidth
                    value={voucher.approvedDate}
                    onChange={handleVoucherChange("approvedDate")}
                    InputLabelProps={{ shrink: true }}
                    sx={printableFieldSx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="D Printed Name"
                    fullWidth
                    value={voucher.receivedName}
                    onChange={handleVoucherChange("receivedName")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="D Position"
                    fullWidth
                    value={voucher.receivedPosition}
                    onChange={handleVoucherChange("receivedPosition")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="D Date"
                    type="date"
                    fullWidth
                    value={voucher.receivedDate}
                    onChange={handleVoucherChange("receivedDate")}
                    InputLabelProps={{ shrink: true }}
                    sx={printableFieldSx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Approved By"
                    fullWidth
                    value={voucher.approvedBy}
                    onChange={handleVoucherChange("approvedBy")}
                    sx={printableFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Approved By Position"
                    fullWidth
                    value={voucher.approvedByPosition}
                    onChange={handleVoucherChange("approvedByPosition")}
                    sx={printableFieldSx}
                  />
                </Grid>
              </Grid>
            </Card>

            <Card sx={{ p: 2.5, borderRadius: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <SectionTitle>Explanation Lines</SectionTitle>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setExplanationLines((current) => [...current, makeLine()])}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Add Line
                </Button>
              </Stack>

              <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                {explanationLines.map((line, index) => (
                  <Stack key={`line-${index}`} direction={{ xs: "column", md: "row" }} spacing={1.25}>
                    <TextField
                      label={`Explanation ${index + 1}`}
                      multiline
                      minRows={2}
                      fullWidth
                      value={line.explanation}
                      onChange={handleLineChange(index, "explanation")}
                      sx={printableFieldSx}
                    />
                    <TextField
                      label="Amount"
                      value={line.amount}
                      onChange={handleLineChange(index, "amount")}
                      sx={{ ...printableFieldSx, minWidth: { md: 180 } }}
                    />
                    <IconButton
                      onClick={() =>
                        setExplanationLines((current) =>
                          current.length === 1 ? current : current.filter((_, lineIndex) => lineIndex !== index)
                        )
                      }
                    >
                      <Remove />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>

              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: ui.goldSoft,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontWeight: 800, color: ui.navy }}>Total Amount</Typography>
                <Typography sx={{ fontWeight: 800, color: ui.navy }}>
                  {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Card>

            <Card sx={{ p: 2.5, borderRadius: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <SectionTitle>Journal Entry Voucher</SectionTitle>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setJournalLines((current) => [...current, makeJournalLine()])}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Add Entry
                </Button>
              </Stack>

              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                {journalLines.map((line, index) => (
                  <Box
                    key={`journal-${index}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${ui.line}`,
                      bgcolor: "#fff",
                    }}
                  >
                    <Grid container spacing={1.25}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Responsibility Center"
                          fullWidth
                          value={line.responsibilityCenter}
                          onChange={handleJournalChange(index, "responsibilityCenter")}
                          sx={printableFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Accounts and Explanations"
                          fullWidth
                          value={line.accountExplanation}
                          onChange={handleJournalChange(index, "accountExplanation")}
                          sx={printableFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Account Code"
                          fullWidth
                          value={line.accountCode}
                          onChange={handleJournalChange(index, "accountCode")}
                          sx={printableFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Ref"
                          fullWidth
                          value={line.ref}
                          onChange={handleJournalChange(index, "ref")}
                          sx={printableFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Debit"
                          fullWidth
                          value={line.debit}
                          onChange={handleJournalChange(index, "debit")}
                          sx={printableFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Credit"
                          fullWidth
                          value={line.credit}
                          onChange={handleJournalChange(index, "credit")}
                          sx={printableFieldSx}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>

              <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                <Chip label={`Debit ${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sx={{ fontWeight: 700 }} />
                <Chip label={`Credit ${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sx={{ fontWeight: 700 }} />
              </Stack>
            </Card>
          </Stack>
        </Grid>

        <Grid item xs={12} xl={7.5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 4,
              border: `1px solid ${ui.line}`,
              backgroundColor: ui.paper,
              boxShadow: "0 24px 60px rgba(18,32,51,0.08)",
            }}
          >
            <Box sx={{ maxWidth: 980, mx: "auto" }}>
              <Typography align="center" sx={{ fontSize: 12, color: ui.muted }}>
                Republic of the Philippines
              </Typography>
              <Typography align="center" sx={{ fontWeight: 800, color: ui.navy }}>
                MUNICIPAL GOVERNMENT OF ZAMBOANGUITA
              </Typography>
              <Typography align="center" sx={{ fontSize: 13, color: ui.muted }}>
                Zamboanguita, Negros Oriental
              </Typography>
              <Typography
                align="center"
                sx={{ mt: 1.2, fontSize: 24, fontWeight: 800, letterSpacing: "0.08em", color: ui.navy }}
              >
                DISBURSEMENT VOUCHER
              </Typography>

              <Grid container spacing={0} sx={{ mt: 2, border: `1px solid ${ui.line}` }}>
                <Grid item xs={8} sx={{ p: 1.25, borderRight: `1px solid ${ui.line}`, borderBottom: `1px solid ${ui.line}` }}>
                  <Typography sx={{ fontWeight: 700, color: ui.navy, mb: 0.75 }}>Mode of Payment</Typography>
                  <Stack direction="row" spacing={1}>
                    {modeOptions.map((mode) => (
                      <Chip
                        key={mode}
                        label={mode}
                        sx={{
                          bgcolor: voucher.modeOfPayment === mode ? ui.navy : "#fff",
                          color: voucher.modeOfPayment === mode ? "#fff" : ui.ink,
                          border: `1px solid ${ui.line}`,
                          fontWeight: 700,
                        }}
                      />
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={4} sx={{ p: 1.25, borderBottom: `1px solid ${ui.line}` }}>
                  <Typography variant="caption" sx={{ color: ui.muted }}>
                    No.
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: ui.ink }}>{voucher.voucherNo || "-"}</Typography>
                </Grid>

                <Grid item xs={7} sx={{ p: 1.25, borderRight: `1px solid ${ui.line}`, borderBottom: `1px solid ${ui.line}` }}>
                  <Typography variant="caption" sx={{ color: ui.muted }}>
                    Payee
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: ui.ink }}>{voucher.payee || "-"}</Typography>
                </Grid>
                <Grid item xs={3} sx={{ p: 1.25, borderRight: `1px solid ${ui.line}`, borderBottom: `1px solid ${ui.line}` }}>
                  <Typography variant="caption" sx={{ color: ui.muted }}>
                    TIN/Employee No.
                  </Typography>
                  <Typography sx={{ color: ui.ink }}>{voucher.tinEmployeeNo || "-"}</Typography>
                </Grid>
                <Grid item xs={2} sx={{ p: 1.25, borderBottom: `1px solid ${ui.line}` }}>
                  <Typography variant="caption" sx={{ color: ui.muted }}>
                    Obligation Request No.
                  </Typography>
                  <Typography sx={{ color: ui.ink }}>{voucher.obligationRequestNo || "-"}</Typography>
                </Grid>

                <Grid item xs={7} sx={{ p: 1.25, borderRight: `1px solid ${ui.line}`, borderBottom: `1px solid ${ui.line}` }}>
                  <Typography variant="caption" sx={{ color: ui.muted }}>
                    Address
                  </Typography>
                  <Typography sx={{ color: ui.ink }}>{voucher.address || "-"}</Typography>
                </Grid>
                <Grid item xs={3} sx={{ p: 1.25, borderRight: `1px solid ${ui.line}`, borderBottom: `1px solid ${ui.line}` }}>
                  <Typography variant="caption" sx={{ color: ui.muted }}>
                    Responsibility Center
                  </Typography>
                  <Typography sx={{ color: ui.ink }}>{voucher.responsibilityCenter || "-"}</Typography>
                </Grid>
                <Grid item xs={2} sx={{ p: 1.25, borderBottom: `1px solid ${ui.line}` }}>
                  <Typography variant="caption" sx={{ color: ui.muted }}>
                    Code
                  </Typography>
                  <Typography sx={{ color: ui.ink }}>{voucher.code || "-"}</Typography>
                </Grid>

                <Grid item xs={12} sx={{ p: 1.25 }}>
                  <Typography variant="caption" sx={{ color: ui.muted }}>
                    Office / Unit / Project
                  </Typography>
                  <Typography sx={{ color: ui.ink }}>{voucher.officeUnitProject || "-"}</Typography>
                </Grid>
              </Grid>

              <Table
                size="small"
                sx={{
                  mt: 2,
                  border: `1px solid ${ui.line}`,
                  "& th, & td": {
                    borderColor: ui.line,
                  },
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: ui.soft }}>
                    <TableCell sx={{ fontWeight: 800, color: ui.navy }}>EXPLANATION</TableCell>
                    <TableCell align="right" sx={{ width: 180, fontWeight: 800, color: ui.navy }}>
                      Amount
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {explanationLines.map((line, index) => (
                    <TableRow key={`preview-line-${index}`} sx={{ height: 42 }}>
                      <TableCell>{line.explanation || ""}</TableCell>
                      <TableCell align="right">
                        {line.amount
                          ? Number(String(line.amount).replace(/,/g, "") || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : ""}
                      </TableCell>
                    </TableRow>
                  ))}
                  {Array.from({ length: Math.max(0, 7 - explanationLines.length) }).map((_, index) => (
                    <TableRow key={`blank-line-${index}`} sx={{ height: 42 }}>
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: ui.goldSoft }}>
                    <TableCell sx={{ fontWeight: 800 }}>TOTAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Grid container spacing={1.25} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <SignatureBlock
                    letter="A"
                    title="Certified"
                    name={voucher.certifiedAName}
                    position={voucher.certifiedAPosition}
                    date={voucher.certifiedADate}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SignatureBlock
                    letter="B"
                    title="Certified"
                    name={voucher.certifiedBName}
                    position={voucher.certifiedBPosition}
                    date={voucher.certifiedBDate}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SignatureBlock
                    letter="C"
                    title="Approved for Payment"
                    name={voucher.approvedName}
                    position={voucher.approvedPosition}
                    date={voucher.approvedDate}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SignatureBlock
                    letter="D"
                    title="Received of Payment"
                    name={voucher.receivedName}
                    position={voucher.receivedPosition}
                    date={voucher.receivedDate}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Typography sx={{ fontWeight: 800, color: ui.navy, letterSpacing: "0.08em" }}>
                JOURNAL ENTRY VOUCHER
              </Typography>

              <Table
                size="small"
                sx={{
                  mt: 1.2,
                  border: `1px solid ${ui.line}`,
                  "& th, & td": {
                    borderColor: ui.line,
                    verticalAlign: "top",
                  },
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: ui.soft }}>
                    <TableCell sx={{ fontWeight: 800, color: ui.navy }}>Responsibility Center</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: ui.navy }}>Accounts and Explanations</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: ui.navy }}>Account Code</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: ui.navy }}>Ref</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: ui.navy }}>
                      Debit
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: ui.navy }}>
                      Credit
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {journalLines.map((line, index) => (
                    <TableRow key={`preview-journal-${index}`} sx={{ height: 42 }}>
                      <TableCell>{line.responsibilityCenter}</TableCell>
                      <TableCell>{line.accountExplanation}</TableCell>
                      <TableCell>{line.accountCode}</TableCell>
                      <TableCell>{line.ref}</TableCell>
                      <TableCell align="right">{line.debit}</TableCell>
                      <TableCell align="right">{line.credit}</TableCell>
                    </TableRow>
                  ))}
                  {Array.from({ length: Math.max(0, 6 - journalLines.length) }).map((_, index) => (
                    <TableRow key={`blank-journal-${index}`} sx={{ height: 42 }}>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: ui.goldSoft }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 800 }}>
                      TOTAL
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Box sx={{ mt: 3.5, textAlign: "center" }}>
                <Typography sx={{ fontWeight: 800, color: ui.ink }}>
                  {voucher.approvedBy || "-"}
                </Typography>
                <Typography sx={{ color: ui.muted }}>
                  {voucher.approvedByPosition || "-"}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
