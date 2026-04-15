<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfKeluarsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcf_keluars', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel VCF (Transaksi Utama)
            $table->foreignId('vcf_id')->constrained('vcfs')->cascadeOnDelete();

            // jam_keluar (time)
            $table->time('jam_keluar');

            // emergency_respon_kontak (string)
            $table->string('emergency_respon_kontak');

            // Relasi ke tabel Petugas (FK ke tabel users)
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
        Schema::dropIfExists('vcf_keluars');
    }
}