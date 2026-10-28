import React from 'react';
import type { DatabaseStats } from '../types/database';
import { Layers, FileText, Users, Globe2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MetricsOverviewProps {
  stats: DatabaseStats;
  onFilterExternos?: () => void;
  onFilterGestionados?: () => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  stats,
  onFilterExternos,
  onFilterGestionados,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Total Llamados</span>
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
          {stats.totalConcursos}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Convocatorias públicas</div>
      </div>

      <div
        onClick={onFilterGestionados}
        className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs cursor-pointer hover:border-blue-300 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>UruguayConcursa</span>
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-emerald-700">
          {stats.concursosGestionados}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Portal centralizado</div>
      </div>

      <div
        onClick={onFilterExternos}
        className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs cursor-pointer hover:border-purple-300 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
          <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
          <span>Concursos Externos</span>
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-purple-700">
          {stats.concursosExternos}
        </div>
        <div className="text-[11px] text-purple-700 font-medium mt-1">No gestionados por UC</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
          <Globe2 className="w-3.5 h-3.5 text-blue-500" />
          <span>Novedades</span>
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
          {stats.totalNovedades}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Hitos y resoluciones</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Adjuntos Guardados</span>
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
          {stats.totalAdjuntos}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Bases, actas y listas</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>Postulantes Clasificados</span>
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-blue-700">
          {stats.totalPostulantes}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Con puntajes y estado</div>
      </div>
    </div>
  );
};
