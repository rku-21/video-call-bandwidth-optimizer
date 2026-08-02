/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Set to "0" to disable adaptive controller. Default: enabled. */
	readonly VITE_ADAPTIVE_CALLING?: string;
	/** Optional URL of Python ML service, e.g. http://localhost:8088 */
	readonly VITE_ML_SERVICE_URL?: string;
	/** Set to "0" to disable telemetry upload to ML service. Default: enabled when ML service is configured. */
	readonly VITE_ML_TELEMETRY?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
