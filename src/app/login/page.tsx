import { login } from '../auth/actions'

export default async function LoginPage(props: {
    searchParams: Promise<{ message: string; error: string }>
}) {
    const searchParams = await props.searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center bg-core-black text-white p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-zinc-500 text-[10px] tracking-[0.5em] font-bold mb-4">SMOKEZERO</h1>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white/90">
                        Bienvenido
                    </h2>
                    <p className="mt-2 text-xs md:text-sm text-zinc-500">
                        Tu sistema de intervención inmediata.
                    </p>
                </div>

                <form className="mt-8 space-y-6" action={login}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-zinc-800 placeholder-zinc-500 text-white bg-zinc-900/50 rounded-lg focus:outline-none focus:ring-orange-pulse focus:border-orange-pulse focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-zinc-800 placeholder-zinc-500 text-white bg-zinc-900/50 rounded-lg focus:outline-none focus:ring-orange-pulse focus:border-orange-pulse focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3.5 md:py-3 px-4 border border-transparent text-sm font-medium rounded-full text-core-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-pulse transition-colors"
                        >
                            Iniciar Sesión
                        </button>
                    </div>

                    {searchParams?.message && (
                        <div className="p-4 bg-zinc-900/80 border border-lime-lift/20 rounded-lg text-center">
                            <p className="text-lime-lift text-sm font-mono">{searchParams.message}</p>
                        </div>
                    )}

                    {searchParams?.error && (
                        <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-center">
                            <p className="text-red-400 text-sm font-mono">{searchParams.error}</p>
                        </div>
                    )}

                    <div className="text-center mt-4">
                        <p className="text-sm text-zinc-500">
                            ¿No tienes cuenta?{' '}
                            <a href="/signup" className="text-lime-lift hover:underline">
                                Crear cuenta
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
