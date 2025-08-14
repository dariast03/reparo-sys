<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización #{{ $quote->quote_number }}</title>
    <style>
        @page {
            margin: 2cm 1.5cm;
            font-family: 'DejaVu Sans', sans-serif;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 20px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin: 0;
        }
        .document-title {
            font-size: 18px;
            color: #666;
            margin: 5px 0;
        }
        .quote-number {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin: 10px 0;
        }
        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .info-left, .info-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .info-right {
            text-align: right;
        }
        .info-box {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 10px;
            background-color: #f9f9f9;
        }
        .info-box h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
            font-weight: bold;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .info-box p {
            margin: 3px 0;
            font-size: 11px;
        }
        .description-section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            background-color: #f8f9fa;
        }
        .description-section h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11px;
        }
        .items-table th {
            background-color: #667eea;
            color: white;
            padding: 10px 5px;
            text-align: left;
            font-weight: bold;
        }
        .items-table td {
            padding: 8px 5px;
            border-bottom: 1px solid #ddd;
        }
        .items-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .totals-section {
            margin-top: 20px;
            float: right;
            width: 300px;
        }
        .totals-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        .totals-table td {
            padding: 5px 10px;
            border: 1px solid #ddd;
        }
        .totals-table .label {
            background-color: #f0f0f0;
            font-weight: bold;
            width: 60%;
        }
        .totals-table .total-row {
            background-color: #667eea;
            color: white;
            font-weight: bold;
            font-size: 14px;
        }
        .terms-section {
            clear: both;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        .terms-section h4 {
            font-size: 14px;
            margin: 0 0 10px 0;
            color: #333;
        }
        .terms-section ul {
            margin: 0;
            padding-left: 20px;
            font-size: 10px;
            line-height: 1.5;
        }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 10px;
            color: #666;
            padding-top: 10px;
            border-top: 1px solid #ddd;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-draft { background-color: #ffeaa7; color: #2d3436; }
        .status-sent { background-color: #74b9ff; color: white; }
        .status-approved { background-color: #00b894; color: white; }
        .status-rejected { background-color: #e17055; color: white; }
        .status-expired { background-color: #636e72; color: white; }
        .validity-warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            margin: 15px 0;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="company-name">{{ config('app.name') }}</h1>
        <p class="document-title">COTIZACIÓN DE SERVICIOS</p>
        <p class="quote-number">#{{ $quote->quote_number }}</p>
        <span class="status-badge status-{{ $quote->status }}">{{ ucfirst($quote->status) }}</span>
    </div>

    <div class="info-section">
        <div class="info-left">
            <div class="info-box">
                <h4>DATOS DEL CLIENTE</h4>
                <p><strong>Nombre:</strong> {{ $quote->customer->name }}</p>
                <p><strong>Email:</strong> {{ $quote->customer->email }}</p>
                <p><strong>Teléfono:</strong> {{ $quote->customer->phone ?? 'No especificado' }}</p>
                <p><strong>Dirección:</strong> {{ $quote->customer->address ?? 'No especificada' }}</p>
            </div>

            @if($quote->repairOrder)
            <div class="info-box">
                <h4>ORDEN DE REPARACIÓN VINCULADA</h4>
                <p><strong>Número:</strong> #{{ $quote->repairOrder->order_number }}</p>
                <p><strong>Estado:</strong> {{ ucfirst($quote->repairOrder->status) }}</p>
                <p><strong>Dispositivo:</strong> {{ $quote->repairOrder->device_info ?? 'No especificado' }}</p>
            </div>
            @endif
        </div>

        <div class="info-right">
            <div class="info-box">
                <h4>INFORMACIÓN DE LA COTIZACIÓN</h4>
                <p><strong>Fecha de Emisión:</strong> {{ $quote->created_at->format('d/m/Y') }}</p>
                <p><strong>Fecha de Vencimiento:</strong> {{ $quote->expiry_date->format('d/m/Y') }}</p>
                <p><strong>Días de Validez:</strong> {{ $quote->validity_days }} días</p>
                <p><strong>Elaborado por:</strong> {{ $quote->user->name }}</p>
            </div>

            @if($quote->expiry_date->isPast())
            <div class="validity-warning">
                ⚠️ COTIZACIÓN VENCIDA
            </div>
            @elseif($quote->expiry_date->diffInDays(now()) <= 3)
            <div class="validity-warning">
                ⚠️ VENCE EN {{ $quote->expiry_date->diffInDays(now()) }} DÍAS
            </div>
            @endif
        </div>
    </div>

    <div class="description-section">
        <h4>DESCRIPCIÓN DEL TRABAJO A REALIZAR</h4>
        <p>{{ $quote->work_description }}</p>
    </div>

    @if($quote->quoteDetails && $quote->quoteDetails->count() > 0)
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%">#</th>
                <th style="width: 10%">Tipo</th>
                <th style="width: 45%">Descripción</th>
                <th style="width: 10%" class="text-center">Cantidad</th>
                <th style="width: 15%" class="text-right">Precio Unit.</th>
                <th style="width: 15%" class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($quote->quoteDetails as $index => $detail)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="text-center">
                    @if($detail->type === 'product')
                        <span style="background-color: #e3f2fd; padding: 2px 6px; border-radius: 10px; font-size: 9px;">REPUESTO</span>
                    @elseif($detail->type === 'labor')
                        <span style="background-color: #f3e5f5; padding: 2px 6px; border-radius: 10px; font-size: 9px;">M. OBRA</span>
                    @else
                        <span style="background-color: #e8f5e8; padding: 2px 6px; border-radius: 10px; font-size: 9px;">SERVICIO</span>
                    @endif
                </td>
                <td>{{ $detail->description }}</td>
                <td class="text-center">{{ number_format($detail->quantity, 2) }}</td>
                <td class="text-right">${{ number_format($detail->unit_price, 2) }}</td>
                <td class="text-right">${{ number_format($detail->total_price, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="totals-section">
        <table class="totals-table">
            <tr>
                <td class="label">Mano de Obra:</td>
                <td class="text-right">${{ number_format($quote->labor_cost, 2) }}</td>
            </tr>
            <tr>
                <td class="label">Repuestos:</td>
                <td class="text-right">${{ number_format($quote->parts_cost, 2) }}</td>
            </tr>
            @if($quote->additional_cost > 0)
            <tr>
                <td class="label">Costos Adicionales:</td>
                <td class="text-right">${{ number_format($quote->additional_cost, 2) }}</td>
            </tr>
            @endif
            <tr>
                <td class="label">Subtotal:</td>
                <td class="text-right">${{ number_format($quote->subtotal, 2) }}</td>
            </tr>
            @if($quote->discount > 0)
            <tr>
                <td class="label">Descuento:</td>
                <td class="text-right">-${{ number_format($quote->discount, 2) }}</td>
            </tr>
            @endif
            @if($quote->taxes > 0)
            <tr>
                <td class="label">Impuestos:</td>
                <td class="text-right">${{ number_format($quote->taxes, 2) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td class="label">TOTAL:</td>
                <td class="text-right">${{ number_format($quote->total, 2) }}</td>
            </tr>
        </table>
    </div>

    <div class="terms-section">
        <h4>TÉRMINOS Y CONDICIONES</h4>
        <ul>
            <li>Esta cotización es válida por {{ $quote->validity_days }} días a partir de la fecha de emisión.</li>
            <li>Los precios incluyen mano de obra y repuestos especificados.</li>
            <li>Cualquier trabajo adicional no contemplado en esta cotización será cotizado por separado.</li>
            <li>Los repuestos defectuosos o dañados durante la reparación serán reemplazados sin costo adicional.</li>
            <li>El cliente debe aprobar la cotización antes de iniciar cualquier trabajo.</li>
            <li>Los dispositivos no reclamados después de 30 días serán considerados abandonados.</li>
            <li>La garantía de reparación es de 30 días sobre el trabajo realizado.</li>
        </ul>

        @if($quote->notes)
        <h4 style="margin-top: 20px;">NOTAS ADICIONALES</h4>
        <p style="font-size: 11px; background-color: #f8f9fa; padding: 10px; border-left: 3px solid #667eea;">
            {{ $quote->notes }}
        </p>
        @endif
    </div>

    <div class="footer">
        <p>
            <strong>{{ config('app.name') }}</strong> |
            Generado el {{ now()->format('d/m/Y H:i') }} |
            Página 1 de 1
        </p>
    </div>
</body>
</html>
