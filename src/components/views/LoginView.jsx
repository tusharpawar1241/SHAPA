import { useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginView({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Auth Error:", err);
      // Clean up common firebase errors for user display
      let cleanMsg = err.message;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        cleanMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        cleanMsg = 'This email address is already in use.';
      } else if (err.code === 'auth/weak-password') {
        cleanMsg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-credential') {
        cleanMsg = 'Incorrect email or password.';
      }
      setError(cleanMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-on-surface">
      
      {/* Left Column: Visual/Marketing - Premium Intro */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-primary-container p-16 flex-col justify-between relative overflow-hidden">
        {/* Subtle mesh background shapes */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl pointer-events-none -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-white/5 blur-2xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Brand */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-primary shadow-lg shadow-black/10">
            <ShieldCheck size={26} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">Guardian AI</h1>
            <p className="text-[10px] tracking-widest uppercase font-bold text-white/70 mt-1">Health &amp; Product Safety</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md z-10 my-auto flex flex-col gap-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white w-max backdrop-blur-sm border border-white/10">
            <Sparkles size={12} className="animate-pulse text-primary-fixed" /> Powered by Gemini AI
          </div>
          
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Know exactly what you consume.
          </h2>
          
          <p className="text-sm text-white/80 leading-relaxed">
            Guardian AI scans product labels, analyzes chemical compounds, and automatically highlights items that trigger your custom allergies, medical conditions, or lifestyle goals.
          </p>

          <div className="flex flex-col gap-3.5 mt-4">
            {[
              "Personalized allergen & skin irritant detection",
              "Smart medical profile contraindication checks",
              "Instant Gemini AI ingredient breakdown",
              "100% private, secured Firestore cloud database"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-primary-fixed flex-shrink-0" />
                <span className="text-xs font-semibold text-white/95">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-white/60 z-10 flex justify-between">
          <span>&copy; 2026 Guardian AI</span>
          <span>Secured with Firebase Auth &amp; Firestore</span>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white relative">
        {/* Mobile-only branding */}
        <div className="absolute top-8 left-8 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </div>
          <span className="text-sm font-black text-primary">Guardian AI</span>
        </div>

        <div className="w-full max-w-md flex flex-col gap-8 animate-[fadeIn_0.4s_ease]">
          
          {/* Form Header */}
          <div className="text-left">
            <h3 className="text-2xl font-black text-on-surface">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1.5">
              {isLogin ? 'Sign in to access your personalized health dashboard.' : 'Enter your details below to set up your safety scanner profile.'}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200/50 text-red-700 rounded-2xl text-xs font-bold leading-relaxed flex gap-2">
              <span className="material-symbols-outlined text-[18px] text-red-500 flex-shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
                  <Mail size={16} />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border border-outline-variant/60 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-slate-50/50 hover:bg-slate-50"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
                  <Lock size={16} />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 border border-outline-variant/60 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-slate-50/50 hover:bg-slate-50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-3 bg-primary text-white font-bold py-3.5 px-6 rounded-xl text-xs hover:bg-primary-container shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In to Dashboard' : 'Register & Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="absolute w-full border-t border-outline-variant/40"></div>
            <span className="relative bg-white px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">Secure Federated Access</span>
          </div>

          {/* Google Sign In */}
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-outline-variant/60 text-on-surface font-bold py-3.5 px-6 rounded-xl text-xs hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
            Continue with Google Account
          </button>

          {/* Toggle Switch */}
          <p className="text-center mt-2 text-xs text-on-surface-variant">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }} 
              className="text-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {isLogin ? 'Sign Up Now' : 'Log In'}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}
