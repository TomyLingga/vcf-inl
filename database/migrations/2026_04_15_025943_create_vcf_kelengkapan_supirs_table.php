<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfKelengkapanSupirsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcf_kelengkapan_supirs', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel VCF (Transaksi Utama)
            $table->foreignId('vcf_id')->constrained('vcfs')->cascadeOnDelete();

            // Relasi ke tabel Item Kelengkapan Supir (Master Item)
            // Sesuaikan 'item_kelengkapan_supirs' dengan nama tabel master yang kamu buat tadi
            $table->foreignId('item_id')->constrained('item_kelengkapan_supirs')->cascadeOnDelete();

            // nilai (boolean) - untuk ceklis Ya/Tidak atau Benar/Salah
            $table->boolean('nilai')->default(false);

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
        Schema::dropIfExists('vcf_kelengkapan_supirs');
    }
}