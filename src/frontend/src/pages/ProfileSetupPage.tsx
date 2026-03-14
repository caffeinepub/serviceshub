import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile, useUserProfile } from "../hooks/useQueries";

export default function ProfileSetupPage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile } = useUserProfile();
  const saveMutation = useSaveProfile();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Perfil
        </h2>
        <p className="text-muted-foreground mb-6">
          Inicia sesión para configurar tu perfil.
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setError("");
    try {
      await saveMutation.mutateAsync({ name: name.trim() });
      toast.success("Perfil guardado correctamente");
      navigate("dashboard");
    } catch {
      toast.error("Error al guardar el perfil");
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <Button
        variant="ghost"
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("dashboard")}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Button>

      <div className="bg-card rounded-2xl border border-border p-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <User className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Tu perfil público
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Este nombre aparecerá en todos tus servicios publicados.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="font-medium">
              Nombre para mostrar
            </Label>
            <Input
              id="displayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ana García"
              className={error ? "border-destructive" : ""}
              data-ocid="profile_form.input"
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={saveMutation.isPending}
            data-ocid="profile_form.submit_button"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar perfil"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
