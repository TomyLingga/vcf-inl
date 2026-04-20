<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\Transporter;
use Illuminate\Http\Request;

class TransporterController extends Controller
{
    public function index(Request $request)
    {
        $query = Transporter::query();

        if ($request->has('search')) {
            $query->where('nama_transporter', 'like', '%' . $request->search . '%')
                  ->orWhere('kode', 'like', '%' . $request->search . '%');
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $data = $request->boolean('all')
            ? $query->orderBy('nama_transporter')->get()
            : $query->orderBy('nama_transporter')->paginate($request->get('per_page', 15));

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_transporter' => 'required|string|max:255',
            'kode'             => 'required|string|max:50|unique:transporters,kode',
            'is_active'        => 'boolean',
        ]);

        $transporter = Transporter::create($validated);

        return response()->json([
            'message' => 'Transporter berhasil ditambahkan.',
            'data'    => $transporter,
        ], 201);
    }

    public function show(Transporter $transporter)
    {
        return response()->json($transporter->load('drivers'));
    }

    public function update(Request $request, Transporter $transporter)
    {
        $validated = $request->validate([
            'nama_transporter' => 'sometimes|required|string|max:255',
            'kode'             => 'sometimes|required|string|max:50|unique:transporters,kode,' . $transporter->id,
            'is_active'        => 'boolean',
        ]);

        $transporter->update($validated);

        return response()->json([
            'message' => 'Transporter berhasil diperbarui.',
            'data'    => $transporter,
        ]);
    }

    public function destroy(Transporter $transporter)
    {
        if ($transporter->drivers()->exists() || $transporter->vcfs()->exists()) {
            return response()->json([
                'message' => 'Transporter tidak dapat dihapus karena masih memiliki data terkait.',
            ], 422);
        }

        $transporter->delete();

        return response()->json(['message' => 'Transporter berhasil dihapus.']);
    }
}
