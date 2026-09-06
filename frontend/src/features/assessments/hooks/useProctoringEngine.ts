import { useEffect, useRef } from "react";

export function useProctoringEngine(
	isActive: boolean,
	stream: MediaStream | null,
	onViolation: (type: string) => void,
) {
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Throttle violations to prevent spamming
	const lastViolationTime = useRef<Record<string, number>>({});

	useEffect(() => {
		if (!isActive || !stream) return;

		try {
			const AudioContextClass =
				window.AudioContext || (window as any).webkitAudioContext;
			if (AudioContextClass) {
				audioContextRef.current = new AudioContextClass();
				const source = audioContextRef.current.createMediaStreamSource(stream);
				analyserRef.current = audioContextRef.current.createAnalyser();
				analyserRef.current.fftSize = 256;
				source.connect(analyserRef.current);
			}
		} catch (e) {
			console.warn("AudioContext init failed", e);
		}

		intervalRef.current = setInterval(() => {
			const now = Date.now();

			// --- Audio Spike Detection ---
			if (analyserRef.current) {
				const bufferLength = analyserRef.current.frequencyBinCount;
				const dataArray = new Uint8Array(bufferLength);
				analyserRef.current.getByteFrequencyData(dataArray);

				let sum = 0;
				for (let i = 0; i < bufferLength; i++) {
					sum += dataArray[i];
				}
				const average = sum / bufferLength;

				// Threshold for talking/noise (average byte value > 50)
				if (average > 50) {
					// Only report once every 10 seconds for audio spikes
					if (!lastViolationTime.current["AudioSpike"] || now - lastViolationTime.current["AudioSpike"] > 10000) {
						lastViolationTime.current["AudioSpike"] = now;
						onViolation("AudioSpike");
					}
				}
			}

			// --- Native Shape Detection API (FaceDetection) ---
			// Note: This is an experimental API, primarily working in Chrome Android or Chrome with flags enabled.
			// It acts as a progressive enhancement for client-side face detection without huge JS bundles.
			if ('FaceDetector' in window) {
				try {
					const faceDetector = new (window as any).FaceDetector();
					// We need an image source. For now, since we don't have a direct handle to the video frame easily in this hook without canvas copying,
					// we can leave this as a placeholder, or implement canvas copying.
					// A lightweight approach:
					const track = stream.getVideoTracks()[0];
					if (track && 'ImageCapture' in window) {
						const imageCapture = new (window as any).ImageCapture(track);
						imageCapture.grabFrame().then((bitmap: ImageBitmap) => {
							faceDetector.detect(bitmap).then((faces: any[]) => {
								if (faces.length === 0) {
									if (!lastViolationTime.current["NoFaceDetected"] || now - lastViolationTime.current["NoFaceDetected"] > 10000) {
										lastViolationTime.current["NoFaceDetected"] = now;
										onViolation("NoFaceDetected");
									}
								} else if (faces.length > 1) {
									if (!lastViolationTime.current["MultipleFacesDetected"] || now - lastViolationTime.current["MultipleFacesDetected"] > 10000) {
										lastViolationTime.current["MultipleFacesDetected"] = now;
										onViolation("MultipleFacesDetected");
									}
								}
							}).catch(() => {});
						}).catch(() => {});
					}
				} catch (e) {
					// fail silently
				}
			}

		}, 3000); // Check every 3 seconds

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
			if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
				audioContextRef.current.close().catch(() => {});
			}
		};
	}, [isActive, stream, onViolation]);

	return {};
}
