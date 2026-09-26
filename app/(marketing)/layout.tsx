import { SmoothScroll } from "@/components/marketing/smooth-scroll"

// The welcome page is dark whatever the app theme is, so the token set is scoped
// here rather than switching the theme for the whole app.
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="dark min-h-svh bg-background text-foreground">
      <a
        href="#canvas"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:bg-foreground focus:px-3 focus:py-2 focus:font-mono focus:text-[11px] focus:tracking-[0.06em] focus:text-background focus:uppercase"
      >
        Skip to content
      </a>
      <SmoothScroll />
      {children}
    </div>
  )
}
