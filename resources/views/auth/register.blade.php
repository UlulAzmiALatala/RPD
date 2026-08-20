<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Join Network</title>
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
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
        }
    </style>
</head>
<body class="bg-[#0b0f19] text-slate-200 min-h-screen flex items-center justify-center relative overflow-hidden p-4">

    <!-- Efek Dekorasi Background Futuristik -->
    <div class="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-purple-500/20">
        
        <!-- Header -->
        <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 mb-3 shadow-lg shadow-purple-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            </div>
            <h2 class="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Create Identity</h2>
            <p class="text-sm text-slate-400 mt-1">Register your terminal to initialize configuration</p>
        </div>

        <!-- Validasi Error -->
        @if ($errors->any())
            <div class="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <ul class="list-disc pl-4 space-y-1">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <!-- Form Register Fortify -->
        <form action="{{ route('register') }}" method="POST" class="space-y-4">
            @csrf

            <div>
                <label for="name" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input type="text" name="name" id="name" value="{{ old('name') }}" required autofocus
                    class="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-purple-500 neon-glow"
                    placeholder="John Doe">
            </div>

            <div>
                <label for="email" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" name="email" id="email" value="{{ old('email') }}" required
                    class="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-purple-500 neon-glow"
                    placeholder="name@domain.com">
            </div>

            <div>
                <label for="password" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                <input type="password" name="password" id="password" required
                    class="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-purple-500 neon-glow"
                    placeholder="••••••••">
            </div>

            <div>
                <label for="password_confirmation" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Confirm Password</label>
                <input type="password" name="password_confirmation" id="password_confirmation" required
                    class="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-purple-500 neon-glow"
                    placeholder="••••••••">
            </div>

            <button type="submit" 
                class="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/10 transition-all duration-300 transform active:scale-[0.98]">
                Initialize Account
            </button>
        </form>

        <div class="text-center mt-5 text-sm text-slate-400">
            Already verified? <a href="{{ route('login') }}" class="text-purple-400 hover:text-purple-300 font-medium transition-colors">Sign In</a>
        </div>
    </div>

</body>
</html>
