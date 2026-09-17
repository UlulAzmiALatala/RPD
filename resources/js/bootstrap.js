import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;

// 🔥 PANGGIL PUSHER & ECHO DI SINI BIAR REACT BISA DENGERIN NOTIF
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    // Karena kita pakai web.php (SPA Cookie), Laravel akan otomatis
    // mengecek otorisasi ke rute bawaan: /broadcasting/auth
});
