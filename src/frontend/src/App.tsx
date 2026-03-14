import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import BrowsePage from "./pages/BrowsePage";
import DashboardPage from "./pages/DashboardPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ServiceFormPage from "./pages/ServiceFormPage";

export type Route =
  | { name: "browse" }
  | { name: "detail"; id: bigint }
  | { name: "dashboard" }
  | { name: "create" }
  | { name: "edit"; id: bigint }
  | { name: "profile" };

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, "");
  if (!path || path === "/") return { name: "browse" };
  if (path === "dashboard") return { name: "dashboard" };
  if (path === "create") return { name: "create" };
  if (path === "profile") return { name: "profile" };
  const detailMatch = path.match(/^service\/(\d+)$/);
  if (detailMatch) return { name: "detail", id: BigInt(detailMatch[1]) };
  const editMatch = path.match(/^service\/(\d+)\/edit$/);
  if (editMatch) return { name: "edit", id: BigInt(editMatch[1]) };
  return { name: "browse" };
}

export function navigate(path: string) {
  window.location.hash = path;
}

export default function App() {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(window.location.hash),
  );

  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  function renderPage() {
    switch (route.name) {
      case "browse":
        return <BrowsePage />;
      case "detail":
        return <ServiceDetailPage serviceId={route.id} />;
      case "dashboard":
        return <DashboardPage />;
      case "create":
        return <ServiceFormPage mode="create" />;
      case "edit":
        return <ServiceFormPage mode="edit" serviceId={route.id} />;
      case "profile":
        return <ProfileSetupPage />;
      default:
        return <BrowsePage />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
