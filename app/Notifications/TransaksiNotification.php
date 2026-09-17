<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; // 🔥 IMPORT INI
use Illuminate\Notifications\Messages\BroadcastMessage; // 🔥 IMPORT INI
use Illuminate\Notifications\Notification;

// 🔥 WAJIB TAMBAH "implements ShouldBroadcast"
class TransaksiNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $title;
    protected $message;
    protected $type;

    public function __construct($title, $message, $type = 'info')
    {
        $this->title = $title;
        $this->message = $message;
        $this->type = $type;
    }

    public function via($notifiable)
    {
        // 🔥 TAMBAHKAN 'broadcast' KESINI BIAR PUSHERNYA JALAN!
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
        ];
    }

    // 🔥 FORMAT DATA YANG TERBANG LEWAT PUSHER (REAL-TIME)
    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
        ]);
    }
}
