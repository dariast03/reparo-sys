<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use App\Models\Brand;
use App\Models\DeviceModel;
use App\Models\ProductCategory;
use App\Models\Product;
use App\Models\RepairOrder;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Quote;
use App\Models\QuoteDetail;
use App\Models\OrderPart;
use App\Models\InventoryMovement;
use App\Models\OrderHistory;
use App\Models\Notification;
use App\Models\Supplier;
use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Setting;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the roles and permissions seeder
        $this->call(SimpleRolesSeeder::class);

        // Create admin user
        $admin = User::factory()->create([
            'name' => 'Root',
            'username' => 'root',
            'email' => 'root@gmail.com',
            'password' => Hash::make('12345678'),
        ]);

        // Assign admin role to admin user
        $admin->assignRole('root');

        // Create additional users
        $technician = User::factory()->create([
            'name' => 'Juan Pérez',
            'username' => 'jperez',
            'email' => 'jperez@reparo.com',
            'password' => Hash::make('12345678'),
        ]);
        $technician->assignRole('technician');

        $receptionist = User::factory()->create([
            'name' => 'María García',
            'username' => 'mgarcia',
            'email' => 'mgarcia@reparo.com',
            'password' => Hash::make('12345678'),
        ]);
        $receptionist->assignRole('receptionist');

        // Seed Settings
        $this->seedSettings();

        // Seed Customers
        $customers = $this->seedCustomers();

        // Seed Brands and Models
        $brands = $this->seedBrands();
        $models = $this->seedModels($brands);

        // Seed Product Categories
        $categories = $this->seedProductCategories();

        // Seed Products
        $products = $this->seedProducts($categories);

        // Seed Suppliers
        $suppliers = $this->seedSuppliers();

        // Seed Purchases
        $purchases = $this->seedPurchases($suppliers, $admin->id);
        $this->seedPurchaseDetails($purchases, $products);

        // Seed Repair Orders
        $repairOrders = $this->seedRepairOrders($customers, $admin->id, $technician->id, $brands, $models);

        // Seed Order Parts and History
        $this->seedOrderParts($repairOrders, $products);
        $this->seedOrderHistory($repairOrders, $admin->id, $technician->id);

        // Seed Inventory Movements
        $this->seedInventoryMovements($products, $admin->id, $repairOrders);

        // Seed Sales
        $sales = $this->seedSales($customers, $admin->id);
        $this->seedSaleDetails($sales, $products);

        // Seed Quotes
        $quotes = $this->seedQuotes($customers, $admin->id, $repairOrders);
        $this->seedQuoteDetails($quotes, $products);

        // Seed Notifications
        $this->seedNotifications($admin->id, $customers, $repairOrders);
    }

    private function seedSettings(): void
    {
        $settings = [
            ['setting_key' => 'company_name', 'setting_value' => 'Reparo Tech', 'description' => 'Nombre de la empresa', 'data_type' => 'string'],
            ['setting_key' => 'company_phone', 'setting_value' => '+1234567890', 'description' => 'Teléfono de la empresa', 'data_type' => 'string'],
            ['setting_key' => 'company_email', 'setting_value' => 'info@reparotech.com', 'description' => 'Email de la empresa', 'data_type' => 'string'],
            ['setting_key' => 'company_address', 'setting_value' => 'Calle Principal 123, Ciudad', 'description' => 'Dirección de la empresa', 'data_type' => 'string'],
            ['setting_key' => 'tax_rate', 'setting_value' => '16.00', 'description' => 'Tasa de impuesto (%)', 'data_type' => 'decimal'],
            ['setting_key' => 'currency_symbol', 'setting_value' => '$', 'description' => 'Símbolo de moneda', 'data_type' => 'string'],
            ['setting_key' => 'default_warranty_days', 'setting_value' => '90', 'description' => 'Días de garantía por defecto', 'data_type' => 'integer'],
            ['setting_key' => 'notification_email_enabled', 'setting_value' => '1', 'description' => 'Notificaciones por email habilitadas', 'data_type' => 'boolean'],
            ['setting_key' => 'low_stock_threshold', 'setting_value' => '5', 'description' => 'Umbral de stock bajo', 'data_type' => 'integer'],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }

    private function seedCustomers(): array
    {
        $customers = [
            [
                'first_name' => 'Carlos',
                'last_name' => 'Rodríguez',
                'document_number' => '12345678',
                'document_type' => 'id_card',
                'phone' => '+1234567801',
                'email' => 'carlos@email.com',
                'address' => 'Av. Principal 123',
                'birth_date' => '1985-03-15',
                'gender' => 'male',
                'status' => 'active',
            ],
            [
                'first_name' => 'Ana',
                'last_name' => 'López',
                'document_number' => '87654321',
                'document_type' => 'id_card',
                'phone' => '+1234567802',
                'email' => 'ana@email.com',
                'address' => 'Calle Secundaria 456',
                'birth_date' => '1990-07-22',
                'gender' => 'female',
                'status' => 'active',
            ],
            [
                'first_name' => 'Miguel',
                'last_name' => 'Torres',
                'document_number' => '11223344',
                'document_type' => 'passport',
                'phone' => '+1234567803',
                'email' => 'miguel@email.com',
                'address' => 'Plaza Central 789',
                'birth_date' => '1988-12-10',
                'gender' => 'male',
                'status' => 'active',
            ],
            [
                'first_name' => 'Sofia',
                'last_name' => 'Martínez',
                'document_number' => '99887766',
                'document_type' => 'id_card',
                'phone' => '+1234567804',
                'email' => 'sofia@email.com',
                'address' => 'Barrio Norte 321',
                'birth_date' => '1995-05-18',
                'gender' => 'female',
                'status' => 'active',
            ],
        ];

        $customerModels = [];
        foreach ($customers as $customer) {
            $customerModels[] = Customer::create($customer);
        }

        return $customerModels;
    }

    private function seedBrands(): array
    {
        $brands = [
            ['name' => 'Apple', 'status' => 'active'],
            ['name' => 'Samsung', 'status' => 'active'],
            ['name' => 'Huawei', 'status' => 'active'],
            ['name' => 'Xiaomi', 'status' => 'active'],
            ['name' => 'LG', 'status' => 'active'],
            ['name' => 'Sony', 'status' => 'active'],
            ['name' => 'OnePlus', 'status' => 'active'],
            ['name' => 'Google', 'status' => 'active'],
            ['name' => 'Lenovo', 'status' => 'active'],
            ['name' => 'HP', 'status' => 'active'],
        ];

        $brandModels = [];
        foreach ($brands as $brand) {
            $brandModels[] = Brand::create($brand);
        }

        return $brandModels;
    }

    private function seedModels($brands): array
    {
        $models = [
            // Apple
            ['brand_id' => $brands[0]->id, 'name' => 'iPhone 14', 'device_type' => 'phone', 'status' => 'active'],
            ['brand_id' => $brands[0]->id, 'name' => 'iPhone 13', 'device_type' => 'phone', 'status' => 'active'],
            ['brand_id' => $brands[0]->id, 'name' => 'iPad Air', 'device_type' => 'tablet', 'status' => 'active'],
            ['brand_id' => $brands[0]->id, 'name' => 'MacBook Pro', 'device_type' => 'laptop', 'status' => 'active'],
            ['brand_id' => $brands[0]->id, 'name' => 'Apple Watch Series 8', 'device_type' => 'smartwatch', 'status' => 'active'],

            // Samsung
            ['brand_id' => $brands[1]->id, 'name' => 'Galaxy S23', 'device_type' => 'phone', 'status' => 'active'],
            ['brand_id' => $brands[1]->id, 'name' => 'Galaxy Note 20', 'device_type' => 'phone', 'status' => 'active'],
            ['brand_id' => $brands[1]->id, 'name' => 'Galaxy Tab S8', 'device_type' => 'tablet', 'status' => 'active'],
            ['brand_id' => $brands[1]->id, 'name' => 'Galaxy Book', 'device_type' => 'laptop', 'status' => 'active'],

            // Huawei
            ['brand_id' => $brands[2]->id, 'name' => 'P50 Pro', 'device_type' => 'phone', 'status' => 'active'],
            ['brand_id' => $brands[2]->id, 'name' => 'MatePad Pro', 'device_type' => 'tablet', 'status' => 'active'],

            // Xiaomi
            ['brand_id' => $brands[3]->id, 'name' => 'Redmi Note 12', 'device_type' => 'phone', 'status' => 'active'],
            ['brand_id' => $brands[3]->id, 'name' => 'Mi 13', 'device_type' => 'phone', 'status' => 'active'],
        ];

        $modelObjects = [];
        foreach ($models as $model) {
            $modelObjects[] = DeviceModel::create($model);
        }

        return $modelObjects;
    }

    private function seedProductCategories(): array
    {
        $categories = [
            ['name' => 'Pantallas', 'description' => 'Pantallas y displays para dispositivos', 'status' => 'active'],
            ['name' => 'Baterías', 'description' => 'Baterías para dispositivos móviles', 'status' => 'active'],
            ['name' => 'Conectores', 'description' => 'Conectores de carga y audio', 'status' => 'active'],
            ['name' => 'Cámaras', 'description' => 'Cámaras frontales y traseras', 'status' => 'active'],
            ['name' => 'Altavoces', 'description' => 'Altavoces y auriculares internos', 'status' => 'active'],
            ['name' => 'Herramientas', 'description' => 'Herramientas de reparación', 'status' => 'active'],
            ['name' => 'Accesorios', 'description' => 'Fundas, protectores y accesorios', 'status' => 'active'],
            ['name' => 'Placas madre', 'description' => 'Placas base y componentes internos', 'status' => 'active'],
        ];

        $categoryModels = [];
        foreach ($categories as $category) {
            $categoryModels[] = ProductCategory::create($category);
        }

        return $categoryModels;
    }

    private function seedProducts($categories): array
    {
        $products = [
            // Pantallas
            ['category_id' => $categories[0]->id, 'code' => 'PNT001', 'name' => 'Pantalla iPhone 14', 'description' => 'Pantalla OLED original para iPhone 14', 'brand' => 'Apple', 'compatible_model' => 'iPhone 14', 'current_stock' => 15, 'minimum_stock' => 5, 'purchase_price' => 180.00, 'sale_price' => 280.00, 'profit_margin' => 35.71, 'product_type' => 'part', 'physical_location' => 'Estante A1', 'status' => 'active'],
            ['category_id' => $categories[0]->id, 'code' => 'PNT002', 'name' => 'Pantalla Samsung S23', 'description' => 'Pantalla AMOLED para Galaxy S23', 'brand' => 'Samsung', 'compatible_model' => 'Galaxy S23', 'current_stock' => 8, 'minimum_stock' => 3, 'purchase_price' => 150.00, 'sale_price' => 230.00, 'profit_margin' => 34.78, 'product_type' => 'part', 'physical_location' => 'Estante A2', 'status' => 'active'],

            // Baterías
            ['category_id' => $categories[1]->id, 'code' => 'BAT001', 'name' => 'Batería iPhone 14', 'description' => 'Batería de litio 3279mAh para iPhone 14', 'brand' => 'Apple', 'compatible_model' => 'iPhone 14', 'current_stock' => 25, 'minimum_stock' => 10, 'purchase_price' => 45.00, 'sale_price' => 75.00, 'profit_margin' => 40.00, 'product_type' => 'part', 'physical_location' => 'Estante B1', 'status' => 'active'],
            ['category_id' => $categories[1]->id, 'code' => 'BAT002', 'name' => 'Batería Samsung S23', 'description' => 'Batería de litio 3900mAh para Galaxy S23', 'brand' => 'Samsung', 'compatible_model' => 'Galaxy S23', 'current_stock' => 20, 'minimum_stock' => 8, 'purchase_price' => 40.00, 'sale_price' => 65.00, 'profit_margin' => 38.46, 'product_type' => 'part', 'physical_location' => 'Estante B2', 'status' => 'active'],

            // Conectores
            ['category_id' => $categories[2]->id, 'code' => 'CON001', 'name' => 'Conector Lightning iPhone', 'description' => 'Conector de carga Lightning para iPhone', 'brand' => 'Apple', 'compatible_model' => 'iPhone 14', 'current_stock' => 30, 'minimum_stock' => 15, 'purchase_price' => 25.00, 'sale_price' => 45.00, 'profit_margin' => 44.44, 'product_type' => 'part', 'physical_location' => 'Estante C1', 'status' => 'active'],
            ['category_id' => $categories[2]->id, 'code' => 'CON002', 'name' => 'Conector USB-C Samsung', 'description' => 'Conector de carga USB-C para Samsung', 'brand' => 'Samsung', 'compatible_model' => 'Galaxy S23', 'current_stock' => 18, 'minimum_stock' => 10, 'purchase_price' => 20.00, 'sale_price' => 35.00, 'profit_margin' => 42.86, 'product_type' => 'part', 'physical_location' => 'Estante C2', 'status' => 'active'],

            // Herramientas
            ['category_id' => $categories[5]->id, 'code' => 'HER001', 'name' => 'Kit Destornilladores', 'description' => 'Kit de destornilladores de precisión', 'brand' => 'Universal', 'compatible_model' => 'Universal', 'current_stock' => 12, 'minimum_stock' => 5, 'purchase_price' => 15.00, 'sale_price' => 30.00, 'profit_margin' => 50.00, 'product_type' => 'tool', 'physical_location' => 'Estante D1', 'status' => 'active'],
            ['category_id' => $categories[5]->id, 'code' => 'HER002', 'name' => 'Pistola de Calor', 'description' => 'Pistola de calor para reparaciones', 'brand' => 'Universal', 'compatible_model' => 'Universal', 'current_stock' => 3, 'minimum_stock' => 2, 'purchase_price' => 60.00, 'sale_price' => 95.00, 'profit_margin' => 36.84, 'product_type' => 'tool', 'physical_location' => 'Estante D2', 'status' => 'active'],

            // Accesorios
            ['category_id' => $categories[6]->id, 'code' => 'ACC001', 'name' => 'Funda iPhone 14', 'description' => 'Funda protectora transparente', 'brand' => 'Generic', 'compatible_model' => 'iPhone 14', 'current_stock' => 50, 'minimum_stock' => 20, 'purchase_price' => 5.00, 'sale_price' => 15.00, 'profit_margin' => 66.67, 'product_type' => 'accessory', 'physical_location' => 'Estante E1', 'status' => 'active'],
            ['category_id' => $categories[6]->id, 'code' => 'ACC002', 'name' => 'Protector Pantalla', 'description' => 'Protector de pantalla vidrio templado', 'brand' => 'Generic', 'compatible_model' => 'Universal', 'current_stock' => 100, 'minimum_stock' => 30, 'purchase_price' => 2.00, 'sale_price' => 8.00, 'profit_margin' => 75.00, 'product_type' => 'accessory', 'physical_location' => 'Estante E2', 'status' => 'active'],
        ];

        $productModels = [];
        foreach ($products as $product) {
            $productModels[] = Product::create($product);
        }

        return $productModels;
    }

    private function seedSuppliers(): array
    {
        $suppliers = [
            [
                'name' => 'TechParts Wholesale',
                'contact_person' => 'Roberto Jiménez',
                'phone' => '+1234567890',
                'email' => 'ventas@techparts.com',
                'address' => 'Zona Industrial Norte, Local 45',
                'tax_id' => 'SP001234567',
                'delivery_time_days' => 5,
                'rating' => 4.5,
                'status' => 'active',
                'notes' => 'Proveedor principal de pantallas y baterías',
            ],
            [
                'name' => 'Electronic Components Co.',
                'contact_person' => 'Laura Fernández',
                'phone' => '+1234567891',
                'email' => 'info@electrocomp.com',
                'address' => 'Av. Tecnológica 789',
                'tax_id' => 'SP001234568',
                'delivery_time_days' => 7,
                'rating' => 4.2,
                'status' => 'active',
                'notes' => 'Especialista en conectores y componentes internos',
            ],
            [
                'name' => 'Mobile Repair Supply',
                'contact_person' => 'Diego Morales',
                'phone' => '+1234567892',
                'email' => 'diego@mobilerepair.com',
                'address' => 'Centro Comercial Tech, Piso 3',
                'tax_id' => 'SP001234569',
                'delivery_time_days' => 3,
                'rating' => 4.8,
                'status' => 'active',
                'notes' => 'Proveedor rápido para urgencias',
            ],
        ];

        $supplierModels = [];
        foreach ($suppliers as $supplier) {
            $supplierModels[] = Supplier::create($supplier);
        }

        return $supplierModels;
    }

    private function seedPurchases($suppliers, $adminId): array
    {
        $purchases = [
            [
                'purchase_number' => 'PUR-2024-001',
                'supplier_id' => $suppliers[0]->id,
                'user_id' => $adminId,
                'subtotal' => 2500.00,
                'discount' => 100.00,
                'taxes' => 384.00,
                'total' => 2784.00,
                'status' => 'received',
                'order_date' => now()->subDays(15),
                'promised_date' => now()->subDays(10),
                'received_date' => now()->subDays(8),
                'notes' => 'Pedido mensual de pantallas y baterías',
            ],
            [
                'purchase_number' => 'PUR-2024-002',
                'supplier_id' => $suppliers[1]->id,
                'user_id' => $adminId,
                'subtotal' => 800.00,
                'discount' => 0.00,
                'taxes' => 128.00,
                'total' => 928.00,
                'status' => 'partial',
                'order_date' => now()->subDays(7),
                'promised_date' => now()->addDays(2),
                'notes' => 'Conectores y herramientas',
            ],
            [
                'purchase_number' => 'PUR-2024-003',
                'supplier_id' => $suppliers[2]->id,
                'user_id' => $adminId,
                'subtotal' => 450.00,
                'discount' => 50.00,
                'taxes' => 64.00,
                'total' => 464.00,
                'status' => 'pending',
                'order_date' => now()->subDays(2),
                'promised_date' => now()->addDay(),
                'notes' => 'Pedido urgente de accesorios',
            ],
        ];

        $purchaseModels = [];
        foreach ($purchases as $purchase) {
            $purchaseModels[] = Purchase::create($purchase);
        }

        return $purchaseModels;
    }

    private function seedPurchaseDetails($purchases, $products): void
    {
        $purchaseDetails = [
            // Purchase 1 details
            ['purchase_id' => $purchases[0]->id, 'product_id' => $products[0]->id, 'quantity_ordered' => 10, 'quantity_received' => 10, 'unit_price' => 180.00, 'total_price' => 1800.00],
            ['purchase_id' => $purchases[0]->id, 'product_id' => $products[2]->id, 'quantity_ordered' => 15, 'quantity_received' => 15, 'unit_price' => 45.00, 'total_price' => 675.00],
            ['purchase_id' => $purchases[0]->id, 'product_id' => $products[3]->id, 'quantity_ordered' => 5, 'quantity_received' => 5, 'unit_price' => 40.00, 'total_price' => 200.00],

            // Purchase 2 details
            ['purchase_id' => $purchases[1]->id, 'product_id' => $products[4]->id, 'quantity_ordered' => 20, 'quantity_received' => 15, 'unit_price' => 25.00, 'total_price' => 500.00],
            ['purchase_id' => $purchases[1]->id, 'product_id' => $products[6]->id, 'quantity_ordered' => 10, 'quantity_received' => 8, 'unit_price' => 15.00, 'total_price' => 150.00],
            ['purchase_id' => $purchases[1]->id, 'product_id' => $products[7]->id, 'quantity_ordered' => 2, 'quantity_received' => 0, 'unit_price' => 60.00, 'total_price' => 120.00],

            // Purchase 3 details
            ['purchase_id' => $purchases[2]->id, 'product_id' => $products[8]->id, 'quantity_ordered' => 30, 'quantity_received' => 0, 'unit_price' => 5.00, 'total_price' => 150.00],
            ['purchase_id' => $purchases[2]->id, 'product_id' => $products[9]->id, 'quantity_ordered' => 50, 'quantity_received' => 0, 'unit_price' => 2.00, 'total_price' => 100.00],
        ];

        foreach ($purchaseDetails as $detail) {
            PurchaseDetail::create($detail);
        }
    }

    private function seedRepairOrders($customers, $adminId, $technicianId, $brands, $models): array
    {
        $repairOrders = [
            [
                'order_number' => 'ORD-2024-001',
                'customer_id' => $customers[0]->id,
                'reception_user_id' => $adminId,
                'technician_user_id' => $technicianId,
                'brand_id' => $brands[0]->id, // Apple
                'model_id' => $models[0]->id, // iPhone 14
                'device_serial' => 'APL123456789',
                'imei' => '123456789012345',
                'device_color' => 'Negro',
                'unlock_pattern' => '1234',
                'problem_description' => 'Pantalla rota tras caída',
                'customer_notes' => 'Se cayó desde el segundo piso',
                'technical_notes' => 'Pantalla completamente dañada, tactil no responde',
                'initial_diagnosis' => 'Reemplazo de pantalla necesario',
                'final_diagnosis' => 'Pantalla reemplazada exitosamente',
                'solution_applied' => 'Instalación de pantalla nueva y pruebas de funcionamiento',
                'included_accessories' => 'Cargador, funda',
                'status' => 'delivered',
                'priority' => 'normal',
                'diagnosis_cost' => 20.00,
                'repair_cost' => 280.00,
                'total_cost' => 300.00,
                'advance_payment' => 150.00,
                'pending_balance' => 0.00,
                'received_date' => now()->subDays(10),
                'promised_date' => now()->subDays(7),
                'diagnosis_date' => now()->subDays(9),
                'repair_date' => now()->subDays(8),
                'delivery_date' => now()->subDays(6),
            ],
            [
                'order_number' => 'ORD-2024-002',
                'customer_id' => $customers[1]->id,
                'reception_user_id' => $adminId,
                'technician_user_id' => $technicianId,
                'brand_id' => $brands[1]->id, // Samsung
                'model_id' => $models[5]->id, // Galaxy S23
                'device_serial' => 'SAM987654321',
                'imei' => '987654321098765',
                'device_color' => 'Blanco',
                'unlock_pattern' => 'PIN: 0987',
                'problem_description' => 'Batería se agota muy rápido',
                'customer_notes' => 'Desde hace una semana la batería dura pocas horas',
                'technical_notes' => 'Batería hinchada, necesita reemplazo inmediato',
                'initial_diagnosis' => 'Reemplazo de batería',
                'status' => 'repairing',
                'priority' => 'high',
                'diagnosis_cost' => 15.00,
                'repair_cost' => 65.00,
                'total_cost' => 80.00,
                'advance_payment' => 40.00,
                'pending_balance' => 40.00,
                'received_date' => now()->subDays(3),
                'promised_date' => now()->addDay(),
                'diagnosis_date' => now()->subDays(2),
            ],
            [
                'order_number' => 'ORD-2024-003',
                'customer_id' => $customers[2]->id,
                'reception_user_id' => $adminId,
                'technician_user_id' => null,
                'brand_id' => $brands[0]->id, // Apple
                'model_id' => $models[1]->id, // iPhone 13
                'device_serial' => 'APL555666777',
                'device_color' => 'Azul',
                'problem_description' => 'No carga, puerto dañado',
                'customer_notes' => 'El cable no entra bien en el puerto',
                'status' => 'received',
                'priority' => 'normal',
                'diagnosis_cost' => 0.00,
                'repair_cost' => 0.00,
                'total_cost' => 0.00,
                'advance_payment' => 0.00,
                'pending_balance' => 0.00,
                'received_date' => now()->subDay(),
                'promised_date' => now()->addDays(3),
            ],
            [
                'order_number' => 'ORD-2024-004',
                'customer_id' => $customers[3]->id,
                'reception_user_id' => $adminId,
                'technician_user_id' => $technicianId,
                'brand_id' => $brands[2]->id, // Huawei
                'model_id' => $models[9]->id, // P50 Pro
                'device_serial' => 'HUA999888777',
                'device_color' => 'Dorado',
                'problem_description' => 'Cámara trasera no funciona',
                'status' => 'diagnosing',
                'priority' => 'low',
                'diagnosis_cost' => 25.00,
                'repair_cost' => 0.00,
                'total_cost' => 0.00,
                'advance_payment' => 25.00,
                'pending_balance' => 0.00,
                'received_date' => now(),
                'promised_date' => now()->addDays(5),
            ],
        ];

        $repairOrderModels = [];
        foreach ($repairOrders as $order) {
            $repairOrderModels[] = RepairOrder::create($order);
        }

        return $repairOrderModels;
    }

    private function seedOrderParts($repairOrders, $products): void
    {
        $orderParts = [
            // Order 1 parts (iPhone 14 screen repair)
            ['repair_order_id' => $repairOrders[0]->id, 'product_id' => $products[0]->id, 'quantity' => 1, 'unit_price' => 280.00, 'total_price' => 280.00, 'usage_date' => now()->subDays(8)],

            // Order 2 parts (Samsung battery replacement)
            ['repair_order_id' => $repairOrders[1]->id, 'product_id' => $products[3]->id, 'quantity' => 1, 'unit_price' => 65.00, 'total_price' => 65.00, 'usage_date' => now()->subDays(2)],
        ];

        foreach ($orderParts as $part) {
            OrderPart::create($part);
        }
    }

    private function seedOrderHistory($repairOrders, $adminId, $technicianId): void
    {
        $orderHistory = [
            // Order 1 history
            ['repair_order_id' => $repairOrders[0]->id, 'user_id' => $adminId, 'previous_status' => null, 'new_status' => 'received', 'notes' => 'Orden recibida en recepción', 'change_date' => now()->subDays(10)],
            ['repair_order_id' => $repairOrders[0]->id, 'user_id' => $technicianId, 'previous_status' => 'received', 'new_status' => 'diagnosing', 'notes' => 'Iniciando diagnóstico técnico', 'change_date' => now()->subDays(9)],
            ['repair_order_id' => $repairOrders[0]->id, 'user_id' => $technicianId, 'previous_status' => 'diagnosing', 'new_status' => 'repairing', 'notes' => 'Comenzando reparación de pantalla', 'change_date' => now()->subDays(8)],
            ['repair_order_id' => $repairOrders[0]->id, 'user_id' => $technicianId, 'previous_status' => 'repairing', 'new_status' => 'repaired', 'notes' => 'Reparación completada exitosamente', 'change_date' => now()->subDays(7)],
            ['repair_order_id' => $repairOrders[0]->id, 'user_id' => $adminId, 'previous_status' => 'repaired', 'new_status' => 'delivered', 'notes' => 'Entregado al cliente', 'change_date' => now()->subDays(6)],

            // Order 2 history
            ['repair_order_id' => $repairOrders[1]->id, 'user_id' => $adminId, 'previous_status' => null, 'new_status' => 'received', 'notes' => 'Orden recibida', 'change_date' => now()->subDays(3)],
            ['repair_order_id' => $repairOrders[1]->id, 'user_id' => $technicianId, 'previous_status' => 'received', 'new_status' => 'diagnosing', 'notes' => 'Evaluando estado de la batería', 'change_date' => now()->subDays(2)],
            ['repair_order_id' => $repairOrders[1]->id, 'user_id' => $technicianId, 'previous_status' => 'diagnosing', 'new_status' => 'repairing', 'notes' => 'Instalando nueva batería', 'change_date' => now()->subDay()],

            // Order 3 history
            ['repair_order_id' => $repairOrders[2]->id, 'user_id' => $adminId, 'previous_status' => null, 'new_status' => 'received', 'notes' => 'Orden recibida para diagnóstico', 'change_date' => now()->subDay()],

            // Order 4 history
            ['repair_order_id' => $repairOrders[3]->id, 'user_id' => $adminId, 'previous_status' => null, 'new_status' => 'received', 'notes' => 'Orden recibida', 'change_date' => now()],
            ['repair_order_id' => $repairOrders[3]->id, 'user_id' => $technicianId, 'previous_status' => 'received', 'new_status' => 'diagnosing', 'notes' => 'Evaluando cámara trasera', 'change_date' => now()],
        ];

        foreach ($orderHistory as $history) {
            OrderHistory::create($history);
        }
    }

    private function seedInventoryMovements($products, $adminId, $repairOrders): void
    {
        $inventoryMovements = [
            // Initial stock entries
            ['product_id' => $products[0]->id, 'user_id' => $adminId, 'repair_order_id' => null, 'movement_type' => 'in', 'quantity' => 20, 'unit_price' => 180.00, 'total_cost' => 3600.00, 'reason' => 'Compra inicial', 'stock_before' => 0, 'stock_after' => 20, 'movement_date' => now()->subDays(20)],
            ['product_id' => $products[1]->id, 'user_id' => $adminId, 'repair_order_id' => null, 'movement_type' => 'in', 'quantity' => 15, 'unit_price' => 150.00, 'total_cost' => 2250.00, 'reason' => 'Compra inicial', 'stock_before' => 0, 'stock_after' => 15, 'movement_date' => now()->subDays(20)],
            ['product_id' => $products[2]->id, 'user_id' => $adminId, 'repair_order_id' => null, 'movement_type' => 'in', 'quantity' => 30, 'unit_price' => 45.00, 'total_cost' => 1350.00, 'reason' => 'Compra inicial', 'stock_before' => 0, 'stock_after' => 30, 'movement_date' => now()->subDays(20)],

            // Usage in repairs
            ['product_id' => $products[0]->id, 'user_id' => $adminId, 'repair_order_id' => $repairOrders[0]->id, 'movement_type' => 'out', 'quantity' => 1, 'unit_price' => 180.00, 'total_cost' => 180.00, 'reason' => 'Usado en reparación', 'stock_before' => 20, 'stock_after' => 19, 'movement_date' => now()->subDays(8)],
            ['product_id' => $products[3]->id, 'user_id' => $adminId, 'repair_order_id' => $repairOrders[1]->id, 'movement_type' => 'out', 'quantity' => 1, 'unit_price' => 40.00, 'total_cost' => 40.00, 'reason' => 'Usado en reparación', 'stock_before' => 25, 'stock_after' => 24, 'movement_date' => now()->subDays(2)],

            // Recent purchases
            ['product_id' => $products[0]->id, 'user_id' => $adminId, 'repair_order_id' => null, 'movement_type' => 'in', 'quantity' => 5, 'unit_price' => 180.00, 'total_cost' => 900.00, 'reason' => 'Restock', 'stock_before' => 19, 'stock_after' => 24, 'movement_date' => now()->subDays(5)],
            ['product_id' => $products[2]->id, 'user_id' => $adminId, 'repair_order_id' => null, 'movement_type' => 'in', 'quantity' => 10, 'unit_price' => 45.00, 'total_cost' => 450.00, 'reason' => 'Restock', 'stock_before' => 29, 'stock_after' => 39, 'movement_date' => now()->subDays(5)],

            // Adjustments
            ['product_id' => $products[6]->id, 'user_id' => $adminId, 'repair_order_id' => null, 'movement_type' => 'adjustment', 'quantity' => -2, 'unit_price' => 15.00, 'total_cost' => -30.00, 'reason' => 'Herramientas dañadas', 'stock_before' => 12, 'stock_after' => 10, 'movement_date' => now()->subDays(3)],
        ];

        foreach ($inventoryMovements as $movement) {
            InventoryMovement::create($movement);
        }
    }

    private function seedSales($customers, $adminId): array
    {
        $sales = [
            [
                'sale_number' => 'VEN-2024-001',
                'customer_id' => $customers[0]->id,
                'seller_user_id' => $adminId,
                'sale_type' => 'cash',
                'subtotal' => 95.00,
                'discount' => 5.00,
                'taxes' => 14.40,
                'total' => 104.40,
                'advance_payment' => 104.40,
                'pending_balance' => 0.00,
                'status' => 'paid',
                'payment_method' => 'cash',
                'notes' => 'Venta de accesorios',
                'sale_date' => now()->subDays(5),
            ],
            [
                'sale_number' => 'VEN-2024-002',
                'customer_id' => $customers[1]->id,
                'seller_user_id' => $adminId,
                'sale_type' => 'cash',
                'subtotal' => 45.00,
                'discount' => 0.00,
                'taxes' => 7.20,
                'total' => 52.20,
                'advance_payment' => 52.20,
                'pending_balance' => 0.00,
                'status' => 'paid',
                'payment_method' => 'card',
                'notes' => 'Funda y protector',
                'sale_date' => now()->subDays(3),
            ],
            [
                'sale_number' => 'VEN-2024-003',
                'customer_id' => null,
                'seller_user_id' => $adminId,
                'sale_type' => 'cash',
                'subtotal' => 120.00,
                'discount' => 10.00,
                'taxes' => 17.60,
                'total' => 127.60,
                'advance_payment' => 50.00,
                'pending_balance' => 77.60,
                'status' => 'pending',
                'payment_method' => 'mixed',
                'notes' => 'Cliente sin registro, venta al público',
                'sale_date' => now()->subDay(),
            ],
        ];

        $saleModels = [];
        foreach ($sales as $sale) {
            $saleModels[] = Sale::create($sale);
        }

        return $saleModels;
    }

    private function seedSaleDetails($sales, $products): void
    {
        $saleDetails = [
            // Sale 1 details
            ['sale_id' => $sales[0]->id, 'product_id' => $products[6]->id, 'quantity' => 1, 'unit_price' => 30.00, 'item_discount' => 0.00, 'total_price' => 30.00],
            ['sale_id' => $sales[0]->id, 'product_id' => $products[7]->id, 'quantity' => 1, 'unit_price' => 95.00, 'item_discount' => 5.00, 'total_price' => 90.00],

            // Sale 2 details
            ['sale_id' => $sales[1]->id, 'product_id' => $products[8]->id, 'quantity' => 2, 'unit_price' => 15.00, 'item_discount' => 0.00, 'total_price' => 30.00],
            ['sale_id' => $sales[1]->id, 'product_id' => $products[9]->id, 'quantity' => 2, 'unit_price' => 8.00, 'item_discount' => 1.00, 'total_price' => 15.00],

            // Sale 3 details
            ['sale_id' => $sales[2]->id, 'product_id' => $products[8]->id, 'quantity' => 4, 'unit_price' => 15.00, 'item_discount' => 0.00, 'total_price' => 60.00],
            ['sale_id' => $sales[2]->id, 'product_id' => $products[9]->id, 'quantity' => 8, 'unit_price' => 8.00, 'item_discount' => 4.00, 'total_price' => 60.00],
        ];

        foreach ($saleDetails as $detail) {
            SaleDetail::create($detail);
        }
    }

    private function seedQuotes($customers, $adminId, $repairOrders): array
    {
        $quotes = [
            [
                'quote_number' => 'COT-2024-001',
                'customer_id' => $customers[2]->id,
                'user_id' => $adminId,
                'repair_order_id' => $repairOrders[2]->id,
                'work_description' => 'Reemplazo de conector Lightning para iPhone 13',
                'labor_cost' => 25.00,
                'parts_cost' => 45.00,
                'additional_cost' => 0.00,
                'subtotal' => 70.00,
                'discount' => 5.00,
                'taxes' => 10.40,
                'total' => 75.40,
                'validity_days' => 15,
                'status' => 'pending',
                'notes' => 'Cotización para reparación de puerto de carga',
                'quote_date' => now()->subDay(),
                'expiry_date' => now()->addDays(14),
            ],
            [
                'quote_number' => 'COT-2024-002',
                'customer_id' => $customers[3]->id,
                'user_id' => $adminId,
                'repair_order_id' => $repairOrders[3]->id,
                'work_description' => 'Diagnóstico y posible reemplazo de cámara trasera Huawei P50 Pro',
                'labor_cost' => 40.00,
                'parts_cost' => 150.00,
                'additional_cost' => 10.00,
                'subtotal' => 200.00,
                'discount' => 0.00,
                'taxes' => 32.00,
                'total' => 232.00,
                'validity_days' => 10,
                'status' => 'pending',
                'notes' => 'Precio estimado, sujeto a confirmación tras diagnóstico completo',
                'quote_date' => now(),
                'expiry_date' => now()->addDays(9),
            ],
            [
                'quote_number' => 'COT-2024-003',
                'customer_id' => $customers[0]->id,
                'user_id' => $adminId,
                'repair_order_id' => null,
                'work_description' => 'Mantenimiento preventivo iPad Air',
                'labor_cost' => 30.00,
                'parts_cost' => 0.00,
                'additional_cost' => 5.00,
                'subtotal' => 35.00,
                'discount' => 0.00,
                'taxes' => 5.60,
                'total' => 40.60,
                'validity_days' => 30,
                'status' => 'approved',
                'notes' => 'Limpieza interna y actualización de software',
                'quote_date' => now()->subDays(2),
                'expiry_date' => now()->addDays(28),
                'response_date' => now()->subDay(),
            ],
        ];

        $quoteModels = [];
        foreach ($quotes as $quote) {
            $quoteModels[] = Quote::create($quote);
        }

        return $quoteModels;
    }

    private function seedQuoteDetails($quotes, $products): void
    {
        $quoteDetails = [
            // Quote 1 details
            ['quote_id' => $quotes[0]->id, 'product_id' => $products[4]->id, 'description' => 'Conector Lightning iPhone', 'quantity' => 1, 'unit_price' => 45.00, 'total_price' => 45.00, 'item_type' => 'part'],
            ['quote_id' => $quotes[0]->id, 'product_id' => null, 'description' => 'Mano de obra - Reemplazo conector', 'quantity' => 1, 'unit_price' => 25.00, 'total_price' => 25.00, 'item_type' => 'labor'],

            // Quote 2 details
            ['quote_id' => $quotes[1]->id, 'product_id' => null, 'description' => 'Cámara trasera Huawei P50 Pro', 'quantity' => 1, 'unit_price' => 150.00, 'total_price' => 150.00, 'item_type' => 'part'],
            ['quote_id' => $quotes[1]->id, 'product_id' => null, 'description' => 'Diagnóstico completo', 'quantity' => 1, 'unit_price' => 25.00, 'total_price' => 25.00, 'item_type' => 'service'],
            ['quote_id' => $quotes[1]->id, 'product_id' => null, 'description' => 'Instalación y calibración', 'quantity' => 1, 'unit_price' => 15.00, 'total_price' => 15.00, 'item_type' => 'labor'],
            ['quote_id' => $quotes[1]->id, 'product_id' => null, 'description' => 'Pruebas de calidad', 'quantity' => 1, 'unit_price' => 10.00, 'total_price' => 10.00, 'item_type' => 'service'],

            // Quote 3 details
            ['quote_id' => $quotes[2]->id, 'product_id' => null, 'description' => 'Limpieza interna profesional', 'quantity' => 1, 'unit_price' => 20.00, 'total_price' => 20.00, 'item_type' => 'service'],
            ['quote_id' => $quotes[2]->id, 'product_id' => null, 'description' => 'Actualización de software', 'quantity' => 1, 'unit_price' => 10.00, 'total_price' => 10.00, 'item_type' => 'service'],
            ['quote_id' => $quotes[2]->id, 'product_id' => null, 'description' => 'Materiales de limpieza', 'quantity' => 1, 'unit_price' => 5.00, 'total_price' => 5.00, 'item_type' => 'other'],
        ];

        foreach ($quoteDetails as $detail) {
            QuoteDetail::create($detail);
        }
    }

    private function seedNotifications($adminId, $customers, $repairOrders): void
    {
        $notifications = [
            [
                'target_user_id' => $adminId,
                'customer_id' => null,
                'repair_order_id' => null,
                'type' => 'system',
                'subject' => 'Stock bajo detectado',
                'message' => 'El producto "Pistola de Calor" tiene stock bajo (3 unidades)',
                'recipient_email' => null,
                'recipient_phone' => null,
                'status' => 'pending',
                'scheduled_date' => now(),
                'send_attempts' => 0,
            ],
            [
                'target_user_id' => null,
                'customer_id' => $customers[1]->id,
                'repair_order_id' => $repairOrders[1]->id,
                'type' => 'email',
                'subject' => 'Su reparación está lista',
                'message' => 'Estimado cliente, su dispositivo Samsung Galaxy S23 ha sido reparado exitosamente y está listo para recoger.',
                'recipient_email' => $customers[1]->email,
                'recipient_phone' => null,
                'status' => 'pending',
                'scheduled_date' => now()->addHour(),
                'send_attempts' => 0,
            ],
            [
                'target_user_id' => null,
                'customer_id' => $customers[2]->id,
                'repair_order_id' => $repairOrders[2]->id,
                'type' => 'sms',
                'subject' => 'Cotización disponible',
                'message' => 'Hola! Su cotización para reparación de iPhone 13 está lista. Total: $75.40. Válida por 15 días.',
                'recipient_email' => null,
                'recipient_phone' => $customers[2]->phone,
                'status' => 'sent',
                'scheduled_date' => now()->subDay(),
                'sent_date' => now()->subDay(),
                'send_attempts' => 1,
            ],
            [
                'target_user_id' => null,
                'customer_id' => $customers[0]->id,
                'repair_order_id' => $repairOrders[0]->id,
                'type' => 'email',
                'subject' => 'Reparación completada',
                'message' => 'Su iPhone 14 ha sido reparado exitosamente. Muchas gracias por confiar en nosotros.',
                'recipient_email' => $customers[0]->email,
                'recipient_phone' => null,
                'status' => 'sent',
                'scheduled_date' => now()->subDays(6),
                'sent_date' => now()->subDays(6),
                'send_attempts' => 1,
            ],
            [
                'target_user_id' => $adminId,
                'customer_id' => null,
                'repair_order_id' => $repairOrders[3]->id,
                'type' => 'system',
                'subject' => 'Orden requiere atención',
                'message' => 'La orden ORD-2024-004 lleva más de 24 horas en diagnóstico',
                'recipient_email' => null,
                'recipient_phone' => null,
                'status' => 'read',
                'scheduled_date' => now()->subHours(2),
                'sent_date' => now()->subHours(2),
                'send_attempts' => 1,
            ],
        ];

        foreach ($notifications as $notification) {
            Notification::create($notification);
        }
    }
}
