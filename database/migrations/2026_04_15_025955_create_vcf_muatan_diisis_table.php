<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfMuatanDiisisTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcf_muatan_diisis', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel VCF (Transaksi Utama)
            $table->foreignId('vcf_id')->constrained('vcfs')->cascadeOnDelete();

            // Relasi ke tabel Item Muatan (Master Item)
            $table->foreignId('item_muatan_id')->constrained('item_muatans')->cascadeOnDelete();

            // nilai (string) - Mengikuti skema gambar
            $table->string('nilai');

            // keterangan (string) - Opsional
            $table->string('keterangan')->nullable();

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
        Schema::dropIfExists('vcf_muatan_diisis');
    }
}