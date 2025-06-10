import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Magnet <span className="text-[hsl(280,100%,70%)]">Cloud</span>{" "}
          Downloader
        </h1>
        <p className="max-w-2xl text-center text-xl text-white/80">
          A powerful cloud-based magnet link downloader with secure
          authentication
        </p>

        <div className="mb-8 flex gap-4">
          <Link
            href="/sign-in"
            className="rounded-lg bg-[hsl(280,100%,70%)] px-6 py-3 font-medium text-white transition-colors hover:bg-[hsl(280,100%,60%)]"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:bg-white/20"
          >
            Create Account
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/dashboard"
          >
            <h3 className="text-2xl font-bold">Dashboard →</h3>
            <div className="text-lg">
              Access your personal dashboard to manage downloads and account
              settings.
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/sign-up"
          >
            <h3 className="text-2xl font-bold">Get Started →</h3>
            <div className="text-lg">
              Create an account to start downloading magnet links through our
              secure cloud service.
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
