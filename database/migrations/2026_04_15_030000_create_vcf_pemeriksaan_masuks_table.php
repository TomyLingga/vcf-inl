<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfPemeriksaanMasuksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcf_pemeriksaan_masuks', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel VCF (Transaksi Utama)
            $table->foreignId('vcf_id')->constrained('vcfs')->cascadeOnDelete();

            // Relasi ke tabel Item Pemeriksaan Masuk (Master Item)
            $table->foreignId('item_id')->constrained('item_pemeriksaan_masuks')->cascadeOnDelete();

            // nilai (string) - Hasil pemeriksaan (misal: "OK", "Rusak", dll)
            $table->string('nilai');

            // keterangan (string)
            $table->string('keterangan')->nullable();

            // Relasi ke tabel Petugas (User yang melakukan input)
            $table->foreignId('petugas_id')->constrained('users')->cascadeOnDelete();

            // waktu_input (timestamp)
            $table->timestamp('waktu_input')->useCurrent();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('vcf_pemeriksaan_masuks');
    }
}