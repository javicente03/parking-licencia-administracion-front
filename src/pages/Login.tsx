import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, X, CheckCircle2, Eye } from 'lucide-react';
import { api } from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Estado Modal Recuperación
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
    const [recoveryLoading, setRecoveryLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.token, res.data.user);
            setEmail('');
            setPassword('');
            navigate('/clients');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setRecoveryLoading(true);
        setRecoveryMessage(null);

        try {
            const res = await api.post('/auth/forgot-password', { email: recoveryEmail });
            setRecoveryMessage(res.data.message);
            setRecoveryEmail('');
        } catch (err: any) {
            setRecoveryMessage('Ocurrió un error al procesar la solicitud.');
        } finally {
            setRecoveryLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-1 bg-sky-500/10 border border-sky-500/20 rounded-xl mb-3">
                        <img src="https://parking-system-m.s3.us-east-1.amazonaws.com/logo.png" alt="Logo" className="w-16 h-16" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100">Mach Parking</h1>
                    <p className="text-slate-400 text-sm mt-1">Gestor de Licencias</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                                placeholder="admin@admin.com"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold uppercase text-slate-400">Contraseña</label>
                            <button
                                type="button"
                                onClick={() => setIsForgotModalOpen(true)}
                                className="text-xs text-sky-400 hover:underline cursor-pointer"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 cursor-pointer"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Autenticando...' : 'Ingresar al Panel'}
                    </button>
                </form>
            </div>

            {/* Modal Solicitud de Recuperación */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                            <h2 className="text-lg font-bold text-slate-100">Recuperar Contraseña</h2>
                            <button onClick={() => setIsForgotModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {recoveryMessage ? (
                            <div className="space-y-4 text-center py-4">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                                <p className="text-sm text-slate-300">{recoveryMessage}</p>
                                <button
                                    onClick={() => {
                                        setIsForgotModalOpen(false);
                                        setRecoveryMessage(null);
                                    }}
                                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 rounded-lg"
                                >
                                    Entendido
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <p className="text-xs text-slate-400">
                                    Ingresa tu dirección de correo registrada y te enviaremos un enlace para restablecer tu contraseña.
                                </p>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        value={recoveryEmail}
                                        onChange={(e) => setRecoveryEmail(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                                        placeholder="admin@ejesoft.cl"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotModalOpen(false)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={recoveryLoading}
                                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-lg disabled:opacity-50"
                                    >
                                        {recoveryLoading ? 'Enviando...' : 'Enviar Enlace'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};