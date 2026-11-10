import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Users, Key, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const DashboardLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Clientes', href: '/clients', icon: Users },
        { name: 'Licencias', href: '/licenses', icon: Key },
    ];

    return (
        <div className="min-h-screen flex bg-slate-950 text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
                    <ShieldCheck className="w-8 h-8 text-sky-400" />
                    <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                        PARKING AUTH
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="truncate">
                        <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};