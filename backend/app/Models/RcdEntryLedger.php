<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RcdEntryLedger extends Model
{
    use HasFactory;

    protected $table = 'rcd_entry_ledgers';

    protected $fillable = [
        'rcd_entry_id',
        'issued_accountable_form_id',
        'batch_id',
        'flow_mode',
        'issued_date',
        'collector',
        'fund',
        'type_of_receipt',
        'serial_no',
        'receipt_no_from',
        'receipt_no_to',
        'issued_qty',
        'total',
        'status',
        'balance_after_qty',
        'balance_after_from',
        'balance_after_to',
    ];
}
