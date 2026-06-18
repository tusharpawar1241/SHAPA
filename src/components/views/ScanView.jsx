import React, { useState, useEffect, useRef } from 'react';

export default function ScanView({ 
  activeCategory, 
  selectCategory, 
  mockDatabase, 
  scanHistory, 
  clearHistory, 
  triggerMockScan, 
  analyzeBase64Image,
  viewHistoryItem,
  hapticFeedback
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [indicatorText, setIndicatorText] = useState("Camera Feed Inactive");
  const [indicatorColor, setIndicatorColor] = useState("text-on-surface-variant");
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [stream, setStream] = useState(null);

  // Restart camera when component mounts or activeCategory changes
  useEffect(() => {
    startCamera();
    setImagePreview(null);
    return () => {
      stopCamera();
    };
  }, [activeCategory]);

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        stopCamera(); // Stop any existing stream
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraActive(true);
        setIndicatorText("Webcam Active. Align label in bracket.");
        setIndicatorColor("text-primary-fixed");
      } catch (err) {
        console.warn("Webcam access denied or unavailable: ", err);
        setCameraActive(false);
        setIndicatorText("Webcam Inactive. Click shutter to upload file.");
        setIndicatorColor("text-[#adc6ff]");
      }
    } else {
      setCameraActive(false);
      setIndicatorText("Webcam Unsupported. Upload file below.");
      setIndicatorColor("text-[#adc6ff]");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const triggerShutter = () => {
    if (cameraActive && stream) {
      // Shutter haptic check
      hapticFeedback();

      // Trigger visual shutter flash
      const flash = document.getElementById('flash-screen');
      if (flash) {
        flash.style.animation = 'flashEffect 0.3s ease-out';
        setTimeout(() => { flash.style.animation = ''; }, 300);
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        
        stopCamera();
        setIndicatorText("Label Captured! Analyzing...");
        setIndicatorColor("text-[#ffb4a9]");
        
        const base64 = dataUrl.split(',')[1];
        setTimeout(() => {
          analyzeBase64Image(base64, "image/jpeg");
        }, 1000);
      }
    } else {
      // Trigger file upload if camera inactive
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // Drag-and-drop file uploads
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragOver(true);
    } else if (e.type === "dragleave") {
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);
      stopCamera();
      setIndicatorText("File Loaded. Analyzing...");
      setIndicatorColor("text-[#ffb4a9]");
      
      const base64 = dataUrl.split(',')[1];
      setTimeout(() => {
        analyzeBase64Image(base64, file.type);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const samples = mockDatabase[activeCategory] || [];

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
          AI Scanning Terminal
        </div>
        <h2 className="text-3xl font-extrabold text-on-surface leading-tight">
          Scan Product Label
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Provide a clean image of ingredients or drug facts for analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Viewfinder & File Drag-Drop */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Viewfinder Card */}
          <div className="bg-black rounded-2xl overflow-hidden relative aspect-[4/3] flex items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] border border-neutral-900">
            {/* Live Camera Video */}
            <video 
              ref={videoRef} 
              className={`absolute inset-0 w-full h-full object-cover z-10 ${cameraActive && !imagePreview ? 'block' : 'hidden'}`}
              autoplay 
              playsinline 
              muted
            ></video>
            
            {/* Canvas for rendering frames */}
            <canvas ref={canvasRef} className="hidden absolute inset-0 w-full h-full object-cover z-10"></canvas>
            
            {/* Captured / Uploaded Image Preview */}
            {imagePreview && (
              <img 
                src={imagePreview} 
                className="absolute inset-0 w-full h-full object-cover z-20" 
                alt="Captured product label"
              />
            )}

            {/* Viewfinder Vignette Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0)_25%,rgba(0,0,0,0)_75%,rgba(0,0,0,0.6)_100%)] z-20 pointer-events-none"></div>
            
            {/* Focus bracket and scan overlay */}
            <div className="relative z-30 w-[240px] h-[240px] flex items-center justify-center pointer-events-none">
              <div className="absolute top-0 left-0 w-9 h-9 border-t-4 border-l-4 border-primary-fixed rounded-tl-xl shadow-[0_0_10px_rgba(130,250,171,0.3)]"></div>
              <div className="absolute top-0 right-0 w-9 h-9 border-t-4 border-r-4 border-primary-fixed rounded-tr-xl shadow-[0_0_10px_rgba(130,250,171,0.3)]"></div>
              <div className="absolute bottom-0 left-0 w-9 h-9 border-b-4 border-l-4 border-primary-fixed rounded-bl-xl shadow-[0_0_10px_rgba(130,250,171,0.3)]"></div>
              <div className="absolute bottom-0 right-0 w-9 h-9 border-b-4 border-r-4 border-primary-fixed rounded-br-xl shadow-[0_0_10px_rgba(130,250,171,0.3)]"></div>
              
              {/* Scan laser animation line */}
              {cameraActive && !imagePreview && (
                <div className="absolute w-full h-0.5 bg-[linear-gradient(90deg,transparent,var(--color-primary-fixed),transparent)] shadow-[0_0_15px_var(--color-primary-fixed)] animate-[scan-line_3s_ease-in-out_infinite]"></div>
              )}
              
              <div className={`text-white/95 font-semibold text-[11px] text-center px-4 bg-black/40 backdrop-blur-md py-1.5 rounded-full ${indicatorColor}`}>
                {indicatorText}
              </div>
            </div>

            {/* Viewfinder Action Buttons */}
            <div className="absolute bottom-6 left-0 w-full flex justify-around items-center z-30 px-6">
              <button 
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="w-11 h-11 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer" 
                title="Gallery Upload"
              >
                <span className="material-symbols-outlined">photo_library</span>
              </button>
              
              <button 
                onClick={triggerShutter}
                className="w-[68px] h-[68px] rounded-full bg-white border-4 border-black/30 flex items-center justify-center cursor-pointer active:scale-95 transition-transform" 
                title="Capture &amp; Analyze"
              >
                <div className="w-[50px] h-[50px] rounded-full bg-white border border-outline-variant hover:bg-neutral-100 transition-colors active:scale-90 duration-75"></div>
              </button>
              
              <button 
                onClick={startCamera}
                className="w-11 h-11 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer" 
                title="Reset Camera Feed"
              >
                <span className="material-symbols-outlined">sync_camera</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className={`border-2 border-dashed border-outline-variant rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer transition-all duration-300 ${
                dragOver ? 'border-primary bg-primary/5 scale-[1.005]' : 'bg-surface-container-lowest hover:border-primary/60'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/*,application/pdf" 
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center mb-4 text-primary transition-colors">
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
              </div>
              <h3 className="text-md font-bold mb-1">Drag &amp; Drop Product Label</h3>
              <p className="text-xs text-on-surface-variant max-w-[360px] mx-auto mb-4">
                Upload a photograph of the ingredients statement or nutritional panel (JPG, PNG, or PDF up to 10MB)
              </p>
              
              <div className="flex gap-4">
                <div className="badge-tag">
                  <span className="material-symbols-outlined text-sm">image</span>
                  <span>Images</span>
                </div>
                <div className="badge-tag">
                  <span className="material-symbols-outlined text-sm">description</span>
                  <span>PDFs</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Scan Category Select, Mock Scans, History Logs */}
        <div className="flex flex-col gap-6">
          
          {/* Active Category Selector */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary-container/30 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Category:</span>
              <select 
                value={activeCategory} 
                onChange={(e) => selectCategory(e.target.value)}
                className="bg-surface-container border border-outline-variant/50 rounded-full px-4 py-1.5 text-xs font-bold text-on-surface outline-none cursor-pointer focus:ring-2 focus:ring-primary"
              >
                <option value="food">🍎 Food Guardian</option>
                <option value="medicine">💊 Meds Guardian</option>
                <option value="cosmetics">🧪 Cosmetic Guardian</option>
              </select>
            </div>
          </div>

          {/* Interactive Mock Simulator Scans */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-on-surface">Interactive Mock Scans</h3>
              <span className="material-symbols-outlined text-sm text-secondary">auto_awesome</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-[-8px]">
              Select a pre-loaded sample label to test profile-driven verification logic:
            </p>
            
            <div className="flex flex-col gap-2.5">
              {samples.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => { stopCamera(); triggerMockScan(s.id); }}
                  className="flex items-center gap-4 p-4 border border-outline-variant/40 rounded-xl bg-surface-container-lowest hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:border-outline transition-all duration-200 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activeCategory === 'food' ? 'bg-secondary/15 text-secondary' : activeCategory === 'medicine' ? 'bg-primary/15 text-primary' : 'bg-tertiary/15 text-tertiary'
                  }`}>
                    <span className="material-symbols-outlined">
                      {activeCategory === 'food' ? 'restaurant' : activeCategory === 'medicine' ? 'medication' : 'science'}
                    </span>
                  </div>
                  <div className="overflow-hidden flex-grow">
                    <p className="text-xs font-bold truncate text-on-surface">{s.product_name}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{s.brand_name} • Sample Label</p>
                  </div>
                  <span className="text-[9px] font-bold px-3 py-1 rounded-full bg-secondary-container/10 text-secondary uppercase tracking-wider">Test</span>
                </div>
              ))}
            </div>
          </div>

          {/* History Scan Logs */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-on-surface">Recent Scan Logs</h3>
              {scanHistory.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs text-on-surface-variant hover:text-error hover:underline font-semibold"
                >
                  Clear Logs
                </button>
              )}
            </div>
            
            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {scanHistory.length === 0 ? (
                <p className="text-[11px] text-on-surface-variant text-center py-6">No scans in log history.</p>
              ) : (
                scanHistory.map((item, idx) => {
                  let icon = "restaurant";
                  let bg = "bg-secondary/15 text-secondary";
                  if (item.category === 'medicine') {
                    icon = "medication";
                    bg = "bg-primary/15 text-primary";
                  } else if (item.category === 'cosmetics') {
                    icon = "science";
                    bg = "bg-tertiary/15 text-tertiary";
                  }

                  const scoreVal = parseFloat(item.safety_score) || 0;
                  const isSafe = scoreVal >= 7.5;
                  const isDanger = scoreVal < 5.0;
                  const badgeText = isSafe ? "Safe" : isDanger ? "Warning" : "Moderate";
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => { stopCamera(); viewHistoryItem(idx); }}
                      className="flex items-center gap-3 p-3 border border-outline-variant/30 rounded-xl bg-surface-container-lowest hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:border-outline transition-all duration-200 cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                      </div>
                      <div className="overflow-hidden flex-grow">
                        <p className="text-xs font-bold truncate text-on-surface">{item.product_name}</p>
                        <p className="text-[9px] text-on-surface-variant truncate">{item.brand_name} • {item.timestamp}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isSafe 
                          ? 'bg-primary/10 text-primary' 
                          : isDanger 
                            ? 'bg-error-container text-on-error-container' 
                            : 'bg-secondary-container/10 text-secondary'
                      }`}>
                        {badgeText} ({scoreVal.toFixed(1)})
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
