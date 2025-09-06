# Servicio de Notificaciones WhatsApp

Este documento describe la implementación del servicio de notificaciones WhatsApp para el sistema de reparaciones.

## Guía de Implementación Completa

### Paso 1: Configuración Inicial

1. **Agregar variables de entorno** al archivo `.env`:
```env
# Configuración WhatsApp API
WHATSAPP_BASE_URL="https://wcm.vendisqr.com"
WHATSAPP_SESSION_NAME="tu_session_name"
WHATSAPP_API_KEY="tu_api_key"
```

2. **Verificar que el storage público esté configurado:**
```bash
php artisan storage:link
```

### Paso 2: Configuración del Frontend

#### Para Cotizaciones (QuoteController)

Los métodos ya están implementados en el controlador:

```php
// Envío por email (incluye WhatsApp si está disponible)
Route::post('/admin/quotes/{quote}/send-email', [QuoteController::class, 'sendEmail']);

// Solo WhatsApp
Route::post('/admin/quotes/{quote}/send-whatsapp', [QuoteController::class, 'sendWhatsApp']);

// Ambos canales
Route::post('/admin/quotes/{quote}/send-both', [QuoteController::class, 'sendBoth']);
```

#### Para Clientes (CustomerController)

Los métodos de envío de QR también están disponibles:

```php
// Envío de QR por ambos canales
Route::post('/admin/customers/{customer}/send-qr', [CustomerController::class, 'sendQr']);
```

### Paso 3: Pruebas del Sistema

1. **Probar conexión básica:**
```bash
php artisan test:whatsapp-document "59178912345" "/ruta/a/archivo.pdf"
```

2. **Probar notificación de cliente:**
```bash
php artisan test:customer-notification 1
```

3. **Probar notificación de orden:**
```bash
php artisan test:order-notification 1 repaired
```

4. **Probar envío de cotización:**
```bash
php artisan test:customer-notification 1 --quote=5
```

### Paso 4: Monitoreo y Logs

Los logs se generan automáticamente en `storage/logs/laravel.log`:

- **Envíos exitosos:** `[INFO] WhatsApp message sent successfully`
- **Errores de API:** `[ERROR] WhatsApp API error`
- **Errores de configuración:** `[ERROR] WhatsApp service not configured`

### Paso 5: Integración con la UI

Para agregar botones de WhatsApp en el frontend, utiliza las rutas implementadas:

```javascript
// Ejemplo con Axios
axios.post(`/admin/quotes/${quoteId}/send-whatsapp`)
  .then(response => {
    // Manejar éxito
    console.log('Cotización enviada por WhatsApp');
  })
  .catch(error => {
    // Manejar error
    console.error('Error enviando por WhatsApp:', error.response.data.message);
  });
```

### Archivos Creados

#### 1. Servicio Principal
- `app/Services/WhatsAppService.php` - Servicio principal para enviar mensajes de WhatsApp

#### 2. Clases de Notificación
- `app/Notifications/CustomerWelcomeQrWhatsApp.php` - Notificación de bienvenida con código QR
- `app/Notifications/RepairOrderStatusWhatsApp.php` - Notificación de cambios de estado de órdenes

#### 3. Servicio Unificado
- `app/Services/NotificationService.php` - Servicio que coordina notificaciones por email y WhatsApp

#### 4. Jobs Asíncronos
- `app/Jobs/SendWelcomeNotificationJob.php` - Job para enviar notificaciones de bienvenida
- `app/Jobs/SendRepairOrderStatusNotificationJob.php` - Job para notificar cambios de estado

#### 5. Comandos de Testing
- `app/Console/Commands/TestWhatsAppService.php` - Comando para probar el servicio básico
- `app/Console/Commands/TestCustomerNotification.php` - Comando para probar notificaciones de cliente

## Funcionalidades Implementadas

### 1. Bienvenida de Clientes

**Cuándo se ejecuta:**
- Al crear un nuevo cliente con teléfono registrado
- Al enviar manualmente el código QR desde el panel de administración

**Qué hace:**
- Genera un código QR con la URL del cliente
- Guarda temporalmente la imagen en storage
- Envía la imagen por WhatsApp con un mensaje de bienvenida
- Limpia el archivo temporal

**Canales soportados:** Email y WhatsApp

## Comandos de Prueba Disponibles

### 1. Notificación de Cliente (QR)
```bash
php artisan test:customer-notification {customer_id}
```

**Ejemplo:**
```bash
php artisan test:customer-notification 1
```

### 2. Notificación de Estado de Orden
```bash
php artisan test:order-notification {order_id} {status}
```

**Estados disponibles:** received, diagnosing, waiting_parts, repairing, quality_check, repaired, delivered, cancelled

**Ejemplo:**
```bash
php artisan test:order-notification 1 repaired
```

### 3. Documento de WhatsApp (Nueva)
```bash
php artisan test:whatsapp-document {phone} {file_path} [--caption="Mensaje opcional"]
```

**Ejemplo:**
```bash
php artisan test:whatsapp-document "59178912345" "/path/to/document.pdf" --caption="Su cotización está lista"
```

### 4. Notificación de Cotización con PDF (Nueva)
```bash
php artisan test:customer-notification {customer_id} --quote={quote_id}
```

**Ejemplo:**
```bash
php artisan test:customer-notification 1 --quote=5
```

Este comando genera y envía la cotización como PDF por WhatsApp.

## Uso

### Comandos de Testing

```bash
# Probar servicio básico de WhatsApp
php artisan whatsapp:test 59165811117 "Mensaje de prueba"

# Probar notificación de bienvenida
php artisan notification:test-customer 1 --type=welcome

# Probar notificación de estado de orden
php artisan notification:test-customer 1 --type=status --repair_order_id=1
```

### Uso Programático

```php
use App\Services\NotificationService;
use App\Jobs\SendWelcomeNotificationJob;
use App\Jobs\SendRepairOrderStatusNotificationJob;

// Enviar notificación de bienvenida (síncrono)
$notificationService = new NotificationService();
$results = $notificationService->sendWelcomeQr($customer, ['whatsapp']);

// Enviar notificación de bienvenida (asíncrono)
SendWelcomeNotificationJob::dispatch($customer, ['email', 'whatsapp']);

// Enviar notificación de estado (asíncrono)
SendRepairOrderStatusNotificationJob::dispatch($repairOrder, ['whatsapp'], $oldStatus);
```

## Estructura de Mensajes

### Mensaje de Bienvenida

```
¡Bienvenido/a a [NOMBRE_APP]!

Estimado/a [NOMBRE_CLIENTE],

Te damos la bienvenida a nuestro sistema de reparaciones...
[Incluye código QR como imagen]
```

### Mensaje de Estado de Orden

```
Hola [NOMBRE]! 👋

[TÍTULO_ESTADO]
Orden: #[NÚMERO_ORDEN]
Dispositivo: [MARCA] [MODELO]

[MENSAJE_DESCRIPTIVO]

[Información adicional según el estado]
---
🏪 [NOMBRE_APP]
Para más detalles, usa tu código QR personal...
```

## Configuración de la API WhatsApp

La API utiliza el endpoint:
```
POST {{BASE_URL}}/api/{{SESSION_ID}}/messages/send
Headers: x-api-key: {{API_KEY}}
```

### Formato para mensajes de texto:
```json
{
  "jid": "59165811117@s.whatsapp.net",
  "type": "number",
  "message": {
    "text": "Tu mensaje aquí"
  }
}
```

### Formato para imágenes:
```json
{
  "jid": "59165811117@s.whatsapp.net",
  "type": "number",
  "message": {
    "image": {
      "url": "https://tu-app.com/storage/temp/qr-code.png"
    },
    "caption": "Tu mensaje aquí"
  }
}
```

## Logging y Debugging

Todos los intentos de notificación se registran en los logs de Laravel:

```bash
# Ver logs en tiempo real
php artisan pail

# Ver logs específicos
tail -f storage/logs/laravel.log | grep -i whatsapp
```

## Colas y Jobs

Para que las notificaciones funcionen correctamente en producción, asegúrate de tener configuradas las colas:

```bash
# Ejecutar worker de colas
php artisan queue:work

# Reiniciar workers después de cambios
php artisan queue:restart
```

## Manejo de Errores

- Si falla el envío por WhatsApp, se registra en los logs pero no afecta la operación principal
- Los jobs tienen retry automático en caso de fallas temporales
- Se valida la configuración antes de intentar enviar mensajes
- Se manejan errores de red y API de forma graceful

## Consideraciones de Seguridad

- Las claves API se almacenan en variables de entorno
- Los códigos QR temporales se eliminan después del envío
- Se valida que el número de teléfono tenga el formato correcto
- Se registran los intentos de notificación para auditoría
