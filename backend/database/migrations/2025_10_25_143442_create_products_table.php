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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên sản phẩm
            $table->string('slug')->unique(); // URL-friendly name
            $table->foreignId('category_id')->constrained()->onDelete('cascade'); // Phân loại
            $table->decimal('price', 10, 2); // Giá tiền (€)
            $table->text('description'); // Mô tả ngắn
            $table->longText('details')->nullable(); // Chi tiết sản phẩm đầy đủ
            $table->string('image')->nullable(); // Đường dẫn hình ảnh
            $table->integer('stock')->default(0); // Số lượng tồn kho
            $table->boolean('featured')->default(false); // Sản phẩm nổi bật
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
