export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
