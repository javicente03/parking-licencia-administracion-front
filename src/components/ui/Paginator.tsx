import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationMeta } from '@/types';

interface PaginatorProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    limitOptions?: number[];
}

export const Paginator: React.FC<PaginatorProps> = ({
    meta,
    onPageChange,
    onLimitChange,
    limitOptions = [1, 5, 10, 25, 50],
}) => {
    const { currentPage, totalPages, totalItems, limit } = meta;

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);

    /* Generar rango dinamico de botones de paginas */
    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
            {/* Informacion de registros actuales */}
            <div className="flex items-center gap-4">
                <span>
                    Mostrando <strong className="text-slate-200">{startItem}</strong> a{' '}
                    <strong className="text-slate-200">{endItem}</strong> de{' '}
                    <strong className="text-slate-200">{totalItems}</strong> registros
                </span>

                {/* Selector de limite por pagina */}
                {onLimitChange && (
                    <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                        <span>Mostrar</span>
                        <select
                            value={limit}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-800 cursor-pointer rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
                        >
                            {limitOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Botones de navegacion */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Primera Pagina"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Pagina Anterior"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-1">
                    {getPageNumbers().map((page, index) =>
                        typeof page === 'number' ? (
                            <button
                                key={index}
                                onClick={() => onPageChange(page)}
                                className={`min-w-[2rem] h-8 px-2 rounded-lg font-medium transition-colors ${currentPage === page
                                    ? 'bg-sky-600 text-white border border-sky-500'
                                    : 'bg-slate-950 text-slate-400 border border-slate-800 cursor-pointer hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                            >
                                {page}
                            </button>
                        ) : (
                            <span key={index} className="px-1 text-slate-600 font-bold">
                                {page}
                            </span>
                        )
                    )}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Pagina Siguiente"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Ultima Pagina"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};