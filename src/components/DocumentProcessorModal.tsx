import React, { useState } from 'react';
import { X, Sparkles, FileText, CheckCircle2, AlertCircle, Loader2, Award, ListOrdered, UploadCloud } from 'lucide-react';
import type { Concurso, AnalisisDocumentoResponse } from '../types/database';

interface DocumentProcessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  concursos: Concurso[];
  selectedConcursoInitial?: Concurso | null;
  onAnalysisComplete?: () => void;
}

export const DocumentProcessorModal: React.FC<DocumentProcessorModalProps> = ({
  isOpen,
  onClose,
  concursos,
  selectedConcursoInitial,
  onAnalysisComplete,
}) => {
  if (!isOpen) return null;

  const [selectedConcursoId, setSelectedConcursoId] = useState<string>(
    selectedConcursoInitial?.id || (concursos[0]?.id ?? '')
  );
  const [tipoDocumento, setTipoDocumento] = useState<'bases' | 'acta'>('acta');
  const [docTexto, setDocTexto] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalisisDocumentoResponse | null>(null);

  // Muestras predeterminadas para pruebas instantáneas
  const sampleBases = `MINISTERIO DE SALUD PÚBLICA (MSP)
BASES DEL LLAMADO Nº 0195/2026
CARGO: Médico Especialista en Epidemiología

1. REQUISITOS EXCLUYENTES:
- Título de Doctor en Medicina y título de Especialista en Epidemiología habilitado por MSP.
- Registro en el Colegio Médico del Uruguay.
- Ciudadanía uruguaya natural o legal.
- No tener inhabilitaciones para cargos públicos según Ley 18.172.

2. REQUISITOS A VALORAR:
- Cursos de posgrado en Salud Pública y Bioestadística.
- Experiencia laboral mínima de 3 años en vigilancia epidemiológica comunitaria.
- Publicaciones científicas en revistas indexadas.

3. ETAPAS DE EVALUACIÓN Y PONDERACIÓN (TOTAL: 100 PUNTOS):
- Etapa 1: Valoración de Méritos y Antecedentes (Máximo: 40 puntos). Mínimo aprobatorio: 25 puntos.
- Etapa 2: Prueba Técnica Escrita de Casos Epidemiológicos (Máximo: 35 puntos). Mínimo: 21 puntos.
- Etapa 3: Entrevista Personal y Defensa de Proyecto (Máximo: 25 puntos). Mínimo: 15 puntos.
Puntaje total mínimo requerido para integrar el orden de prelación: 70 puntos.`;

  const sampleActa = `TRIBUNAL DEL CONCURSO - LLAMADO 0195/2026
ACTA FINAL Nº 3: ORDEN DE PRELACIÓN Y RESULTADOS DEFINITIVOS
En Montevideo, a los 26 días del mes de octubre de 2026.

El Tribunal procede a publicar la nómina final de postulantes clasificados según su orden de mérito y puntaje:

1. C.I. 3.450.912-1 | Dr. Álvaro Benítez | Méritos: 38.0 | Prueba: 33.5 | Entrevista: 24.0 | Total: 95.5 pts | Estado: Preseleccionado | Convocado para designación directa
2. C.I. 4.129.803-5 | Dra. Sofía Rossi | Méritos: 36.5 | Prueba: 31.0 | Entrevista: 22.5 | Total: 90.0 pts | Estado: Preseleccionado | Convocado para designación directa
3. C.I. 4.671.209-9 | Dr. Ignacio Varela | Méritos: 32.0 | Prueba: 29.5 | Entrevista: 20.0 | Total: 81.5 pts | Estado: Preseleccionado | No convocado (Integra Lista de Prelación Suplente)
4. C.I. 4.908.112-4 | Dra. Mariana Domínguez | Méritos: 29.0 | Prueba: 27.0 | Entrevista: 18.0 | Total: 74.0 pts | Estado: Preseleccionado | No convocado (Lista de Prelación Suplente)
5. C.I. 5.120.334-0 | Dr. Lucas Menéndez | Méritos: 26.0 | Prueba: 22.0 | Entrevista: 16.0 | Total: 64.0 pts | Estado: No preseleccionado | No convocado (No alcanza mínimo aprobatorio de 70 pts)
6. C.I. 3.882.901-2 | Dra. Florencia Suárez | Méritos: 20.0 | Prueba: 0.0 | Entrevista: 0.0 | Total: 20.0 pts | Estado: No preseleccionado | No convocado (Eliminada en Méritos)`;

  const handleLoadSample = (sample: string, tipo: 'bases' | 'acta') => {
    setTipoDocumento(tipo);
    setDocTexto(sample);
    setErrorMsg(null);
    setAnalysisResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDocTexto(text);
      if (file.name.toLowerCase().includes('bases')) {
        setTipoDocumento('bases');
      } else if (file.name.toLowerCase().includes('acta')) {
        setTipoDocumento('acta');
      }
    };
    reader.readAsText(file);
  };

  const handleProcess = async () => {
    if (!docTexto.trim()) {
      setErrorMsg('Debes ingresar o cargar el texto del documento para analizar');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analizar-documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concursoId: selectedConcursoId || undefined,
          tipoDocumento,
          textoDocumento: docTexto,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el documento');
      }

      setAnalysisResult(data);
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error en la extracción documental');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Analizador de Documentos (Bases y Actas) con IA
              </h3>
              <p className="text-xs text-slate-500">
                Estructura criterios de selección, requisitos y clasifica postulantes con orden de mérito y puntajes.
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

        {/* Formulario y entrada */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Vincular a concurso */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Vincular al Concurso en la Base de Datos
              </label>
              <select
                value={selectedConcursoId}
                onChange={(e) => setSelectedConcursoId(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded focus:border-blue-600 focus:outline-hidden"
              >
                <option value="">(No vincular a ningún concurso)</option>
                {concursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numeroLlamado} - {c.nombreLlamado} ({c.organismo})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de documento */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Tipo de Documento a Procesar
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTipoDocumento('bases')}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded border transition-colors cursor-pointer ${
                    tipoDocumento === 'bases'
                      ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Bases (Criterios y Etapas)
                </button>
                <button
                  type="button"
                  onClick={() => setTipoDocumento('acta')}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded border transition-colors cursor-pointer ${
                    tipoDocumento === 'acta'
                      ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Actas (Postulantes y Puntajes)
                </button>
              </div>
            </div>
          </div>

          {/* Atajos de muestras rápidas */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">Cargar muestra de prueba de UruguayConcursa:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample(sampleBases, 'bases')}
                className="text-[11px] font-medium text-blue-700 hover:underline cursor-pointer"
              >
                Muestra Bases MSP
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => handleLoadSample(sampleActa, 'acta')}
                className="text-[11px] font-medium text-blue-700 hover:underline cursor-pointer"
              >
                Muestra Acta MSP con Nómina
              </button>
            </div>
          </div>

          {/* Área de texto / carga */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-800">
                Texto del Documento a Analizar
              </label>
              <label className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Cargar archivo .txt/.pdf</span>
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={8}
              value={docTexto}
              onChange={(e) => setDocTexto(e.target.value)}
              placeholder="Pega aquí el contenido de las bases o del acta de tribunal (con requisitos, etapas o lista de cédulas y puntajes)..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-blue-600 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Botón de acción */}
          <div className="flex justify-end">
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extrayendo con Gemini 3.8...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Procesar Documento con Gemini</span>
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* RESULTADOS DE LA EXTRACCIÓN */}
          {analysisResult && (
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Extracción completada y guardada en la base de datos</span>
                </div>
                <span className="text-[11px] font-mono uppercase text-slate-500">
                  Tipo: {analysisResult.tipo}
                </span>
              </div>

              {analysisResult.resumen && (
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {analysisResult.resumen}
                </p>
              )}

              {/* Si se extrajeron CRITERIOS */}
              {analysisResult.criterios && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white border border-slate-200 rounded">
                      <span className="font-bold text-rose-800 uppercase block mb-1.5 text-[11px]">
                        Requisitos Excluyentes Detectados:
                      </span>
                      <ul className="space-y-1 text-slate-700 list-disc list-inside">
                        {analysisResult.criterios.requisitosExcluyentes?.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded">
                      <span className="font-bold text-blue-800 uppercase block mb-1.5 text-[11px]">
                        Requisitos a Valorar:
                      </span>
                      <ul className="space-y-1 text-slate-700 list-disc list-inside">
                        {analysisResult.criterios.requisitosValorables?.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Etapas extraídas */}
                  {analysisResult.criterios.etapas && (
                    <div className="border border-slate-200 rounded overflow-hidden">
                      <table className="w-full text-xs text-left bg-white">
                        <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px]">
                          <tr>
                            <th className="py-2 px-3">Etapa</th>
                            <th className="py-2 px-3 text-right">Puntaje Máximo</th>
                            <th className="py-2 px-3 text-right">Mínimo Eliminatorio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {analysisResult.criterios.etapas.map((et, idx) => (
                            <tr key={idx}>
                              <td className="py-1.5 px-3 font-medium text-slate-900">{et.nombre}</td>
                              <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                                {et.puntajeMaximo} pts
                              </td>
                              <td className="py-1.5 px-3 text-right font-mono text-rose-700">
                                {et.minimoEliminatorio ? `${et.minimoEliminatorio} pts` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Si se extrajeron POSTULANTES */}
              {analysisResult.postulantes && (
                <div className="space-y-2">
                  <span className="font-bold text-xs text-slate-800 block">
                    Nómina Clasificada y Ordenada ({analysisResult.postulantes.length} postulantes):
                  </span>
                  <div className="border border-slate-200 rounded overflow-x-auto bg-white">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px]">
                        <tr>
                          <th className="py-2 px-3">Orden</th>
                          <th className="py-2 px-3">Identificador (C.I.)</th>
                          <th className="py-2 px-3">Nombre</th>
                          <th className="py-2 px-3">Estado Extraído</th>
                          <th className="py-2 px-3 text-right">Puntaje</th>
                          <th className="py-2 px-3">Observaciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analysisResult.postulantes.map((pos, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-mono font-bold text-slate-900">
                              #{pos.ordenMerito || idx + 1}
                            </td>
                            <td className="py-1.5 px-3 font-mono font-medium text-slate-900">
                              {pos.identificadorPostulante}
                            </td>
                            <td className="py-1.5 px-3 text-slate-700">{pos.nombre || '—'}</td>
                            <td className="py-1.5 px-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  pos.estado === 'Convocado'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : pos.estado === 'Preseleccionado'
                                    ? 'bg-blue-100 text-blue-800'
                                    : pos.estado === 'No preseleccionado'
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {pos.estado}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                              {pos.puntajeTotal} pts
                            </td>
                            <td className="py-1.5 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                              {pos.observaciones || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
