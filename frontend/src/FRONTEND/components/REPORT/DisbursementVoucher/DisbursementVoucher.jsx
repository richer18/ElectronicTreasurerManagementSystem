import { LocalPrintshop, RestartAlt } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMemo, useState } from "react";

const uiColors = {
  navy: "#0f2747",
  navyHover: "#0b1e38",
  steel: "#4b5d73",
  steelHover: "#3c4c60",
  teal: "#0f6b62",
  tealHover: "#0b544d",
  amber: "#a66700",
  amberHover: "#8c5600",
  bg: "#f5f7fb",
  cardGradients: [
    "linear-gradient(135deg, #0f2747, #2f4f7f)",
    "linear-gradient(135deg, #0f6b62, #2a8a7f)",
    "linear-gradient(135deg, #4b5d73, #6a7f99)",
    "linear-gradient(135deg, #a66700, #c98a2a)",
  ],
};

const modeOptions = ["Check", "Cash", "Others"];

const defaultEntryForm = {
  voucherNo: "",
  voucherDate: "",
  modeOfPayment: "Check",
  payee: "",
  address: "Zamboanguita, Negros Oriental",
  explanation: "",
  amount: "",
};

const StyledTableCell = styled(TableCell)(() => ({
  whiteSpace: "nowrap",
  fontWeight: 700,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: 11.5,
  background: "#f7f9fc",
  color: "#0f2747",
  borderBottom: "2px solid #d6a12b",
}));

function SummaryCard({ title, value, gradient }) {
  return (
    <Card
      sx={{
        flex: 1,
        p: 3,
        borderRadius: "16px",
        background: gradient,
        color: "white",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        minWidth: 0,
      }}
    >
      <Typography sx={{ fontSize: 15, opacity: 0.92, fontWeight: 600 }}>{title}</Typography>
      <Typography sx={{ mt: 1, fontSize: { xs: 28, md: 34 }, fontWeight: 900 }}>{value}</Typography>
      <Box
        sx={{
          mt: 2.5,
          height: 4,
          width: "78%",
          borderRadius: 999,
          bgcolor: "rgba(255,255,255,0.35)",
          "&::after": {
            content: '""',
            display: "block",
            width: "68%",
            height: "100%",
            borderRadius: 999,
            bgcolor: "#ffffff",
          },
        }}
      />
    </Card>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatVoucherPrintDate(value) {
  if (!value) {
    return "--/--/----";
  }

  const parsedDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
}

function escapePrintHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function paymentModeMark(selectedMode, expectedMode) {
  return String(selectedMode || "").trim().toLowerCase() === expectedMode.toLowerCase() ? "X" : "&nbsp;";
}

function formatVoucherPrintAmount(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const normalizedValue = String(value).replaceAll(",", "");
  const numericValue = Number(normalizedValue);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return formatCurrency(numericValue);
}

function resolveJournalMode(modeOfPayment) {
  const normalizedMode = String(modeOfPayment || "").trim().toLowerCase();

  if (normalizedMode === "cash") {
    return "Cash Disbursement";
  }

  if (normalizedMode === "others") {
    return "Others";
  }

  return "Check Disbursement";
}

function buildVoucherPrintMarkup(entry) {
  const blank = "&nbsp;";
  const voucherNo = escapePrintHtml(entry.voucherNo || "");
  const voucherDate = escapePrintHtml(formatVoucherPrintDate(entry.voucherDate));
  const payee = escapePrintHtml(entry.payee === "No payee" ? "" : entry.payee || "");
  const address = escapePrintHtml(entry.address || defaultEntryForm.address);
  const explanation = escapePrintHtml(entry.explanation || "");
  const amount = escapePrintHtml(
    formatVoucherPrintAmount(
      entry.printAmount !== undefined ? entry.printAmount : entry.amount
    )
  );
  const modeOfPayment = String(entry.modeOfPayment || "Check");
  const tinEmployeeNo = escapePrintHtml(entry.tinEmployeeNo || "");
  const obligationRequestNo = escapePrintHtml(entry.obligationRequestNo || "");
  const responsibilityCenter = escapePrintHtml(entry.responsibilityCenter || "");
  const officeUnitProject = escapePrintHtml(entry.officeUnitProject || "");
  const code = escapePrintHtml(entry.code || "");
  const checkNo = escapePrintHtml(entry.checkNo || "");
  const bankName = escapePrintHtml(entry.bankName || "");
  const receivedName = escapePrintHtml(entry.receivedName || "");
  const receivedDate = escapePrintHtml(formatVoucherPrintDate(entry.receivedDate));
  const orOtherDocuments = escapePrintHtml(entry.orOtherDocuments || "");
  const jevNo = escapePrintHtml(entry.jevNo || "");
  const jevDate = escapePrintHtml(formatVoucherPrintDate(entry.jevDate));
  const journalMode = resolveJournalMode(modeOfPayment);

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Disbursement Voucher ${voucherNo || ""}</title>
      <style>
        @page {
          size: A4;
          margin: 12mm;
        }

        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        body {
          margin: 0;
          font-family: "Times New Roman", serif;
          background: #ffffff;
          color: #000000;
        }

        .voucher {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          padding: 12px;
        }

        .header {
          text-align: center;
          margin-bottom: 8px;
        }

        .header p {
          margin: 0;
          line-height: 1.2;
          font-size: 13px;
        }

        .header h1 {
          margin: 4px 0 0;
          font-size: 18px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .sheet-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          margin-top: 6px;
        }

        .sheet-table td,
        .sheet-table th {
          border: 1px solid #000;
          padding: 4px 6px;
          vertical-align: top;
          font-size: 11px;
          line-height: 1.15;
        }

        .sheet-table th {
          text-align: center;
          font-weight: 700;
        }

        .label {
          font-weight: 700;
          font-size: 10.5px;
        }

        .value {
          min-height: 14px;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .center {
          text-align: center;
        }

        .right {
          text-align: right;
        }

        .middle {
          vertical-align: middle !important;
        }

        .title-cell {
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.7px;
        }

        .check-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .box {
          width: 14px;
          height: 14px;
          border: 1px solid #000;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
          flex: 0 0 auto;
        }

        .particulars {
          min-height: 170px;
        }

        .signature-space {
          min-height: 34px;
        }

        .name {
          font-weight: 700;
          text-transform: uppercase;
        }

        .journal-head {
          font-weight: 700;
        }

        .journal-row {
          height: 26px;
        }
      </style>
    </head>
    <body>
      <div class="voucher">
        <div class="header">
          <p>Republic of the Philippines</p>
          <p>MUNICIPAL GOVERNMENT OF ZAMBOANGUITA</p>
          <p>Zamboanguita, Negros Oriental</p>
        </div>

        <table class="sheet-table">
          <colgroup>
            <col style="width: 11.5%;" />
            <col style="width: 11.5%;" />
            <col style="width: 11.5%;" />
            <col style="width: 11.5%;" />
            <col style="width: 11.5%;" />
            <col style="width: 8.5%;" />
            <col style="width: 8.5%;" />
            <col style="width: 11%;" />
            <col style="width: 7%;" />
            <col style="width: 7%;" />
          </colgroup>
          <tr>
            <td colspan="8" class="title-cell center middle">DISBURSEMENT VOUCHER</td>
            <td colspan="2">
              <div class="label">No.</div>
              <div class="value">${voucherNo || blank}</div>
            </td>
          </tr>
          <tr>
            <td colspan="8">${blank}</td>
            <td colspan="2">
              <div class="label">Date:</div>
              <div class="value">${voucherDate || blank}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2" class="middle">
              <div class="label">Mode of Payment</div>
            </td>
            <td colspan="2" class="middle">
              <span class="check-item"><span class="box">${paymentModeMark(modeOfPayment, "Check")}</span>Check</span>
            </td>
            <td colspan="2" class="middle">
              <span class="check-item"><span class="box">${paymentModeMark(modeOfPayment, "Cash")}</span>Cash</span>
            </td>
            <td colspan="4" class="middle">
              <span class="check-item"><span class="box">${paymentModeMark(modeOfPayment, "Others")}</span>Others</span>
            </td>
          </tr>
          <tr>
            <td rowspan="2" class="middle"><div class="label">Payee</div></td>
            <td colspan="4" rowspan="2" class="middle"><div class="value">${payee || blank}</div></td>
            <td colspan="3" rowspan="2">
              <div class="label">TIN/Employee No.</div>
              <div class="value">${tinEmployeeNo || blank}</div>
            </td>
            <td colspan="2">
              <div class="label">Obligation Request</div>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <div class="label">No.</div>
              <div class="value">${obligationRequestNo || blank}</div>
            </td>
          </tr>
          <tr>
            <td rowspan="2" class="middle"><div class="label">Address</div></td>
            <td colspan="4" rowspan="2" class="middle"><div class="value">${address || blank}</div></td>
            <td colspan="5">
              <div class="label">Responsibility Center</div>
              <div class="value">${responsibilityCenter || blank}</div>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <div class="label">Office/Unit/Project:</div>
              <div class="value">${officeUnitProject || blank}</div>
            </td>
            <td colspan="2">
              <div class="label">Code:</div>
              <div class="value">${code || blank}</div>
            </td>
          </tr>
        </table>

        <table class="sheet-table">
          <tr>
            <th colspan="8">EXPLANATION</th>
            <th colspan="2">Amount</th>
          </tr>
          <tr>
            <td colspan="8" class="particulars">
              <div class="value">${explanation || blank}</div>
            </td>
            <td colspan="2" class="particulars right">
              <div class="value">${amount || blank}</div>
            </td>
          </tr>
        </table>

        <table class="sheet-table">
          <tr>
            <td colspan="4"><span class="name">A.</span> Certified</td>
            <td colspan="6"><span class="name">B.</span> Certified</td>
          </tr>
          <tr>
            <td colspan="4" class="center middle">
              <div>Allotment obligated for the purpose</div>
              <div>as indicated above</div>
            </td>
            <td colspan="6" class="center middle">Funds Available</td>
          </tr>
          <tr>
            <td colspan="4" class="center middle">Supporting documents complete</td>
            <td colspan="6">${blank}</td>
          </tr>
          <tr>
            <td><div class="label">Signature</div></td>
            <td colspan="3" class="signature-space">${blank}</td>
            <td><div class="label">Signature</div></td>
            <td colspan="5" class="signature-space">${blank}</td>
          </tr>
          <tr>
            <td><div class="label">Printed Name</div></td>
            <td colspan="2" class="center middle"><div class="name">JOSELITO M. TINAYTINAY</div></td>
            <td><div class="label">Date</div></td>
            <td><div class="label">Printed Name</div></td>
            <td colspan="4" class="center middle"><div class="name">PAUL REE AMBROSE A. MARTINEZ</div></td>
            <td><div class="label">Date:</div></td>
          </tr>
          <tr>
            <td><div class="label">Position</div></td>
            <td colspan="3" class="center middle">
              <div>Municipal Accountant</div>
              <div>Head, Accounting Unit/Authorized Representative</div>
            </td>
            <td><div class="label">Position</div></td>
            <td colspan="5" class="center middle">Municipal Treasurer</td>
          </tr>
        </table>

        <table class="sheet-table">
          <tr>
            <td colspan="4"><span class="name">C.</span> Approved for Payment</td>
            <td colspan="6"><span class="name">D.</span> Received of Payment</td>
          </tr>
          <tr>
            <td><div class="label">Signature</div></td>
            <td colspan="3" class="signature-space">${blank}</td>
            <td><div class="label">Check No.</div></td>
            <td colspan="3"><div class="value">${checkNo || blank}</div></td>
            <td colspan="2">
              <div class="label">Date:</div>
              <div class="value">${receivedDate || blank}</div>
            </td>
          </tr>
          <tr>
            <td><div class="label">Printed Name</div></td>
            <td colspan="2" class="center middle"><div class="name">JONAH PAT L. AVILES</div></td>
            <td><div class="label">Date</div></td>
            <td><div class="label">Signature</div></td>
            <td colspan="4">${blank}</td>
            <td>
              <div class="label">Date:</div>
              <div class="value">${receivedDate || blank}</div>
            </td>
          </tr>
          <tr>
            <td><div class="label">Position</div></td>
            <td colspan="3" class="center middle">
              <div>Municipal Mayor</div>
              <div>Agency Head/Authorized Representative</div>
            </td>
            <td colspan="3">
              <div class="label">OR/Other Documents</div>
              <div class="value">${orOtherDocuments || blank}</div>
            </td>
            <td colspan="2">
              <div class="label">JEV No.</div>
              <div class="value">${jevNo || blank}</div>
            </td>
            <td>
              <div class="label">Date:</div>
              <div class="value">${jevDate || blank}</div>
            </td>
          </tr>
        </table>

        <table class="sheet-table">
          <tr>
            <td colspan="5" class="middle"><span class="name">For Accounting use only</span></td>
            <td colspan="3" class="center middle journal-head">JOURNAL ENTRY VOUCHER</td>
            <td colspan="2">
              <div class="label">No.</div>
              <div class="value">${jevNo || blank}</div>
            </td>
          </tr>
          <tr>
            <td colspan="5" class="center middle name">LGU - MUNICIPALITY OF ZAMBOANGUITA</td>
            <td colspan="5">
              <div class="label">Date.</div>
              <div class="value">${jevDate || blank}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2" class="middle">
              <span class="check-item"><span class="box">${paymentModeMark(journalMode, "Collection")}</span>COLLECTION</span>
            </td>
            <td colspan="2" class="middle">
              <span class="check-item"><span class="box">${paymentModeMark(journalMode, "Check Disbursement")}</span>CHECK DISBURSEMENT</span>
            </td>
            <td colspan="3" class="middle">
              <span class="check-item"><span class="box">${paymentModeMark(journalMode, "Cash Disbursement")}</span>CASH DISBURSEMENT</span>
            </td>
            <td colspan="3" class="middle">
              <span class="check-item"><span class="box">${paymentModeMark(journalMode, "Others")}</span>OTHERS</span>
            </td>
          </tr>
          <tr>
            <th colspan="2">Responsibility Center</th>
            <th colspan="3">Accounts and Explanations</th>
            <th>Account Code</th>
            <th>Ref</th>
            <th colspan="2">Debit</th>
            <th>Credit</th>
          </tr>
          <tr class="journal-row">
            <td colspan="2">${responsibilityCenter || blank}</td>
            <td colspan="3">${explanation || blank}</td>
            <td>${code || blank}</td>
            <td>${blank}</td>
            <td colspan="2" class="right">${amount || blank}</td>
            <td class="right">${blank}</td>
          </tr>
          <tr class="journal-row">
            <td colspan="2">${blank}</td>
            <td colspan="3">${blank}</td>
            <td>${blank}</td>
            <td>${blank}</td>
            <td colspan="2" class="right">${blank}</td>
            <td class="right">${blank}</td>
          </tr>
          <tr class="journal-row">
            <td colspan="2">${blank}</td>
            <td colspan="3">${blank}</td>
            <td>${blank}</td>
            <td>${blank}</td>
            <td colspan="2" class="right">${blank}</td>
            <td class="right">${blank}</td>
          </tr>
          <tr class="journal-row">
            <td colspan="2">${blank}</td>
            <td colspan="3">${blank}</td>
            <td>${blank}</td>
            <td>${blank}</td>
            <td colspan="2" class="right">${blank}</td>
            <td class="right">${blank}</td>
          </tr>
        </table>

        <table class="sheet-table">
          <tr>
            <td colspan="2" class="middle"><div class="name">APPROVED:</div></td>
            <td colspan="3" class="center middle">
              <div class="name">JOSELITO M. TINAYTINAY</div>
              <div>Municipal Accountant</div>
            </td>
            <td colspan="5">${blank}</td>
          </tr>
        </table>

        <table class="sheet-table">
          <tr>
            <td style="width: 33.33%;">
              <div class="label">Bank Name</div>
              <div class="value">${bankName || blank}</div>
            </td>
            <td style="width: 33.33%;">
              <div class="label">Received by</div>
              <div class="value">${receivedName || blank}</div>
            </td>
            <td style="width: 33.33%;">
              <div class="label">Office/Unit/Project</div>
              <div class="value">${officeUnitProject || blank}</div>
            </td>
          </tr>
        </table>
      </div>
    </body>
  </html>`;
}

export default function DisbursementVoucher() {
  const [voucher, setVoucher] = useState(defaultEntryForm);
  const [openEntryDialog, setOpenEntryDialog] = useState(false);
  const [tableRows, setTableRows] = useState([]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Voucher Status",
        value: "NEW ENTRY",
        gradient: uiColors.cardGradients[0],
      },
      {
        title: "Mode of Payment",
        value: voucher.modeOfPayment.toUpperCase(),
        gradient: uiColors.cardGradients[1],
      },
      {
        title: "Payee",
        value: voucher.payee || "NO PAYEE",
        gradient: uiColors.cardGradients[2],
      },
      {
        title: "Voucher Date",
        value: voucher.voucherDate || "--/--/----",
        gradient: uiColors.cardGradients[3],
      },
    ],
    [voucher.modeOfPayment, voucher.payee, voucher.voucherDate]
  );

  const handleVoucherChange = (field) => (event) => {
    setVoucher((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleNewEntry = () => {
    setVoucher(defaultEntryForm);
    setOpenEntryDialog(true);
  };

  const handleCloseEntryDialog = () => {
    setOpenEntryDialog(false);
  };

  const printVoucher = (entry) => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(buildVoucherPrintMarkup(entry));
    iframeDoc.close();

    const cleanup = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const doPrint = () => {
      const printWindow = iframe.contentWindow;
      if (!printWindow) {
        cleanup();
        return;
      }

      printWindow.focus();
      printWindow.onafterprint = cleanup;
      setTimeout(() => {
        printWindow.print();
      }, 250);
      setTimeout(cleanup, 1500);
    };

    setTimeout(doPrint, 300);
  };

  const handleCreateEntryAndPrint = () => {
    const nextEntry = {
      id: Date.now(),
      voucherDate: voucher.voucherDate || "--/--/----",
      voucherNo: voucher.voucherNo || `DV-${String(tableRows.length + 1).padStart(3, "0")}`,
      payee: voucher.payee || "No payee",
      address: voucher.address || defaultEntryForm.address,
      explanation: voucher.explanation || "",
      modeOfPayment: voucher.modeOfPayment,
      amount: Number(voucher.amount || 0),
      printAmount: voucher.amount,
      status: "NEW",
    };

    setTableRows((current) => [nextEntry, ...current]);
    setOpenEntryDialog(false);
    printVoucher(nextEntry);
  };

  const handlePrintCurrentVoucher = () => {
    printVoucher({
      voucherNo: voucher.voucherNo,
      voucherDate: voucher.voucherDate,
      payee: voucher.payee,
      address: voucher.address,
      explanation: voucher.explanation,
      modeOfPayment: voucher.modeOfPayment,
      amount: Number(voucher.amount || 0),
      printAmount: voucher.amount,
    });
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        padding: { xs: 2, md: 3 },
        minHeight: "100vh",
        backgroundColor: uiColors.bg,
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ py: 2 }} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={2} flexGrow={1} flexWrap="wrap">
            <TextField
              label="Voucher No."
              value={voucher.voucherNo}
              onChange={handleVoucherChange("voucherNo")}
              sx={{ minWidth: { xs: "100%", md: 220 } }}
            />
            <TextField
              label="Voucher Date"
              type="date"
              value={voucher.voucherDate}
              onChange={handleVoucherChange("voucherDate")}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { xs: "100%", md: 220 } }}
            />
            <TextField
              label="Payee"
              value={voucher.payee}
              onChange={handleVoucherChange("payee")}
              sx={{ minWidth: { xs: "100%", md: 360 }, flex: 1 }}
            />
            <TextField
              label="Mode of Payment"
              select
              value={voucher.modeOfPayment}
              onChange={handleVoucherChange("modeOfPayment")}
              sx={{ minWidth: { xs: "100%", md: 220 } }}
            >
              {modeOptions.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Address"
              value={voucher.address}
              onChange={handleVoucherChange("address")}
              sx={{ minWidth: { xs: "100%", md: 300 } }}
            />
            <TextField
              label="Explanation"
              value={voucher.explanation}
              onChange={handleVoucherChange("explanation")}
              sx={{ minWidth: { xs: "100%", md: 320 }, flex: 1 }}
            />
            <TextField
              label="Amount"
              type="number"
              value={voucher.amount}
              onChange={handleVoucherChange("amount")}
              sx={{ minWidth: { xs: "100%", md: 200 } }}
            />
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2} sx={{ py: 1 }}>
          <Box display="flex" gap={2} flexGrow={1} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<RestartAlt />}
              sx={{
                px: 3.5,
                backgroundColor: uiColors.navy,
                color: "white",
                "&:hover": {
                  backgroundColor: uiColors.navyHover,
                  transform: "translateY(-1px)",
                  boxShadow: "0 3px 10px rgba(15, 39, 71, 0.3)",
                },
                textTransform: "none",
                fontSize: 15,
                fontWeight: 600,
                borderRadius: "10px",
                minWidth: "130px",
                height: "44px",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(15, 39, 71, 0.2)",
              }}
              onClick={handleNewEntry}
            >
              New Entry
            </Button>

          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<LocalPrintshop />}
              onClick={handlePrintCurrentVoucher}
              sx={{
                px: 3,
                height: 44,
                fontSize: 14,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: 2,
                transition: "all 0.2s ease",
                backgroundColor: uiColors.amber,
                color: "white",
                "&:hover": {
                  backgroundColor: uiColors.amberHover,
                  transform: "translateY(-1px)",
                },
              }}
            >
              Print
            </Button>
          </Box>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          gap={3}
          sx={{
            mt: 4,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {summaryCards.map((card) => (
            <SummaryCard
              key={card.title}
              title={card.title}
              value={card.value}
              gradient={card.gradient}
            />
          ))}
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          boxShadow: 6,
          overflow: "hidden",
          "& .MuiTableCell-root": {
            py: 2,
          },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>Voucher Date</StyledTableCell>
              <StyledTableCell>Voucher No.</StyledTableCell>
              <StyledTableCell>Payee</StyledTableCell>
              <StyledTableCell>Mode of Payment</StyledTableCell>
              <StyledTableCell>Explanation</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Action</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" sx={{ color: "#486581" }}>
                    No disbursement voucher entries yet. Click `New Entry` to add one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
            {tableRows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={500}>
                    {row.voucherDate}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{row.voucherNo}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{row.payee}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={600}>
                    {row.modeOfPayment}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {row.explanation || "--"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={700} sx={{ color: "#0f6b62" }}>
                    {formatCurrency(row.amount)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ color: row.status === "NEW" ? "#0f6b62" : "#0f2747" }}
                  >
                    {row.status}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button
                    startIcon={<LocalPrintshop />}
                    size="small"
                    variant="contained"
                    onClick={() => printVoucher(row)}
                    sx={{
                      textTransform: "none",
                      px: 2,
                      py: 0.75,
                      fontSize: "0.75rem",
                      borderRadius: 2,
                      backgroundColor: "#1976d2",
                    }}
                  >
                    Print
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openEntryDialog} onClose={handleCloseEntryDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800, color: uiColors.navy }}>New Disbursement Voucher Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Voucher No."
                value={voucher.voucherNo}
                onChange={handleVoucherChange("voucherNo")}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Voucher Date"
                value={voucher.voucherDate}
                onChange={handleVoucherChange("voucherDate")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Mode of Payment"
                value={voucher.modeOfPayment}
                onChange={handleVoucherChange("modeOfPayment")}
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
                fullWidth
                label="Payee"
                value={voucher.payee}
                onChange={handleVoucherChange("payee")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={voucher.address}
                onChange={handleVoucherChange("address")}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Explanation"
                value={voucher.explanation}
                onChange={handleVoucherChange("explanation")}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Amount"
                value={voucher.amount}
                onChange={handleVoucherChange("amount")}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseEntryDialog} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateEntryAndPrint}
            sx={{
              textTransform: "none",
              backgroundColor: uiColors.navy,
              "&:hover": { backgroundColor: uiColors.navyHover },
            }}
          >
            Create & Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
