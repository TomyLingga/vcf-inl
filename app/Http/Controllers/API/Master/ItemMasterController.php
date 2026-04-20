<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\ItemKelengkapanSupir;
use App\Models\ItemMuatan;
use App\Models\ItemPemeriksaanMasuk;
use App\Models\ItemPemeriksaanKeluar;
use Illuminate\Http\Request;

// ─────────────────────────────────────────────────────────────────────────────
// ItemKelengkapanSupirController
// ─────────────────────────────────────────────────────────────────────────────
class ItemKelengkapanSupirController extends Controller
{
    public function index(Request $request)
    {

    }

    public function store(Request $request)
    {

    }

    public function show(ItemKelengkapanSupir $itemKelengkapanSupir)
    {
        return response()->json($itemKelengkapanSupir);
    }

    public function update(Request $request, ItemKelengkapanSupir $itemKelengkapanSupir)
    {

    }

    public function destroy(ItemKelengkapanSupir $itemKelengkapanSupir)
    {

    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ItemMuatanController
// ─────────────────────────────────────────────────────────────────────────────
class ItemMuatanController extends Controller
{
    public function index(Request $request)
    {

    }

    public function store(Request $request)
    {

    }

    public function show(ItemMuatan $itemMuatan)
    {
        return response()->json($itemMuatan);
    }

    public function update(Request $request, ItemMuatan $itemMuatan)
    {

    }

    public function destroy(ItemMuatan $itemMuatan)
    {

    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ItemPemeriksaanMasukController
// ─────────────────────────────────────────────────────────────────────────────
class ItemPemeriksaanMasukController extends Controller
{
    public function index(Request $request)
    {

    }

    public function store(Request $request)
    {

    }

    public function show(ItemPemeriksaanMasuk $itemPemeriksaanMasuk)
    {
        return response()->json($itemPemeriksaanMasuk);
    }

    public function update(Request $request, ItemPemeriksaanMasuk $itemPemeriksaanMasuk)
    {

    }

    public function destroy(ItemPemeriksaanMasuk $itemPemeriksaanMasuk)
    {

    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ItemPemeriksaanKeluarController
// ─────────────────────────────────────────────────────────────────────────────
class ItemPemeriksaanKeluarController extends Controller
{
    public function index(Request $request)
    {

    }

    public function store(Request $request)
    {

    }

    public function show(ItemPemeriksaanKeluar $itemPemeriksaanKeluar)
    {
        return response()->json($itemPemeriksaanKeluar);
    }

    public function update(Request $request, ItemPemeriksaanKeluar $itemPemeriksaanKeluar)
    {

    }

    public function destroy(ItemPemeriksaanKeluar $itemPemeriksaanKeluar)
    {

    }
}
