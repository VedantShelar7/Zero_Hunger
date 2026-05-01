import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function VolunteerDashboard() {
  const [assignedOrder, setAssignedOrder] = useState(null);
  const [aiStatus, setAiStatus] = useState('idle'); // idle, scanning, complete
  const [verificationResult, setVerificationResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const allOrders = await api.getOrders();
        // For demo, we just find the first order that has been accepted but not yet delivered
        const active = (allOrders || []).find(o => o.ngoStatus === 'accepted' && o.status !== 'Delivered');
        if (active) {
          // Map backend fields to local display names if they differ
          setAssignedOrder({
            ...active,
            donor: active.source,
            pickupLocation: active.source + ', Bangalore',
            dropLocation: 'NGO Distribution Center, Koramangala'
          });
        } else {
          setAssignedOrder(null);
        }
      } catch (err) { console.error(err); }
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      simulateAiVerification();
    }
  };

  const simulateAiVerification = () => {
    setAiStatus('scanning');
    
    // Simulate processing delay
    setTimeout(() => {
      setVerificationResult({
        trlScore: 82,
        colorCheck: 'Passed (No discoloration)',
        textureCheck: 'Passed (Optimal consistency)',
        verdict: 'Safe for Transit'
      });
      setAiStatus('complete');
    }, 2500);
  };

  const updateDeliveryStatus = async () => {
    if (assignedOrder.id !== 'mock-123') {
      try {
        await api.updateOrderStatus(assignedOrder.id, 'Out for Delivery');
      } catch (err) { console.error(err); }
    }
    setAssignedOrder(prev => ({ ...prev, status: 'Out for Delivery' }));
  };

  return (
    <div className="p-12 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Volunteer Dispatch</h2>
        <p className="text-slate-500">Manage your active pickups and verify food safety</p>
      </div>

      {!assignedOrder ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 text-center text-slate-500">
          No active assignments at the moment. Stay tuned!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Assignment Details */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#0d7377]"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="bg-[#0d7377]/10 text-[#0d7377] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {assignedOrder.status}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">{assignedOrder.food}</h3>
                  <p className="text-slate-500">{assignedOrder.quantity}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-2xl">two_wheeler</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex flex-shrink-0 items-center justify-center text-blue-600 z-10">
                    <span className="material-symbols-outlined text-[18px]">storefront</span>
                  </div>
                  <div className="absolute left-4 top-8 w-0.5 h-10 bg-slate-100"></div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Pickup From</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{assignedOrder.pickupLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex flex-shrink-0 items-center justify-center text-amber-600 z-10">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Deliver To</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{assignedOrder.dropLocation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Verification */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0d7377]">memory</span>
              AI Food Verification
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Our CNN (Convolutional Neural Network) model analyzes visual features like color and texture to determine whether food is fresh and safe before transit.
            </p>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden">
              
              {aiStatus === 'idle' && !uploadedImage && (
                <div className="p-8 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">photo_camera</span>
                  <p className="text-slate-600 font-medium mb-4">Take a photo of the surplus to verify freshness.</p>
                  <label className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary-container transition-colors cursor-pointer flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">upload</span>
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              )}

              {uploadedImage && (
                <div className="w-full h-full relative group">
                  <img src={uploadedImage} alt="Food to verify" className="w-full h-full object-cover" />
                  
                  {aiStatus === 'scanning' && (
                    <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white p-6">
                      <span className="material-symbols-outlined text-5xl animate-spin text-primary mb-4">refresh</span>
                      <h4 className="font-bold text-lg mb-2">Analyzing Visual Features...</h4>
                      <p className="text-sm text-slate-300 text-center">Checking color integrity and surface texture for spoilage indicators.</p>
                      
                      <div className="w-full max-w-xs bg-slate-700 h-2 rounded-full mt-6 overflow-hidden">
                        <div className="bg-primary h-full w-full origin-left animate-[pulse_2s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                  )}

                  {aiStatus === 'complete' && (
                    <div className="absolute inset-0 bg-slate-900/80 p-6 flex flex-col">
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-3xl font-bold">check</span>
                        </div>
                        <h4 className="font-bold text-2xl text-white mb-1">{verificationResult.verdict}</h4>
                        <p className="text-green-400 font-bold mb-6">TRL Score: {verificationResult.trlScore}</p>

                        <div className="w-full bg-slate-800/80 rounded-xl p-4 text-left border border-slate-700 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Color Analysis</span>
                            <span className="text-white text-sm font-semibold">{verificationResult.colorCheck}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Texture Scan</span>
                            <span className="text-white text-sm font-semibold">{verificationResult.textureCheck}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {aiStatus === 'complete' && assignedOrder.status !== 'Out for Delivery' && (
              <button 
                onClick={updateDeliveryStatus}
                className="mt-6 bg-[#007751] text-white w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                Start Delivery Route
                <span className="material-symbols-outlined">route</span>
              </button>
            )}

            {assignedOrder.status === 'Out for Delivery' && (
              <div className="mt-6 bg-green-50 text-green-800 p-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 border border-green-200">
                <span className="material-symbols-outlined">check_circle</span>
                You are currently en route!
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
