<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfBebanTambahanMasuksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcf_beban_tambahan_masuks', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel VCF (Transaksi Utama)
            // Menggunakan format foreignId sesuai instruksi
            $table->foreignId('vcf_id')->constrained('vcfs')->cascadeOnDelete();

            // jenis_beban (string)
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
        Schema::dropIfExists('vcf_beban_tambahan_masuks');
    }
}