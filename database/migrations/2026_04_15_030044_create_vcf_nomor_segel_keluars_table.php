<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfNomorSegelKeluarsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcf_nomor_segel_keluars', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel induk (VCF_SEGEL_KELUAR)
            // Menggunakan format foreignId sesuai instruksi Anda
            $table->foreignId('segel_keluar_id')->constrained('vcf_segel_keluars')->cascadeOnDelete();

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
        Schema::dropIfExists('vcf_nomor_segel_keluars');
    }
}