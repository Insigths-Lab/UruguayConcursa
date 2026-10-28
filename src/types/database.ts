/**
 * Esquema relacional y tipos de datos para la capa de consolidación de UruguayConcursa
 */

export type EstadoConcurso = 'Inscripciones Abiertas' | 'En Evaluación' | 'Finalizado' | 'Prorrogado';

export type EstadoPostulante = 'Preseleccionado' | 'No preseleccionado' | 'Convocado' | 'No convocado';

export type TipoDocumento = 'bases' | 'acta' | 'resolucion' | 'orden_prelacion' | 'comunicado' | 'tribunal';

export interface Concurso {
  id: string;
  numeroLlamado: string; // ej. "0042/2026"
  nombreLlamado: string;
  organismo: string;
  departamento: string;
  fechaCierre: string; // ISO string
  descripcion: string;
  esExterno: boolean;
  gestionadoPorUruguayConcursa: boolean;
  etiquetaGestion: string; // "Gestionado por UruguayConcursa" o "Concurso no gestionado por UruguayConcursa"
  portalOrigenUrl: string;
  estadoConcurso: EstadoConcurso;
  createdAt: string;
  // Relaciones
  novedades?: Novedad[];
  adjuntos?: Adjunto[];
  criterios?: CriterioEvaluacion;
  postulantes?: PostulanteEvaluado[];
}

export interface Novedad {
  id: string;
  concursoId: string;
  fechaPublicacion: string;
  titulo: string;
  descripcion: string;
  adjuntoIds: string[];
  versionEtiqueta?: string; // ej. "v1.0 Inicial", "v2.0 Rectificatoria"
  tipoCambio?: 'publicacion_inicial' | 'rectificacion_bases' | 'nueva_acta' | 'prorroga_plazo' | 'lista_definitiva';
}

export interface Adjunto {
  id: string;
  concursoId: string;
  novedadId?: string;
  nombreArchivo: string;
  tipoDocumento: TipoDocumento;
  urlDescarga: string;
  pesoBytes: number;
  contenidoExtraido?: string;
  fechaSubida: string;
  procesadoConIA?: boolean;
  version?: string; // ej. "v1.0 (Original)", "v2.0 (Rectificada)", "Acta Preliminar", "Acta Final"
  estadoVersion?: 'vigente' | 'historica_anterior' | 'rectificada';
  motivoCambio?: string; // ej. "Prórroga de inscripciones y ampliación de requisitos valorables"
  versionAnteriorId?: string;
}

export interface EtapaConcurso {
  nombre: string;
  puntajeMaximo: number;
  minimoEliminatorio?: number;
  descripcion?: string;
}

export interface CriterioEvaluacion {
  id: string;
  concursoId: string;
  requisitosExcluyentes: string[];
  requisitosValorables: string[];
  etapas: EtapaConcurso[];
  puntajeTotalMaximo: number;
  puntajeMinimoAprobacion?: number;
  resumenBases?: string;
  fechaExtraccion?: string;
}

export interface PostulanteEvaluado {
  id: string;
  concursoId: string;
  adjuntoOrigenId?: string;
  identificadorPostulante: string; // Cédula de identidad (ej. "4.891.234-5") o código de postulación
  nombre?: string;
  ordenMerito?: number;
  estado: EstadoPostulante;
  puntajeTotal: number;
  desgloseEtapas: Record<string, number>; // ej: { "Méritos y antecedentes": 28, "Prueba de conocimientos": 35, "Entrevista": 18 }
  observaciones?: string;
}

export interface DatabaseStats {
  totalConcursos: number;
  concursosGestionados: number;
  concursosExternos: number;
  totalNovedades: number;
  totalAdjuntos: number;
  totalPostulantes: number;
  concursosConCriterios: number;
}

export interface CrawlRequest {
  urlOrId: string;
  tipoOrigen?: 'auto' | 'uruguayconcursa' | 'externo';
}

export interface AnalisisDocumentoRequest {
  concursoId?: string;
  tipoDocumento: 'bases' | 'acta';
  textoDocumento: string;
  nombreArchivo?: string;
}

export interface AnalisisDocumentoResponse {
  success: boolean;
  tipo: 'bases' | 'acta';
  criterios?: Partial<CriterioEvaluacion>;
  postulantes?: Partial<PostulanteEvaluado>[];
  resumen: string;
  rawJson?: string;
}
