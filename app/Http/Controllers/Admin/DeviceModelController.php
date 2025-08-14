<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDeviceModelRequest;
use App\Http\Requests\Admin\UpdateDeviceModelRequest;
use App\Models\Brand;
use App\Models\DeviceModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeviceModelController extends Controller
{
    public function index(Request $request)
    {
        $query = DeviceModel::with('brand');

        // Search filter
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('brand', function ($brandQuery) use ($search) {
                        $brandQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Device type filter
        if ($request->has('device_type') && $request->get('device_type') !== 'all') {
            $query->where('device_type', $request->get('device_type'));
        }

        // Brand filter
        if ($request->has('brand_id') && $request->get('brand_id') !== 'all') {
            $query->where('brand_id', $request->get('brand_id'));
        }

        $deviceModels = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('admin/device-models/index', [
            'deviceModels' => $deviceModels,
            'filters' => $request->only(['search', 'status', 'device_type', 'brand_id']),
            'brands' => Brand::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/device-models/create', [
            'brands' => Brand::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreDeviceModelRequest $request)
    {
        DeviceModel::create($request->validated());

        return redirect()->route('admin.device-models.index')
            ->with('success', 'Modelo de dispositivo creado exitosamente.');
    }

    public function show(DeviceModel $deviceModel)
    {
        $deviceModel->load('brand', 'repairOrders');

        return Inertia::render('admin/device-models/show', [
            'deviceModel' => $deviceModel,
        ]);
    }

    public function edit(DeviceModel $deviceModel)
    {
        $deviceModel->load('brand');

        return Inertia::render('admin/device-models/edit', [
            'deviceModel' => $deviceModel,
            'brands' => Brand::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateDeviceModelRequest $request, DeviceModel $deviceModel)
    {
        $deviceModel->update($request->validated());

        return redirect()->route('admin.device-models.index')
            ->with('success', 'Modelo de dispositivo actualizado exitosamente.');
    }

    public function destroy(DeviceModel $deviceModel)
    {
        // Check if the model has associated repair orders
        if ($deviceModel->repairOrders()->count() > 0) {
            return back()->with('error', 'No se puede eliminar el modelo porque tiene órdenes de reparación asociadas.');
        }

        $deviceModel->update(['status' => 'inactive']);

        return back()->with('success', 'Modelo de dispositivo desactivado exitosamente.');
    }

    public function reactivate(DeviceModel $deviceModel)
    {
        $deviceModel->update(['status' => 'active']);

        return back()->with('success', 'Modelo de dispositivo reactivado exitosamente.');
    }
}
