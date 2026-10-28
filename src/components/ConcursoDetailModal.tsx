import React, { useState } from 'react';
import type { Concurso, Novedad, Adjunto, CriterioEvaluacion, PostulanteEvaluado } from '../types/database';
import {
  X,
  ExternalLink,
  Calendar,
  Building,
  FileText,
  Clock,
  Download,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Award,
  Sparkles,
  PlusCircle,
  Eye,
  Search,
  History,
  GitBranch,
  ArrowRight,
} from 'lucide-react';

interface ConcursoDetailModalProps {
  concurso: Concurso | null;
  onClose: () => void;
  onAnalyzeDocument: (concurso: Concurso, adjunto?: Adjunto) => void;
  onAddNovedad: (concursoId: string, titulo: string, descripcion: string, archivoNombre?: string, archivoContenido?: string) => Promise<void>;
}

export const ConcursoDetailModal: React.FC<ConcursoDetailModalProps> = ({
  concurso,
  onClose,
  onAnalyzeDocument,
  onAddNovedad,
}) => {
  if (!concurso) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'novedades' | 'adjuntos' | 'criterios' | 'postulantes' | 'versiones'>('info');
  const [selectedAdjuntoViewer, setSelectedAdjuntoViewer] = useState<Adjunto | null>(null);
  const [adjuntoVersionFilter, setAdjuntoVersionFilter] = useState<'all' | 'vigente' | 'historica'>('all');

  // Estado para agregar nueva novedad
  const [showAddNovedad, setShowAddNovedad] = useState(false);
  const [newNovTitulo, setNewNovTitulo] = useState('');
  const [newNovDesc, setNewNovDesc] = useState('');
  const [newNovDocNombre, setNewNovDocNombre] = useState('');
  const [newNovDocTexto, setNewNovDocTexto] = useState('');
  const [isSubmittingNov, setIsSubmittingNov] = useState(false);

  // Filtros de postulantes
  const [postulanteSearch, setPostulanteSearch] = useState('');
  const [postulanteEstadoFilter, setPostulanteEstadoFilter] = useState<'all' | 'Preseleccionado' | 'No preseleccionado' | 'Convocado' | 'No convocado'>('all');

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const handleCreateNovedad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNovTitulo.trim()) return;

    setIsSubmittingNov(true);
    try {
      await onAddNovedad(
        concurso.id,
        newNovTitulo,
        newNovDesc,
        newNovDocNombre.trim() || undefined,
        newNovDocTexto.trim() || undefined
      );
      setNewNovTitulo('');
      setNewNovDesc('');
      setNewNovDocNombre('');
      setNewNovDocTexto('');
      setShowAddNovedad(false);
    } catch (err) {
      console.error('Error al agregar novedad:', err);
    } finally {
      setIsSubmittingNov(false);
    }
  };

  // Filtrado de postulantes
  const postulantes = concurso.postulantes || [];
  const filteredPostulantes = postulantes.filter((p) => {
    const matchSearch =
      postulanteSearch === '' ||
      p.identificadorPostulante.toLowerCase().includes(postulanteSearch.toLowerCase()) ||
      (p.nombre && p.nombre.toLowerCase().includes(postulanteSearch.toLowerCase()));

    const matchEstado =
      postulanteEstadoFilter === 'all' || p.estado === postulanteEstadoFilter;

    return matchSearch && matchEstado;
  });

  // Conteo de versiones históricas
  const totalVersionesHistoricas = (concurso.adjuntos || []).filter(
    (a) => a.estadoVersion === 'historica_anterior' || a.estadoVersion === 'rectificada'
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Cabecera del modal */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-base text-slate-900">
                {concurso.numeroLlamado}
              </span>
              <span className="text-slate-300">·</span>

              {/* Etiqueta destacada si es concurso externo */}
              {concurso.esExterno ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-100 text-purple-900 border border-purple-300 rounded font-semibold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-purple-700" />
                  Concurso no gestionado por UruguayConcursa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-medium text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Gestionado por UruguayConcursa
                </span>
              )}

              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">{concurso.estadoConcurso}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {concurso.nombreLlamado}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{concurso.organismo}</span>
              <span>·</span>
              <span>{concurso.departamento}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de pestañas */}
        <div className="flex border-b border-slate-200 bg-white px-6 gap-6 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'info'
                ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ficha del Llamado
          </button>
          <button
            onClick={() => setActiveTab('novedades')}
            className={`py-3 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'novedades'
                ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Ventana de Novedades</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
              {concurso.novedades?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('adjuntos')}
            className={`py-3 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'adjuntos'
                ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Adjuntos Almacenados</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-100 rounded text-blue-800">
              {concurso.adjuntos?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('versiones')}
            className={`py-3 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'versiones'
                ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Versiones Anteriores & Cambios</span>
            {totalVersionesHistoricas > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-semibold">
                {totalVersionesHistoricas}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('criterios')}
            className={`py-3 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'criterios'
                ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Criterios de Selección (Bases)</span>
            {concurso.criterios && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('postulantes')}
            className={`py-3 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'postulantes'
                ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
            <span>Nómina de Postulantes (Actas)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
              {postulantes.length}
            </span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* PESTAÑA: FICHA DEL LLAMADO */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Alerta explícita para concursos externos */}
              {concurso.esExterno && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-purple-900">
                        Concurso no gestionado por UruguayConcursa
                      </h4>
                      <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                        Este concurso corresponde a una convocatoria autónoma de {concurso.organismo}. La inscripción,
                        publicación de actas y posibles reclamos se tramitan de forma directa a través del portal de la
                        institución convocante.
                      </p>
                      <a
                        href={concurso.portalOrigenUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-xs text-purple-900 font-semibold underline mt-2 hover:text-purple-950"
                      >
                        <span>Ir al portal de origen del organismo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid de metadatos principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Detalles del Concurso</span>
                  <dl className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <dt className="text-slate-500">Número de llamado:</dt>
                      <dd className="font-mono font-bold text-slate-900">{concurso.numeroLlamado}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <dt className="text-slate-500">Organismo convocante:</dt>
                      <dd className="font-semibold text-slate-900 text-right">{concurso.organismo}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <dt className="text-slate-500">Departamento:</dt>
                      <dd className="text-slate-900">{concurso.departamento}</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-slate-500">Régimen:</dt>
                      <dd className="font-medium text-slate-900">{concurso.etiquetaGestion}</dd>
                    </div>
                  </dl>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Plazos e Inscripción</span>
                  <dl className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <dt className="text-slate-500">Fecha y hora de cierre:</dt>
                      <dd className="font-mono font-bold text-slate-900 tabular-nums">
                        {formatDate(concurso.fechaCierre)}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <dt className="text-slate-500">Estado actual:</dt>
                      <dd className="font-semibold text-slate-900">{concurso.estadoConcurso}</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-slate-500">Portal web:</dt>
                      <dd>
                        <a
                          href={concurso.portalOrigenUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-blue-700 hover:underline flex items-center gap-1"
                        >
                          <span>{concurso.gestionadoPorUruguayConcursa ? 'UruguayConcursa' : 'Portal Externo'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Descripción completa */}
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Descripción del Cargo y Tareas</h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {concurso.descripcion || 'Sin descripción detallada registrada.'}
                </p>
              </div>

              {/* Botón rápido para analizar con IA */}
              <div className="flex items-center justify-between p-4 bg-blue-50/70 border border-blue-200 rounded-lg">
                <div>
                  <h4 className="text-xs font-bold text-blue-900">Extracción automática de bases y actas</h4>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Procesa los documentos PDF almacenados de este concurso para extraer criterios y nóminas de postulantes.
                  </p>
                </div>
                <button
                  onClick={() => onAnalyzeDocument(concurso)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Procesar con Gemini</span>
                </button>
              </div>
            </div>
          )}

          {/* PESTAÑA: VENTANA DE NOVEDADES */}
          {activeTab === 'novedades' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ventana de Novedades del Concurso</h3>
                  <p className="text-xs text-slate-500">
                    Registro cronológico de novedades y notificaciones oficiales publicadas en la web.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddNovedad(!showAddNovedad)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1.5 rounded border border-blue-200 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{showAddNovedad ? 'Cerrar Formulario' : 'Registrar Novedad'}</span>
                </button>
              </div>

              {/* Formulario para agregar novedad */}
              {showAddNovedad && (
                <form
                  onSubmit={handleCreateNovedad}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
                >
                  <h4 className="text-xs font-bold text-slate-800">Nueva Novedad / Acta Publicada</h4>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Título de la novedad
                    </label>
                    <input
                      type="text"
                      required
                      value={newNovTitulo}
                      onChange={(e) => setNewNovTitulo(e.target.value)}
                      placeholder="ej. Acta Nº 2: Resultados de la prueba de oposición"
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Descripción o texto del comunicado
                    </label>
                    <textarea
                      rows={2}
                      value={newNovDesc}
                      onChange={(e) => setNewNovDesc(e.target.value)}
                      placeholder="Detalle de las resoluciones o convocatorias del tribunal..."
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Nombre de archivo adjunto (Opcional)
                      </label>
                      <input
                        type="text"
                        value={newNovDocNombre}
                        onChange={(e) => setNewNovDocNombre(e.target.value)}
                        placeholder="ej. Acta_2_Resultados_Prueba.pdf"
                        className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Contenido textual del documento
                      </label>
                      <input
                        type="text"
                        value={newNovDocTexto}
                        onChange={(e) => setNewNovDocTexto(e.target.value)}
                        placeholder="Texto extraído del documento adjunto..."
                        className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddNovedad(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingNov}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors cursor-pointer"
                    >
                      {isSubmittingNov ? 'Guardando...' : 'Guardar Novedad y Adjunto'}
                    </button>
                  </div>
                </form>
              )}

              {/* Feed cronológico de novedades */}
              <div className="space-y-3">
                {(!concurso.novedades || concurso.novedades.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    No se han registrado novedades para este llamado aún.
                  </div>
                ) : (
                  concurso.novedades.map((nov, index) => {
                    const relatedAdjuntos = (concurso.adjuntos || []).filter((a) =>
                      nov.adjuntoIds?.includes(a.id)
                    );

                    return (
                      <div
                        key={nov.id}
                        className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 flex-wrap gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">
                              Novedad #{concurso.novedades!.length - index}
                            </span>
                            {nov.versionEtiqueta && (
                              <span className="px-1.5 py-0.2 bg-blue-50 text-blue-800 border border-blue-200 rounded font-mono text-[10px] font-semibold">
                                {nov.versionEtiqueta}
                              </span>
                            )}
                            {nov.tipoCambio && (
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                                {nov.tipoCambio.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <span className="font-mono tabular-nums">{formatDate(nov.fechaPublicacion)}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{nov.titulo}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{nov.descripcion}</p>

                        {/* Archivos vinculados a esta novedad */}
                        {relatedAdjuntos.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                            {relatedAdjuntos.map((adj) => (
                              <div
                                key={adj.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                <span className="font-medium">{adj.nombreArchivo}</span>
                                {adj.version && (
                                  <span className="text-[10px] font-mono px-1 bg-white border border-slate-200 rounded text-slate-600">
                                    {adj.version}
                                  </span>
                                )}
                                <a
                                  href={adj.urlDescarga}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-700 hover:text-blue-900 ml-1"
                                  title="Descargar archivo"
                                >
                                  <Download className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA: ADJUNTOS ALMACENADOS */}
          {activeTab === 'adjuntos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Repositorio de Archivos Adjuntos</h3>
                  <p className="text-xs text-slate-500">
                    Bases, actas de tribunal, resoluciones y listas descargadas y almacenadas en la base de datos.
                  </p>
                </div>

                {/* Filtro por estado de versión */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md text-xs">
                  <button
                    onClick={() => setAdjuntoVersionFilter('all')}
                    className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                      adjuntoVersionFilter === 'all'
                        ? 'bg-white text-slate-900 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos ({concurso.adjuntos?.length || 0})
                  </button>
                  <button
                    onClick={() => setAdjuntoVersionFilter('vigente')}
                    className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                      adjuntoVersionFilter === 'vigente'
                        ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Vigentes ({(concurso.adjuntos || []).filter((a) => a.estadoVersion !== 'historica_anterior').length})
                  </button>
                  <button
                    onClick={() => setAdjuntoVersionFilter('historica')}
                    className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                      adjuntoVersionFilter === 'historica'
                        ? 'bg-white text-amber-800 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Versiones Anteriores ({(concurso.adjuntos || []).filter((a) => a.estadoVersion === 'historica_anterior' || a.estadoVersion === 'rectificada').length})
                  </button>
                </div>
              </div>

              {(!concurso.adjuntos || concurso.adjuntos.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  No hay archivos adjuntos almacenados para este llamado.
                </div>
              ) : (
                <div className="space-y-3">
                  {(concurso.adjuntos || [])
                    .filter((adj) => {
                      if (adjuntoVersionFilter === 'vigente') return adj.estadoVersion !== 'historica_anterior';
                      if (adjuntoVersionFilter === 'historica') return adj.estadoVersion === 'historica_anterior' || adj.estadoVersion === 'rectificada';
                      return true;
                    })
                    .map((adj) => (
                    <div
                      key={adj.id}
                      className={`p-4 bg-white border rounded-lg flex flex-col gap-3 shadow-xs hover:border-slate-300 transition-colors ${
                        adj.estadoVersion === 'historica_anterior' ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-semibold text-xs text-slate-900">{adj.nombreArchivo}</span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                              {adj.tipoDocumento}
                            </span>
                            {adj.version && (
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded">
                                {adj.version}
                              </span>
                            )}
                            {adj.estadoVersion === 'historica_anterior' ? (
                              <span className="text-[10px] font-medium px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded">
                                Versión Anterior / Histórica
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                                Vigente
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 font-mono tabular-nums">
                            <span>{(adj.pesoBytes / 1024).toFixed(1)} KB</span>
                            <span>·</span>
                            <span>Subido: {formatDate(adj.fechaSubida)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setSelectedAdjuntoViewer(adj)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Contenido</span>
                          </button>
                          <a
                            href={adj.urlDescarga}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar</span>
                          </a>
                          <button
                            onClick={() => onAnalyzeDocument(concurso, adj)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span>Analizar con IA</span>
                          </button>
                        </div>
                      </div>

                      {/* Motivo de rectificación o reemplazo si existe */}
                      {adj.motivoCambio && (
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 flex items-start gap-1.5">
                          <History className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-800">Nota de Modificación:</span>{' '}
                            {adj.motivoCambio}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Visor de texto de adjunto seleccionado */}
              {selectedAdjuntoViewer && (
                <div className="mt-4 p-4 bg-slate-900 text-slate-100 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700">
                    <span className="font-mono font-semibold">{selectedAdjuntoViewer.nombreArchivo}</span>
                    <button
                      onClick={() => setSelectedAdjuntoViewer(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      Cerrar visor
                    </button>
                  </div>
                  <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto text-slate-300">
                    {selectedAdjuntoViewer.contenidoExtraido || 'No hay contenido de texto extraído aún.'}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA: VERSIONES ANTERIORES & CAMBIOS */}
          {activeTab === 'versiones' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Historial de Versiones Anteriores y Modificaciones</h3>
                <p className="text-xs text-slate-500">
                  Trazabilidad cronológica de bases rectificadas, actas preliminares vs definitivas y cambios en requisitos o plazos.
                </p>
              </div>

              {/* Resumen de ciclo de versiones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Documentos Totales</span>
                  <p className="text-lg font-mono font-bold text-slate-900 mt-1 tabular-nums">
                    {concurso.adjuntos?.length || 0}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {(concurso.adjuntos || []).filter((a) => a.tipoDocumento === 'bases').length} bases / {(concurso.adjuntos || []).filter((a) => a.tipoDocumento === 'acta').length} actas
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase">Documentos Vigentes</span>
                  <p className="text-lg font-mono font-bold text-emerald-950 mt-1 tabular-nums">
                    {(concurso.adjuntos || []).filter((a) => a.estadoVersion !== 'historica_anterior').length}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Rigen actualmente la evaluación
                  </p>
                </div>

                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-amber-800 uppercase">Versiones Anteriores</span>
                  <p className="text-lg font-mono font-bold text-amber-950 mt-1 tabular-nums">
                    {(concurso.adjuntos || []).filter((a) => a.estadoVersion === 'historica_anterior' || a.estadoVersion === 'rectificada').length}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Archivadas con auditoría de cambios
                  </p>
                </div>
              </div>

              {/* Comparativa cronológica de versiones */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Evolución Documental del Concurso
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {(concurso.novedades || []).map((nov, idx) => {
                    const adjuntosNovedad = (concurso.adjuntos || []).filter((a) => nov.adjuntoIds?.includes(a.id));
                    const esRectificacion = nov.tipoCambio === 'rectificacion_bases' || nov.titulo.toLowerCase().includes('rectific');
                    const esFinal = nov.tipoCambio === 'lista_definitiva' || nov.titulo.toLowerCase().includes('final');

                    return (
                      <div key={nov.id} className="relative">
                        {/* Indicador de nodo temporal */}
                        <div
                          className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                            esRectificacion
                              ? 'border-purple-600 bg-purple-100'
                              : esFinal
                              ? 'border-emerald-600 bg-emerald-100'
                              : 'border-blue-600'
                          }`}
                        />

                        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{nov.titulo}</span>
                              {nov.versionEtiqueta && (
                                <span className="px-1.5 py-0.2 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] font-semibold text-slate-700">
                                  {nov.versionEtiqueta}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                              {formatDate(nov.fechaPublicacion)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed mb-3">
                            {nov.descripcion}
                          </p>

                          {/* Adjuntos asociados y notas de cambio */}
                          {adjuntosNovedad.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              {adjuntosNovedad.map((adj) => (
                                <div
                                  key={adj.id}
                                  className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="font-medium text-slate-800">{adj.nombreArchivo}</span>
                                    {adj.version && (
                                      <span className="text-[10px] font-mono px-1.5 bg-white border border-slate-200 rounded text-slate-700">
                                        {adj.version}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setSelectedAdjuntoViewer(adj)}
                                      className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
                                    >
                                      Inspeccionar versión
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA: CRITERIOS DE SELECCIÓN (BASES) */}
          {activeTab === 'criterios' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Estructura y Criterios de Selección</h3>
                  <p className="text-xs text-slate-500">
                    Requisitos mínimos, ponderaciones por etapa y reglas eliminatorias extraídas de las bases.
                  </p>
                </div>
                <button
                  onClick={() => onAnalyzeDocument(concurso)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Re-analizar Bases con Gemini</span>
                </button>
              </div>

              {!concurso.criterios ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
                  <p className="text-slate-500">
                    Aún no se han estructurado los criterios de selección de este llamado.
                  </p>
                  <button
                    onClick={() => onAnalyzeDocument(concurso)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extraer Criterios de las Bases</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Resumen de las bases */}
                  {concurso.criterios.resumenBases && (
                    <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-950 leading-relaxed">
                      <span className="font-bold">Resumen Reglamentario: </span>
                      {concurso.criterios.resumenBases}
                    </div>
                  )}

                  {/* Requisitos excluyentes y valorables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                      <h4 className="text-xs font-bold text-rose-800 uppercase flex items-center gap-1.5 mb-3">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Requisitos Excluyentes (Eliminatorios)
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {concurso.criterios.requisitosExcluyentes.map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-rose-600 font-bold shrink-0 mt-0.5">•</span>
                            <span className="leading-snug">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                      <h4 className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1.5 mb-3">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        Méritos y Requisitos a Valorar
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {concurso.criterios.requisitosValorables.map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                            <span className="leading-snug">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tabla de etapas del concurso */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-100 font-semibold text-xs text-slate-800 flex justify-between">
                      <span>Etapas de Evaluación y Ponderaciones</span>
                      <span className="font-mono tabular-nums">
                        Puntaje Máximo: {concurso.criterios.puntajeTotalMaximo} pts
                      </span>
                    </div>
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                        <tr>
                          <th className="py-2 px-4">Etapa</th>
                          <th className="py-2 px-4 text-right">Puntaje Máximo</th>
                          <th className="py-2 px-4 text-right">Mínimo Eliminatorio</th>
                          <th className="py-2 px-4">Descripción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {concurso.criterios.etapas.map((etapa, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-semibold text-slate-900">{etapa.nombre}</td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                              {etapa.puntajeMaximo} pts
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums text-rose-700">
                              {etapa.minimoEliminatorio ? `${etapa.minimoEliminatorio} pts` : 'Sin mínimo'}
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 text-[11px]">{etapa.descripcion || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA: NÓMINA DE POSTULANTES (ACTAS) */}
          {activeTab === 'postulantes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nómina Ordenada de Postulantes según Actas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lista clasificada por orden de mérito, estado (preseleccionado/no preseleccionado, convocado/no convocado) y puntaje.
                  </p>
                </div>
                <button
                  onClick={() => onAnalyzeDocument(concurso)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Procesar Acta con IA</span>
                </button>
              </div>

              {/* Controles de filtro para postulantes */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={postulanteSearch}
                    onChange={(e) => setPostulanteSearch(e.target.value)}
                    placeholder="Filtrar por C.I. o nombre..."
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500 font-medium">Estado:</span>
                  <select
                    value={postulanteEstadoFilter}
                    onChange={(e) => setPostulanteEstadoFilter(e.target.value as any)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-hidden"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="Preseleccionado">Preseleccionado</option>
                    <option value="Convocado">Convocado</option>
                    <option value="No preseleccionado">No preseleccionado</option>
                    <option value="No convocado">No convocado</option>
                  </select>
                </div>
              </div>

              {postulantes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
                  <p className="text-slate-500">
                    Aún no se ha cargado ni extraído la lista de postulantes para este llamado.
                  </p>
                  <button
                    onClick={() => onAnalyzeDocument(concurso)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extraer Postulantes de un Acta</span>
                  </button>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4 whitespace-nowrap">Orden</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">Identificador (C.I.)</th>
                        <th className="py-2.5 px-4">Nombre / Código</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">Estado del Postulante</th>
                        <th className="py-2.5 px-4 text-right whitespace-nowrap">Puntaje Total</th>
                        <th className="py-2.5 px-4">Observaciones del Tribunal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredPostulantes.map((postulante) => {
                        const isPre = postulante.estado === 'Preseleccionado' || postulante.estado === 'Convocado';

                        return (
                          <tr key={postulante.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                              #{postulante.ordenMerito || '—'}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                              {postulante.identificadorPostulante}
                            </td>
                            <td className="py-2.5 px-4 font-medium text-slate-800">
                              {postulante.nombre || '—'}
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              {postulante.estado === 'Convocado' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                  Convocado
                                </span>
                              ) : postulante.estado === 'Preseleccionado' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                                  Preseleccionado
                                </span>
                              ) : postulante.estado === 'No preseleccionado' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                                  No preseleccionado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700">
                                  No convocado
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                              {postulante.puntajeTotal.toFixed(1)} pts
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-slate-500 max-w-xs truncate">
                              {postulante.observaciones || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">ID Interno: {concurso.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
