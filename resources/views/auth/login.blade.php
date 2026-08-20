<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - Quantum Access</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://tailwindcss.com"></script>
    <style>
        @import url('https://googleapis.com');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .glass-panel {
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .neon-glow:focus {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
        }
    </style>
</head>
<body class="bg-[#0b0f19] text-slate-200 min-h-screen flex items-center justify-center relative overflow-hidden p-4">

    <!-- Efek Dekorasi Background Futuristik -->
    <div class="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-blue-500/20">
        
        <!-- Header / Logo Abstraks -->
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-3 shadow-lg shadow-blue-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h2 class="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Welcome Back</h2>
            <p class="text-sm text-slate-400 mt-1">Enter your credentials to access the secure network</p>
        </div>

        <!-- Validasi Error -->
        @if ($errors->any())
            <div class="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <ul class="list-disc pl-4 space-y-1">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <!-- Form Login Fortify -->
        <form action="{{ route('login') }}" method="POST" class="space-y-5">
            @csrf

            <div>
                <label for="email" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Identity / Email</label>
                <input type="email" name="email" id="email" value="{{ old('email') }}" required autofocus
                    class="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500 neon-glow"
                    placeholder="name@domain.com">
            </div>

            <div>
                <div class="flex justify-between items-center mb-2">
                    <label for="password" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Access Key / Password</label>
                </div>
                <input type="password" name="password" id="password" required
                    class="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500 neon-glow"
                    placeholder="••••••••">
            </div>

            <div class="flex items-center justify-between pt-1">
                <label class="flex items-center text-sm text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" name="remember" id="remember" class="accent-blue-500 rounded border-slate-800 bg-slate-900 mr-2 w-4 h-4">
                    Remember terminal
                </label>
            </div>

            <button type="submit" 
                class="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/10 transition-all duration-300 transform active:scale-[0.98]">
                Authorize Session
            </button>
        </form>

        <div class="text-center mt-6 text-sm text-slate-400">
            New operative? <a href="{{ route('register') }}" class="text-blue-400 hover:text-blue-300 font-medium transition-colors">Create account</a>
        </div>
    </div>

</body>
</html>
