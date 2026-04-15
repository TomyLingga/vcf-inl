<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfBebanTambahanKeluarsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcf_beban_tambahan_keluars', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel VCF (Transaksi Utama) sesuai format yang diminta
            $table->foreignId('vcf_id')->constrained('vcfs')->cascadeOnDelete();

            // jenis_beban (string) - Mencatat deskripsi beban tambahan saat keluar
            $table->string('jenis_beban');

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
        Schema::dropIfExists('vcf_beban_tambahan_keluars');
    }
}