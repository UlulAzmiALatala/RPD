<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>SIRA Kemenkumham</title>
    
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
</head>
<body class="bg-slate-50 font-sans antialiased text-slate-600 overflow-hidden">
    
    <!-- PASTIKAN HANYA ADA DIV INI, TIDAK ADA NAV/HEADER HTML LAINNYA -->
    <div id="app"></div>

</body>
</html>