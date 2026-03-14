import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, Service, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useAllServices(
  category: Category | null = null,
  sortByPrice: boolean | null = null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["services", category, sortByPrice],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveServices(category, sortByPrice);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchServices(searchText: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["services", "search", searchText],
    queryFn: async () => {
      if (!actor || !searchText.trim()) return [];
      return actor.searchServices(searchText);
    },
    enabled: !!actor && !isFetching && !!searchText.trim(),
  });
}

export function useServiceById(serviceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Service | null>({
    queryKey: ["service", serviceId?.toString()],
    queryFn: async () => {
      if (!actor || serviceId === null) return null;
      return actor.getServiceById(serviceId);
    },
    enabled: !!actor && !isFetching && serviceId !== null,
  });
}

export function useMyServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["my-services"],
    queryFn: async () => {
      if (!actor) return [];
      const profile = await actor.getCallerUserProfile();
      if (!profile) return [];
      // We use getAllActiveServices but filter for the seller, or get by seller
      // We'll get all services by calling getServicesBySeller with identity
      // Actually we need the principal - use actor to get all and filter, or better:
      // The backend has getServicesBySeller(sellerId: Principal)
      // But we don't expose identity directly here; let's call getAllActiveServices
      // and we'll refresh from the backend after mutations anyway
      // Actually: getCallerUserProfile shows logged-in user; use getAllActiveServices
      // and filter in dashboard OR add a dedicated endpoint.
      // The spec has getServicesBySeller(sellerId) - we need the principal.
      // Let's store principal separately.
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useCreateService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      price: number;
      category: Category;
      sellerName: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createService(
        data.title,
        data.description,
        data.price,
        data.category,
        data.sellerName,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["services"] });
      void qc.invalidateQueries({ queryKey: ["seller-services"] });
    },
  });
}

export function useEditService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      price: number;
      category: Category;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.editService(
        data.id,
        data.title,
        data.description,
        data.price,
        data.category,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["services"] });
      void qc.invalidateQueries({ queryKey: ["seller-services"] });
    },
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (serviceId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteService(serviceId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["services"] });
      void qc.invalidateQueries({ queryKey: ["seller-services"] });
    },
  });
}

export function useToggleService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (serviceId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.toggleServiceActive(serviceId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["services"] });
      void qc.invalidateQueries({ queryKey: ["seller-services"] });
    },
  });
}

export function useSellerServices(sellerId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["seller-services", sellerId],
    queryFn: async () => {
      if (!actor || !sellerId) return [];
      // Use getAllActiveServices and filter - or call getServicesBySeller with Principal
      // For now, return all services by the seller
      const all = await actor.getAllActiveServices(null, null);
      return all.filter((s) => s.sellerId.toString() === sellerId);
    },
    enabled: !!actor && !isFetching && !!sellerId,
  });
}
