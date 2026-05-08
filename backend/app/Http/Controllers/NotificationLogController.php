<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use Illuminate\Http\Request;

class NotificationLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = NotificationLog::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();
        
        return response()->json($logs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:added,removed,to_main,to_wait,convocation,quota',
            'student_name' => 'nullable|string',
            'detail' => 'required|string',
        ]);

        $log = NotificationLog::create([
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'student_name' => $validated['student_name'] ?? null,
            'detail' => $validated['detail'],
            'checked' => false,
        ]);

        return response()->json($log, 201);
    }

    public function toggleCheck(Request $request, $id)
    {
        $log = NotificationLog::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $log->update(['checked' => !$log->checked]);

        return response()->json($log);
    }

    public function checkAll(Request $request)
    {
        NotificationLog::where('user_id', $request->user()->id)
            ->where('checked', false)
            ->update(['checked' => true]);

        return response()->json(['message' => 'Tout marqué comme lu']);
    }

    public function clear(Request $request)
    {
        NotificationLog::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Historique effacé']);
    }
}