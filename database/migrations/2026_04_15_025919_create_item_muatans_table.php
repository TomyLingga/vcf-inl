<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateItemMuatansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('item_muatans', function (Blueprint $table) {
            // id (Primary Key)
            $table->id();

            // nama_item (string)
            $table->string('nama_item');

            // jenis (string)
            $table->string('jenis');

            // keterangan (string)
            $table->string('keterangan')->nullable();

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
        Schema::dropIfExists('item_muatans');
    }
}