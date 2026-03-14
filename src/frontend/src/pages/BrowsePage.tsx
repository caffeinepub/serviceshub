import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Shield, Sparkles, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Category, type Service } from "../backend.d";
import CategoryBadge, { categoryLabel } from "../components/CategoryBadge";
import ServiceCard from "../components/ServiceCard";
import { useAllServices, useSearchServices } from "../hooks/useQueries";

const CATEGORIES = [
  Category.design,
  Category.programming,
  Category.marketing,
  Category.writing,
  Category.video,
  Category.music,
  Category.business,
  Category.other,
];

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

const SAMPLE_SERVICES: Service[] = [
  {
    id: BigInt(1),
    title: "Diseño de Identidad Visual Completa",
    description:
      "Logo, paleta de colores, tipografía y guía de marca profesional para tu negocio.",
    price: 299,
    category: Category.design,
    sellerName: "Ana García",
    sellerId: { toString: () => "seller-1" } as any,
    active: true,
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(2),
    title: "Desarrollo de Aplicación Web React",
    description:
      "Construyo tu webapp moderna con React, TypeScript y diseño responsivo.",
    price: 850,
    category: Category.programming,
    sellerName: "Carlos Mendez",
    sellerId: { toString: () => "seller-2" } as any,
    active: true,
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(3),
    title: "Estrategia de Marketing Digital en Redes",
    description:
      "Plan de contenido mensual con diseños, copy y análisis de métricas para Instagram y TikTok.",
    price: 450,
    category: Category.marketing,
    sellerName: "María López",
    sellerId: { toString: () => "seller-3" } as any,
    active: true,
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(4),
    title: "Redacción de Artículos SEO para Blog",
    description:
      "Artículos optimizados para buscadores, 1000-2000 palabras, investigación de palabras clave incluida.",
    price: 120,
    category: Category.writing,
    sellerName: "Pedro Ruiz",
    sellerId: { toString: () => "seller-4" } as any,
    active: true,
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(5),
    title: "Edición de Video Profesional",
    description:
      "Edición cinematográfica para YouTube, cortes, color grading, subtítulos y música.",
    price: 200,
    category: Category.video,
    sellerName: "Sofia Torres",
    sellerId: { toString: () => "seller-5" } as any,
    active: true,
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(6),
    title: "Composición Musical para Publicidad",
    description:
      "Jingles y música original para comerciales, podcasts y aplicaciones.",
    price: 350,
    category: Category.music,
    sellerName: "Diego Morales",
    sellerId: { toString: () => "seller-6" } as any,
    active: true,
    createdAt: BigInt(Date.now()),
  },
];

export default function BrowsePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  const allServicesQuery = useAllServices(
    activeCategory !== "all" ? activeCategory : null,
    null,
  );
  const searchQuery = useSearchServices(search);

  const services = useMemo<Service[]>(() => {
    if (search.trim()) {
      return searchQuery.data ?? [];
    }
    const data = allServicesQuery.data;
    if (!data || data.length === 0) return SAMPLE_SERVICES;
    return activeCategory === "all"
      ? data
      : data.filter((s) => s.category === activeCategory);
  }, [search, searchQuery.data, allServicesQuery.data, activeCategory]);

  const isLoading =
    (search.trim() ? searchQuery.isLoading : allServicesQuery.isLoading) &&
    services.length === 0;

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-card border-b border-border">
        <div className="hero-gradient absolute inset-0 pointer-events-none" />
        <div className="noise-bg absolute inset-0 pointer-events-none" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Marketplace descentralizado
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
              Encuentra el servicio{" "}
              <span className="text-primary">perfecto</span> para tu proyecto
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg">
              Miles de profesionales listos para ayudarte. Diseño, programación,
              marketing y más.
            </p>

            {/* Search */}
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Busca diseñadores, programadores, redactores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 bg-background text-base border-border focus:ring-primary"
                data-ocid="browse.search_input"
              />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>+500 servicios activos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>Pagos seguros</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse */}
      <section className="container mx-auto px-4 py-10">
        {/* Category tabs */}
        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as Category | "all")}
          className="mb-8"
        >
          <TabsList
            className="h-auto flex-wrap gap-1 bg-muted p-1 rounded-xl overflow-x-auto"
            data-ocid="browse.category_tab"
          >
            <TabsTrigger value="all" className="rounded-lg text-sm">
              Todos
            </TabsTrigger>
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="rounded-lg text-sm">
                {categoryLabel(cat)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Grid */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="browse.service_list"
          >
            {SKELETON_KEYS.map((key) => (
              <Skeleton
                key={key}
                className="h-48 rounded-xl"
                data-ocid="browse.loading_state"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="browse.empty_state"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No se encontraron servicios
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {search
                ? `No hay resultados para "${search}". Intenta con otros términos.`
                : "Aún no hay servicios en esta categoría. ¡Sé el primero en publicar!"}
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="browse.service_list"
          >
            {services.map((service, index) => (
              <ServiceCard
                key={service.id.toString()}
                service={service}
                ocid={`browse.service_card.${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
