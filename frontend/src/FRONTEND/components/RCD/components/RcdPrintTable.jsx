import React, { useRef, useEffect, useState } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";

const text10 = { fontSize: "10px" };
const text9 = { fontSize: "9px" };
const text8 = { fontSize: "8px" };
const thinBorder = "0.5px solid #222";
const thinCellBorder = { border: thinBorder };

/**
 * RcdPrintTable Component
 * Renders the official Report of Collection and Deposit form.
 * Uses a CDN for html2pdf to avoid build-time resolution issues.
 */
function RcdPrintTable({ payload, onClose }) {
  const printRef = useRef(null);
  const [libReady, setLibReady] = useState(false);

  useEffect(() => {
    // Load html2pdf from CDN dynamically to avoid "Could not resolve" errors
    if (!window.html2pdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.async = true;
      script.onload = () => setLibReady(true);
      document.body.appendChild(script);
    } else {
      setLibReady(true);
    }
  }, []);

  if (!payload) return null;

  const header = payload.header || {};
  const formattedDate = payload.formattedDate || "";
  const shortDate = payload.shortDate || "";
  const collections = payload.collections || [];
  const totalCollections = Number(payload.totalCollections || 0);
  const autoAccountability = payload.autoAccountability || [];
  const accountableOfficerName = "Amabella S. Ramos";

  const handleLocalPrint = () => {
    const printContents = printRef.current?.querySelector("#printableArea")?.outerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <html>
        <head>
          <title>RCD_Report_${formattedDate || "Print"}</title>
          ${styles}
          <style>
            @page { size: auto; margin: 10mm; }
            html, body { width: 100%; margin: 0; padding: 0; background: #fff; }
            body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            #printableArea { width: 100% !important; margin: 0 auto !important; }
            table { border-collapse: collapse; width: 100%; border: 1px solid black !important; }
            th, td { border: 1px solid black !important; padding: 4px !important; }
            .no-print { display: none !important; }
            .bg-light { background-color: #f8f9fa !important; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleLocalSavePdf = async () => {
    if (!window.html2pdf) {
      console.error("PDF Library not loaded yet");
      return;
    }
    const previewElement = printRef.current?.querySelector("#rcd-print-preview-root");
    if (!previewElement) return;

    const collector = header.officer || "collector";
    const datePart = (formattedDate || "").replace(/[^a-zA-Z0-9]+/g, "-");
    const filename = `RCD-${collector.replace(/\s+/g, "_")}-${datePart}.pdf`;

    const options = {
      margin: 8,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    window.html2pdf().set(options).from(previewElement).save();
  };

  return (
    <div ref={printRef} className="p-3 bg-light min-vh-100">
      <div className="d-flex align-items-center justify-content-between mb-3 no-print container-fluid" style={{ maxWidth: "8.5in" }}>
        <h5 className="m-0 fw-bold text-primary">Official RCD Preview</h5>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            Close
          </button>
          <button 
            type="button" 
            className="btn btn-sm btn-outline-dark" 
            onClick={handleLocalSavePdf}
            disabled={!libReady}
          >
            {libReady ? "Save PDF" : "Loading PDF Lib..."}
          </button>
          <button type="button" className="btn btn-sm btn-primary px-4" onClick={handleLocalPrint}>
            Print Report
          </button>
        </div>
      </div>

      <div id="printableArea">
        <Container
        >
          <style>
            {`
              @media print { .no-print { display: none !important; } }
              .font-monospace { font-family: monospace !important; }
              .decoration-double { text-decoration-style: double; text-decoration-line: underline; }
              .leading-normal { line-height: 1.5; }
              table { border-color: #222 !important; border-width: 0.5px !important; }
              th, td { border-color: #222 !important; border-width: 0.5px !important; }
              .table-bordered > :not(caption) > * > * {
                border-width: 0.5px !important;
              }
            `}
          </style>

          {/* Header */}
          <div className="text-center mb-3">
            <h1 className="fw-bold mb-1" style={{ fontSize: "14px", letterSpacing: "0.02em" }}>
              REPORT OF COLLECTION AND DEPOSIT
            </h1>
            <h2 className="text-decoration-underline fw-bold mb-1 text-uppercase" style={{ fontSize: "12px", letterSpacing: "0.15em" }}>
              {header.municipality || "MUNICIPALITY OF ZAMBOANGUITA"}
            </h2>
            <p className="mb-0 fw-medium" style={text10}>LGU</p>
          </div>

          <Row className="pt-2 mb-2" style={text10}>
            <Col xs={8}>
              <div className="d-flex align-items-center mb-2">
                <span style={{ width: 48 }}>Fund:</span>
                <span className="border-bottom border-black fw-bold flex-grow-1 px-1">{header.fund || "General Fund"}</span>
              </div>
              <div className="d-flex align-items-center">
                <span style={{ width: 145, whiteSpace: "nowrap" }}>Name of Accountable Officer:</span>
                <span className="border-bottom border-black fw-bold text-uppercase flex-grow-1 px-1">{header.officer}</span>
              </div>
            </Col>
            <Col xs={4} className="ps-4">
              <div className="d-flex align-items-center mb-2">
                <span style={{ width: 48 }}>Date:</span>
                <span className="border-bottom border-black fw-bold text-center text-uppercase flex-grow-1">{formattedDate}</span>
              </div>
              <div className="d-flex align-items-center">
                <span style={{ width: 72, whiteSpace: "nowrap" }}>Report No.</span>
                <span className="border-bottom border-black fw-bold flex-grow-1 text-center">{header.reportNo || "  "}</span>
              </div>
            </Col>
          </Row>

          {/* Part A */}
          <div className="mb-0" style={{ border: thinBorder }}>
            <div className="px-2 py-1 fw-bold bg-light" style={{ fontSize: "11px", borderBottom: thinBorder }}>
              A. COLLECTIONS
            </div>
            <div className="px-4 py-1 fw-medium fst-italic" style={{ ...text10, borderBottom: thinBorder }}>
              1. For Collectors
            </div>
            <Table responsive={false} className="mb-0" style={{ ...text10, tableLayout: "fixed" }}>
              <thead>
                <tr className="text-center align-middle">
                  <th style={{ ...thinCellBorder, width: "28%" }} className="fw-normal">Type (Form No.)</th>
                  <th colSpan={2} style={thinCellBorder} className="fw-normal">Official Receipt/Serial No.</th>
                  <th style={{ ...thinCellBorder, width: "24%" }} className="fw-normal">Amount</th>
                </tr>
                <tr className="text-center" style={text9}>
                  <th style={thinCellBorder}></th>
                  <th className="fw-normal" style={{ ...thinCellBorder, width: "18%" }}>From</th>
                  <th className="fw-normal" style={{ ...thinCellBorder, width: "18%" }}>To</th>
                  <th style={thinCellBorder}></th>
                </tr>
              </thead>
              <tbody>
                {collections.length > 0 ? collections.map((item, i) => (
                  <tr key={i}>
                    <td className="px-2 text-uppercase text-truncate" style={{ ...thinCellBorder, ...text9 }}>{item.type}</td>
                    <td className="text-center font-monospace" style={thinCellBorder}>{item.from}</td>
                    <td className="text-center font-monospace" style={thinCellBorder}>{item.to}</td>
                    <td className="text-end px-2 fw-bold" style={thinCellBorder}>
                      {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ) ) : (
                  <tr><td colSpan={4} className="text-center text-muted fst-italic py-2" style={thinCellBorder}>No collections recorded</td></tr>
                )}
                <tr className="fw-bold">
                  <td colSpan={3} className="text-end px-3 py-2" style={{ ...thinCellBorder, ...text10 }}>TOTAL COLLECTIONS (PHP)</td>
                  <td className="text-end px-2 py-2 text-decoration-underline decoration-double" style={thinCellBorder}>
                    {totalCollections.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>

          <div style={{ borderLeft: thinBorder, borderRight: thinBorder, borderBottom: thinBorder }}>
            <div className="px-4 py-1 fw-medium fst-italic" style={{ ...text10, borderBottom: thinBorder }}>
              2. For Liquidating Officers/Treasurer
            </div>
            <Table responsive={false} className="mb-0" style={{ ...text10, tableLayout: "fixed" }}>
              <tbody>
                <tr className="text-center fw-normal" style={text9}>
                  <td style={{ ...thinCellBorder, width: "45%" }}>Name of Accountable Officer</td>
                  <td style={{ ...thinCellBorder, width: "20%" }}>Report No.</td>
                  <td style={{ ...thinCellBorder, width: "35%" }}>Amount</td>
                </tr>
                <tr>
                  <td className="fw-bold text-uppercase text-center py-2" style={{ ...thinCellBorder, ...text9 }}>{accountableOfficerName}</td>
                  <td style={thinCellBorder}></td>
                  <td className="text-end px-2 fw-bold" style={thinCellBorder}>
                    {Number(0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </Table>
            <Table responsive={false} className="mb-0" style={{ ...text10, tableLayout: "fixed" }}>
              <tbody>
                <tr className="text-center fw-normal" style={text9}>
                  <td style={{ ...thinCellBorder, width: "45%" }}>Accountable Officer/Bank</td>
                  <td style={{ ...thinCellBorder, width: "20%" }}>Reference</td>
                  <td style={{ ...thinCellBorder, width: "35%" }}></td>
                </tr>
                <tr>
                  <td className="fw-bold text-uppercase text-center py-2" style={{ ...thinCellBorder, ...text9 }}>{header.bank || header.treasurer}</td>
                  <td className="fst-italic text-center" style={thinCellBorder}>{header.reference || "OR's"}</td>
                  <td style={thinCellBorder}></td>
                </tr>
              </tbody>
            </Table>
          </div>

          {/* Part C */}
          <div style={{ borderLeft: thinBorder, borderRight: thinBorder, borderBottom: thinBorder }}>
            <div className="px-2 py-1 fw-bold bg-light" style={{ fontSize: "11px", borderBottom: thinBorder }}>
              C. ACCOUNTABILITY OF ACCOUNTABLE FORMS
            </div>
            <Table responsive={false} className="mb-0 text-center" style={{ ...text8, tableLayout: "fixed", lineHeight: 1.1 }}>
              <thead>
                <tr className="text-uppercase align-middle">
                  <th rowSpan={2} style={{ ...thinCellBorder, width: "16%" }}>Name of Form</th>
                  <th colSpan={3} style={{ ...thinCellBorder, width: "21%" }}>Beg. Balance</th>
                  <th colSpan={3} style={{ ...thinCellBorder, width: "21%" }}>Receipt</th>
                  <th colSpan={3} style={{ ...thinCellBorder, width: "21%" }}>Issued</th>
                  <th colSpan={3} style={{ ...thinCellBorder, width: "21%" }}>Ending Balance</th>
                </tr>
                <tr style={{ fontSize: "7px" }}>
                  <th style={thinCellBorder}>QTY</th><th style={thinCellBorder}>From</th><th style={thinCellBorder}>To</th>
                  <th style={thinCellBorder}>QTY</th><th style={thinCellBorder}>From</th><th style={thinCellBorder}>To</th>
                  <th style={thinCellBorder}>QTY</th><th style={thinCellBorder}>From</th><th style={thinCellBorder}>To</th>
                  <th style={thinCellBorder}>QTY</th><th style={thinCellBorder}>From</th><th style={thinCellBorder}>To</th>
                </tr>
              </thead>
              <tbody>
                {autoAccountability.map((item, idx) => (
                  <tr key={idx}>
                    <td className="text-start px-1 text-uppercase fw-medium text-truncate" style={thinCellBorder}>{item.name}</td>
                    <td className="text-secondary fst-italic" style={thinCellBorder}>{item.begQty || 0}</td>
                    <td className="text-secondary font-monospace" style={thinCellBorder}>{item.begFrom || "-"}</td>
                    <td className="text-secondary font-monospace" style={thinCellBorder}>{item.begTo || "-"}</td>
                    <td className="fw-bold" style={thinCellBorder}>{item.recQty || 0}</td>
                    <td className="font-monospace" style={thinCellBorder}>{item.recFrom || "-"}</td>
                    <td className="font-monospace" style={thinCellBorder}>{item.recTo || "-"}</td>
                    <td className="fw-bold text-danger" style={thinCellBorder}>{item.issuedQty || 0}</td>
                    <td className="font-monospace text-danger" style={thinCellBorder}>{item.issuedFrom || "-"}</td>
                    <td className="font-monospace text-danger" style={thinCellBorder}>{item.issuedTo || "-"}</td>
                    <td className="fw-bold bg-light" style={thinCellBorder}>{item.endQty || 0}</td>
                    <td className="font-monospace bg-light" style={thinCellBorder}>{item.endFrom || "-"}</td>
                    <td className="font-monospace bg-light" style={thinCellBorder}>{item.endTo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

           {/* Summary Section */}
          <div className="mb-3" style={{ borderLeft: thinBorder, borderRight: thinBorder, borderBottom: thinBorder }}>
            <div className="px-2 py-1 fw-bold text-uppercase bg-light" style={{ fontSize: "11px", borderBottom: thinBorder }}>
              Summary of Collections and Remittances
            </div>
            <Row className="g-0" style={text10}>
              <Col xs={7} className="p-3 fw-medium">
                <div style={{ lineHeight: '1.8' }}>
                  <p className="mb-0">Beginning Balance</p>
                  <p className="mb-0">Add: Collection</p>
                  <p className="mb-0">Less: Remittance/Deposit to Cashier/Treasury/Depository Bank</p>
                  <p className="mb-0">Ending Balance</p>
                   <p className="fw-bolder" style={{ fontSize: '11px', marginLeft: 'auto', marginRight: 'auto' }}>TOTAL</p>
                </div>
              </Col>
              <Col xs={5} className="p-3 d-flex flex-column" style={{ lineHeight: '1.8', borderLeft: thinBorder }}>
                {/* 4 Rows of Underlines */}
                <div className="w-100" style={{ height: '1.8em', borderBottom: thinBorder }}></div>
                
                <div className="w-100 d-flex justify-content-between fw-bold" style={{ height: '1.8em', borderBottom: thinBorder }}>
                  <span className="ps-2">PHP</span>
                  <span className="pe-2">{totalCollections.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="w-100" style={{ height: '1.8em', borderBottom: thinBorder }}></div>
                
                <div className="w-100" style={{ height: '1.8em', borderBottom: thinBorder }}></div>

                

              </Col>
            </Row>
          </div>


          {/* Signatures */}
          <Row className="g-0" style={{ minHeight: 180, border: thinBorder }}>
            <Col xs={6} className="p-3 d-flex flex-column justify-content-between bg-white" style={{ borderRight: thinBorder }}>
              <div>
                <p className="fw-bold text-uppercase mb-2" style={{ fontSize: '11px' }}>CERTIFICATION</p>
                <p className="ps-2" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                  I hereby certify that the foregoing report of collections and deposits and accountability of accountable form is true and correct.
                </p>
              </div>
              <Row className="mt-4 text-center px-2">
                <Col xs={8}>
                  <p className="border-bottom border-black mb-1 fw-bold text-uppercase" style={{ fontSize: '10.5px' }}>{header.officer}</p>
                  <p className="mb-0 fw-medium text-uppercase" style={{ fontSize: '8px' }}>Accountable Officer</p>
                </Col>
                <Col xs={4}>
                  <p className="border-bottom border-black mb-1 fw-bold" style={{ fontSize: '10.5px' }}>{shortDate}</p>
                  <p className="mb-0 fw-medium text-uppercase" style={{ fontSize: '8px' }}>Date</p>
                </Col>
              </Row>
            </Col>
            <Col xs={6} className="p-3 d-flex flex-column justify-content-between bg-white">
              <div>
                <p className="fw-bold text-uppercase mb-2" style={{ fontSize: '11px' }}>VERIFICATION AND ACKNOWLEDGMENT</p>
                <p className="ps-2" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                  I hereby certify that the foregoing report of collections has been verified and acknowledge receipt of PHP ____________________ .
                </p>
              </div>
              <Row className="mt-4 text-center px-2">
                <Col xs={8}>
                  <p className="border-bottom border-black mb-1 fw-bold text-uppercase" style={{ fontSize: '10.5px' }}>{header.treasurer}</p>
                  <p className="mb-0 fw-medium text-uppercase" style={{ fontSize: '8px' }}>Municipal Treasurer</p>
                </Col>
                <Col xs={4}>
                  <p className="border-bottom border-black mb-1 fw-bold" style={{ fontSize: '10.5px' }}>{shortDate}</p>
                  <p className="mb-0 fw-medium text-uppercase" style={{ fontSize: '8px' }}>Date</p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default RcdPrintTable;
