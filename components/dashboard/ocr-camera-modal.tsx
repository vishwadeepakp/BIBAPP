import React, { useRef, useState, useEffect } from 'react';

export const OcrCameraModal = ({ isOpen, onClose, OnCaptureSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // 1. Start Camera Feed on Modal Open
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera Access Error:', err);
      setCameraError('Camera access denied. Please allow access or upload a file instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  // 2. Capture Image & Compress on Client Canvas
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set dimensions
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // Draw frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Compress Image to JPEG with 0.8 quality (~200KB - 400KB)
    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

    stopCamera();
    setCapturedImage(compressedBase64);
  };

  // 3. Handle Gallery Upload Backup Option
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        stopCamera();
        setCapturedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. Submit Image to Parent Handler (Kafka / Server API)
  const handleConfirmUpload = () => {
    if (!capturedImage) return;

    // Send base64/blob to parent component to initiate Kafka job
    OnCaptureSuccess(capturedImage);
    handleCloseModal();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleCloseModal = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-900 text-white">
          <h3 className="text-lg font-semibold">Scan Bill (OCR)</h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-white text-2xl">
            &times;
          </button>
        </div>

        {/* Camera View / Preview Area */}
        <div className="relative w-full h-[380px] bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="text-center p-4 text-red-400">
              <p>{cameraError}</p>
            </div>
          ) : capturedImage ? (
            /* Preview Image */
            <img src={capturedImage} alt="Captured Bill" className="w-full h-full object-contain" />
          ) : (
            /* Live Video Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Scanning Frame Guide */}
              <div className="absolute border-2 border-dashed border-yellow-400 rounded-lg w-[85%] h-[75%] pointer-events-none flex items-center justify-center">
                <span className="text-yellow-400 text-xs bg-black bg-opacity-60 px-2 py-1 rounded">
                  Place bill in this frame
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Hidden Canvas for Capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Footer / Controls */}
        <div className="p-4 bg-gray-100 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
              >
                Retake
              </button>
              <button
                onClick={handleConfirmUpload}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                Submit
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current.click()}
                className="py-2 px-3 text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg"
              >
                Choose from gallery
              </button>

              <button
                onClick={handleCapture}
                disabled={!isCameraActive}
                className={`py-3 px-6 rounded-full font-bold text-white shadow-lg ${
                  isCameraActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Capture
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
