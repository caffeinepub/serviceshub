import { Store } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Store className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-sm text-foreground">
              ServicesHub
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © {year}. Creado con ❤️ usando{" "}
            <a
              href={utmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Marketplace descentralizado
          </p>
        </div>
      </div>
    </footer>
  );
}
