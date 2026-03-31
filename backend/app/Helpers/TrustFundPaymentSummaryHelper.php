<?php

namespace App\Helpers;

use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class TrustFundPaymentSummaryHelper
{
    public static function applyActiveFilter(Builder $query, string $alias = 'trust_fund_payment'): Builder
    {
        $qualifiedAlias = trim($alias) === '' ? 'trust_fund_payment' : $alias;

        if (Schema::hasColumn('trust_fund_payment', 'IS_CANCELLED')) {
            return $query->where(function ($statusQuery) use ($qualifiedAlias) {
                $statusQuery
                    ->whereNull("{$qualifiedAlias}.IS_CANCELLED")
                    ->orWhere("{$qualifiedAlias}.IS_CANCELLED", 0);
            });
        }

        if (Schema::hasColumn('trust_fund_payment', 'PAYMENT_STATUS_CT')) {
            return $query->where(function ($statusQuery) use ($qualifiedAlias) {
                $statusQuery
                    ->whereNull("{$qualifiedAlias}.PAYMENT_STATUS_CT")
                    ->orWhere("{$qualifiedAlias}.PAYMENT_STATUS_CT", '<>', 'CNL');
            });
        }

        return $query;
    }

    public static function applyDateFilters(Builder $query, Request $request, string $column = 'DATE'): Builder
    {
        if ($request->filled('year')) {
            $year = (int) $request->year;

            if ($request->filled('month')) {
                $month = (int) $request->month;

                if ($request->filled('day')) {
                    $start = Carbon::create($year, $month, (int) $request->day)->startOfDay();
                    $end = (clone $start)->addDay();
                } else {
                    $start = Carbon::create($year, $month, 1)->startOfMonth();
                    $end = (clone $start)->addMonth();
                }
            } else {
                $start = Carbon::create($year, 1, 1)->startOfYear();
                $end = (clone $start)->addYear();
            }

            return $query
                ->where($column, '>=', $start->toDateString())
                ->where($column, '<', $end->toDateString());
        }

        if ($request->filled('month')) {
            $query->whereMonth($column, $request->month);
        }

        if ($request->filled('day')) {
            $query->whereDay($column, $request->day);
        }

        return $query;
    }

    public static function applySearch(Builder $query, ?string $search, string $alias = 'tf'): Builder
    {
        $search = trim((string) $search);

        if ($search === '') {
            return $query;
        }

        $query->where(function ($searchQuery) use ($search, $alias) {
            $searchQuery
                ->where("{$alias}.NAME", 'like', "%{$search}%")
                ->orWhere("{$alias}.RECEIPT_NO", 'like', "%{$search}%")
                ->orWhere("{$alias}.CASHIER", 'like', "%{$search}%")
                ->orWhere("{$alias}.TYPE_OF_RECEIPT", 'like', "%{$search}%");
        });

        return $query;
    }
}
