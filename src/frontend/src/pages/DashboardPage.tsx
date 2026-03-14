import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  LayoutDashboard,
  LogIn,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import type { Service } from "../backend.d";
import CategoryBadge from "../components/CategoryBadge";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteService,
  useToggleService,
  useUserProfile,
} from "../hooks/useQueries";

export default function DashboardPage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { actor, isFetching } = useActor();
  const { data: profile } = useUserProfile();
  const qc = useQueryClient();

  const sellerServicesQuery = useQuery<Service[]>({
    queryKey: ["seller-services", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getServicesBySeller(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  const deleteMutation = useDeleteService();
  const toggleMutation = useToggleService();
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Panel de vendedor
        </h2>
        <p className="text-muted-foreground mb-6">
          Inicia sesión para gestionar tus servicios.
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

  const services = sellerServicesQuery.data ?? [];
  const isLoading = sellerServicesQuery.isLoading && services.length === 0;

  async function handleToggle(serviceId: bigint, currentActive: boolean) {
    try {
      await toggleMutation.mutateAsync(serviceId);
      await qc.invalidateQueries({ queryKey: ["seller-services"] });
      toast.success(
        currentActive ? "Servicio desactivado" : "Servicio activado",
      );
    } catch {
      toast.error("Error al cambiar el estado del servicio");
    }
  }

  async function handleDelete(serviceId: bigint) {
    try {
      await deleteMutation.mutateAsync(serviceId);
      await qc.invalidateQueries({ queryKey: ["seller-services"] });
      toast.success("Servicio eliminado");
      setDeleteTarget(null);
    } catch {
      toast.error("Error al eliminar el servicio");
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Mi Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile?.name ? (
              <>
                Bienvenido, <strong>{profile.name}</strong>
              </>
            ) : (
              <>Gestiona y publica tus servicios profesionales</>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {!profile?.name && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("profile")}
            >
              Configurar perfil
            </Button>
          )}
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            onClick={() => navigate("create")}
            data-ocid="dashboard.create_button"
          >
            <Plus className="w-4 h-4" />
            Publicar servicio
          </Button>
        </div>
      </div>

      {/* Services list */}
      {isLoading ? (
        <div className="space-y-4" data-ocid="dashboard.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div
          className="text-center py-20 bg-card rounded-2xl border border-border"
          data-ocid="dashboard.service_list"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            Aún no tienes servicios
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Publica tu primer servicio y empieza a recibir clientes.
          </p>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            onClick={() => navigate("create")}
          >
            <Plus className="w-4 h-4" />
            Crear mi primer servicio
          </Button>
        </div>
      ) : (
        <div className="space-y-4" data-ocid="dashboard.service_list">
          {services.map((service, index) => (
            <div
              key={service.id.toString()}
              className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              data-ocid={`dashboard.service_card.${index + 1}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CategoryBadge category={service.category} />
                  <span className="text-sm font-semibold text-accent">
                    ${service.price.toFixed(2)}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-foreground truncate">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {service.active ? (
                      <Eye className="w-3.5 h-3.5 inline mr-1 text-primary" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 inline mr-1" />
                    )}
                    {service.active ? "Activo" : "Inactivo"}
                  </span>
                  <Switch
                    checked={service.active}
                    onCheckedChange={() =>
                      handleToggle(service.id, service.active)
                    }
                    disabled={toggleMutation.isPending}
                    data-ocid={`dashboard.toggle.${index + 1}`}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => navigate(`service/${service.id}/edit`)}
                  data-ocid={`dashboard.edit_button.${index + 1}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => setDeleteTarget(service.id)}
                  data-ocid={`dashboard.delete_button.${index + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Eliminar</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              ¿Eliminar este servicio?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El servicio será eliminado
              permanentemente del marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTarget(null)}
              data-ocid="dashboard.cancel_button"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTarget !== null && handleDelete(deleteTarget)
              }
              data-ocid="dashboard.confirm_button"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
