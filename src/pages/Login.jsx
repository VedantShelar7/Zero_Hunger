import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { api } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Donor'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignup) {
        const user = await api.signup(formData);
        login(user);
      } else {
        const user = await api.login(formData.name, formData.password);
        login(user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Google Response:', credentialResponse);
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Decoded Token:', decoded);
      
      const googleData = {
        email: decoded.email,
        name: decoded.name || decoded.given_name || 'Google User',
        googleId: decoded.sub,
        role: formData.role
      };
      
      const user = await api.googleAuth(googleData);
      login(user);
    } catch (err) {
      console.error('Google Auth Error:', err);
      setError(`Google Auth Error: ${err.message || 'Unknown error'}`);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('login-', '');
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex w-full min-h-screen bg-surface font-body text-on-surface antialiased">
      {/* Left Panel: Brand & Impact */}
      <div className="hidden lg:flex w-[40%] bg-[#0d7377] text-white relative flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            className="w-full h-full object-cover mix-blend-overlay" 
            alt="Abstract soft wave pattern" 
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop"
          />
        </div>
        <div className="relative z-10 p-12 lg:p-16 flex flex-col h-full">
          <div className="mb-auto">
            <div className="flex items-center gap-3 mb-12">
              <span className="material-symbols-outlined text-4xl text-white">volunteer_activism</span>
              <span className="text-2xl font-bold text-white tracking-tight">Food Sahaya</span>
            </div>
            <h1 className="text-5xl font-black text-white max-w-md leading-tight tracking-tighter">
              {isSignup ? "Start your impact journey." : "Welcome back to the movement."}
            </h1>
            <p className="mt-6 text-emerald-50/70 font-medium max-w-xs">
              Joining the network of 500+ businesses and NGOs fighting food waste daily.
            </p>
          </div>
          <div className="mt-auto">
            <div className="flex items-center gap-2 text-emerald-100/50 text-sm font-bold tracking-widest uppercase">
              <span className="w-8 h-[2px] bg-emerald-500"></span>
              Science Driven Charity
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-[60%] bg-[#F9F9F9] flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
              {isSignup ? "Create Account" : "Sign In"}
            </h2>
            <p className="text-slate-500 font-medium">
              {isSignup ? "Join the community and start rescuing food." : "Access your dashboard to manage contributions."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form id="login-form" className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email or Name</label>
              <input 
                id="login-name" 
                required 
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-[#0d7377] focus:ring-4 focus:ring-[#0d7377]/10 outline-none transition-all font-medium" 
                placeholder="name@example.com or Grand Plaza Hotel" 
                type="text"
              />
            </div>

            {isSignup && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                <input 
                  id="login-email" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-[#0d7377] focus:ring-4 focus:ring-[#0d7377]/10 outline-none transition-all font-medium" 
                  placeholder="name@example.com" 
                  type="email"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Password</label>
                {!isSignup && <a href="#" className="text-[10px] font-black text-[#0d7377] hover:underline uppercase tracking-wider">Forgot?</a>}
              </div>
              <div className="relative">
                <input 
                  id="login-password" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-[#0d7377] focus:ring-4 focus:ring-[#0d7377]/10 outline-none transition-all font-medium" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0d7377] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Select Role</label>
              <select 
                id="login-role" 
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-[#0d7377] focus:ring-4 focus:ring-[#0d7377]/10 outline-none transition-all cursor-pointer font-bold appearance-none"
              >
                <option value="Donor">Business Donor</option>
                <option value="NGO">NGO / Demand Centre</option>
                <option value="Volunteer">Volunteer Partner</option>
              </select>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-4">
              <button 
                className="w-full bg-[#0d7377] text-white rounded-2xl py-4 font-black shadow-[0_10px_25px_rgba(13,115,119,0.3)] hover:bg-[#00595c] hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-3 text-sm uppercase tracking-widest" 
                type="submit"
              >
                {isSignup ? "Create Account" : "Access Dashboard"}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-slate-400 font-black uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login Failed')}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  width="400"
                />
              </div>
            </div>

            <div className="text-center pt-8 border-t border-slate-100">
              <p className="text-slate-500 text-sm font-medium">
                {isSignup ? "Already have an account?" : "Don't have an account?"}
                <button 
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="ml-2 text-[#0d7377] font-black hover:underline"
                >
                  {isSignup ? "Sign In" : "Register Now"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
