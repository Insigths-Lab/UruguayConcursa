import React, { useState } from 'react';
import { Globe, X, Search, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import type { Concurso } from '../types/database';

interface CrawlerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConcursoAdded: (concurso: Concurso) => void;
}

export const CrawlerModal: React.FC<CrawlerModalProps> = ({ isOpen, onClose, onConcursoAdded }) => {
  if (!isOpen) return null;

  const [urlOrId, setUrlOrId] = useState('');
  const [tipoOrigen, setTipoOrigen] = useState<'auto' | 'uruguayconcursa' | 'externo'>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  const handleCrawl = async (targetInput?: string, specificTipo?: 'auto' | 'uruguayconcursa' | 'externo') => {
    const value = targetInput || urlOrId;
    if (!value.trim()) {
      setErrorMsg('Por favor introduce un número de llamado o URL');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessResult(null);

    try {
      const response = await fetch('/api/crawler/fetch-llamado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlOrId: value.trim(),
          tipoOrigen: specificTipo || tipoOrigen,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la solicitud');
      }

      setSuccessResult(data);
      if (data.concurso) {
        onConcursoAdded(data.concurso);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la web');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPreset = (presetId: string, tipo: 'uruguayconcursa' | 'externo') => {
    setUrlOrId(presetId);
    setTipoOrigen(tipo);
    handleCrawl(presetId, tipo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Conector y Rastreador Web de UruguayConcursa
              </h3>
              <p className="text-xs text-slate-500">
                Recolección en vivo de convocatorias, ventana de novedades y descarga de adjuntos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-800">
              Número del Llamado o URL del Portal
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlOrId}
                onChange={(e) => setUrlOrId(e.target.value)}
                placeholder="ej. 0142/2026 o https://www.uruguayconcursa.gub.uy/concursos/..."
                className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-blue-600 focus:outline-hidden"
              />
              <button
                onClick={() => handleCrawl()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 rounded-md transition-colors shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rastreando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Rastrear en Vivo</span>
                  </>
                )}
              </button>
            </div>

            {/* Selector de origen */}
            <div className="flex items-center gap-4 text-xs pt-1">
              <span className="text-slate-500 font-medium">Clasificación de origen:</span>
              <label className="inline-flex items-center gap-1.5 text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="tipoOrigen"
                  value="auto"
                  checked={tipoOrigen === 'auto'}
                  onChange={() => setTipoOrigen('auto')}
                  className="text-blue-600"
                />
                <span>Detección automática</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="tipoOrigen"
                  value="uruguayconcursa"
                  checked={tipoOrigen === 'uruguayconcursa'}
                  onChange={() => setTipoOrigen('uruguayconcursa')}
                  className="text-blue-600"
                />
                <span>UruguayConcursa</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-purple-800 font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="tipoOrigen"
                  value="externo"
                  checked={tipoOrigen === 'externo'}
                  onChange={() => setTipoOrigen('externo')}
                  className="text-purple-600"
                />
                <span>Concurso Externo</span>
              </label>
            </div>
          </div>

          {/* Presets rápidos */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
              Muestras verificadas de la web:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickPreset('0219/2026', 'uruguayconcursa')}
                className="p-2 text-left bg-white border border-slate-200 hover:border-blue-400 rounded transition-colors group cursor-pointer"
              >
                <div className="font-semibold text-slate-800 group-hover:text-blue-700">
                  Llamado 0219/2026
                </div>
                <div className="text-[11px] text-slate-500">MEC · Gestionado por UruguayConcursa</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('montevideo.gub.uy/concursos/9200-2026', 'externo')}
                className="p-2 text-left bg-purple-50/60 border border-purple-200 hover:border-purple-400 rounded transition-colors group cursor-pointer"
              >
                <div className="font-semibold text-purple-900 group-hover:text-purple-950">
                  Concurso IM 9200/2026
                </div>
                <div className="text-[11px] text-purple-700">Intendencia · No gestionado por UC</div>
              </button>
            </div>
          </div>

          {/* Mensajes de error */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Resultado exitoso */}
          {successResult && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successResult.message}</span>
              </div>
              <div className="text-xs text-slate-700 space-y-1">
                <div>
                  <span className="font-semibold">Llamado: </span>
                  {successResult.concurso?.numeroLlamado} - {successResult.concurso?.nombreLlamado}
                </div>
                <div>
                  <span className="font-semibold">Clasificación: </span>
                  <span
                    className={
                      successResult.concurso?.esExterno
                        ? 'font-bold text-purple-900'
                        : 'text-slate-800'
                    }
                  >
                    {successResult.concurso?.etiquetaGestion}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {successResult.novedades?.length || 0} novedad(es) y{' '}
                  {successResult.adjuntos?.length || 0} adjunto(s) incorporados a la base de datos centralizada.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
