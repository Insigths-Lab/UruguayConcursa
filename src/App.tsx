import React, { useState, useEffect } from 'react';
import type { Concurso, DatabaseStats, Adjunto } from './types/database';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { ConcursosTable } from './components/ConcursosTable';
import { ConcursoDetailModal } from './components/ConcursoDetailModal';
import { CrawlerModal } from './components/CrawlerModal';
import { DocumentProcessorModal } from './components/DocumentProcessorModal';
import { DatabaseConsole } from './components/DatabaseConsole';
import { Sparkles, Globe, Database, Download, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'llamados' | 'database' | 'analyzer' | 'export'>('llamados');
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [stats, setStats] = useState<DatabaseStats>({
    totalConcursos: 0,
    concursosGestionados: 0,
    concursosExternos: 0,
    totalNovedades: 0,
    totalAdjuntos: 0,
    totalPostulantes: 0,
    concursosConCriterios: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gestionFilter, setGestionFilter] = useState<'all' | 'uruguayconcursa' | 'externos'>('all');
  const [organismoFilter, setOrganismoFilter] = useState('all');

  // Modales
  const [selectedConcurso, setSelectedConcurso] = useState<Concurso | null>(null);
  const [isCrawlerOpen, setIsCrawlerOpen] = useState(false);
  const [isDocProcessorOpen, setIsDocProcessorOpen] = useState(false);
  const [processorConcursoTarget, setProcessorConcursoTarget] = useState<Concurso | null>(null);

  // Sincronización en vivo
  const [isSyncingNovedades, setIsSyncingNovedades] = useState(false);
  const [syncBanner, setSyncBanner] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: string;
    wafNotice?: string;
  } | null>(null);

  // Cargar datos del servidor
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resConcursos, resStats] = await Promise.all([
        fetch('/api/concursos'),
        fetch('/api/db/stats'),
      ]);

      if (resConcursos.ok) {
        const dataConcursos = await resConcursos.json();
        setConcursos(dataConcursos);

        // Si hay un concurso seleccionado, actualizar su referencia
        if (selectedConcurso) {
          const updated = dataConcursos.find((c: Concurso) => c.id === selectedConcurso.id);
          if (updated) setSelectedConcurso(updated);
        }
      }

      if (resStats.ok) {
        const dataStats = await resStats.json();
        setStats(dataStats);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCrawler = () => {
    setIsCrawlerOpen(true);
  };

  const handleConcursoAdded = (newConcurso: Concurso) => {
    loadData();
    setSelectedConcurso(newConcurso);
  };

  const handleSelectConcurso = (concurso: Concurso) => {
    setSelectedConcurso(concurso);
  };

  const handleAnalyzeConcurso = (concurso: Concurso, adjunto?: Adjunto) => {
    setProcessorConcursoTarget(concurso);
    setIsDocProcessorOpen(true);
  };

  const handleAddNovedad = async (
    concursoId: string,
    titulo: string,
    descripcion: string,
    archivoNombre?: string,
    archivoContenido?: string
  ) => {
    const res = await fetch(`/api/concursos/${concursoId}/novedades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo,
        descripcion,
        archivoNombre,
        archivoContenido,
        tipoDocumento: 'acta',
      }),
    });

    if (res.ok) {
      await loadData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Barra superior institucional */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCrawler={handleOpenCrawler}
      />

      {/* Contenedor principal de la aplicación */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Métricas consolidadas */}
        <MetricsOverview
          stats={stats}
          onFilterGestionados={() => {
            setActiveTab('llamados');
            setGestionFilter('uruguayconcursa');
          }}
          onFilterExternos={() => {
            setActiveTab('llamados');
            setGestionFilter('externos');
          }}
        />

        {/* VISTA 1: LLAMADOS Y NOVEDADES */}
        {activeTab === 'llamados' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Consolidación de Concursos de UruguayConcursa
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Base centralizada de llamados públicos, cronología de novedades y repositorio de adjuntos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={async () => {
                    setIsSyncingNovedades(true);
                    setSyncBanner(null);
                    try {
                      const res = await fetch('/api/crawler/sync-novedades', { method: 'POST' });
                      const data = await res.json();
                      await loadData();
                      setSyncBanner({
                        type: 'success',
                        message: data.message,
                        details: `Se consolidaron ${data.nuevosConcursosIncorporados} nuevos concursos y ${data.nuevasNovedadesIncorporadas} novedades. Total en base: ${data.totalConcursos} llamados.`,
                        wafNotice: data.wafNotice,
                      });
                    } catch (err: any) {
                      setSyncBanner({
                        type: 'error',
                        message: 'Error al sincronizar con https://www.uruguayconcursa.gub.uy/novedades',
                        details: err.message,
                      });
                    } finally {
                      setIsSyncingNovedades(false);
                    }
                  }}
                  disabled={isSyncingNovedades}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  <Globe className={`w-3.5 h-3.5 ${isSyncingNovedades ? 'animate-spin' : ''}`} />
                  <span>{isSyncingNovedades ? 'Recorriendo portal...' : 'Recorrer Novedades Web'}</span>
                </button>

                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  title="Recargar datos de la base"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
                <button
                  onClick={() => {
                    setProcessorConcursoTarget(null);
                    setIsDocProcessorOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Procesar Bases / Actas</span>
                </button>
              </div>
            </div>

            {/* Banner de resultado de sincronización de novedades */}
            {syncBanner && (
              <div
                className={`p-4 rounded-lg border text-xs space-y-1.5 transition-all ${
                  syncBanner.type === 'success'
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{syncBanner.message}</span>
                  </div>
                  <button
                    onClick={() => setSyncBanner(null)}
                    className="text-slate-400 hover:text-slate-700 text-[11px] cursor-pointer"
                  >
                    Descartar
                  </button>
                </div>
                {syncBanner.details && (
                  <p className="text-[11px] text-emerald-800">{syncBanner.details}</p>
                )}
                {syncBanner.wafNotice && (
                  <div className="mt-2 p-2.5 bg-white/70 border border-emerald-300/60 rounded text-[11px] text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">Nota de seguridad gubernamental: </span>
                    {syncBanner.wafNotice}
                  </div>
                )}
              </div>
            )}

            {/* Tabla principal */}
            <ConcursosTable
              concursos={concursos}
              onSelectConcurso={handleSelectConcurso}
              onAnalyzeConcurso={handleAnalyzeConcurso}
              gestionFilter={gestionFilter}
              setGestionFilter={setGestionFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              organismoFilter={organismoFilter}
              setOrganismoFilter={setOrganismoFilter}
            />
          </div>
        )}

        {/* VISTA 2: CAPA DE DATOS RELACIONAL */}
        {activeTab === 'database' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Capa Base Relacional y Consola de Consultas
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspección del esquema normalizado de 5 tablas: concursos, novedades, adjuntos, criterios y postulantes.
              </p>
            </div>
            <DatabaseConsole stats={stats} />
          </div>
        )}

        {/* VISTA 3: EXTRACCIÓN IA (BASES Y ACTAS) */}
        {activeTab === 'analyzer' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Motor de Extracción Documental con Gemini 3.8
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Procesa textos y PDFs de convocatorias públicas para extraer criterios, ponderaciones y nóminas clasificadas.
                </p>
              </div>
              <button
                onClick={() => {
                  setProcessorConcursoTarget(null);
                  setIsDocProcessorOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Abrir Asistente de Extracción</span>
              </button>
            </div>

            {/* Tarjetas explicativas de las capacidades de extracción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-700 rounded-md font-bold text-xs">
                    BASES
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Estructuración de Criterios y Ponderaciones
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Interpreta documentos de bases generales y particulares de UruguayConcursa para separar con exactitud:
                </p>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li><span className="font-semibold text-slate-900">Requisitos excluyentes:</span> títulos universitarios, residencia o ciudadanía obligatoria.</li>
                  <li><span className="font-semibold text-slate-900">Requisitos valorables:</span> méritos académicos, experiencia previa y capacitaciones.</li>
                  <li><span className="font-semibold text-slate-900">Etapas del concurso:</span> méritos, pruebas de conocimiento, entrevistas, y puntajes mínimos eliminatorios.</li>
                </ul>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-md font-bold text-xs">
                    ACTAS
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nómina Ordenada de Postulantes
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Digitaliza tablas de actas de tribunal y listas de prelación para clasificar a cada candidato:
                </p>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li><span className="font-semibold text-slate-900">Identificador y C.I.:</span> documento de identidad o código de postulación.</li>
                  <li><span className="font-semibold text-slate-900">Estado clasificado:</span> Preseleccionado / No preseleccionado / Convocado / No convocado.</li>
                  <li><span className="font-semibold text-slate-900">Puntaje y Orden:</span> orden de mérito y desglose de puntos por etapa.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 4: CONSOLA SQL Y EXPORTACIÓN */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Consola SQL & Exportación de Datos
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Genera volcados completos para bases de datos relacionales compatibles con PostgreSQL, MySQL y SQLite.
              </p>
            </div>
            <DatabaseConsole stats={stats} />
          </div>
        )}
      </main>

      {/* MODALES INTERACTIVOS */}
      <ConcursoDetailModal
        concurso={selectedConcurso}
        onClose={() => setSelectedConcurso(null)}
        onAnalyzeDocument={handleAnalyzeConcurso}
        onAddNovedad={handleAddNovedad}
      />

      <CrawlerModal
        isOpen={isCrawlerOpen}
        onClose={() => setIsCrawlerOpen(false)}
        onConcursoAdded={handleConcursoAdded}
      />

      <DocumentProcessorModal
        isOpen={isDocProcessorOpen}
        onClose={() => setIsDocProcessorOpen(false)}
        concursos={concursos}
        selectedConcursoInitial={processorConcursoTarget}
        onAnalysisComplete={loadData}
      />
    </div>
  );
}
