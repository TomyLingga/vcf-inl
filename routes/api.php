<?php

use Illuminate\Support\Facades\Route;

// Auth
use App\Http\Controllers\API\AuthController;

// Master
use App\Http\Controllers\API\Master\TransporterController;
use App\Http\Controllers\API\Master\DriverController;
use App\Http\Controllers\API\Master\JenisKendaraanController;
use App\Http\Controllers\API\Master\LogistikController;
use App\Http\Controllers\API\Master\ProdukController;
use App\Http\Controllers\API\Master\UserController;
use App\Http\Controllers\API\Master\ItemKelengkapanSupirController;
use App\Http\Controllers\API\Master\ItemMuatanController;
use App\Http\Controllers\API\Master\ItemPemeriksaanMasukController;
use App\Http\Controllers\API\Master\ItemPemeriksaanKeluarController;

// VCF
use App\Http\Controllers\API\VCF\VcfBagian1Controller;
use App\Http\Controllers\API\VCF\VcfBagian2Controller;
use App\Http\Controllers\API\VCF\VcfBagian3Controller;
use App\Http\Controllers\API\VCF\VcfBagian4Controller;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes (semua role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    /*
    |----------------------------------------------------------------------
    | Master — Read-only untuk petugas, full CRUD untuk admin
    |----------------------------------------------------------------------
    */

    Route::middleware(['petugas'])->group(function () {
        Route::get('/master/transporters', [TransporterController::class, 'index']);
        Route::get('/master/transporters/{transporter}', [TransporterController::class, 'show']);

        Route::get('/master/drivers', [DriverController::class, 'index']);
        Route::get('/master/drivers/{driver}', [DriverController::class, 'show']);

        Route::get('/master/jenis-kendaraan', [JenisKendaraanController::class, 'index']);
        Route::get('/master/jenis-kendaraan/{jenisKendaraan}', [JenisKendaraanController::class, 'show']);

        Route::get('/master/logistik', [LogistikController::class, 'index']);
        Route::get('/master/logistik/{logistik}', [LogistikController::class, 'show']);

        Route::get('/master/produk', [ProdukController::class, 'index']);
        Route::get('/master/produk/{produk}', [ProdukController::class, 'show']);

        Route::get('/master/item-kelengkapan-supir', [ItemKelengkapanSupirController::class, 'index']);
        Route::get('/master/item-kelengkapan-supir/{itemKelengkapanSupir}', [ItemKelengkapanSupirController::class, 'show']);

        Route::get('/master/item-muatan', [ItemMuatanController::class, 'index']);
        Route::get('/master/item-muatan/{itemMuatan}', [ItemMuatanController::class, 'show']);

        Route::get('/master/item-pemeriksaan-masuk', [ItemPemeriksaanMasukController::class, 'index']);
        Route::get('/master/item-pemeriksaan-masuk/{itemPemeriksaanMasuk}', [ItemPemeriksaanMasukController::class, 'show']);

        Route::get('/master/item-pemeriksaan-keluar', [ItemPemeriksaanKeluarController::class, 'index']);
        Route::get('/master/item-pemeriksaan-keluar/{itemPemeriksaanKeluar}', [ItemPemeriksaanKeluarController::class, 'show']);
    });

    /*
    |----------------------------------------------------------------------
    | Master — CRUD (admin only)
    |----------------------------------------------------------------------
    */
    Route::middleware(['admin'])->group(function () {
        Route::apiResource('/master/transporters', TransporterController::class)
            ->except(['index', 'show']);

        Route::apiResource('/master/drivers', DriverController::class)
            ->except(['index', 'show']);

        Route::apiResource('/master/jenis-kendaraan', JenisKendaraanController::class)
            ->except(['index', 'show']);

        Route::apiResource('/master/logistik', LogistikController::class)
            ->except(['index', 'show']);

        Route::apiResource('/master/produk', ProdukController::class)
            ->except(['index', 'show']);

        Route::apiResource('/master/item-kelengkapan-supir', ItemKelengkapanSupirController::class)
            ->except(['index', 'show']);

        Route::apiResource('/master/item-muatan', ItemMuatanController::class)
            ->except(['index', 'show']);

        Route::apiResource('/master/item-pemeriksaan-masuk', ItemPemeriksaanMasukController::class)
            ->except(['index', 'show']);

        Route::apiResource('/master/item-pemeriksaan-keluar', ItemPemeriksaanKeluarController::class)
            ->except(['index', 'show']);

        // User management (admin only)
        Route::apiResource('/master/users', UserController::class);
        Route::post('/master/users/{user}/reset-password', [UserController::class, 'resetPassword']);

        // Admin bisa update Bagian 4 untuk koreksi
        Route::put('/vcf/{vcfId}/bagian4', [VcfBagian4Controller::class, 'update']);
    });

    /*
    |----------------------------------------------------------------------
    | VCF — Petugas
    |----------------------------------------------------------------------
    */
    Route::middleware(['petugas'])->group(function () {

        // Bagian 1 — Security Main Gate
        Route::get('/vcf', [VcfBagian1Controller::class, 'index']);
        Route::post('/vcf', [VcfBagian1Controller::class, 'store']);
        Route::get('/vcf/{id}', [VcfBagian1Controller::class, 'show']);
        Route::put('/vcf/{id}', [VcfBagian1Controller::class, 'update']);

        // Bagian 2 — Security Weighbridge Masuk
        Route::get('/vcf/{vcfId}/bagian2', [VcfBagian2Controller::class, 'show']);
        Route::post('/vcf/{vcfId}/bagian2', [VcfBagian2Controller::class, 'store']);
        Route::put('/vcf/{vcfId}/bagian2', [VcfBagian2Controller::class, 'update']);

        // Bagian 3 — Security Weighbridge Keluar
        Route::get('/vcf/{vcfId}/bagian3', [VcfBagian3Controller::class, 'show']);
        Route::post('/vcf/{vcfId}/bagian3', [VcfBagian3Controller::class, 'store']);
        Route::put('/vcf/{vcfId}/bagian3', [VcfBagian3Controller::class, 'update']);

        // Bagian 4 — Security Main Gate (jam keluar)
        Route::get('/vcf/{vcfId}/bagian4', [VcfBagian4Controller::class, 'show']);
        Route::post('/vcf/{vcfId}/bagian4', [VcfBagian4Controller::class, 'store']);
    });
});
