<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfPemeriksaanKeluarsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcf_pemeriksaan_keluars', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel VCF (Transaksi Utama)
            $table->foreignId('vcf_id')->constrained('vcfs')->cascadeOnDelete();

            // Relasi ke tabel Item Pemeriksaan Keluar (Master Item)
            // Sesuaikan nama tabel 'item_pemeriksaan_keluars' dengan migrasi mastermu
            $table->foreignId('item_id')->constrained('item_pemeriksaan_keluars')->cascadeOnDelete();

            // nilai (string) - Hasil pemeriksaan saat keluar
            $table->string('nilai');

            // keterangan (string) - Catatan tambahan jika ada
            $table->string('keterangan')->nullable();

            // Relasi ke tabel Petugas (User yang memeriksa saat keluar)
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
        Schema::dropIfExists('vcf_pemeriksaan_keluars');
    }
}