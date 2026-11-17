import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/api/axios';

export const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: 'Las contraseñas no coinciden.' });
            return;
        }

        if (!token) {
            setStatus({ type: 'error', message: 'Token de recuperación no encontrado.' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const res = await api.post('/auth/reset-password', {
                token,
                newPassword,
            });
            setStatus({ type: 'success', message: res.data.message });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setStatus({
                type: 'error',
                message: err.response?.data?.error || 'Error al restablecer la contraseña.',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-100">Enlace Inválido</h2>
                    <p className="text-slate-400 text-sm mt-2 mb-6">El enlace de recuperación no contiene un token válido.</p>
                    <Link to="/login" className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium">
                        Volver al Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-1 bg-sky-500/10 border border-sky-500/20 rounded-xl mb-3">
                        <img src="/logo.png" alt="Logo" className="w-16 h-16" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100">Nueva Contraseña</h1>
                    <p className="text-slate-400 text-sm mt-1">Ingresa tu nueva contraseña de acceso</p>
                </div>

                {status && (
                    <div
                        className={`mb-6 p-3 border text-sm rounded-lg flex items-center gap-2 ${status.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}
                    >
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Nueva Contraseña</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Confirmar Contraseña</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};