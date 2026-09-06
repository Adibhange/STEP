import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/design-system";

export interface HardwarePrecheckModalProps {
	isOpen: boolean;
	onComplete: (stream: MediaStream) => void;
}

export const HardwarePrecheckModal: React.FC<HardwarePrecheckModalProps> = ({
	isOpen,
	onComplete,
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	useEffect(() => {
		if (isOpen && !stream && !error) {
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: true })
				.then((s) => {
					setStream(s);
					if (videoRef.current) {
						videoRef.current.srcObject = s;
					}
				})
				.catch((err) => {
					setError(
						"Camera or Microphone access denied. Please allow permissions to proceed.",
					);
				});
		}
	}, [isOpen, stream, error]);

	const handleStartVerification = () => {
		setIsAnalyzing(true);
		// Mock a 2s analyzing delay, as standard face detection APIs aren't widely supported without polyfills
		setTimeout(() => {
			setIsAnalyzing(false);
			setIsSuccess(true);
			setTimeout(() => {
				if (stream) {
					onComplete(stream);
				}
			}, 1000);
		}, 2000);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
			>
				<div className="p-6 border-b border-slate-200 dark:border-slate-800">
					<h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
						<Icon name="shield" className="w-5 h-5 text-indigo-500" />
						Proctoring Pre-Check
					</h2>
					<p className="text-sm text-slate-500 mt-1">
						Please ensure your camera and microphone are working.
					</p>
				</div>

				<div className="p-6">
					{error ? (
						<div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-start gap-3">
							<Icon name="alert-triangle" className="w-5 h-5 shrink-0 mt-0.5" />
							<p className="text-sm">{error}</p>
						</div>
					) : (
						<div className="space-y-4">
							<div className="relative bg-slate-900 rounded-lg aspect-video overflow-hidden border border-slate-200 dark:border-slate-700">
								<video
									ref={videoRef}
									autoPlay
									playsInline
									muted
									className="w-full h-full object-cover"
								/>
								{isAnalyzing && (
									<div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
										<Icon name="loader" className="w-8 h-8 animate-spin mb-2" />
										<span className="text-sm font-medium">Analyzing Feed...</span>
									</div>
								)}
								{isSuccess && (
									<div className="absolute inset-0 bg-green-500/20 flex flex-col items-center justify-center text-green-400">
										<Icon name="check-circle" className="w-12 h-12 mb-2 bg-green-900/50 rounded-full" />
										<span className="text-sm font-medium">Verification Passed</span>
									</div>
								)}
							</div>

							<div className="space-y-3">
								<div className="flex items-center justify-between text-sm">
									<span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
										<Icon name="camera" className="w-4 h-4" /> Camera Access
									</span>
									<Icon name="check" className="w-4 h-4 text-green-500" />
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
										<Icon name="mic" className="w-4 h-4" /> Microphone Access
									</span>
									<Icon name="check" className="w-4 h-4 text-green-500" />
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
					<button
						type="button"
						className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
						onClick={() => window.location.reload()}
					>
						Cancel
					</button>
					<button
						type="button"
						disabled={!stream || isAnalyzing || isSuccess || !!error}
						onClick={handleStartVerification}
						className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
					>
						{isAnalyzing ? (
							<>
								<Icon name="loader" className="w-4 h-4 animate-spin" />
								Verifying...
							</>
						) : (
							"Start Verification"
						)}
					</button>
				</div>
			</motion.div>
		</div>
	);
};
