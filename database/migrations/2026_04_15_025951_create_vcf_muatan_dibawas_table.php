<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfMuatanDibawasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcf_muatan_dibawas', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel VCF (Transaksi Utama)
            $table->foreignId('vcf_id')->constrained('vcfs')->cascadeOnDelete();

            // Relasi ke tabel Item Muatan (Master Item)
            // Menggunakan cascade agar jika item muatan dihapus, data di sini ikut terhapus
            $table->foreignId('item_muatan_id')->constrained('item_muatans')->cascadeOnDelete();

            // nilai (string) - Sesuai gambar, di sini menggunakan string (mungkin untuk jumlah atau deskripsi)
            $table->string('nilai');

            // keterangan (string)
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
        Schema::dropIfExists('vcf_muatan_dibawas');
    }
}