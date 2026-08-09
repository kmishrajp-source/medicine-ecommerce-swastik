"use client";
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

export default function AbhaClient() {
  const { cartCount, toggleCart } = useCart();
  const [step, setStep] = useState(1); // 1: Input Aadhaar/Phone, 2: OTP, 3: Success
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      
      <main className="flex-1" style={{ marginTop: '160px' }}>
        
        <div className="bg-slate-900 py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.3)_0%,_transparent_70%)]" />
          <div className="container mx-auto px-8 relative z-10 text-center">
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
              Link Your <span className="text-emerald-400">ABHA Account</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
              Ayushman Bharat Health Account (ABHA) allows you to securely access and share your digital health records with doctors and hospitals nationwide.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-8 py-16 max-w-3xl">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100">
              <div className="w-1/2 p-6 text-center border-r border-slate-100 bg-emerald-50">
                <i className="fa-solid fa-id-card text-3xl text-emerald-600 mb-3 block" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Create ABHA</h3>
              </div>
              <div className="w-1/2 p-6 text-center">
                <i className="fa-solid fa-link text-3xl text-slate-400 mb-3 block" />
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Link Existing ABHA</h3>
              </div>
            </div>

            <div className="p-10">
              {step === 1 && (
                <div className="animate-in fade-in zoom-in duration-300">
                  <h4 className="text-xl font-black text-slate-900 mb-2">Enter your Aadhaar or Mobile Number</h4>
                  <p className="text-sm text-slate-500 mb-8">We will send a one-time password (OTP) to your registered mobile number for verification.</p>
                  
                  <form onSubmit={handleSendOtp}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aadhaar Number / Mobile</label>
                    <input 
                      type="text" 
                      required 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-slate-900 mb-6"
                      placeholder="e.g. 1234 5678 9012"
                    />
                    
                    <div className="flex items-start gap-3 mb-8">
                      <input type="checkbox" required className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                      <p className="text-xs text-slate-500 leading-relaxed">
                        I hereby declare my consent to generate my ABHA number and link it with Swastik Medicare for accessing my digital health records under the ABDM framework.
                      </p>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-500/30">
                      Generate OTP
                    </button>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h4 className="text-xl font-black text-slate-900 mb-2">Verify OTP</h4>
                  <p className="text-sm text-slate-500 mb-8">Enter the 6-digit OTP sent to your Aadhaar linked mobile number ending with ******4912.</p>
                  
                  <form onSubmit={handleVerifyOtp}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Enter 6-Digit OTP</label>
                    <input 
                      type="text" 
                      required 
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-center text-2xl tracking-[1em] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-black text-slate-900 mb-6"
                      placeholder="------"
                    />
                    
                    <div className="flex justify-between items-center mb-8 text-xs font-bold">
                      <span className="text-slate-400">01:59</span>
                      <button type="button" className="text-emerald-600 hover:underline">Resend OTP</button>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-500/30">
                      Verify & Link ABHA
                    </button>
                  </form>
                </div>
              )}

              {step === 3 && (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-check text-5xl text-emerald-600" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">ABHA Linked Successfully!</h4>
                  <p className="text-slate-500 text-sm mb-6">Your ABHA number <span className="font-bold text-slate-900">91-2345-6789-0123</span> has been linked. You can now access your digital prescriptions, lab reports, and unified health timeline.</p>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 flex items-center gap-4 text-left">
                    <img src="https://ui-avatars.com/api/?name=Rohan+Sharma&background=10b981&color=fff" alt="User" className="w-16 h-16 rounded-full" />
                    <div>
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1"><i className="fa-solid fa-shield-check mr-1" /> ABDM Verified Profile</div>
                      <div className="font-bold text-slate-900 text-lg">Rohan Sharma</div>
                      <div className="text-xs text-slate-500 font-medium">ABHA Address: rohan.sharma@abdm</div>
                    </div>
                  </div>

                  <Link href="/my-health-records/timeline" className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl">
                    View Health Timeline
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-center gap-6 grayscale opacity-60">
              <img src="/nha-logo.png" alt="NHA" className="h-8 object-contain hidden md:block" onError={(e) => e.target.style.display='none'} />
              <img src="/digital-india-logo.png" alt="Digital India" className="h-8 object-contain hidden md:block" onError={(e) => e.target.style.display='none'} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Approved by National Health Authority (NHA)</span>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
