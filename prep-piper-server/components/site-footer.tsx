export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 text-sm md:grid-cols-4 md:px-6">
        <div className="col-span-2 md:col-span-1">
          <div className="text-lg font-semibold">Prep Piper</div>
          <p className="mt-2 text-foreground/70">
            AI-powered technical interview practice platform with real-time feedback.
          </p>
        </div>

        <div>
          <div className="font-medium">Quick Links</div>
          <ul className="mt-2 space-y-1 text-foreground/70">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="/sign-in">Sign In</a>
            </li>
            <li>
              <a href="/sign-up">Sign Up</a>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-medium">Resources</div>
          <ul className="mt-2 space-y-1 text-foreground/70">
            <li>
              <a href="#">Documentation</a>
            </li>
            <li>
              <a href="#">Help Center</a>
            </li>
            <li>
              <a href="#">Status Page</a>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-medium">Legal</div>
          <ul className="mt-2 space-y-1 text-foreground/70">
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Terms of Service</a>
            </li>
            <li>
              <a href="#">Cookie Policy</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-foreground/60 md:px-6">
          <span>© {new Date().getFullYear()} Prep Piper. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="LinkedIn">
              LinkedIn
            </a>
            <a href="#" aria-label="Twitter">
              Twitter
            </a>
            <a href="#" aria-label="GitHub">
              GitHub
            </a>
            <a href="#" aria-label="Discord">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
