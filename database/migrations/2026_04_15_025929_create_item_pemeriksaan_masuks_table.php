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
            // id (Primary Key)
            $table->id();

            // nama_item (string)
            $table->string('nama_item');

            // kode (string)
            $table->string('kode');

            // tipe_jawaban (string) - misal: boolean, text, pilihan ganda
            $table->string('tipe_jawaban');

            // has_detail (boolean) - menentukan apakah butuh input tambahan
            $table->boolean('has_detail')->default(false);

            // keterangan_detail (string)
            $table->string('keterangan_detail')->nullable();

            // urutan (int)
            $table->integer('urutan');

            // is_active (boolean)
            $table->boolean('is_active')->default(true);

            // created_at & updated_at
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