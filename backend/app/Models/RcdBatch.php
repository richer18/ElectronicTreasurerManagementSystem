<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RcdBatch extends Model
{
    use HasFactory;

    protected $table = 'rcd_batches';

    protected $fillable = [
        'report_date',
        'collector',
        'status',
        'total_amount',
        'entry_count',
        'submitted_at',
        'reviewed_at',
        'deposited_at',
        'reviewed_by',
        'deposit_reference',
        'remarks',
    ];
}
