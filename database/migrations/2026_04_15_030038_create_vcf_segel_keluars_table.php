<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfSegelKeluarsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcf_segel_keluars', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel VCF (Transaksi Utama) sesuai format instruksi
            $table->foreignId('vcf_id')->constrained('vcfs')->cascadeOnDelete();

            // jumlah_segel (int)
            $table->integer('jumlah_segel');

            // Relasi ke tabel Petugas (FK ke tabel users) sesuai format instruksi
            $table->foreignId('petugas_id')->constrained('users')->cascadeOnDelete();

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
        Schema::dropIfExists('vcf_segel_keluars');
    }
}