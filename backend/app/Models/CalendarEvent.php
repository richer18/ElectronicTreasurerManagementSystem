<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalendarEvent extends Model
{
    protected $fillable = [
        'title',
        'description',
        'start_at',
        'end_at',
        'all_day',
        'is_system',
        'category',
        'holiday_type',
        'color',
        'attachment_path',
        'attachment_name',
        'attachment_mime',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'all_day' => 'boolean',
        'is_system' => 'boolean',
    ];
}
