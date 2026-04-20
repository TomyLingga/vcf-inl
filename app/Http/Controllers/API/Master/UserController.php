<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    protected array $allowedRoles = [
        'admin',
        'petugas',
    ];

    private $messageFail = 'Something went wrong';
    private $messageMissing = 'Data not found in record';
    private $messageAll = 'Success to Fetch All Datas';
    private $messageSuccess = 'Success to Fetch Data';
    private $messageCreate = 'Success to Create Data';
    private $messageUpdate = 'Success to Update Data';

    public function index(Request $request)
    {
        try {
            $data = User::orderBy('nama', 'asc')
                    ->get();

            if ($data->isEmpty()) {
                return response()->json(['message' => $this->messageMissing], 401);
            }

            return response()->json(['data' => $data, 'message' => $this->messageAll], 200);
        } catch (QueryException $e) {
            return response()->json([
                'message' => $this->messageFail,
                'err' => $e->getTrace()[0],
                'errMsg' => $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
            try {
                $validated = $request->validate([
                'nama'      => 'required|string|max:255',
                'username'  => 'required|string|max:100|unique:users,username',
                'password'  => 'required|string|min:8|confirmed',
                'role'      => 'required|in:' . implode(',', $this->allowedRoles),
                'is_active' => 'boolean',
            ]);

            $user = User::create([
                'nama'          => $validated['nama'],
                'username'      => $validated['username'],
                'password_hash' => Hash::make($validated['password']),
                'role'          => $validated['role'],
                'is_active'     => $validated['is_active'] ?? true,
            ]);
            DB::commit();
            return response()->json([
                'message' => 'User berhasil ditambahkan.',
                'data'    => $user->only('id', 'nama', 'username', 'role', 'is_active'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => "Ada kesalahan",
                'err' => $e->getTrace()[0],
                'errMsg' => $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

    public function show(User $user)
    {
        return response()->json(
            $user->only('id', 'nama', 'username', 'role', 'is_active', 'created_at')
        );
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'nama'      => 'sometimes|required|string|max:255',
            'username'  => 'sometimes|required|string|max:100|unique:users,username,' . $user->id,
            'role'      => 'sometimes|required|in:' . implode(',', $this->allowedRoles),
            'is_active' => 'boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'data'    => $user->only('id', 'nama', 'username', 'role', 'is_active'),
        ]);
    }

    /**
     * Reset password user (admin only).
     */
    public function resetPassword(Request $request, User $user)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password_hash' => Hash::make($request->password),
        ]);

        // Cabut semua token aktif user tersebut
        $user->tokens()->delete();

        return response()->json(['message' => 'Password berhasil direset. Semua sesi aktif telah dicabut.']);
    }

    public function destroy(User $user)
    {
        // Jangan hapus diri sendiri
        if ($user->id === request()->user()->id) {
            return response()->json([
                'message' => 'Tidak dapat menghapus akun sendiri.',
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus.']);
    }
}
