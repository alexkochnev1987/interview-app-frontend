export default function Home() {
  return (
    <main>
      <h1>Interview App</h1>
      <p>Environment: {process.env.NEXT_PUBLIC_ENV ?? 'local'}</p>
    </main>
  );
}
