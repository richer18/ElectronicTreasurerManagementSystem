<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ExportRealPropertyTaxAllDataToJson extends Command
{
    protected $signature = 'export:rpt-json';
    protected $description = 'Export real_property_tax_payment table to a JSON file';

    public function handle()
    {
        $this->info('📦 Exporting real_property_tax_payment to JSON...');

        $data = DB::table('real_property_tax_payment')->get();

        $jsonPath = storage_path('app/public/rpt_data.json');
        File::ensureDirectoryExists(dirname($jsonPath));
        File::put($jsonPath, json_encode($data, JSON_PRETTY_PRINT));

        $this->info('✅ Export complete: rpt_data.json');
    }
}
