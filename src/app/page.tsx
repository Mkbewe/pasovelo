export default function Home() {
  return (
    <main className='flex flex-1 items-center justify-center px-6 py-16'>
      <section className='w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12'>
        <p className='text-sm font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400'>
          Pasovelo
        </p>
        <h1 className='mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl'>
          Trener hiszpańskich form
        </h1>
        <p className='mt-4 text-base leading-7 text-slate-600 dark:text-slate-400'>
          Projekt dopiero startuje. Na razie możesz zobaczyć prototyp trenera odmiany czasowników.
        </p>
        <div className='mt-8'>
          <a
            href='/prototype.html'
            className='inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition hover:from-amber-600 hover:to-orange-700'
          >
            Otwórz prototyp
          </a>
        </div>
        <p className='mt-8 text-xs text-slate-400 dark:text-slate-500'>
          Wersja robocza · Next.js · TypeScript · Tailwind CSS
        </p>
      </section>
    </main>
  );
}
