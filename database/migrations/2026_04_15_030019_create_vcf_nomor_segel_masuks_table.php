<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfNomorSegelMasuksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcf_nomor_segel_masuks', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel induk (VCF_SEGEL_MASUK)
            // Menggunakan format foreignId sesuai instruksi
            $table->foreignId('segel_masuk_id')->constrained('vcf_segel_masuks')->cascadeOnDelete();

            // urutan (int)
            $table->integer('urutan');

            // nomor_segel (string)
            $table->string('nomor_segel');

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
        Schema::dropIfExists('vcf_nomor_segel_masuks');
    }
}