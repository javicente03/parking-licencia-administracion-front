import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Key, Download, Ban, Search, ShieldAlert, CheckCircle2, Plus } from 'lucide-react';
import { api } from '@/api/axios';
import { License, PaginatedResponse } from '@/types';
import { Paginator } from '@/components/ui/Paginator';
import { LicenseGenerateModal } from '@/pages/LicenseGenerateModal';
import { formatDate } from '@/helpers/date';

export const Licenses: React.FC = () => {
    const queryClient = useQueryClient();

    /* Estados de paginación, límite y búsqueda */
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    /* Petición GET licencias paginadas */
    const { data: response, isLoading } = useQuery<PaginatedResponse<License>>({
        queryKey: ['licenses', page, limit, search],
        queryFn: async () => {
            const res = await api.get('/licenses', {
                params: { page, limit, search },
            });
            return res.data;
        },
    });

    const licenses = response?.data || [];
    const meta = response?.meta || { totalItems: 0, currentPage: 1, totalPages: 1, limit: 10 };

    /* Mutación para revocar licencia */
    const revokeMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await api.patch(`/licenses/${id}/revoke`);
            return res.data;
        },
        onSuccess: () => {
            /* Invalida tanto la cache de licencias como la de clientes */
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Error al revocar la licencia.');
        },
    });

    const downloadKeyFile = (token: string, clientName: string) => {
        const element = document.createElement('a');
        const file = new Blob([token], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `license-${clientName.toLowerCase().replace(/\s+/g, '-')}.key`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        <Key className="w-7 h-7 text-sky-400" /> Registro de Licencias Emitidas
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Control de licencias con firma asimétrica RSA-2048</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Campo de busqueda */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar cliente, plan o HWID..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                        />
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg text-xs flex items-center gap-2 transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Nueva Licencia
                    </button>
                </div>
            </div>

            {/* Tabla de Licencias */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Cargando licencias...</div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold bg-slate-950/50">
                                <th className="py-3.5 px-4">Cliente</th>
                                <th className="py-3.5 px-4">Hardware ID (HWID)</th>
                                <th className="py-3.5 px-4">Plan / Cajas</th>
                                <th className="py-3.5 px-4">Expiración</th>
                                <th className="py-3.5 px-4">Estado</th>
                                <th className="py-3.5 px-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-sm">
                            {licenses.map((lic) => (
                                <tr key={lic.id} className="hover:bg-slate-800/30">
                                    <td className="py-3.5 px-4 font-medium text-slate-200">
                                        {lic.client?.name || 'N/A'}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-xs text-sky-400">
                                        {lic.hwid}
                                    </td>
                                    <td className="py-3.5 px-4 text-xs text-slate-300">
                                        <div>{lic.plan}</div>
                                        <div className="text-slate-500">{lic.cashBoxesCount} caja(s)</div>
                                    </td>
                                    <td className="py-3.5 px-4 text-xs text-slate-400">
                                        {formatDate(lic.expiresAt, 'DD/MM/YYYY')}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {lic.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <CheckCircle2 className="w-3 h-3" /> Activa
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                <ShieldAlert className="w-3 h-3" /> Revocada
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4 text-right space-x-2">
                                        <button
                                            onClick={() => downloadKeyFile(lic.signedToken, lic.client?.name || 'licencia')}
                                            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded transition-colors"
                                            title="Descargar license.key"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        {lic.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('¿Deseas revocar esta licencia?')) {
                                                        revokeMutation.mutate(lic.id);
                                                    }
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                                title="Revocar Licencia"
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {licenses.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                                        No se encontraron licencias emitidas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Componente Paginator */}
            {!isLoading && licenses.length > 0 && (
                <Paginator
                    meta={meta}
                    onPageChange={(newPage) => setPage(newPage)}
                    onLimitChange={(newLimit) => {
                        setLimit(newLimit);
                        setPage(1);
                    }}
                />
            )}

            {/* Modal Emision de Licencia */}
            <LicenseGenerateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['licenses'] });
                    queryClient.invalidateQueries({ queryKey: ['clients'] });
                }}
            />
        </div>
    );
};