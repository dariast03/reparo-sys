<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización #{{ $quote->quote_number }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        .quote-info {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .quote-info h3 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 18px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .info-label {
            font-weight: 600;
            color: #495057;
        }
        .info-value {
            color: #6c757d;
        }
        .total {
            background-color: #e3f2fd;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #1976d2;
            margin: 0;
        }
        .total-label {
            color: #666;
            font-size: 14px;
            margin: 0;
        }
        .description {
            background-color: #fff3e0;
            border: 1px solid #ffcc02;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .description h4 {
            margin: 0 0 10px 0;
            color: #e65100;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #6c757d;
        }
        .contact-info {
            background-color: #e8f5e8;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .contact-info h4 {
            margin: 0 0 10px 0;
            color: #2e7d32;
        }
        .validity-warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .validity-warning strong {
            color: #856404;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .content {
                padding: 20px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-value {
                margin-top: 5px;
                font-weight: 600;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $company }}</h1>
            <p>Cotización de Servicios de Reparación</p>
        </div>

        <div class="content">
            <div class="greeting">
                ¡Hola {{ $customer->name }}!
            </div>

            <p>Esperamos que se encuentre muy bien. Nos complace enviarle la cotización solicitada para los servicios de reparación:</p>

            <div class="quote-info">
                <h3>📋 Detalles de la Cotización</h3>
                <div class="info-row">
                    <span class="info-label">Número de Cotización:</span>
                    <span class="info-value">#{{ $quote->quote_number }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha de Emisión:</span>
                    <span class="info-value">{{ $quote->created_at->format('d/m/Y') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Válida Hasta:</span>
                    <span class="info-value">{{ $quote->expiry_date->format('d/m/Y') }}</span>
                </div>
                @if($quote->repairOrder)
                <div class="info-row">
                    <span class="info-label">Orden de Reparación:</span>
                    <span class="info-value">#{{ $quote->repairOrder->order_number }}</span>
                </div>
                @endif
            </div>

            <div class="description">
                <h4>🔧 Descripción del Trabajo</h4>
                <p style="margin: 0; line-height: 1.5;">{{ $quote->work_description }}</p>
            </div>

            <div class="total">
                <p class="total-label">Total de la Cotización</p>
                <p class="total-amount">${{ number_format($quote->total, 2) }}</p>
            </div>

            @if($quote->validity_days <= 7)
            <div class="validity-warning">
                <strong>⚠️ Atención:</strong> Esta cotización tiene una validez limitada de {{ $quote->validity_days }} días.
                Por favor, contáctenos pronto para proceder con la reparación.
            </div>
            @endif

            <div style="text-align: center; margin: 30px 0;">
                <p><strong>¿Desea proceder con la reparación?</strong></p>
                <p>Por favor, responda a este correo o contáctenos directamente para confirmar.</p>
            </div>

            <div class="contact-info">
                <h4>📞 Información de Contacto</h4>
                <p><strong>Teléfono:</strong> [Su número de teléfono]</p>
                <p><strong>Email:</strong> [Su email de contacto]</p>
                <p><strong>Dirección:</strong> [Su dirección]</p>
                <p><strong>Horarios:</strong> Lunes a Viernes: 9:00 AM - 6:00 PM</p>
            </div>

            @if($quote->notes)
            <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1565c0;">📝 Notas Adicionales</h4>
                <p style="margin: 0;">{{ $quote->notes }}</p>
            </div>
            @endif

            <p>Encontrará adjunto el PDF detallado de la cotización con todos los ítems y costos especificados.</p>

            <p>Agradecemos su confianza en nuestros servicios y esperamos su pronta respuesta.</p>

            <p style="margin-top: 30px;">
                <strong>Saludos cordiales,</strong><br>
                <span style="color: #667eea;">El equipo de {{ $company }}</span>
            </p>
        </div>

        <div class="footer">
            <p><strong>{{ $company }}</strong></p>
            <p>Este es un correo automático, por favor no responda a esta dirección.</p>
            <p>Para consultas, utilice nuestros canales de contacto oficiales.</p>
        </div>
    </div>
</body>
</html>
