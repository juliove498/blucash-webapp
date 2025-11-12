import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
	onScanSuccess: (decodedText: string) => void;
	onScanError?: (error: string) => void;
	onClose: () => void;
}

export const QRScanner = ({ onScanSuccess, onScanError, onClose }: QRScannerProps) => {
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const [isScanning, setIsScanning] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const startScanner = async () => {
			try {
				const html5QrCode = new Html5Qrcode('qr-reader');
				scannerRef.current = html5QrCode;

				await html5QrCode.start(
					{ facingMode: 'environment' }, // Usar cámara trasera
					{
						fps: 10,
						qrbox: { width: 250, height: 250 },
					},
					(decodedText) => {
						onScanSuccess(decodedText);
						stopScanner();
					},
					(errorMessage) => {
						// Ignorar errores de escaneo continuos
						if (onScanError && !errorMessage.includes('NotFoundException')) {
							onScanError(errorMessage);
						}
					}
				);

				setIsScanning(true);
			} catch (err: any) {
				setError(err?.message || 'Error al iniciar la cámara');
				if (onScanError) {
					onScanError(err?.message);
				}
			}
		};

		startScanner();

		return () => {
			stopScanner();
		};
	}, [onScanSuccess, onScanError]);

	const stopScanner = async () => {
		if (scannerRef.current && isScanning) {
			try {
				await scannerRef.current.stop();
				scannerRef.current.clear();
			} catch (err) {
				console.error('Error stopping scanner:', err);
			}
			setIsScanning(false);
		}
	};

	const handleClose = async () => {
		await stopScanner();
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black z-50 flex flex-col">
			{/* Header */}
			<div className="relative w-full bg-black/80 p-4 pt-safe">
				<button
					onClick={handleClose}
					className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				<h2 className="text-white text-xl font-bold text-center">Escanear código QR</h2>
			</div>

			{/* Scanner Area */}
			<div className="flex-1 flex items-center justify-center p-4">
				<div className="relative w-full max-w-md">
					{error ? (
						<div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-white text-center">
							<p className="font-bold mb-2">Error</p>
							<p className="text-sm">{error}</p>
							<button
								onClick={handleClose}
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
				<p className="text-white text-center text-sm">
					Apunta la cámara hacia el código QR para escanearlo
				</p>
			</div>
		</div>
	);
};

export default QRScanner;



