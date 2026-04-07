<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Illuminate\Database\Query\Builder;

class QueryHelpers
{
    public static function addDateFilters(Builder $query, Request $request, $column = 'created_at')
    {
        if ($request->filled('month')) {
            $months = collect(explode(',', (string) $request->month))
                ->map(fn ($month) => (int) trim($month))
                ->filter(fn ($month) => $month >= 1 && $month <= 12)
                ->values()
                ->all();

            if (count($months) > 1) {
                $query->whereIn(\DB::raw("MONTH({$column})"), $months);
            } elseif (count($months) === 1) {
                $query->whereMonth($column, $months[0]);
            }
        }
        if ($request->filled('day')) {
            $query->whereDay($column, $request->day);
        }
        if ($request->filled('year')) {
            $query->whereYear($column, $request->year);
        }

        return $query;
    }
}
