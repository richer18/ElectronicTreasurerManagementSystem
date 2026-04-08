<?php

namespace App\Support;

use RuntimeException;
use SimpleXMLElement;
use ZipArchive;

class SimpleXlsxReader
{
    public function readRows(string $path): array
    {
        $zip = new ZipArchive();

        if ($zip->open($path) !== true) {
            throw new RuntimeException('Unable to open XLSX file.');
        }

        try {
            $sharedStrings = $this->readSharedStrings($zip);
            $sheetPath = $this->resolveFirstSheetPath($zip);
            $sheetXml = $zip->getFromName($sheetPath);

            if ($sheetXml === false) {
                throw new RuntimeException('Unable to read worksheet XML.');
            }

            return $this->parseSheetRows($sheetXml, $sharedStrings);
        } finally {
            $zip->close();
        }
    }

    private function readSharedStrings(ZipArchive $zip): array
    {
        $xml = $zip->getFromName('xl/sharedStrings.xml');

        if ($xml === false) {
            return [];
        }

        $document = simplexml_load_string($xml);
        if (! $document instanceof SimpleXMLElement) {
            return [];
        }

        $strings = [];

        foreach ($document->si as $item) {
            if (isset($item->t)) {
                $strings[] = (string) $item->t;
                continue;
            }

            $parts = [];
            foreach ($item->r as $run) {
                $parts[] = (string) $run->t;
            }
            $strings[] = implode('', $parts);
        }

        return $strings;
    }

    private function resolveFirstSheetPath(ZipArchive $zip): string
    {
        $workbookXml = $zip->getFromName('xl/workbook.xml');
        $relsXml = $zip->getFromName('xl/_rels/workbook.xml.rels');

        if ($workbookXml === false || $relsXml === false) {
            throw new RuntimeException('Workbook metadata is missing.');
        }

        $workbook = simplexml_load_string($workbookXml);
        $rels = simplexml_load_string($relsXml);

        if (! $workbook instanceof SimpleXMLElement || ! $rels instanceof SimpleXMLElement) {
            throw new RuntimeException('Workbook metadata is invalid.');
        }

        $workbook->registerXPathNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships');
        $sheet = $workbook->sheets->sheet[0] ?? null;

        if (! $sheet) {
            throw new RuntimeException('Workbook does not contain a worksheet.');
        }

        $relationshipId = (string) $sheet->attributes('http://schemas.openxmlformats.org/officeDocument/2006/relationships')->id;

        foreach ($rels->Relationship as $relationship) {
            if ((string) $relationship['Id'] !== $relationshipId) {
                continue;
            }

            $target = (string) $relationship['Target'];
            return str_starts_with($target, 'xl/') ? $target : 'xl/' . ltrim($target, '/');
        }

        throw new RuntimeException('Worksheet relationship could not be resolved.');
    }

    private function parseSheetRows(string $sheetXml, array $sharedStrings): array
    {
        $sheet = simplexml_load_string($sheetXml);

        if (! $sheet instanceof SimpleXMLElement || ! isset($sheet->sheetData)) {
            throw new RuntimeException('Worksheet data is invalid.');
        }

        $rows = [];

        foreach ($sheet->sheetData->row as $row) {
            $rowValues = [];
            $maxIndex = 0;

            foreach ($row->c as $cell) {
                $ref = (string) $cell['r'];
                $columnLetters = preg_replace('/\d+/', '', $ref);
                $index = $this->columnLettersToIndex($columnLetters);
                $rowValues[$index] = $this->resolveCellValue($cell, $sharedStrings);
                $maxIndex = max($maxIndex, $index);
            }

            if ($maxIndex === 0 && empty($rowValues)) {
                $rows[] = [];
                continue;
            }

            $normalized = [];
            for ($i = 1; $i <= $maxIndex; $i++) {
                $normalized[] = array_key_exists($i, $rowValues) ? trim((string) $rowValues[$i]) : null;
            }

            $rows[] = $normalized;
        }

        return $rows;
    }

    private function resolveCellValue(SimpleXMLElement $cell, array $sharedStrings): ?string
    {
        $type = (string) $cell['t'];

        if ($type === 'inlineStr') {
            return isset($cell->is->t) ? (string) $cell->is->t : null;
        }

        if (! isset($cell->v)) {
            return null;
        }

        $value = (string) $cell->v;

        if ($type === 's') {
            $sharedIndex = (int) $value;
            return $sharedStrings[$sharedIndex] ?? null;
        }

        return $value;
    }

    private function columnLettersToIndex(string $letters): int
    {
        $letters = strtoupper($letters);
        $index = 0;

        for ($i = 0, $length = strlen($letters); $i < $length; $i++) {
            $index = ($index * 26) + (ord($letters[$i]) - 64);
        }

        return $index;
    }
}
