import Link from "next/link"

import { Reveal } from "@/components/marketing/reveal"

function ClosingCta() {
  return (
    <section id="start" className="px-4 pb-10 md:px-8">
      <Reveal className="mx-auto max-w-[110rem] rounded-lg border border-border bg-card p-8 md:p-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] font-medium tracking-[-0.04em] text-foreground">
            Ship your first
            <br />
            workflow today.
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/sign-up"
              className="rounded-full bg-foreground px-5 py-2.5 font-mono text-[11px] font-medium tracking-[0.06em] text-background uppercase transition-all hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:translate-y-px"
            >
              Start building
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-border px-5 py-2.5 font-mono text-[11px] font-medium tracking-[0.06em] text-foreground uppercase transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Log in
            </Link>
          </div>
        </div>

        <footer className="mt-16 flex flex-col gap-4 border-t border-border pt-6 text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[10px] tracking-[0.06em] uppercase">
            Browser automation workflows · {new Date().getFullYear()}
          </p>
          <ul className="flex flex-wrap gap-5">
            {[
              { label: "Workflows", href: "#canvas" },
              { label: "Nodes", href: "#nodes" },
              { label: "Live runs", href: "#runs" },
              { label: "Log in", href: "/sign-in" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="font-mono text-[10px] tracking-[0.06em] uppercase transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      </Reveal>
    </section>
  )
}

export { ClosingCta }
