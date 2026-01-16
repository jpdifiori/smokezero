import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-core-black text-white p-4 text-center">
            <h1 className="text-3xl font-bold mb-4 text-orange-pulse">Authentication Error</h1>
            <p className="mb-8 text-white/50">
                There was an issue verifying your login code. It may have expired or been used already.
            </p>
            <Link
                href="/login"
                className="px-6 py-3 rounded-full bg-white text-core-black font-bold hover:bg-zinc-200 transition-colors"
            >
                Try Again
            </Link>
        </div>
    )
}
