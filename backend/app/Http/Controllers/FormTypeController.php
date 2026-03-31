<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class FormTypeController extends Controller
{
    public function index()
    {
        return DB::table('t_ortype')
            ->selectRaw('CODE as id, CODE as code, DESCRIPTION as name, DESCRIPTION as description')
            ->orderBy('DESCRIPTION')
            ->get();
    }
}
