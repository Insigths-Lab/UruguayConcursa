import React from 'react';
import { Database, Globe, FileSearch, Download, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'llamados' | 'database' | 'analyzer' | 'export';
  setActiveTab: (tab: 'llamados' | 'database' | 'analyzer' | 'export') => void;
  onOpenCrawler: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenCrawler }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <span className="font-bold text-lg tracking-tight text-slate-900">
              UruguayConcursa Data
            </span>
            <span className="text-xs font-mono text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Consolidación & Doc Analyzer</span>
          </div>

          {/* Zone 2: 4 single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('llamados')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                activeTab === 'llamados'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Llamados y Novedades
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                activeTab === 'database'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Capa de Datos Relacional
            </button>
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                activeTab === 'analyzer'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Extracción IA (Bases y Actas)
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                activeTab === 'export'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Consola SQL & Exportación
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenCrawler}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Conectar Llamado Web</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
