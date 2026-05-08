<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Models\User;

class NotificationService
{
    public static function notifySecretaries($type, $studentName, $detail)
    {
        $secretaries = User::where('role', 'secretary')->get();

        foreach ($secretaries as $secretary) {
            NotificationLog::create([
                'user_id' => $secretary->id,
                'type' => $type,
                'student_name' => $studentName,
                'detail' => $detail,
                'checked' => false,
            ]);
        }
    }

    public static function notifyUser($userId, $type, $studentName, $detail)
    {
        NotificationLog::create([
            'user_id' => $userId,
            'type' => $type,
            'student_name' => $studentName,
            'detail' => $detail,
            'checked' => false,
        ]);
    }
}