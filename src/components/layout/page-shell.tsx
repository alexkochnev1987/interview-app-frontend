import type { ReactNode } from 'react';

interface PageMainProps {
  children: ReactNode;
}

interface PageMainWideGapProps {
  children: ReactNode;
}

interface PageMainCompactProps {
  children: ReactNode;
}

interface PageMainEditorProps {
  children: ReactNode;
}

interface PageMainTightProps {
  children: ReactNode;
}

interface PageMainCompactStackProps {
  children: ReactNode;
}

interface LoginPageShellProps {
  children: ReactNode;
}

interface MaxWidth4xlProps {
  children: ReactNode;
}

export function PageMain({ children }: PageMainProps) {
  return <main className="container space-y-8 py-10 md:py-12">{children}</main>;
}

export function PageMainWideGap({ children }: PageMainWideGapProps) {
  return <main className="container space-y-8 py-10 md:space-y-10 md:py-12">{children}</main>;
}

export function PageMainCompact({ children }: PageMainCompactProps) {
  return <main className="container py-12">{children}</main>;
}

export function PageMainEditor({ children }: PageMainEditorProps) {
  return <main className="container space-y-6 py-10 md:space-y-8 md:py-12">{children}</main>;
}

export function PageMainTight({ children }: PageMainTightProps) {
  return <main className="container py-10 md:py-12">{children}</main>;
}

export function PageMainCompactStack({ children }: PageMainCompactStackProps) {
  return <main className="container space-y-6 py-12">{children}</main>;
}

export function LoginPageShell({ children }: LoginPageShellProps) {
  return (
    <main className="container grid min-h-[calc(100vh-6rem)] gap-8 py-10 lg:grid-cols-[1.1fr_420px] lg:items-center lg:py-14">
      {children}
    </main>
  );
}

export function MaxWidth4xl({ children }: MaxWidth4xlProps) {
  return <div className="mx-auto max-w-4xl">{children}</div>;
}
