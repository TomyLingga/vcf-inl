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
            $table->string('nomor_urut');
            $table->date('tanggal');
            $table->foreignId('logistik_id')->constrained()->cascadeOnDelete();
            $table->foreignId('produk_id')->constrained()->cascadeOnDelete();
            $table->string('tipe_kegiatan');
            $table->string('asal_tujuan');
            $table->foreignId('jenis_kendaraan_id')->constrained()->cascadeOnDelete();
            $table->string('no_polisi');
            $table->foreignId('transporter_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained()->cascadeOnDelete();
            $table->time('jam_masuk');
            $table->string('status')->default('masuk'); // misal: 'masuk', 'keluar', 'selesai'
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
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
        Schema::dropIfExists('vcfs');
    }
}
