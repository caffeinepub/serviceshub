import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Lock, MessageCircle, Tag, User } from "lucide-react";
import { useState } from "react";
import { navigate } from "../App";
import CategoryBadge from "../components/CategoryBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useServiceById } from "../hooks/useQueries";

interface ServiceDetailPageProps {
  serviceId: bigint;
}

export default function ServiceDetailPage({
  serviceId,
}: ServiceDetailPageProps) {
  const { data: service, isLoading } = useServiceById(serviceId);
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [contactOpen, setContactOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  function handleHire() {
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
    } else {
      setContactOpen(true);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-8" />
        <Skeleton className="h-40 w-full mb-6" />
        <Skeleton className="h-12 w-40" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Servicio no encontrado
        </h2>
        <p className="text-muted-foreground mb-6">
          Este servicio no existe o fue eliminado.
        </p>
        <Button onClick={() => navigate("/")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al marketplace
      </Button>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-primary/70 to-accent" />
        <div className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <CategoryBadge category={service.category} />
            <div className="text-right">
              <div className="text-3xl font-display font-bold text-accent">
                ${service.price.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">por proyecto</div>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-4 leading-snug">
            {service.title}
          </h1>

          <div className="flex items-center gap-3 mb-8 p-4 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {service.sellerName}
              </div>
              <div className="text-xs text-muted-foreground">
                Proveedor de servicio
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Tag className="w-4 h-4 text-primary" />
              Descripción del servicio
            </div>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {service.description}
            </p>
          </div>

          <Button
            size="lg"
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base"
            onClick={handleHire}
          >
            <MessageCircle className="w-5 h-5" />
            Contratar servicio
          </Button>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent data-ocid="service_detail.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Contactar con el vendedor
            </DialogTitle>
            <DialogDescription>
              Puedes comunicarte con <strong>{service.sellerName}</strong> para
              coordinar los detalles de tu proyecto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <User className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="font-semibold text-foreground">
                {service.sellerName}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Vendedor registrado en ServicesHub
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              El sistema de mensajería directa estará disponible pronto. Por
              ahora, deja un comentario en el perfil del vendedor.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setContactOpen(false)}
              data-ocid="service_detail.close_button"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Prompt Dialog */}
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Inicia sesión para contratar
            </DialogTitle>
            <DialogDescription>
              Necesitas iniciar sesión para contactar con el vendedor y
              contratar este servicio.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                login();
                setLoginPromptOpen(false);
              }}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="outline"
              onClick={() => setLoginPromptOpen(false)}
              data-ocid="service_detail.cancel_button"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
