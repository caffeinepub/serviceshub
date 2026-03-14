import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import { Category } from "../backend.d";
import { categoryLabel } from "../components/CategoryBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateService,
  useEditService,
  useServiceById,
  useUserProfile,
} from "../hooks/useQueries";

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

interface ServiceFormPageProps {
  mode: "create" | "edit";
  serviceId?: bigint;
}

export default function ServiceFormPage({
  mode,
  serviceId,
}: ServiceFormPageProps) {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile } = useUserProfile();
  const { data: existingService, isLoading: isLoadingService } = useServiceById(
    mode === "edit" ? (serviceId ?? null) : null,
  );

  const createMutation = useCreateService();
  const editMutation = useEditService();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category | "">("" as Category | "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && existingService) {
      setTitle(existingService.title);
      setDescription(existingService.description);
      setPrice(existingService.price.toString());
      setCategory(existingService.category);
    }
  }, [mode, existingService]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Acceso requerido
        </h2>
        <p className="text-muted-foreground mb-6">
          Inicia sesión para publicar un servicio.
        </p>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          onClick={() => login()}
        >
          <LogIn className="w-4 h-4" />
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  if (mode === "edit" && isLoadingService) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "El título es obligatorio";
    if (!description.trim())
      newErrors.description = "La descripción es obligatoria";
    const priceNum = Number.parseFloat(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0)
      newErrors.price = "Ingresa un precio válido";
    if (!category) newErrors.category = "Selecciona una categoría";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const sellerName =
      profile?.name ??
      identity?.getPrincipal().toString().slice(0, 8) ??
      "Vendedor";
    const priceNum = Number.parseFloat(price);

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          title: title.trim(),
          description: description.trim(),
          price: priceNum,
          category: category as Category,
          sellerName,
        });
        toast.success("¡Servicio publicado exitosamente!");
        navigate("dashboard");
      } else if (mode === "edit" && serviceId !== undefined) {
        await editMutation.mutateAsync({
          id: serviceId,
          title: title.trim(),
          description: description.trim(),
          price: priceNum,
          category: category as Category,
        });
        toast.success("Servicio actualizado");
        navigate("dashboard");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar el servicio",
      );
    }
  }

  const isPending = createMutation.isPending || editMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <Button
        variant="ghost"
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("dashboard")}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al panel
      </Button>

      <div className="bg-card rounded-2xl border border-border p-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          {mode === "create" ? "Publicar servicio" : "Editar servicio"}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          {mode === "create"
            ? "Completa los detalles de tu servicio para publicarlo en el marketplace."
            : "Actualiza la información de tu servicio."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">
              Título del servicio
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Diseño de logo profesional"
              className={errors.title ? "border-destructive" : ""}
              data-ocid="service_form.title_input"
            />
            {errors.title && (
              <p
                className="text-destructive text-xs"
                data-ocid="service_form.error_state"
              >
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe detalladamente tu servicio, qué incluye, tiempos de entrega..."
              rows={4}
              className={errors.description ? "border-destructive" : ""}
              data-ocid="service_form.description_textarea"
            />
            {errors.description && (
              <p className="text-destructive text-xs">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="font-medium">
                Precio (USD)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className={`pl-7 ${errors.price ? "border-destructive" : ""}`}
                  data-ocid="service_form.price_input"
                />
              </div>
              {errors.price && (
                <p className="text-destructive text-xs">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Categoría</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as Category)}
              >
                <SelectTrigger
                  className={errors.category ? "border-destructive" : ""}
                  data-ocid="service_form.category_select"
                >
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-destructive text-xs">{errors.category}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isPending}
              data-ocid="service_form.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : mode === "create" ? (
                "Publicar servicio"
              ) : (
                "Guardar cambios"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("dashboard")}
              data-ocid="service_form.cancel_button"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
