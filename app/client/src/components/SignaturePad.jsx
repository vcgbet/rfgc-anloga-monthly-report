import React, { useRef, useState, useEffect } from 'react';
import { Pen, Upload, RotateCcw, CheckCircle, Trash2, Image as ImageIcon } from 'lucide-react';

export const SignaturePad = ({
  value,
  onChange,
  label = 'Signature',
  signerRole = 'Secretary',
  allowUpload = true,
  allowDraw = true,
}) => {
  const [mode, setMode] = useState('draw'); // 'draw' or 'upload'
  const [penColor, setPenColor] = useState('#1e3a8a');
  const [penWidth, setPenWidth] = useState(2.5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!value);
  const [strokeHistory, setStrokeHistory] = useState([]);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setHasSignature(!!value);
  }, [value]);

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current && !value) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [mode, value]);

  // Canvas drawing handlers
  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);

    // Save current state for undo
    setStrokeHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setHasSignature(true);
    onChange(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setStrokeHistory([]);
    setHasSignature(false);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokeHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    const prevHistory = [...strokeHistory];
    const lastImageData = prevHistory.pop();
    setStrokeHistory(prevHistory);
    ctx.putImageData(lastImageData, 0, 0);

    if (prevHistory.length === 0) {
      setHasSignature(false);
      onChange('');
    } else {
      onChange(canvas.toDataURL('image/png'));
    }
  };

  // Image Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create an offscreen canvas to scale/clean
        const maxW = 500;
        const maxH = 250;
        let w = img.width;
        let h = img.height;

        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = w * ratio;
          h = h * ratio;
        }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = tempCanvas.toDataURL('image/png');
        setHasSignature(true);
        onChange(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <span>{label}</span>
          {hasSignature && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Signed
            </span>
          )}
        </label>

        {/* Mode Selector Tabs */}
        <div className="inline-flex bg-slate-200 p-1 rounded-lg text-xs font-medium">
          {allowDraw && (
            <button
              type="button"
              onClick={() => setMode('draw')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                mode === 'draw'
                  ? 'bg-white text-blue-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pen className="w-3.5 h-3.5" /> Draw Pad
            </button>
          )}
          {allowUpload && (
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                mode === 'upload'
                  ? 'bg-white text-blue-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload File
            </button>
          )}
        </div>
      </div>

      {/* Existing Signature Preview */}
      {value && (
        <div className="mb-3 p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-28 h-16 bg-slate-100 border border-dashed border-slate-300 rounded flex items-center justify-center overflow-hidden">
              <img
                src={value}
                alt="Current Signature"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">Current Signature / Stamp</p>
              <p className="text-[11px] text-slate-500">Ready for report endorsement</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear / Change
          </button>
        </div>
      )}

      {/* DRAW MODE */}
      {mode === 'draw' && (
        <div>
          <div className="relative border-2 border-dashed border-blue-200 rounded-lg bg-white overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={460}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[140px] cursor-crosshair touch-none bg-white block"
            />
            {!hasSignature && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 text-slate-400">
                <span className="text-sm italic font-serif">Sign here with mouse or touch screen...</span>
              </div>
            )}
          </div>

          {/* Canvas Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Color:</span>
              <button
                type="button"
                onClick={() => setPenColor('#1e3a8a')}
                className={`w-5 h-5 rounded-full bg-[#1e3a8a] border-2 ${
                  penColor === '#1e3a8a' ? 'ring-2 ring-offset-1 ring-blue-500' : 'border-white'
                }`}
                title="Navy Blue"
              />
              <button
                type="button"
                onClick={() => setPenColor('#000000')}
                className={`w-5 h-5 rounded-full bg-black border-2 ${
                  penColor === '#000000' ? 'ring-2 ring-offset-1 ring-blue-500' : 'border-white'
                }`}
                title="Black"
              />
              <button
                type="button"
                onClick={() => setPenColor('#2563eb')}
                className={`w-5 h-5 rounded-full bg-blue-600 border-2 ${
                  penColor === '#2563eb' ? 'ring-2 ring-offset-1 ring-blue-500' : 'border-white'
                }`}
                title="Royal Blue"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={undoLastStroke}
                disabled={strokeHistory.length === 0}
                className="text-xs px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded disabled:opacity-40 flex items-center gap-1"
                title="Undo last stroke"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Undo
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODE */}
      {mode === 'upload' && (
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40 rounded-lg p-5 text-center cursor-pointer transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-2.5 bg-blue-100 rounded-full text-blue-700">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Click to browse or drop signature/stamp image
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supports PNG, JPG, WEBP (transparent signatures or official church stamps)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
