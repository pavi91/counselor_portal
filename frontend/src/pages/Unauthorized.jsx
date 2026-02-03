export default function Unauthorized() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
                {/* Icon */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/10 rounded-full border-2 border-red-500/30">
                        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l-3.414-3.414A2 2 0 0012.414 2H9a2 2 0 00-2 2v2m0 0H5a2 2 0 00-2 2v2m0 0v2a2 2 0 002 2h2m0 0h2" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-5xl font-bold text-white mb-4">Access Denied</h1>
                <p className="text-xl text-slate-400 mb-8">
                    You don't have permission to access this resource. Please contact your administrator if you believe this is a mistake.
                </p>

                {/* Status Code */}
                <div className="inline-block bg-slate-800/50 border border-slate-700 rounded-lg px-6 py-3 mb-8">
                    <code className="text-red-400 font-mono text-sm">Error 403: Unauthorized</code>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                        Go Back
                    </button>
                    <a
                        href="/"
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                        Home
                    </a>
                </div>
            </div>
        </div>
    );
}