import React, { useState } from 'react';
import type { Concurso } from '../types/database';
import { Search, ExternalLink, Calendar, FileText, ChevronRight, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface ConcursosTableProps {
  concursos: Concurso[];
  onSelectConcurso: (concurso: Concurso) => void;
  onAnalyzeConcurso: (concurso: Concurso) => void;
  gestionFilter: 'all' | 'uruguayconcursa' | 'externos';
  setGestionFilter: (filter: 'all' | 'uruguayconcursa' | 'externos') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  organismoFilter: string;
  setOrganismoFilter: (organismo: string) => void;
}

export const ConcursosTable: React.FC<ConcursosTableProps> = ({
  concursos,
  onSelectConcurso,
  onAnalyzeConcurso,
  gestionFilter,
  setGestionFilter,
  searchTerm,
  setSearchTerm,
  organismoFilter,
  setOrganismoFilter,
}) => {
  const [estadoFilter, setEstadoFilter] = useState<string>('all');

  // Filtrado de concursos
  const filtered = concursos.filter((c) => {
    const matchSearch =
      searchTerm === '' ||
      c.numeroLlamado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nombreLlamado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.organismo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchGestion =
      gestionFilter === 'all' ||
      (gestionFilter === 'uruguayconcursa' && c.gestionadoPorUruguayConcursa) ||
      (gestionFilter === 'externos' && c.esExterno);

    const matchEstado = estadoFilter === 'all' || c.estadoConcurso === estadoFilter;

    const matchOrganismo =
      organismoFilter === 'all' || c.organismo.toLowerCase().includes(organismoFilter.toLowerCase());

    return matchSearch && matchGestion && matchEstado && matchOrganismo;
  });

  // Lista única de organismos
  const uniqueOrganismos = Array.from(new Set(concursos.map((c) => c.organismo)));

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const getDaysRemaining = (isoString: string) => {
    try {
      const target = new Date(isoString).getTime();
      const now = new Date().getTime();
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      if (diff < 0) return 'Cerrado';
      if (diff === 0) return 'Cierra hoy';
      return `${diff} días restantes`;
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
      {/* Barra de control y filtrado */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Segmented control para tipo de gestión */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-md text-xs font-medium">
            <button
              onClick={() => setGestionFilter('all')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                gestionFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({concursos.length})
            </button>
            <button
              onClick={() => setGestionFilter('uruguayconcursa')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                gestionFilter === 'uruguayconcursa'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              UruguayConcursa ({concursos.filter((c) => c.gestionadoPorUruguayConcursa).length})
            </button>
            <button
              onClick={() => setGestionFilter('externos')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                gestionFilter === 'externos'
                  ? 'bg-purple-700 text-white shadow-xs font-semibold'
                  : 'text-purple-700 hover:text-purple-900'
              }`}
            >
              No gestionados por UC ({concursos.filter((c) => c.esExterno).length})
            </button>
          </div>

          {/* Buscador en tiempo real */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número (ej. 0084/2026), cargo u organismo..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-blue-600 transition-colors"
            />
          </div>
        </div>

        {/* Filtros secundarios: Organismo y Estado */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium">Organismo:</span>
          <select
            value={organismoFilter}
            onChange={(e) => setOrganismoFilter(e.target.value)}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">Todos los organismos</option>
            {uniqueOrganismos.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>

          <span className="text-slate-300 mx-1">|</span>

          <span className="text-slate-500 font-medium">Estado:</span>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">Todos los estados</option>
            <option value="Inscripciones Abiertas">Inscripciones Abiertas</option>
            <option value="En Evaluación">En Evaluación</option>
            <option value="Finalizado">Finalizado</option>
          </select>

          <span className="ml-auto text-slate-400 text-[11px] font-mono tabular-nums">
            Mostrando {filtered.length} de {concursos.length} registros
          </span>
        </div>
      </div>

      {/* Tabla de Concursos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-4 whitespace-nowrap">Nº Llamado</th>
              <th className="py-2.5 px-4">Nombre del Llamado y Organismo</th>
              <th className="py-2.5 px-4 whitespace-nowrap">Régimen de Gestión</th>
              <th className="py-2.5 px-4 whitespace-nowrap">Fecha de Cierre</th>
              <th className="py-2.5 px-4 text-center whitespace-nowrap">Novedades & Docs</th>
              <th className="py-2.5 px-4 text-right whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No se encontraron concursos que coincidan con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filtered.map((concurso) => {
                const isExterno = concurso.esExterno;
                const daysRemaining = getDaysRemaining(concurso.fechaCierre);

                return (
                  <tr
                    key={concurso.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectConcurso(concurso)}
                  >
                    {/* Número de llamado */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {concurso.numeroLlamado}
                    </td>

                    {/* Nombre y organismo */}
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {concurso.nombreLlamado}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="font-medium text-slate-700">{concurso.organismo}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>{concurso.departamento}</span>
                      </div>
                    </td>

                    {/* Régimen de gestión con anotación estricta de concurso externo */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isExterno ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded text-purple-900 font-semibold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span>Concurso no gestionado por UruguayConcursa</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Gestionado por UruguayConcursa</span>
                        </div>
                      )}
                    </td>

                    {/* Fecha de cierre */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono tabular-nums text-slate-900 font-medium">
                        {formatDate(concurso.fechaCierre)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{daysRemaining}</span>
                      </div>
                    </td>

                    {/* Novedades y adjuntos */}
                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono tabular-nums">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {concurso.novedades?.length || 0}
                        </span>
                        <span className="text-slate-400">nov /</span>
                        <span className="font-semibold text-blue-700">
                          {concurso.adjuntos?.length || 0}
                        </span>
                        <span className="text-slate-400">adj</span>
                        {(concurso.adjuntos || []).some((a) => a.estadoVersion === 'historica_anterior' || a.estadoVersion === 'rectificada') && (
                          <span
                            title="Posee historial de versiones anteriores o rectificadas"
                            className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-sans font-semibold"
                          >
                            Rev.
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Botones de acción directa */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onAnalyzeConcurso(concurso)}
                          title="Analizar bases y actas con Gemini"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          <span>Analizar Docs</span>
                        </button>
                        <button
                          onClick={() => onSelectConcurso(concurso)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          <span>Ficha</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
