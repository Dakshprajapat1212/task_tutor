<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('recordings', function (Blueprint $table) {
            if (DB::getDriverName() === 'mysql') {
                DB::statement('ALTER TABLE recordings CHANGE chapters video_timestamps TEXT NULL');
            } else if (Schema::hasColumn('recordings', 'chapters')) {
                $table->renameColumn('chapters', 'video_timestamps');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('recordings', function (Blueprint $table) {
            if (DB::getDriverName() === 'mysql') {
                DB::statement('ALTER TABLE recordings CHANGE video_timestamps chapters TEXT NULL');
            } else if (Schema::hasColumn('recordings', 'video_timestamps')) {
                $table->renameColumn('video_timestamps', 'chapters');
            }
        });
    }
};
