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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_name')->after('user_id');
            $table->string('customer_phone')->after('customer_name');
            $table->text('customer_address')->after('customer_phone');
            $table->string('customer_email')->nullable()->after('customer_address');
            $table->decimal('subtotal', 10, 2)->after('customer_email');
            $table->decimal('shipping_fee', 10, 2)->default(0)->after('subtotal');
            $table->decimal('total', 10, 2)->after('shipping_fee');
            $table->string('payment_method')->after('total');
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid')->after('status');
            $table->text('note')->nullable()->after('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'customer_name',
                'customer_phone', 
                'customer_address',
                'customer_email',
                'subtotal',
                'shipping_fee',
                'total',
                'payment_method',
                'payment_status',
                'note'
            ]);
        });
    }
};
