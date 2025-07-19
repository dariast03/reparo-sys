import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-4xl text-sm">
                    <nav className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Yo Reparo MAX</h1>
                        <div className="flex gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-sm border border-[#19140035] px-5 py-1.5 text-sm text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-sm border border-transparent px-5 py-1.5 text-sm text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    {/*     <Link
                                        href={route('register')}
                                        className="rounded-sm border border-[#19140035] px-5 py-1.5 text-sm text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Registrarse
                                    </Link> */}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="flex w-full max-w-4xl flex-1 flex-col-reverse items-center justify-between lg:flex-row">
                    <div className="flex-1 p-6 text-center lg:p-12 lg:text-left">
                        <h2 className="mb-4 text-3xl font-bold text-[#1b1b18] dark:text-white">Reparación de celulares y computadoras</h2>
                        <p className="mb-6 text-[#4b4b47] dark:text-[#A1A09A]">
                            En <strong>Yo Reparo MAX</strong>, ofrecemos servicio técnico confiable, rápido y profesional para tus dispositivos.
                            ¡Recupéralos como nuevos!
                        </p>
                        <Link
                            href={'#'}
                            className="inline-block rounded-md bg-[#f53003] px-6 py-2 text-white hover:bg-[#d62802] dark:bg-[#FF4433] dark:hover:bg-[#e03d2e]"
                        >
                            Contáctanos
                        </Link>
                    </div>

                    <div className="flex-1">
                        <img
                            src="/img/repair-hero.webp"
                            alt="Técnico reparando dispositivo"
                            className="rounded-lg shadow-lg dark:shadow-[#fffaed2d]"
                        />
                    </div>
                </main>
            </div>
        </>
    );
}
