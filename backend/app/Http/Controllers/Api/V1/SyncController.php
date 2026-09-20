<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DevicePairing;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SyncController extends Controller
{
    /**
     * Generar un código numérico temporal de 6 dígitos para vincular PC con Móvil.
     */
    public function generateCode(Request $request)
    {
        $vaultId = $request->input('vault_id') ?: $request->header('X-Vault-Id');

        if (empty($vaultId)) {
            $vaultId = 'VAULT-' . strtoupper(Str::random(12));
        }

        // Generar código único de 6 dígitos
        do {
            $code = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        } while (DevicePairing::where('code', $code)->where('expires_at', '>', now())->exists());

        $pairing = DevicePairing::create([
            'code' => $code,
            'vault_id' => $vaultId,
            'expires_at' => now()->addMinutes(10),
            'is_used' => false,
        ]);

        return response()->json([
            'success' => true,
            'code' => $code,
            'formatted_code' => substr($code, 0, 3) . ' ' . substr($code, 3),
            'vault_id' => $vaultId,
            'expires_at' => $pairing->expires_at->toIso8601String(),
            'expires_in_seconds' => 600,
        ]);
    }

    /**
     * Vincular un dispositivo móvil usando el código de 6 dígitos.
     */
    public function linkDevice(Request $request)
    {
        $rawCode = $request->input('code', '');
        $code = preg_replace('/\D/', '', $rawCode);

        if (strlen($code) !== 6) {
            return response()->json([
                'success' => false,
                'message' => 'El código de vinculación debe ser de 6 dígitos.',
            ], 400);
        }

        $pairing = DevicePairing::where('code', $code)->first();

        if (!$pairing) {
            return response()->json([
                'success' => false,
                'message' => 'Código de vinculación inválido o no encontrado.',
            ], 404);
        }

        if ($pairing->expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'El código ha expirado. Por favor genera un nuevo código en tu PC.',
            ], 410);
        }

        $pairing->update(['is_used' => true]);

        return response()->json([
            'success' => true,
            'message' => '¡Dispositivo vinculado con éxito!',
            'vault_id' => $pairing->vault_id,
        ]);
    }

    /**
     * Verificar si el código ha sido emparejado exitosamente.
     */
    public function getStatus(Request $request)
    {
        $rawCode = $request->query('code', '');
        $code = preg_replace('/\D/', '', $rawCode);

        if (empty($code)) {
            return response()->json(['success' => false, 'is_linked' => false], 400);
        }

        $pairing = DevicePairing::where('code', $code)->first();

        if (!$pairing) {
            return response()->json(['success' => false, 'is_linked' => false]);
        }

        return response()->json([
            'success' => true,
            'is_linked' => (bool)$pairing->is_used,
            'vault_id' => $pairing->vault_id,
            'is_expired' => $pairing->expires_at->isPast(),
        ]);
    }
}
