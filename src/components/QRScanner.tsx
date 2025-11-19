import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  onClose: () => void;
}

export const QRScanner = ({
  onScanSuccess,
  onScanError,
  onClose,
}: QRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasScannedRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const startScanner = async () => {
      try {
        console.log("[QRScanner] Initializing scanner...");

        // Limpiar elemento existente
        const existingElement = document.getElementById("qr-reader");
        if (existingElement) {
          existingElement.innerHTML = "";
        }

        const html5QrCode = new Html5Qrcode("qr-reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        // Solicitar permisos
        await navigator.mediaDevices.getUserMedia({ video: true });

        // Obtener cámaras
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          throw new Error("No se encontró ninguna cámara");
        }

        // Buscar cámara trasera
        const backCamera = devices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear") ||
            device.label.toLowerCase().includes("trasera") ||
            device.label.toLowerCase().includes("environment")
        );
        const cameraId = backCamera ? backCamera.id : devices[0].id;
        console.log("[QRScanner] Using camera:", cameraId);

        await html5QrCode.start(
          cameraId,
          {
            fps: 30, // Mayor FPS para mejor detección
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false, // Permitir flip para mejor detección
          },
          (decodedText) => {
            if (!hasScannedRef.current) {
              console.log("[QRScanner] QR Code detected:", decodedText);
              hasScannedRef.current = true;
              stopScanner().then(() => {
                onScanSuccess(decodedText);
              });
            }
          },
          (errorMessage) => {
            // Ignorar errores normales de escaneo
            if (
              !errorMessage.includes("NotFoundException") &&
              !errorMessage.includes("No MultiFormat Readers")
            ) {
              console.warn("[QRScanner] Scan error:", errorMessage);
            }
          }
        );

        console.log("[QRScanner] Scanner started successfully");
      } catch (err: any) {
        console.error("[QRScanner] Error starting scanner:", err);
        const errorMsg =
          err?.message || "Error al iniciar la cámara. Verifica los permisos.";
        setError(errorMsg);
        if (onScanError) {
          onScanError(errorMsg);
        }
      }
    };

    startScanner();

    return () => {
      console.log("[QRScanner] Cleaning up...");
      mountedRef.current = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("[QRScanner] Error stopping scanner:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="relative w-full bg-black/80 p-4 pt-safe">
        <button
          onClick={() => {
            stopScanner().then(() => onClose());
          }}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-white text-xl font-bold text-center">
          Escanear código QR
        </h2>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {error ? (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-white text-center">
              <p className="font-bold mb-2">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => {
                  stopScanner().then(() => onClose());
                }}
                className="mt-4 px-4 py-2 bg-white text-red-500 rounded-lg font-bold"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div id="qr-reader" className="rounded-lg overflow-hidden" />
              <div className="absolute inset-0 pointer-events-none">
                {/* Overlay con esquinas */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full bg-black/80 p-6 pb-safe">
        <p className="text-white text-center text-sm mb-2">
          Apunta la cámara hacia el código QR para escanearlo
        </p>
        {error && (
          <p className="text-red-400 text-center text-xs mt-2">
            💡 Asegúrate de permitir el acceso a la cámara
          </p>
        )}
        <p className="text-white/60 text-center text-xs mt-3">
          💡 Si el código tiene un logo en el centro, asegúrate de que esté bien
          iluminado y enfocado
        </p>
      </div>
    </div>
  );
};

export default QRScanner;
