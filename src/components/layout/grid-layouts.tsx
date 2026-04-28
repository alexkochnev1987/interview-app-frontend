import type { ReactNode } from 'react';

interface ThreeColumnCardsGridProps {
  children: ReactNode;
}

interface InterviewSetupFormGridProps {
  children: ReactNode;
}

interface TwoPanelHeroGridProps {
  children: ReactNode;
}

interface QuestionEditorMainGridProps {
  children: ReactNode;
}

interface SectionHeaderRowProps {
  children: ReactNode;
}

interface FeedbackTopGridProps {
  children: ReactNode;
}

interface FeedbackBottomGridProps {
  children: ReactNode;
}

interface SectionStackProps {
  children: ReactNode;
}

interface SingleColumnGridProps {
  children: ReactNode;
}

interface TwoUpSmGridProps {
  children: ReactNode;
}

interface HeaderSplitRowProps {
  children: ReactNode;
}

interface MetricsThreeUpGridProps {
  children: ReactNode;
}

export function ThreeColumnCardsGrid({ children }: ThreeColumnCardsGridProps) {
  return <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{children}</section>;
}

export function InterviewSetupFormGrid({ children }: InterviewSetupFormGridProps) {
  return <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">{children}</div>;
}

export function TwoPanelHeroGrid({ children }: TwoPanelHeroGridProps) {
  return <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">{children}</section>;
}

export function DashboardHeroGrid({ children }: TwoPanelHeroGridProps) {
  return <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">{children}</section>;
}

export function InterviewDetailHeroGrid({ children }: TwoPanelHeroGridProps) {
  return <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">{children}</section>;
}

export function QuestionEditorMainGrid({ children }: QuestionEditorMainGridProps) {
  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">{children}</div>;
}

export function SectionHeaderRow({ children }: SectionHeaderRowProps) {
  return <div className="flex flex-wrap items-end justify-between gap-4">{children}</div>;
}

export function FeedbackTopGrid({ children }: FeedbackTopGridProps) {
  return <section className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1.05fr_0.95fr]">{children}</section>;
}

export function FeedbackBottomGrid({ children }: FeedbackBottomGridProps) {
  return <section className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.85fr_1.15fr]">{children}</section>;
}

export function MetricsThreeUpGrid({ children }: MetricsThreeUpGridProps) {
  return <div className="grid gap-4 md:grid-cols-3">{children}</div>;
}

export function SectionStack({ children }: SectionStackProps) {
  return <section className="space-y-4">{children}</section>;
}

export function SingleColumnGrid({ children }: SingleColumnGridProps) {
  return <div className="grid gap-4">{children}</div>;
}

export function TwoUpSmGrid({ children }: TwoUpSmGridProps) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function HeaderSplitRow({ children }: HeaderSplitRowProps) {
  return <div className="flex flex-wrap items-start justify-between gap-4">{children}</div>;
}
