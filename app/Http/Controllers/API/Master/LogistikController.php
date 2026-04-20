<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\Logistik;
use Illuminate\Http\Request;

class LogistikController extends Controller
{
    public function index(Request $request)
    {
        $query = Logistik::query();

        if ($request->has('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%')
                  ->orWhere('kode', 'like', '%' . $request->search . '%');
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $data = $request->boolean('all')
            ? $query->orderBy('nama')->get()
            : $query->orderBy('nama')->paginate($request->get('per_page', 15));

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama'      => 'required|string|max:100',
            'kode'      => 'required|string|max:20|unique:logistiks,kode',
            'is_active' => 'boolean',
        ]);

        $data = Logistik::create($validated);

        return response()->json([
            'message' => 'Logistik berhasil ditambahkan.',
            'data'    => $data,
        ], 201);
    }

    public function show(Logistik $logistik)
    {
        return response()->json($logistik);
    }

    public function update(Request $request, Logistik $logistik)
    {
        $validated = $request->validate([
            'nama'      => 'sometimes|required|string|max:100',
            'kode'      => 'sometimes|required|string|max:20|unique:logistiks,kode,' . $logistik->id,
            'is_active' => 'boolean',
        ]);

        $logistik->update($validated);

        return response()->json([
            'message' => 'Logistik berhasil diperbarui.',
            'data'    => $logistik,
        ]);
    }

    public function destroy(Logistik $logistik)
    {
        if ($logistik->vcfs()->exists()) {
            return response()->json([
                'message' => 'Logistik tidak dapat dihapus karena masih digunakan.',
            ], 422);
        }

        $logistik->delete();

        return response()->json(['message' => 'Logistik berhasil dihapus.']);
    }
}
