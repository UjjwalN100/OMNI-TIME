import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Paperclip, 
  Bell, 
  Layers, 
  ArrowRight, 
  Check, 
  X as XIcon, 
  User, 
  ShieldCheck, 
  Lock,
  Mail,
  Loader2,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOmni } from '../../context/OmniContext';

export const WelcomeGateway: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, continueAsGuest } = useAuth();
  const { theme, toggleTheme } = useOmni();
  const [loading, setLoading] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signInWithEmail(email, password);
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-screen bg-[var(--canvas-bg)] text-[var(--text-main)] flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-x-hidden selection:bg-purple-500 selection:text-white transition-colors">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-purple-600/15 via-indigo-600/10 to-purple-400/10 blur-[120px] pointer-events-none rounded-full" />
      
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-widest text-purple-400 uppercase">OMNI</span>
            <span className="font-semibold text-base text-[var(--text-main)]">Time</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-[var(--border-line)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
            title="Switch between Light and Dark mode"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-purple-400" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-[var(--border-line)] text-xs text-[var(--text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Productivity Ecosystem</span>
          </div>
        </div>
      </header>

      {/* Main Central Card */}
      <main className="max-w-4xl w-full mx-auto my-auto py-8 relative z-10 flex flex-col items-center">
        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Welcome to Distraction-Free Daily Planning</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Structure your day with <span className="bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-400 bg-clip-text text-transparent">zero friction</span>.
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Choose how you would like to get started today.
          </p>
        </div>

        {error && (
          <div className="w-full max-w-xl mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        {/* The Two Entry Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
          {/* OPTION 1: GOOGLE / GMAIL (FULL ACCESS) */}
          <div className="relative group rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/60 border-2 border-purple-500/50 p-6 flex flex-col justify-between shadow-xl shadow-purple-950/40 hover:border-purple-400 transition-all">
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-bold text-white uppercase tracking-wider shadow-md shadow-purple-500/30">
              Recommended • Full Access
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <h3 className="text-lg font-bold text-white">Sign In with Google</h3>
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                  <Check className="w-3.5 h-3.5 text-purple-400" />
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Connect your account for full access across all OMNI tools, cloud synchronization, and smart reminders.
              </p>

              {/* Unlocked Features List */}
              <ul className="space-y-2 mb-6 text-xs">
                <li className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Date & Item Document Attachments</strong></span>
                </li>
                <li className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>OMNI Space & Ecosystem Integration</strong></span>
                </li>
                <li className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Desktop & Audio Notifications</strong></span>
                </li>
                <li className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Multi-Device Cloud Synchronization</strong></span>
                </li>
              </ul>
            </div>

            <div>
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg shadow-white/10 hover:shadow-white/20 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowEmailAuth(!showEmailAuth)}
                className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 mt-2.5 transition"
              >
                {showEmailAuth ? 'Hide email options' : 'Or use Email / Password'}
              </button>
            </div>
          </div>

          {/* OPTION 2: GUEST MODE (LIMITED ACCESS) */}
          <div className="rounded-2xl bg-slate-900/40 border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <h3 className="text-lg font-bold text-slate-200">Continue as Guest</h3>
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Explore the basic 3-pane calendar grid locally. Restricted features are disabled.
              </p>

              {/* Disabled Features List */}
              <ul className="space-y-2 mb-6 text-xs">
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Basic Day / Week / Month Calendar</span>
                </li>
                <li className="flex items-center gap-2 text-rose-400/90 font-medium">
                  <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Document attachments disabled</span>
                </li>
                <li className="flex items-center gap-2 text-rose-400/90 font-medium">
                  <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>OMNI ecosystem connecting disabled</span>
                </li>
                <li className="flex items-center gap-2 text-rose-400/90 font-medium">
                  <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>No notifications or audio reminders</span>
                </li>
              </ul>
            </div>

            <div>
              <button
                onClick={continueAsGuest}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 font-semibold text-sm transition-all active:scale-[0.99]"
              >
                <span>Enter as Guest</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <div className="text-center text-[10px] text-slate-500 mt-2.5">
                Temporary local session • No account required
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Email Auth Form */}
        {showEmailAuth && (
          <form 
            onSubmit={handleEmailAuth}
            className="w-full max-w-md mt-6 p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3.5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-white/5">
              <span>{isSignUp ? 'Create account with Email' : 'Sign In with Email'}</span>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-400 hover:text-purple-300"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-500 relative z-10 py-2">
        OMNI Time • Zero Clutter • Zero Cost Cloud Hosting • Built for Speed
      </footer>
    </div>
  );
};
