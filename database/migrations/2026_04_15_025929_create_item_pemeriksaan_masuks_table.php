<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateItemPemeriksaanMasuksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('item_pemeriksaan_masuks', function (Blueprint $table) {
            $table->id();
            $table->string('nama_item');
            $table->string('kode');
            $table->string('tipe_jawaban');
            $table->boolean('has_detail');
            $table->string('keterangan_detail');
            $table->integer('urutan');
            $table->boolean('is_active')->default(true);
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
        Schema::dropIfExists('item_pemeriksaan_masuks');
    }
}
