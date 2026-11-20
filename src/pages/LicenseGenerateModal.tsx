import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Key, Download } from 'lucide-react';
import { api } from '@/api/axios';
import { Client, CashBox, PaginatedResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    clients?: Client[];
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const FEATURE_OPTIONS = [
    { id: 'installations', label: 'Gestión de Instalaciones' },
    { id: 'zones', label: 'Gestión de Zonas' },
    { id: 'charge_per_minute', label: 'Cobro por Minuto' },
    { id: 'subscribers', label: 'Abonados' },
    { id: 'discounts', label: 'Descuentos' },
    { id: 'cashbox', label: 'Cajas de Efectivo' },
    { id: 'devices', label: 'Gestión de Servidores' },
];

export const LicenseGenerateModal: React.FC<Props> = ({
    clients: initialClients,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const queryClient = useQueryClient();

    const [clientId, setClientId] = useState('');
    const [hwid, setHwid] = useState('');
    const [planName, setPlanName] = useState('Plan Estándar 2026');
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [cashBoxes, setCashBoxes] = useState<CashBox[]>([
        { code: 'CASHBOX1', description: 'Caja Principal' },
    ]);
    const [expiresAt, setExpiresAt] = useState('2026-12-31');
    const [superAdminMail, setSuperAdminMail] = useState('');
    const [superAdminPassword, setSuperAdminPassword] = useState('');

    const [miniPcMail, setMiniPcMail] = useState('');
    const [miniPcPassword, setMiniPcPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);

    /* Carga autonoma de clientes si no fueron pasados por props */
    const { data: clientsResponse } = useQuery<PaginatedResponse<Client>>({
        queryKey: ['clients-modal-list'],
        queryFn: async () => {
            const res = await api.get('/clients', { params: { limit: 100 } });
            return res.data;
        },
        enabled: isOpen && (!initialClients || initialClients.length === 0),
    });

    const availableClients = initialClients && initialClients.length > 0
        ? initialClients
        : clientsResponse?.data || [];

    if (!isOpen) return null;

    const handleToggleFeature = (id: string) => {
        setSelectedFeatures((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
    };

    const handleAddCashBox = () => {
        const nextIndex = cashBoxes.length + 1;
        setCashBoxes([...cashBoxes, { code: `CASHBOX${nextIndex}`, description: `Caja ${nextIndex}` }]);
    };

    const handleRemoveCashBox = (index: number) => {
        setCashBoxes(cashBoxes.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const idempotencyKey = uuidv4();

        try {
            const res = await api.post(
                '/licenses/generate',
                {
                    clientId,
                    hwid,
                    planName,
                    features: selectedFeatures,
                    cashBoxes,
                    expiresAt,
                    superAdminMail,
                    superAdminPassword,
                    miniPcMail,
                    miniPcPassword,
                },
                {
                    headers: {
                        'Idempotency-Key': idempotencyKey,
                    },
                }
            );

            setGeneratedToken(res.data.token);
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            onSuccess();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al generar la licencia');
        } finally {
            setLoading(false);
        }
    };

    const downloadKeyFile = (token: string) => {
        const element = document.createElement('a');
        const file = new Blob([token], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'license.key';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const resetModalState = () => {
        setGeneratedToken(null);
        setClientId('');
        setHwid('');
        setPlanName('Plan Estándar 2026');
        setSelectedFeatures([]);
        setCashBoxes([{ code: 'CASHBOX1', description: 'Caja Principal' }]);
        setSuperAdminMail('');
        setSuperAdminPassword('');
        setMiniPcMail('');
        setMiniPcPassword('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-xl p-6 shadow-2xl my-8 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-sky-400">
                        <Key className="w-5 h-5" /> Nueva Licencia On-Premise
                    </h2>
                    <button onClick={resetModalState} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {generatedToken ? (
                    <div className="space-y-6 text-center py-4">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">
                            ¡Licencia RSA-2048 Firmada y Generada con Éxito!
                        </div>

                        <button
                            onClick={() => downloadKeyFile(generatedToken)}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                        >
                            <Download className="w-5 h-5" /> Descargar Archivo license.key
                        </button>

                        <button
                            onClick={resetModalState}
                            className="text-slate-400 text-sm hover:underline"
                        >
                            Cerrar Ventana
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Cliente *</label>
                                <select
                                    required
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                                >
                                    <option value="">Selecciona un cliente</option>
                                    {availableClients.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Hardware ID (HWID) *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej: F47AC10B58CC4372A5670E02B2C3D479"
                                    value={hwid}
                                    onChange={(e) => setHwid(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500 font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre Comercial del Plan</label>
                                <input
                                    type="text"
                                    value={planName}
                                    onChange={(e) => setPlanName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha Expiración *</label>
                                <input
                                    required
                                    type="date"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                                />
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Características Autorizadas (Features)</label>
                            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-40 overflow-y-auto">
                                {FEATURE_OPTIONS.map((feat) => (
                                    <label key={feat.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedFeatures.includes(feat.id)}
                                            onChange={() => handleToggleFeature(feat.id)}
                                            className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                                        />
                                        {feat.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Configuración Cajas */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-semibold text-slate-400">Cajas de Efectivo Permitidas ({cashBoxes.length})</label>
                                <button
                                    type="button"
                                    onClick={handleAddCashBox}
                                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Añadir Caja
                                </button>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {cashBoxes.map((box, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="Código"
                                            value={box.code}
                                            onChange={(e) => {
                                                const updated = [...cashBoxes];
                                                updated[idx].code = e.target.value;
                                                setCashBoxes(updated);
                                            }}
                                            className="w-1/3 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Descripción"
                                            value={box.description}
                                            onChange={(e) => {
                                                const updated = [...cashBoxes];
                                                updated[idx].description = e.target.value;
                                                setCashBoxes(updated);
                                            }}
                                            className="w-2/3 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100"
                                        />
                                        {cashBoxes.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveCashBox(idx)} className="text-rose-500 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Credenciales SuperAdmin Opcionales */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Email SuperAdmin Local</label>
                                <input
                                    type="email"
                                    value={superAdminMail}
                                    onChange={(e) => setSuperAdminMail(e.target.value)}
                                    placeholder="admin@local.internal"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Password SuperAdmin Local</label>
                                <input
                                    type="password"
                                    value={superAdminPassword}
                                    onChange={(e) => setSuperAdminPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                                />
                            </div>
                        </div>

                        {/* Credenciales MiniPC Opcionales */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Email MiniPC Local</label>
                                <input
                                    type="email"
                                    value={miniPcMail}
                                    onChange={(e) => setMiniPcMail(e.target.value)}
                                    placeholder="mini@local.internal"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Password MiniPC Local</label>
                                <input
                                    type="password"
                                    value={miniPcPassword}
                                    onChange={(e) => setMiniPcPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetModalState}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm rounded-lg disabled:opacity-50"
                            >
                                {loading ? 'Firmando Licencia...' : 'Generar Licencia RSA'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};