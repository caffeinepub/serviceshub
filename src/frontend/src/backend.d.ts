import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Service {
    id: bigint;
    title: string;
    active: boolean;
    createdAt: bigint;
    description: string;
    sellerName: string;
    category: Category;
    sellerId: Principal;
    price: number;
}
export interface UserProfile {
    name: string;
}
export enum Category {
    music = "music",
    other = "other",
    video = "video",
    marketing = "marketing",
    design = "design",
    business = "business",
    writing = "writing",
    programming = "programming"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createService(title: string, description: string, price: number, category: Category, sellerName: string): Promise<bigint>;
    deleteService(serviceId: bigint): Promise<void>;
    editService(serviceId: bigint, title: string, description: string, price: number, category: Category): Promise<void>;
    getAllActiveServices(category: Category | null, sortByPrice: boolean | null): Promise<Array<Service>>;
    getAllCategories(): Promise<Array<Category>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getServiceByCategory(category: Category): Promise<Array<Service>>;
    getServiceById(serviceId: bigint): Promise<Service | null>;
    getServiceCount(): Promise<bigint>;
    getServiceStats(): Promise<{
        total: bigint;
        active: bigint;
        inactive: bigint;
    }>;
    getServicesBySeller(sellerId: Principal): Promise<Array<Service>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchServices(searchText: string): Promise<Array<Service>>;
    toggleServiceActive(serviceId: bigint): Promise<{
        active: boolean;
    }>;
}
