<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Add indexes for faster search queries
            $table->index('name', 'products_name_index');
            $table->index('category_id', 'products_category_id_index');
            $table->fullText(['name', 'description'], 'products_search_fulltext');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_name_index');
            $table->dropIndex('products_category_id_index');
            $table->dropFullText('products_search_fulltext');
        });
    }
};
