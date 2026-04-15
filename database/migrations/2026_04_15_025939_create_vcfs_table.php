<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVcfsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vcfs', function (Blueprint $table) {
            $table->id();
            
            // Kolom String & Date
            $table->string('nomor_urut');
            $table->date('tanggal');

            // Foreign Keys (Relasi ke tabel-tabel master)
            $table->foreignId('logistik_id')->constrained('logistiks')->cascadeOnDelete();
            $table->foreignId('produk_id')->constrained('produks')->cascadeOnDelete();
            
            $table->string('tipe_ kegiatan');
            $table->string('asal_tujuan');
            
            $table->foreignId('jenis_kendaraan_id')->constrained('jenis_kendaraans')->cascadeOnDelete();
            $table->string('no_polisi');
            
            $table->foreignId('transporter_id')->constrained('transporters')->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained('drivers')->cascadeOnDelete();

            // Jam Masuk & Auditor
            $table->time('jam_masuk');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete(); // Asumsi relasi ke tabel users

            // Status & Timestamps
            $table->string('status');
            $table->timestamps(); // Ini otomatis mencakup created_at sesuai gambar
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('vcfs');
    }
}