import { useState, useEffect, useRef, useCallback } from 'react';

export default function ScanView({ 
  activeCategory, 
  selectCategory, 
  mockDatabase, 
  scanHistory, 
  clearHistory, 
  triggerMockScan, 
  analyzeBase64Image,
  analyzeTextQuery,
  viewHistoryItem,
  hapticFeedback,
  apiSettings
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [indicatorText, setIndicatorText] = useState("Camera Feed Inactive");
  const [indicatorColor, setIndicatorColor] = useState("text-on-surface-variant");
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const streamRef = useRef(null);

  // Search tabs & inputs state
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' or 'search'
  const [searchName, setSearchName] = useState('');
  const [searchBarcode, setSearchBarcode] = useState('');
  const [searchKeywords, setSearchKeywords] = useState('');
  const [compareMedicine, setCompareMedicine] = useState('');
  const [isCameraViewOpen, setIsCameraViewOpen] = useState(false);

  // Sync / Reset local form state when activeCategory changes during render phase
  const [prevCategory, setPrevCategory] = useState(activeCategory);
  if (activeCategory !== prevCategory) {
    setPrevCategory(activeCategory);
    setImagePreview(null);
    setSearchName('');
    setSearchBarcode('');
    setSearchKeywords('');
    setCompareMedicine('');
    setIsCameraViewOpen(false);
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        stopCamera(); // Stop any existing stream
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        streamRef.current = mediaStream;
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
  }, [stopCamera]);

  // Control live camera feed based on active tab and camera view visibility
  useEffect(() => {
    let active = true;
    
    // Defer camera operations to prevent synchronous state updates in render cycle
    const timer = setTimeout(() => {
      if (active) {
        if (activeTab === 'scan' && isCameraViewOpen) {
          startCamera();
        } else {
          stopCamera();
        }
      }
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, [activeTab, isCameraViewOpen, startCamera, stopCamera]);

  const triggerShutter = () => {
    if (cameraActive && streamRef.current) {
      hapticFeedback();

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchName && !searchBarcode && !searchKeywords) {
      alert("Please fill in at least one field (Product Name, Barcode, or Keywords) to search.");
      return;
    }
    
    let queryText = searchName;
    if (searchBarcode) {
      queryText = queryText ? `${queryText} (ID: ${searchBarcode})` : `Barcode: ${searchBarcode}`;
    }
    if (searchKeywords) {
      queryText = queryText ? `${queryText} (Keywords: ${searchKeywords})` : searchKeywords;
    }

    analyzeTextQuery(queryText, compareMedicine, activeCategory);
  };

  const samples = mockDatabase[activeCategory] || [];

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
            AI Scanning &amp; Inquiry Terminal
          </div>
          <h2 className="text-3xl font-extrabold text-on-surface leading-tight">
            Analyze Product Safety
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Provide a clean label photo or enter product identifiers below.
          </p>
        </div>
      </div>

      {/* ── API KEY CONFIGURATION WARNING ── */}
      {(!apiSettings || apiSettings.mode === 'mock' || !apiSettings.apiKey) && (
        <div className="mb-6 bg-[#B45309]/8 border-2 border-[#B45309]/30 rounded-3xl p-4 flex items-center gap-3.5 shadow-sm">
          <span className="material-symbols-outlined text-[#B45309] text-2xl flex-shrink-0">info</span>
          <div>
            <p className="text-xs font-extrabold text-[#B45309] uppercase tracking-wider">Demo / Mock Mode Active</p>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
              No Gemini API key is configured in the environment variables. Any scan or search will simulate results using mock sample database items. Please set the <strong>VITE_GEMINI_API_KEY</strong> environment variable to enable live Gemini AI analysis.
            </p>
          </div>
        </div>
      )}

      {/* Modern Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/30 pb-0.5 mb-6">
        <button 
          onClick={() => {
            setActiveTab('scan');
            setImagePreview(null);
            setSearchName('');
            setSearchBarcode('');
            setSearchKeywords('');
            setCompareMedicine('');
          }}
          className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer bg-transparent outline-none border-none ${
            activeTab === 'scan' ? 'border-b-2 border-solid border-primary text-primary font-extrabold' : 'border-b-0 text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          <span>Label Scanner</span>
        </button>
        <button 
          onClick={() => {
            setActiveTab('search');
            setIsCameraViewOpen(false);
            setImagePreview(null);
            setSearchName('');
            setSearchBarcode('');
            setSearchKeywords('');
            setCompareMedicine('');
          }}
          className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer bg-transparent outline-none border-none ${
            activeTab === 'search' ? 'border-b-2 border-solid border-primary text-primary font-extrabold' : 'border-b-0 text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          <span>Search Product details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Viewfinder / Search fields */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {activeTab === 'scan' ? (
            <>
              {/* Viewfinder Card */}
              {isCameraViewOpen && (
              <div className="bg-black rounded-2xl overflow-hidden relative aspect-[4/3] flex items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] border border-neutral-900">
                {/* Live Camera Video */}
                <video 
                  ref={videoRef} 
                  className={`absolute inset-0 w-full h-full object-cover z-10 ${cameraActive && !imagePreview ? 'block' : 'hidden'}`}
                  autoPlay 
                  playsInline 
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
                  <button 
                    onClick={() => { setIsCameraViewOpen(false); stopCamera(); }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer z-50"
                    title="Close Camera"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              )}

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
                    Upload a photograph of ingredients or nutritional statement.
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
                  
                  {!isCameraViewOpen && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsCameraViewOpen(true); startCamera(); }}
                      className="mt-6 flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-6 rounded-full text-sm hover:bg-primary-container hover:text-on-surface shadow-md cursor-pointer transition-all duration-200 border-none outline-none"
                    >
                      <span className="material-symbols-outlined">photo_camera</span>
                      <span>Scan with Camera</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Try with Demo Samples */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm font-fill-1">science</span>
                  <span>Try with Demo Samples</span>
                </h3>
                <p className="text-[11px] text-on-surface-variant mb-4">
                  Select a sample product to simulate a full AI label scan and see personalized warnings.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {samples.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => { stopCamera(); triggerMockScan(sample.id); }}
                      className="flex items-center gap-3 p-3 border border-outline-variant/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left cursor-pointer bg-transparent"
                    >
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {activeCategory === 'food' ? 'restaurant' : activeCategory === 'cosmetics' ? 'science' : 'medication'}
                        </span>
                      </div>
                      <div className="overflow-hidden flex-grow">
                        <p className="text-xs font-bold truncate text-on-surface">{sample.product_name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{sample.brand_name}</p>
                      </div>
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">chevron_right</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: Text Search Form */
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-5">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <span className="material-symbols-outlined">search</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider">Search Safety Database</h3>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Product Name</label>
                  <input 
                    type="text" 
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary transition-all bg-white"
                    placeholder="e.g. Cetaphil Cleanser, Oreo Cookies, Metformin"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Product Barcode / ID (Optional)</label>
                  <input 
                    type="text" 
                    value={searchBarcode}
                    onChange={(e) => setSearchBarcode(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary transition-all bg-white"
                    placeholder="e.g. 7622201814437"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Keywords or Concerns (Optional)</label>
                  <input 
                    type="text" 
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary transition-all bg-white"
                    placeholder="e.g. Acne face wash, Gluten-free cookie, Diabetes medicine"
                  />
                </div>

                {activeCategory === 'medicine' && (
                  <div className="flex flex-col gap-1.5 p-3.5 bg-secondary-container/5 rounded-xl border border-secondary/20 mt-1">
                    <label className="text-xs font-bold text-secondary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">swap_horiz</span>
                      <span>Drug Interaction Checker</span>
                    </label>
                    <input 
                      type="text" 
                      value={compareMedicine}
                      onChange={(e) => setCompareMedicine(e.target.value)}
                      className="w-full p-2.5 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary transition-all bg-white"
                      placeholder="Enter secondary medicine to crosscheck (e.g. Ibuprofen)"
                    />
                    <p className="text-[10px] text-on-surface-variant leading-relaxed">
                      Matches drug safety profiles and evaluates potential clinical interactions.
                    </p>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-xs hover:bg-primary-container shadow-md cursor-pointer transition-colors duration-150 border-none outline-none mt-2 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span>Analyze Product via AI</span>
                </button>
              </form>
            </div>
          )}

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

          {/* Coming Soon Placeholder */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 border border-dashed border-outline-variant/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
            <div className="w-16 h-16 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary mb-2">
              <span className="material-symbols-outlined text-3xl">construction</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Community Scan Database</h3>
              <p className="text-xs text-on-surface-variant mt-2 max-w-[250px] mx-auto">
                We're building a crowdsourced database of verified product safety scans. 
              </p>
            </div>
            <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-secondary text-white uppercase tracking-wider mt-2 shadow-sm">
              Feature Coming Soon
            </span>
          </div>

          {/* History Scan Logs */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-on-surface">Recent Scan Logs</h3>
              {scanHistory.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs text-on-surface-variant hover:text-error hover:underline font-semibold bg-transparent border-none outline-none cursor-pointer"
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
                            ? 'bg-error-container text-on-error-container font-extrabold' 
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
