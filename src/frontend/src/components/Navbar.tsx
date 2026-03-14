import { Button } from "@/components/ui/button";
import { LayoutDashboard, Loader2, LogIn, LogOut, Store } from "lucide-react";
import { navigate } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Navbar() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          className="flex items-center gap-2 group"
          onClick={() => navigate("/")}
          data-ocid="nav.home_link"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Store className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground tracking-tight">
            Services<span className="text-primary">Hub</span>
          </span>
        </button>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 font-medium"
              onClick={() => navigate("dashboard")}
              data-ocid="nav.dashboard_link"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Mi Panel</span>
            </Button>
          )}

          {isInitializing ? (
            <Button variant="outline" size="sm" disabled>
              <Loader2 className="w-4 h-4 animate-spin" />
            </Button>
          ) : isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => clear()}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="nav.login_button"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{isLoggingIn ? "Conectando..." : "Iniciar Sesión"}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
