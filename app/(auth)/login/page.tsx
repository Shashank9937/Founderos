type LoginPageProps = {
  searchParams?: { error?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const error = searchParams?.error;

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden border-r border-border/70 bg-gradient-to-br from-background via-background to-accent/20 p-10 lg:block">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Founder AI Agent OS</p>
        <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight">
          Build, debug, and scale production-grade founder agents with measurable leverage.
        </h1>
        <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
          <li>- 4-core-component agent builder (Perception, Brain, Tools, Memory)</li>
          <li>- Structured failure analysis, automation scoring, and debug diagnostics</li>
          <li>- CEO learning + finance strategy + SaaS commercialization execution stack</li>
        </ul>
      </section>

      <section className="flex items-center justify-center p-6">
        <form action="/api/auth/login" method="post" className="w-full max-w-sm space-y-4 rounded-xl border border-border/70 bg-card/90 p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Secure Access</p>
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="text-xs text-muted-foreground">Seed credentials are documented in README.</p>
          </div>

          {error ? (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-400">
              Invalid credentials. Try again.
            </p>
          ) : null}

          <label className="block space-y-1">
            <span className="text-xs font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium">Password</span>
            <input
              name="password"
              type="password"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </label>

          <button type="submit" className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            Enter Command Center
          </button>
        </form>
      </section>
    </main>
  );
}
