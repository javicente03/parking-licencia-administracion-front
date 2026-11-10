import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Building, Mail, Phone, MapPin, Key, Search, Pencil, Power, X } from 'lucide-react';
import { api } from '@/api/axios';
import { Client, PaginatedResponse } from '@/types';
import { LicenseGenerateModal } from './LicenseGenerateModal';
import { Paginator } from '@/components/ui/Paginator';
import { v4 as uuidv4 } from 'uuid';

export const Clients: React.FC = () => {
    const queryClient = useQueryClient();
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    /* Estados de paginacion y busqueda */
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    /* Formulario cliente */
    const [name, setName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');

    /* Peticion GET clientes */
    const { data: response, isLoading } = useQuery<PaginatedResponse<Client>>({
        queryKey: ['clients', page, limit, search],
        queryFn: async () => {
            const res = await api.get('/clients', {
                params: { page, limit, search },
            });
            return res.data;
        },
    });

    const clients = response?.data || [];
    const meta = response?.meta || { totalItems: 0, currentPage: 1, totalPages: 1, limit: 10 };

    /* Mutation POST crear cliente */
    const createClientMutation = useMutation({
        mutationFn: async (newClient: Partial<Client>) => {
            const idempotencyKey = uuidv4();
            const res = await api.post('/clients', newClient, {
                headers: { 'Idempotency-Key': idempotencyKey },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            closeClientModal();
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Error al registrar cliente');
        },
    });

    /* Mutation PUT actualizar cliente */
    const updateClientMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
            const res = await api.put(`/clients/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            closeClientModal();
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Error al actualizar cliente');
        },
    });

    /* Mutation PATCH cambiar estado activo/inactivo */
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            // Enviamos explícitamente el nuevo estado deseado
            const res = await api.patch(`/clients/${id}/status`, { isActive });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });

    const openCreateModal = () => {
        setEditingClient(null);
        setName('');
        setTaxId('');
        setContactEmail('');
        setContactPhone('');
        setAddress('');
        setIsClientModalOpen(true);
    };

    const openEditModal = (client: Client) => {
        setEditingClient(client);
        setName(client.name);
        setTaxId(client.taxId || '');
        setContactEmail(client.contactEmail);
        setContactPhone(client.contactPhone || '');
        setAddress(client.address || '');
        setIsClientModalOpen(true);
    };

    const closeClientModal = () => {
        setIsClientModalOpen(false);
        setEditingClient(null);
        setName('');
        setTaxId('');
        setContactEmail('');
        setContactPhone('');
        setAddress('');
    };

    const handleSubmitClient = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name,
            taxId: taxId || undefined,
            contactEmail,
            contactPhone: contactPhone || undefined,
            address: address || undefined,
        };

        if (editingClient) {
            updateClientMutation.mutate({ id: editingClient.id, data: payload });
        } else {
            createClientMutation.mutate(payload);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        <Users className="w-7 h-7 text-sky-400" /> Directorio de Clientes
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Administra los clientes y genera licencias vinculadas</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Busqueda */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                        />
                    </div>

                    <button
                        onClick={() => setIsLicenseModalOpen(true)}
                        className="px-4 py-2.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 font-medium rounded-lg text-sm flex items-center gap-2 transition-colors shrink-0"
                    >
                        <Key className="w-4 h-4" /> Emitir Licencia
                    </button>

                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg text-sm flex items-center gap-2 transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* Grid de Clientes */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Cargando clientes...</div>
            ) : clients.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400">
                    No se encontraron clientes coincidentes.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.map((client) => (
                        <div
                            key={client.id}
                            className={`bg-slate-900 border rounded-xl p-5 space-y-4 transition-colors ${client.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-rose-950/50 opacity-60'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-slate-100">{client.name}</h3>
                                        {!client.isActive && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                Inactivo
                                            </span>
                                        )}
                                    </div>
                                    {client.taxId && <p className="text-xs font-mono text-slate-400 mt-0.5">RUT/NIT: {client.taxId}</p>}
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(client)}
                                        className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                                        title="Editar Cliente"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (confirm(`¿Deseas ${client.isActive ? 'desactivar' : 'activar'} este cliente?`)) {
                                                toggleStatusMutation.mutate({ id: client.id, isActive: !client.isActive });
                                            }
                                        }}
                                        className={`p-1.5 rounded-lg transition-colors ${client.isActive
                                            ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                                            : 'text-rose-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                            }`}
                                        title={client.isActive ? 'Desactivar Cliente' : 'Activar Cliente'}
                                    >
                                        <Power className={`w-4 h-4 ${client.isActive ? 'text-green-400' : 'text-red-400'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-500" /> {client.contactEmail}
                                </div>
                                {client.contactPhone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-500" /> {client.contactPhone}
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-500" /> {client.address}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-800/40 text-xs">
                                <span className="text-slate-500">Licencias asociadas</span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                    {client._count?.licenses || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paginador Universal */}
            {!isLoading && clients.length > 0 && (
                <Paginator
                    meta={meta}
                    onPageChange={(newPage) => setPage(newPage)}
                    onLimitChange={(newLimit) => {
                        setLimit(newLimit);
                        setPage(1);
                    }}
                />
            )}

            {/* Modal Crear / Editar Cliente */}
            {isClientModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                <Building className="w-5 h-5 text-sky-400" />
                                {editingClient ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                            </h2>
                            <button onClick={closeClientModal} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitClient} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre o Razon Social *</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                                    placeholder="Ej: Estacionamientos del Norte SpA"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Identificacion Fiscal (RUT / RIF / NIT)</label>
                                <input
                                    type="text"
                                    value={taxId}
                                    onChange={(e) => setTaxId(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                                    placeholder="76.123.456-7"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Correo Electronico de Contacto *</label>
                                <input
                                    required
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                                    placeholder="contacto@estacionamiento.cl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Telefono</label>
                                    <input
                                        type="text"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                                        placeholder="+56 9 1234 5678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Direccion</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                                        placeholder="Av. Principal #123"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeClientModal}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createClientMutation.isPending || updateClientMutation.isPending}
                                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm rounded-lg disabled:opacity-50"
                                >
                                    {createClientMutation.isPending || updateClientMutation.isPending
                                        ? 'Guardando...'
                                        : editingClient
                                            ? 'Actualizar Cliente'
                                            : 'Crear Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Generar Licencia */}
            <LicenseGenerateModal
                clients={clients}
                isOpen={isLicenseModalOpen}
                onClose={() => setIsLicenseModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['clients'] });
                }}
            />
        </div>
    );
};