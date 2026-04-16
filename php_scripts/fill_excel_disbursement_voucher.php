<?php

declare(strict_types=1);

const SPREADSHEET_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PKG_REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';

function request_value(string $key, ?string $default = ''): ?string
{
    $value = $_POST[$key] ?? $_GET[$key] ?? $default;

    if ($value === null) {
        return null;
    }

    return is_string($value) ? trim($value) : (string) $value;
}

function request_json_array(string $key): array
{
    $raw = request_value($key, '');
    if ($raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);

    return is_array($decoded) ? $decoded : [];
}

function cell_text(?string $label, ?string $value): string
{
    $value = trim((string) $value);
    if ($label === null || $label === '') {
        return $value;
    }

    return $value === '' ? $label : $label . "\n" . $value;
}

function mode_mark(string $selected, string $expected): string
{
    return strcasecmp(trim($selected), trim($expected)) === 0 ? 'X' : '';
}

function workbook_sheet_path(ZipArchive $zip, string $sheetName = 'DV'): string
{
    $workbook = new DOMDocument();
    $workbook->loadXML($zip->getFromName('xl/workbook.xml'));
    $rels = new DOMDocument();
    $rels->loadXML($zip->getFromName('xl/_rels/workbook.xml.rels'));

    $sheetXPath = new DOMXPath($workbook);
    $sheetXPath->registerNamespace('m', SPREADSHEET_NS);
    $sheetXPath->registerNamespace('r', REL_NS);

    $relsXPath = new DOMXPath($rels);
    $relsXPath->registerNamespace('rel', PKG_REL_NS);

    $sheetNode = $sheetXPath->query(sprintf('/m:workbook/m:sheets/m:sheet[@name="%s"]', $sheetName))->item(0);
    if (!$sheetNode instanceof DOMElement) {
        throw new RuntimeException("Sheet '{$sheetName}' not found in workbook.");
    }

    $relationshipId = $sheetNode->getAttributeNS(REL_NS, 'id');
    $relationship = $relsXPath->query(sprintf('/rel:Relationships/rel:Relationship[@Id="%s"]', $relationshipId))->item(0);

    if (!$relationship instanceof DOMElement) {
        throw new RuntimeException("Relationship for sheet '{$sheetName}' not found.");
    }

    $target = $relationship->getAttribute('Target');

    return str_starts_with($target, 'xl/') ? $target : 'xl/' . ltrim($target, '/');
}

function column_index(string $letters): int
{
    $letters = strtoupper($letters);
    $index = 0;

    foreach (str_split($letters) as $char) {
        $index = ($index * 26) + (ord($char) - 64);
    }

    return $index;
}

function split_cell_reference(string $reference): array
{
    if (!preg_match('/^([A-Z]+)(\d+)$/i', $reference, $matches)) {
        throw new InvalidArgumentException("Invalid cell reference: {$reference}");
    }

    return [strtoupper($matches[1]), (int) $matches[2]];
}

function ensure_row(DOMDocument $xml, DOMXPath $xpath, DOMElement $sheetData, int $rowNumber): DOMElement
{
    $row = $xpath->query(sprintf('./m:row[@r="%d"]', $rowNumber), $sheetData)->item(0);
    if ($row instanceof DOMElement) {
        return $row;
    }

    $row = $xml->createElementNS(SPREADSHEET_NS, 'row');
    $row->setAttribute('r', (string) $rowNumber);

    $insertBefore = null;
    foreach ($sheetData->childNodes as $child) {
        if (!$child instanceof DOMElement || $child->localName !== 'row') {
            continue;
        }

        if ((int) $child->getAttribute('r') > $rowNumber) {
            $insertBefore = $child;
            break;
        }
    }

    if ($insertBefore instanceof DOMNode) {
        $sheetData->insertBefore($row, $insertBefore);
    } else {
        $sheetData->appendChild($row);
    }

    return $row;
}

function ensure_cell(DOMDocument $xml, DOMXPath $xpath, DOMElement $row, string $reference): DOMElement
{
    $cell = $xpath->query(sprintf('./m:c[@r="%s"]', $reference), $row)->item(0);
    if ($cell instanceof DOMElement) {
        return $cell;
    }

    [$column] = split_cell_reference($reference);
    $targetIndex = column_index($column);

    $cell = $xml->createElementNS(SPREADSHEET_NS, 'c');
    $cell->setAttribute('r', $reference);

    $insertBefore = null;
    foreach ($row->childNodes as $child) {
        if (!$child instanceof DOMElement || $child->localName !== 'c') {
            continue;
        }

        [$childColumn] = split_cell_reference($child->getAttribute('r'));
        if (column_index($childColumn) > $targetIndex) {
            $insertBefore = $child;
            break;
        }
    }

    if ($insertBefore instanceof DOMNode) {
        $row->insertBefore($cell, $insertBefore);
    } else {
        $row->appendChild($cell);
    }

    return $cell;
}

function set_cell_value(DOMDocument $xml, DOMXPath $xpath, DOMElement $sheetData, string $reference, string $value): void
{
    [$column, $rowNumber] = split_cell_reference($reference);
    $row = ensure_row($xml, $xpath, $sheetData, $rowNumber);
    $cell = ensure_cell($xml, $xpath, $row, $reference);

    while ($cell->firstChild) {
        $cell->removeChild($cell->firstChild);
    }

    $cell->setAttribute('t', 'inlineStr');
    $inlineString = $xml->createElementNS(SPREADSHEET_NS, 'is');
    $textNode = $xml->createElementNS(SPREADSHEET_NS, 't');
    if (preg_match('/^\s|\s$|\n/', $value)) {
        $textNode->setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
    }
    $textNode->appendChild($xml->createTextNode($value));
    $inlineString->appendChild($textNode);
    $cell->appendChild($inlineString);
}

function set_cell_style(DOMDocument $xml, DOMXPath $xpath, DOMElement $sheetData, string $reference, int $styleId): void
{
    [, $rowNumber] = split_cell_reference($reference);
    $row = ensure_row($xml, $xpath, $sheetData, $rowNumber);
    $cell = ensure_cell($xml, $xpath, $row, $reference);
    $cell->setAttribute('s', (string) $styleId);
}

function build_particulars_lines(array $rows, string $valueKey): string
{
    $lines = [];

    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }

        $value = trim((string) ($row[$valueKey] ?? ''));
        if ($value !== '') {
            $lines[] = $value;
        }
    }

    return implode("\n", $lines);
}

function output_workbook(string $filePath): void
{
    header('Content-Description: File Transfer');
    header('Content-Type: application/vnd.ms-excel.sheet.macroEnabled.12');
    header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Pragma: public');
    readfile($filePath);
    exit;
}

$templatePath = __DIR__ . '/../template/Voucher/DisbursementVoucher.xlsm';
if (!file_exists($templatePath)) {
    http_response_code(500);
    exit('Template file not found.');
}

$particulars = request_json_array('particulars');
$journalRows = request_json_array('journal_rows');

$voucherNo = request_value('voucher_no');
$voucherDate = request_value('voucher_date');
$modeOfPayment = request_value('mode_of_payment', 'Check');
$payee = request_value('payee');
$tinEmployeeNo = request_value('tin_employee_no');
$obligationRequestNo = request_value('obligation_request_no');
$address = request_value('address');
$responsibilityCenter = request_value('responsibility_center');
$officeUnitProject = request_value('office_unit_project');
$code = request_value('code');
$fundsAvailable = request_value('funds_available');

$certifiedAName = request_value('certified_a_name', 'JOSELITO M. TINAYTINAY');
$certifiedADate = request_value('certified_a_date');
$certifiedAPosition1 = request_value('certified_a_position_1', 'Municipal Accountant');
$certifiedAPosition2 = request_value('certified_a_position_2', 'Head, Accounting Unit/Authorized Representative');
$certifiedBName = request_value('certified_b_name', 'PAUL REE AMBROSE A. MARTINEZ');
$certifiedBDate = request_value('certified_b_date');
$certifiedBPosition = request_value('certified_b_position', 'Municipal Treasurer');

$approvedName = request_value('approved_name', 'JONAH PAT L. AVILES');
$approvedDate = request_value('approved_date');
$approvedPosition1 = request_value('approved_position_1', 'Municipal Mayor');
$approvedPosition2 = request_value('approved_position_2', 'Agency Head/Authorized Representative');

$checkNo = request_value('check_no');
$bankName = request_value('bank_name');
$receivedDate = request_value('received_date');
$receivedName = request_value('received_name');
$orOtherDocuments = request_value('or_other_documents');
$jevNo = request_value('jev_no');
$jevDate = request_value('jev_date');
$journalMode = request_value('journal_mode', 'Check Disbursement');

$approvedFooterName = request_value('approved_footer_name', 'JOSELITO M. TINAYTINAY');
$approvedFooterPosition = request_value('approved_footer_position', 'Municipal Accountant');

$tempFile = tempnam(sys_get_temp_dir(), 'dv_xlsm_');
$outputFile = $tempFile . '.xlsm';
copy($templatePath, $outputFile);
@unlink($tempFile);

$zip = new ZipArchive();
if ($zip->open($outputFile) !== true) {
    http_response_code(500);
    exit('Unable to open output workbook.');
}

$sheetPath = workbook_sheet_path($zip, 'DV');
$sheetXml = new DOMDocument();
$sheetXml->preserveWhiteSpace = false;
$sheetXml->formatOutput = false;
$sheetXml->loadXML($zip->getFromName($sheetPath));

$xpath = new DOMXPath($sheetXml);
$xpath->registerNamespace('m', SPREADSHEET_NS);
$sheetData = $xpath->query('/m:worksheet/m:sheetData')->item(0);

if (!$sheetData instanceof DOMElement) {
    $zip->close();
    http_response_code(500);
    exit('Invalid worksheet structure.');
}

$cellMap = [
    'I4' => cell_text('No.', $voucherNo),
    'I5' => cell_text('Date:', $voucherDate),
    'B8' => $payee ?? '',
    'F8' => cell_text('TIN/Employee No.', $tinEmployeeNo),
    'I9' => cell_text('No.', $obligationRequestNo),
    'B10' => $address ?? '',
    'F10' => cell_text('Responsibility Center', $responsibilityCenter),
    'F11' => cell_text('Office/Unit/Project:', $officeUnitProject),
    'I11' => cell_text('Code', $code),
    'A13' => build_particulars_lines($particulars, 'description'),
    'I13' => build_particulars_lines($particulars, 'amount'),
    'E21' => cell_text('Funds Available', $fundsAvailable),
    'B27' => $certifiedAName ?? '',
    'D27' => cell_text('Date', $certifiedADate),
    'F27' => $certifiedBName ?? '',
    'J27' => cell_text('Date:', $certifiedBDate),
    'B29' => $certifiedAPosition1 ?? '',
    'B30' => $certifiedAPosition2 ?? '',
    'F29' => $certifiedBPosition ?? '',
    'B34' => $approvedName ?? '',
    'D34' => cell_text('Date', $approvedDate),
    'F34' => $receivedName ?? '',
    'E32' => cell_text("Check\nNo.", $checkNo),
    'F32' => cell_text('Bank Name', $bankName),
    'J32' => cell_text('Date:', $receivedDate),
    'J33' => cell_text('Date:', $receivedDate),
    'B36' => $approvedPosition1 ?? '',
    'B37' => $approvedPosition2 ?? '',
    'E36' => cell_text('OR/Other Documents', $orOtherDocuments),
    'H36' => cell_text('JEV No.', $jevNo),
    'J36' => cell_text('Date:', $jevDate),
    'F38' => cell_text('No.', $jevNo),
    'F39' => cell_text('Date.', $jevDate),
    'C48' => $approvedFooterName ?? '',
    'C49' => $approvedFooterPosition ?? '',
];

$journalCellRefs = [
    ['A43', 'B43', 'E43', 'F43', 'G43', 'I43'],
    ['A44', 'B44', 'E44', 'F44', 'G44', 'I44'],
    ['A45', 'B45', 'E45', 'F45', 'G45', 'I45'],
    ['A46', 'B46', 'E46', 'F46', 'G46', 'I46'],
];

foreach ($journalCellRefs as $index => $refs) {
    $row = $journalRows[$index] ?? [];
    if (!is_array($row)) {
        continue;
    }

    $cellMap[$refs[0]] = trim((string) ($row['responsibility_center'] ?? ''));
    $cellMap[$refs[1]] = trim((string) ($row['account_explanation'] ?? ''));
    $cellMap[$refs[2]] = trim((string) ($row['account_code'] ?? ''));
    $cellMap[$refs[3]] = trim((string) ($row['ref'] ?? ''));
    $cellMap[$refs[4]] = trim((string) ($row['debit'] ?? ''));
    $cellMap[$refs[5]] = trim((string) ($row['credit'] ?? ''));
}

foreach ($cellMap as $reference => $value) {
    if ($value === null) {
        continue;
    }

    set_cell_value($sheetXml, $xpath, $sheetData, $reference, $value);
}

set_cell_value($sheetXml, $xpath, $sheetData, 'B6', mode_mark($modeOfPayment ?? '', 'Check'));
set_cell_value($sheetXml, $xpath, $sheetData, 'D6', mode_mark($modeOfPayment ?? '', 'Cash'));
set_cell_value($sheetXml, $xpath, $sheetData, 'F6', mode_mark($modeOfPayment ?? '', 'Others'));
set_cell_style($sheetXml, $xpath, $sheetData, 'B6', 95);
set_cell_style($sheetXml, $xpath, $sheetData, 'D6', 160);
set_cell_style($sheetXml, $xpath, $sheetData, 'F6', 105);

set_cell_value($sheetXml, $xpath, $sheetData, 'B40', mode_mark($journalMode ?? '', 'Collection'));
set_cell_value($sheetXml, $xpath, $sheetData, 'D40', mode_mark($journalMode ?? '', 'Check Disbursement'));
set_cell_value($sheetXml, $xpath, $sheetData, 'F40', mode_mark($journalMode ?? '', 'Cash Disbursement'));
set_cell_value($sheetXml, $xpath, $sheetData, 'I40', mode_mark($journalMode ?? '', 'Others'));
set_cell_style($sheetXml, $xpath, $sheetData, 'B40', 60);
set_cell_style($sheetXml, $xpath, $sheetData, 'D40', 60);
set_cell_style($sheetXml, $xpath, $sheetData, 'F40', 125);
set_cell_style($sheetXml, $xpath, $sheetData, 'I40', 125);

$zip->addFromString($sheetPath, $sheetXml->saveXML());
$zip->close();

output_workbook($outputFile);
