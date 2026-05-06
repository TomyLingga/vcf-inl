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
Route::post('login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth Actions
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    /*
    Master Data Routes
    */
    Route::prefix('master')->group(function () {
        
        Route::middleware('petugas')->group(function () {
            Route::get('transporters', [TransporterController::class, 'index']);
            Route::get('transporters/{transporter}', [TransporterController::class, 'show']);

            Route::get('drivers', [DriverController::class, 'index']);
            Route::get('drivers/{driver}', [DriverController::class, 'show']);

            Route::get('jenis-kendaraan', [JenisKendaraanController::class, 'index']);
            Route::get('jenis-kendaraan/{jenisKendaraan}', [JenisKendaraanController::class, 'show']);

            Route::get('logistik', [LogistikController::class, 'index']);
            Route::get('logistik/{logistik}', [LogistikController::class, 'show']);

            Route::get('produk', [ProdukController::class, 'index']);
            Route::get('produk/{produk}', [ProdukController::class, 'show']);

            Route::get('item-kelengkapan-supir', [ItemKelengkapanSupirController::class, 'index']);
            Route::get('item-kelengkapan-supir/{itemKelengkapanSupir}', [ItemKelengkapanSupirController::class, 'show']);

            Route::get('item-muatan', [ItemMuatanController::class, 'index']);
            Route::get('item-muatan/{itemMuatan}', [ItemMuatanController::class, 'show']);

            Route::get('item-pemeriksaan-masuk', [ItemPemeriksaanMasukController::class, 'index']);
            Route::get('item-pemeriksaan-masuk/{itemPemeriksaanMasuk}', [ItemPemeriksaanMasukController::class, 'show']);

            Route::get('item-pemeriksaan-keluar', [ItemPemeriksaanKeluarController::class, 'index']);
            Route::get('item-pemeriksaan-keluar/{itemPemeriksaanKeluar}', [ItemPemeriksaanKeluarController::class, 'show']);
        });

        // --- FULL CRUD (Admin Only) ---
        Route::middleware('admin')->group(function () {
            Route::apiResource('transporters', TransporterController::class)->except(['index', 'show']);
            Route::apiResource('drivers', DriverController::class)->except(['index', 'show']);
            
            Route::apiResource('jenis-kendaraan', JenisKendaraanController::class)
                ->except(['index', 'show'])
                ->parameters(['jenis-kendaraan' => 'jenisKendaraan']);
            
            Route::apiResource('logistik', LogistikController::class)->except(['index', 'show']);
            Route::apiResource('produk', ProdukController::class)->except(['index', 'show']);
            
            Route::apiResource('item-kelengkapan-supir', ItemKelengkapanSupirController::class)
                ->except(['index', 'show'])
                ->parameters(['item-kelengkapan-supir' => 'itemKelengkapanSupir']);
                
            Route::apiResource('item-muatan', ItemMuatanController::class)
                ->except(['index', 'show'])
                ->parameters(['item-muatan' => 'itemMuatan']);
                
            Route::apiResource('item-pemeriksaan-masuk', ItemPemeriksaanMasukController::class)
                ->except(['index', 'show'])
                ->parameters(['item-pemeriksaan-masuk' => 'itemPemeriksaanMasuk']);
                
            Route::apiResource('item-pemeriksaan-keluar', ItemPemeriksaanKeluarController::class)
                ->except(['index', 'show'])
                ->parameters(['item-pemeriksaan-keluar' => 'itemPemeriksaanKeluar']);

            // User management
            Route::apiResource('users', UserController::class);
            Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword']);
        });
    });

    /*
    |----------------------------------------------------------------------
    | VCF (Vehicle Check Form) Routes
    |----------------------------------------------------------------------
    | Multistep process for Petugas
    */
    Route::prefix('vcf')->group(function () {
        
        Route::middleware('petugas')->group(function () {
            // Bagian 1 (Main Gate Masuk)
            Route::get('/', [VcfBagian1Controller::class, 'index']);
            Route::post('/', [VcfBagian1Controller::class, 'store']);
            Route::get('{id}', [VcfBagian1Controller::class, 'show']);
            Route::put('{id}', [VcfBagian1Controller::class, 'update']);

            // Bagian 2 (Weighbridge Masuk)
            Route::get('{vcfId}/bagian2', [VcfBagian2Controller::class, 'show']);
            Route::post('{vcfId}/bagian2', [VcfBagian2Controller::class, 'store']);
            Route::put('{vcfId}/bagian2', [VcfBagian2Controller::class, 'update']);

            // Bagian 3 (Weighbridge Keluar)
            Route::get('{vcfId}/bagian3', [VcfBagian3Controller::class, 'show']);
            Route::post('{vcfId}/bagian3', [VcfBagian3Controller::class, 'store']);
            Route::put('{vcfId}/bagian3', [VcfBagian3Controller::class, 'update']);

            // Bagian 4 (Main Gate Keluar)
            Route::get('{vcfId}/bagian4', [VcfBagian4Controller::class, 'show']);
            Route::post('{vcfId}/bagian4', [VcfBagian4Controller::class, 'store']);
        });

        // Bagian 4 Correction (Admin only)
        Route::middleware('admin')->put('{vcfId}/bagian4', [VcfBagian4Controller::class, 'update']);
    });
});
