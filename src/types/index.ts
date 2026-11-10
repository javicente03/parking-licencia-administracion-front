export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'OPERATOR';
}

export interface Client {
    id: string;
    name: string;
    taxId?: string;
    contactEmail: string;
    contactPhone?: string;
    address?: string;
    isActive: boolean;
    createdAt: string;
    _count?: {
        licenses: number;
    };
}

export interface CashBox {
    code: string;
    description: string;
}

export interface License {
    id: string;
    clientId: string;
    client?: Client;
    hwid: string;
    plan: string;
    features: string[];
    cashBoxes: CashBox[];
    cashBoxesCount: number;
    expiresAt: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';
    signedToken: string;
    createdAt: string;
}

export interface GenerateLicensePayload {
    clientId: string;
    hwid: string;
    planName: string;
    features: string[];
    cashBoxes: CashBox[];
    expiresAt: string;
    superAdminMail?: string;
    superAdminPassword?: string;
}

export interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}