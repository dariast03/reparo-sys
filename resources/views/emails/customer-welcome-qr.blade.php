<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a {{ config('app.name') }}!</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }

        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }

        .content {
            padding: 40px 30px;
        }

        .welcome-section {
            text-align: center;
            margin-bottom: 40px;
        }

        .welcome-section h2 {
            color: #2d3748;
            font-size: 24px;
            margin-bottom: 15px;
        }

        .welcome-section p {
            color: #4a5568;
            font-size: 16px;
            margin-bottom: 10px;
        }

        .customer-info {
            background-color: #f7fafc;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
        }

        .customer-info h3 {
            margin: 0 0 15px 0;
            color: #2d3748;
            font-size: 18px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
        }

        .info-label {
            font-weight: bold;
            color: #4a5568;
        }

        .info-value {
            color: #2d3748;
        }

        .qr-section {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }

        .qr-section h3 {
            margin: 0 0 15px 0;
            font-size: 22px;
        }

        .qr-section p {
            margin-bottom: 20px;
            font-size: 16px;
            opacity: 0.9;
        }

        .qr-code {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            display: inline-block;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .qr-code-text {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #4a5568;
            background-color: #f7fafc;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 10px;
        }

        .features {
            background-color: #f7fafc;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
        }

        .features h3 {
            margin: 0 0 20px 0;
            color: #2d3748;
            font-size: 20px;
            text-align: center;
        }

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        .feature {
            text-align: center;
            padding: 15px;
        }

        .feature-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            font-size: 24px;
            color: white;
        }

        .feature h4 {
            margin: 0 0 10px 0;
            color: #2d3748;
            font-size: 16px;
        }

        .feature p {
            margin: 0;
            color: #4a5568;
            font-size: 14px;
        }

        .cta {
            text-align: center;
            margin: 30px 0;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            transition: transform 0.2s ease;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .footer {
            background-color: #2d3748;
            color: #cbd5e0;
            padding: 30px;
            text-align: center;
        }

        .footer p {
            margin: 0 0 10px 0;
            font-size: 14px;
        }

        .footer a {
            color: #667eea;
            text-decoration: none;
        }

        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }

        @media (max-width: 600px) {
            .container {
                margin: 0;
            }

            .header, .content, .footer {
                padding: 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .welcome-section h2 {
                font-size: 20px;
            }

            .feature-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎉 ¡Bienvenido a {{ config('app.name') }}!</h1>
            <p>Tu cuenta ha sido creada exitosamente</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Welcome Section -->
            <div class="welcome-section">
                <h2>¡Hola, {{ $customer->first_name }}!</h2>
                <p>Nos complace tenerte como parte de nuestra familia.</p>
                <p>Hemos creado tu perfil de cliente con toda tu información para brindarte un mejor servicio.</p>
            </div>

            <!-- Customer Information -->
            <div class="customer-info">
                <h3>📋 Tu información registrada</h3>
                <div class="info-row">
                    <span class="info-label">Nombre completo:</span>
                    <span class="info-value">{{ $customer->full_name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">{{ $customer->document_type === 'ci' ? 'Cédula de Identidad' : 'Documento' }}:</span>
                    <span class="info-value">{{ $customer->document_number }}</span>
                </div>
                @if($customer->email)
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ $customer->email }}</span>
                </div>
                @endif
                @if($customer->phone)
                <div class="info-row">
                    <span class="info-label">Teléfono:</span>
                    <span class="info-value">{{ $customer->phone }}</span>
                </div>
                @endif
            </div>

            <!-- QR Code Section -->
            <div class="qr-section">
                <h3>🔗 Tu Código QR Personal</h3>
                <p>Este código QR te permitirá acceder rápidamente a tu información, historial de reparaciones y más.</p>

                <div class="qr-code">
                    <img src="{{ $customer->qr_data_uri }}" alt="Código QR de {{ $customer->full_name }}" style="max-width: 200px; height: auto;">
                </div>

                <div class="qr-code-text">{{ $customer->qr_code }}</div>

                <p style="font-size: 14px; margin-top: 15px;">
                    💡 <strong>Tip:</strong> Guarda este código QR en tu teléfono para acceso rápido
                </p>
            </div>

            <!-- Features -->
            <div class="features">
                <h3>✨ ¿Qué puedes hacer con tu código QR?</h3>
                <div class="feature-grid">
                    <div class="feature">
                        <div class="feature-icon">📱</div>
                        <h4>Acceso Rápido</h4>
                        <p>Escanea el código para acceder instantáneamente a tu portal personal</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">📋</div>
                        <h4>Historial Completo</h4>
                        <p>Ve todas tus reparaciones, cotizaciones y compras en un solo lugar</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🔧</div>
                        <h4>Nuevas Órdenes</h4>
                        <p>Facilita la creación de nuevas órdenes de reparación</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">💰</div>
                        <h4>Ofertas Exclusivas</h4>
                        <p>Recibe descuentos y promociones especiales</p>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Call to Action -->
            <div class="cta">
                <p style="margin-bottom: 20px; color: #4a5568; font-size: 16px;">
                    ¡Prueba tu código QR ahora mismo!
                </p>
                <a href="{{ $customer->qr_url }}" class="cta-button">
                    🚀 Ver Mi Portal
                </a>
            </div>

            <div class="divider"></div>

            <!-- Additional Info -->
            <div style="text-align: center; color: #4a5568;">
                <p><strong>📞 ¿Necesitas ayuda?</strong></p>
                <p>Nuestro equipo está aquí para ayudarte. No dudes en contactarnos.</p>
                <p>También hemos adjuntado tu código QR como imagen para que lo guardes fácilmente.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>{{ config('app.name') }}</strong></p>
            <p>Sistema de Gestión de Reparaciones</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>
