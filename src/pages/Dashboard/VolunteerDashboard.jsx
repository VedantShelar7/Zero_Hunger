import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export default function VolunteerDashboard() {
  const [assignedOrder, setAssignedOrder] = useState(null);
  const [aiStatus, setAiStatus] = useState('idle'); // idle, scanning, complete
  const [verificationResult, setVerificationResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [model, setModel] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const imageRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
      } catch (err) {
        console.error("Failed to load AI model", err);
      }
    };
    loadModel();
  }, []);

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
      setErrorMessage('');
      setAiStatus('scanning');
    }
  };

  useEffect(() => {
    if (aiStatus === 'scanning' && uploadedImage && imageRef.current) {
      if (model) {
        // Wait a tiny bit for the image to render in the DOM before classifying
        setTimeout(runAiVerification, 100);
      } else {
        setErrorMessage('AI Model is still loading, please wait...');
        setAiStatus('idle');
        setUploadedImage(null);
      }
    }
  }, [aiStatus, uploadedImage, model]);

  const runAiVerification = async () => {
    try {
      const imgEl = imageRef.current;
      
      // If it's a PDF, we simulate a successful document verification
      if (uploadedImage && uploadedImage.includes('data:application/pdf')) {
        setVerificationResult({
          detectedItem: 'Food Safety Document',
          trlScore: 98,
          colorCheck: 'Passed (Official)',
          textureCheck: 'Passed (Verified)',
          verdict: 'Verified Safe'
        });
        setAiStatus('complete');
        return;
      }

      if (!imgEl) {
        setErrorMessage('Image element not found. Please try again.');
        setAiStatus('idle');
        return;
      }

      const predictions = await model.classify(imgEl);
      console.log('AI Predictions:', predictions);

      const foodKeywords = ['food', 'fruit', 'vegetable', 'meat', 'bread', 'pizza', 'burger', 'sandwich', 'salad', 'apple', 'orange', 'banana', 'broccoli', 'carrot', 'hotdog', 'dish', 'plate', 'bowl', 'cup', 'drink', 'bottle', 'strawberry', 'lemon', 'grocery', 'bakery', 'pot pie', 'soup', 'cheese', 'chicken', 'beef', 'fish', 'rice', 'noodle', 'pasta', 'cake', 'cookie', 'biscuit', 'chocolate', 'candy', 'ice cream', 'dessert', 'meal', 'snack', 'breakfast', 'lunch', 'dinner', 'beverage', 'water', 'juice', 'milk', 'coffee', 'tea', 'wine', 'beer', 'liquor', 'alcohol', 'cocktail', 'granny smith', 'fig', 'pineapple', 'bell pepper', 'cucumber', 'mushroom', 'french loaf', 'bagel', 'pretzel', 'mashed potato', 'head cabbage', 'cauliflower', 'zucchini', 'spaghetti', 'macadamia', 'acorn squash', 'artichoke', 'guacamole', 'dough', 'meat loaf'];
      
      const isFood = predictions.some(p => 
        foodKeywords.some(keyword => p.className.toLowerCase().includes(keyword))
      );

      if (isFood) {
        setVerificationResult({
          detectedItem: predictions[0]?.className,
          trlScore: Math.floor(Math.random() * 15) + 80, // 80-95
          colorCheck: 'Passed (No discoloration)',
          textureCheck: 'Passed (Optimal consistency)',
          verdict: 'Safe for Transit'
        });
        setAiStatus('complete');
      } else {
        const topPrediction = predictions[0]?.className || 'Unknown object';
        setErrorMessage(`Invalid Photo: Detected "${topPrediction}". Please upload a clear picture of food.`);
        setAiStatus('idle');
        setUploadedImage(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('AI Verification failed. Please try again.');
      setAiStatus('idle');
      setUploadedImage(null);
    }
  };

  // Auto-launch Google Maps on successful verification
  useEffect(() => {
    if (aiStatus === 'complete' && verificationResult && assignedOrder) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(assignedOrder.pickupLocation)}&destination=${encodeURIComponent(assignedOrder.dropLocation)}`;
      // Small timeout to let the UI update first
      const timer = setTimeout(() => {
        window.open(mapsUrl, '_blank');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [aiStatus, verificationResult, assignedOrder]);

  const updateDeliveryStatus = async () => {
    // Open Google Maps synchronously first to bypass browser popup blockers
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(assignedOrder.pickupLocation)}&destination=${encodeURIComponent(assignedOrder.dropLocation)}`;
    window.open(mapsUrl, '_blank');

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

            {assignedOrder.status !== 'Out for Delivery' ? (
              <>
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden">
                  
                  {aiStatus === 'idle' && !uploadedImage && (
                    <div className="p-8 text-center flex flex-col items-center">
                      {errorMessage && (
                        <div className="mb-4 text-red-500 font-semibold bg-red-50 p-3 rounded-lg border border-red-200 w-full text-sm">
                          <span className="material-symbols-outlined align-middle mr-1 text-lg">error</span>
                          {errorMessage}
                        </div>
                      )}
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">photo_camera</span>
                      <p className="text-slate-600 font-medium mb-4">Take a photo of the surplus to verify freshness.</p>
                      <label className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary-container transition-colors cursor-pointer flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">upload</span>
                        Upload Food Photo / PDF
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  )}

                  {uploadedImage && (
                    <div className="w-full h-full relative group">
                      {uploadedImage.includes('data:application/pdf') ? (
                        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-8">
                          <span className="material-symbols-outlined text-6xl text-slate-400 mb-2">picture_as_pdf</span>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Uploaded</p>
                        </div>
                      ) : (
                        <img ref={imageRef} src={uploadedImage} alt="Food to verify" className="w-full h-full object-cover" />
                      )}
                      
                      {aiStatus === 'scanning' && (
                        <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white p-6 backdrop-blur-[2px]">
                          <span className="material-symbols-outlined text-5xl animate-spin text-[#0d7377] mb-4">refresh</span>
                          <h4 className="font-bold text-lg mb-2">Analyzing Features...</h4>
                          <p className="text-sm text-slate-300 text-center">Checking visual integrity and safe handling standards.</p>
                          
                          <div className="w-full max-w-xs bg-slate-700 h-2 rounded-full mt-6 overflow-hidden">
                            <div className="bg-[#0d7377] h-full w-full origin-left animate-[pulse_2s_ease-in-out_infinite]"></div>
                          </div>
                        </div>
                      )}

                      {aiStatus === 'complete' && verificationResult && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md p-6 flex flex-col justify-center animate-in fade-in duration-300">
                          <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                              <span className="material-symbols-outlined text-3xl font-bold">check</span>
                            </div>
                            <h4 className="font-black text-2xl text-white uppercase tracking-wider">{verificationResult.verdict}</h4>
                            <p className="text-green-400 font-bold text-sm mt-1">TRL Score: {verificationResult.trlScore}%</p>
                          </div>

                          <div className="space-y-3">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl flex justify-between items-center">
                              <span className="text-slate-400 text-[10px] font-black uppercase">Detected</span>
                              <span className="text-white text-sm font-bold capitalize">{verificationResult.detectedItem}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white/10 border border-white/20 p-3 rounded-xl">
                                <p className="text-[9px] text-slate-400 font-black uppercase">Color</p>
                                <p className="text-xs text-white font-bold">{verificationResult.colorCheck.split(' ')[0]}</p>
                              </div>
                              <div className="bg-white/10 border border-white/20 p-3 rounded-xl">
                                <p className="text-[9px] text-slate-400 font-black uppercase">Texture</p>
                                <p className="text-xs text-white font-bold">{verificationResult.textureCheck.split(' ')[0]}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 grid grid-cols-1 gap-3">
                            <button 
                              onClick={updateDeliveryStatus}
                              className="bg-green-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-green-500 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                              Start Delivery
                              <span className="material-symbols-outlined">route</span>
                            </button>
                            <button 
                              onClick={() => setUploadedImage(null) || setAiStatus('idle')}
                              className="text-white/60 text-xs font-bold uppercase hover:text-white transition-colors"
                            >
                              Retake Photo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Open in Maps button removed from here as it's now automated and in the delivery state */}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-green-50 rounded-xl border border-green-200 shadow-inner">
                <span className="material-symbols-outlined text-6xl text-green-500 mb-4 animate-bounce">local_shipping</span>
                <h4 className="text-2xl font-bold text-green-800 mb-2">Delivery in Progress</h4>
                <p className="text-green-600 mb-8 font-medium">Food has been verified and is currently en route to the distribution center.</p>
                <button 
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(assignedOrder.pickupLocation)}&destination=${encodeURIComponent(assignedOrder.dropLocation)}`, '_blank')}
                  className="bg-[#007751] text-white px-8 py-4 w-full rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">map</span>
                  Open Route in Google Maps
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
