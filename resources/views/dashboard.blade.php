<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Dashboard RPD KEMENKUM</title>
    
    <!-- Memanggil CSS dan JS/React bawaan Vite -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="bg-gray-100">
    
    <!-- Header Sementara -->
    <div class="bg-white shadow p-4 flex justify-between items-center">
        <h2 class="text-xl font-bold text-blue-900">Sistem RPD Keuangan KEMENKUM</h2>
        
        <!-- Tombol Logout bawaan Fortify -->
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit" class="text-red-500 font-bold hover:underline">
                Logout
            </button>
        </form>
    </div>

    <!-- Di dalam div inilah komponen React (app.jsx) akan muncul -->
    <div id="app"></div>

</body>
</html>