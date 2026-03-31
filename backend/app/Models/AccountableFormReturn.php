<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountableFormReturn extends Model
{
    use HasFactory;

    protected $fillable = [
        'issued_accountable_form_id',
        'return_date',
        'collector',
        'fund',
        'form_type',
        'serial_no',
        'returned_receipt_from',
        'returned_receipt_to',
        'returned_receipt_qty',
        'processed_by',
        'returned_to',
        'custodian_received_by',
        'return_signature_reference',
        'logbook_reference_no',
        'remarks',
        'status',
    ];

    public function issuedForm()
    {
        return $this->belongsTo(IssuedAccountableForm::class, 'issued_accountable_form_id', 'ID');
    }
}
