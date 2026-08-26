<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // Tambahkan baris ini untuk mematikan CSRF di route API kita
        $middleware->validateCsrfTokens(except: [
            'api/transaksi/*',
            'api/anggaran/*', // Sekalian untuk master anggaran
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
