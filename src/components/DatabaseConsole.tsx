import React, { useState, useEffect } from 'react';
import { Database, Download, Table, Code, Search, Layers, Check, FileDown, ArrowUpDown } from 'lucide-react';
import type { DatabaseStats } from '../types/database';

interface DatabaseConsoleProps {
  stats: DatabaseStats;
}

export const DatabaseConsole: React.FC<DatabaseConsoleProps> = ({ stats }) => {
  const [selectedTable, setSelectedTable] = useState<'concursos' | 'novedades' | 'adjuntos' | 'criterios' | 'postulantes'>('concursos');
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchTableData = async (tbl = selectedTable, field = filterField, val = filterValue) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tbl,
          filterField: field || undefined,
          filterValue: val || undefined,
        }),
      });
      const data = await response.json();
      setTableData(data.rows || []);
    } catch (err) {
      console.error('Error al consultar tabla:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(selectedTable, filterField, filterValue);
  }, [selectedTable]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTableData(selectedTable, filterField, filterValue);
  };

  const handleDownload = (format: 'sql' | 'json' | 'csv', table?: string) => {
    if (format === 'sql') {
      window.location.href = '/api/export/sql';
    } else if (format === 'json') {
      window.location.href = '/api/export/json';
    } else if (format === 'csv') {
      window.location.href = `/api/export/csv/${table || selectedTable}`;
    }
  };

  const schemaInfo = {
    concursos: [
      { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Identificador único del concurso' },
      { name: 'numero_llamado', type: 'VARCHAR(32)', key: '', desc: 'Código del llamado (ej. 0084/2026)' },
      { name: 'nombre_llamado', type: 'TEXT', key: '', desc: 'Nombre del puesto / función pública' },
      { name: 'organismo', type: 'VARCHAR(255)', key: '', desc: 'Ministerio, Ente, Intendencia' },
      { name: 'fecha_cierre', type: 'TIMESTAMP', key: '', desc: 'Fecha límite de inscripción' },
      { name: 'es_externo', type: 'BOOLEAN', key: '', desc: 'TRUE si no es gestionado por UruguayConcursa' },
      { name: 'etiqueta_gestion', type: 'VARCHAR(100)', key: '', desc: 'Anotación formal de régimen de gestión' },
      { name: 'portal_origen_url', type: 'TEXT', key: '', desc: 'URL oficial en la web' },
    ],
    novedades: [
      { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Identificador de la novedad' },
      { name: 'concurso_id', type: 'VARCHAR(64)', key: 'FK', desc: 'Referencia a concursos(id)' },
      { name: 'fecha_publicacion', type: 'TIMESTAMP', key: '', desc: 'Fecha y hora de publicación' },
      { name: 'titulo', type: 'VARCHAR(255)', key: '', desc: 'Título de la novedad o acta' },
      { name: 'descripcion', type: 'TEXT', key: '', desc: 'Texto detallado del comunicado' },
      { name: 'version_etiqueta', type: 'VARCHAR(64)', key: '', desc: 'Etiqueta de versión (ej. v1.0, v2.0 Rectificada)' },
      { name: 'tipo_cambio', type: 'VARCHAR(64)', key: '', desc: 'publicacion_inicial | rectificacion_bases | nueva_acta | lista_definitiva' },
    ],
    adjuntos: [
      { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Identificador del archivo adjunto' },
      { name: 'concurso_id', type: 'VARCHAR(64)', key: 'FK', desc: 'Referencia a concursos(id)' },
      { name: 'novedad_id', type: 'VARCHAR(64)', key: 'FK', desc: 'Referencia a novedades(id)' },
      { name: 'nombre_archivo', type: 'VARCHAR(255)', key: '', desc: 'Nombre original del archivo' },
      { name: 'tipo_documento', type: 'VARCHAR(50)', key: '', desc: 'bases | acta | resolucion | comunicado' },
      { name: 'version', type: 'VARCHAR(64)', key: '', desc: 'Versión del documento (ej. v1.0 Original, v2.0 Rectificada)' },
      { name: 'estado_version', type: 'VARCHAR(64)', key: '', desc: 'vigente | historica_anterior | rectificada' },
      { name: 'motivo_cambio', type: 'TEXT', key: '', desc: 'Justificación o resolución que motivó la rectificación' },
      { name: 'contenido_extraido', type: 'TEXT', key: '', desc: 'Texto completo almacenado para búsqueda' },
    ],
    criterios: [
      { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Identificador del criterio' },
      { name: 'concurso_id', type: 'VARCHAR(64)', key: 'FK (UNIQUE)', desc: 'Referencia a concursos(id)' },
      { name: 'requisitos_excluyentes', type: 'JSON', key: '', desc: 'Array de condiciones eliminatorias' },
      { name: 'requisitos_valorables', type: 'JSON', key: '', desc: 'Array de méritos evaluables' },
      { name: 'etapas', type: 'JSON', key: '', desc: 'Etapas con puntaje máximo y mínimo' },
      { name: 'puntaje_total_maximo', type: 'NUMERIC(5,2)', key: '', desc: 'Puntaje total del llamado' },
    ],
    postulantes: [
      { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Identificador de registro' },
      { name: 'concurso_id', type: 'VARCHAR(64)', key: 'FK', desc: 'Referencia a concursos(id)' },
      { name: 'identificador_postulante', type: 'VARCHAR(64)', key: '', desc: 'Cédula de Identidad o código' },
      { name: 'orden_merito', type: 'INTEGER', key: '', desc: 'Posición relativa en la lista' },
      { name: 'estado', type: 'VARCHAR(50)', key: '', desc: 'Preseleccionado | Convocado | No convocado' },
      { name: 'puntaje_total', type: 'NUMERIC(5,2)', key: '', desc: 'Puntaje final obtenido' },
      { name: 'desglose_etapas', type: 'JSON', key: '', desc: 'Puntajes por cada fase evaluada' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Centro de Exportación Rápida */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-700" />
              <span>Capa de Datos Centralizada & Centro de Exportación</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Descarga la base consolidada con esquema relacional en tercera forma normal (3NF) para consumir en bases SQL, APIs o herramientas de análisis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleDownload('sql')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Descargar .SQL (DDL + INSERTs)</span>
            </button>
            <button
              onClick={() => handleDownload('json')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Descargar .JSON</span>
            </button>
            <button
              onClick={() => handleDownload('csv', selectedTable)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Descargar Tabla ({selectedTable}) en CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Esquema de las Tablas */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Diccionario del Esquema Relacional
            </h4>
            <p className="text-[11px] text-slate-500">
              Estructura normalizada de datos para llamados, novedades, archivos y postulantes.
            </p>
          </div>

          {/* Selector de tabla */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded text-xs">
            {(['concursos', 'novedades', 'adjuntos', 'criterios', 'postulantes'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedTable(t);
                  setFilterField('');
                  setFilterValue('');
                }}
                className={`px-3 py-1 rounded transition-colors capitalize font-medium cursor-pointer ${
                  selectedTable === t
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Columnas de la tabla seleccionada */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
              <tr>
                <th className="py-2 px-4">Columna</th>
                <th className="py-2 px-4">Tipo de Dato</th>
                <th className="py-2 px-4">Restricción</th>
                <th className="py-2 px-4">Descripción del Campo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {schemaInfo[selectedTable].map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2 px-4 font-mono font-bold text-slate-900">{col.name}</td>
                  <td className="py-2 px-4 font-mono text-[11px] text-blue-700">{col.type}</td>
                  <td className="py-2 px-4">
                    {col.key && (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">
                        {col.key}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-slate-600">{col.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explorador de Datos de la Tabla */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Registros Consolidados: Tabla <span className="text-blue-700 font-mono">`{selectedTable}`</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              Total de registros: {tableData.length}
            </span>
          </div>

          {/* Filtro en vivo */}
          <form onSubmit={handleApplyFilter} className="flex items-center gap-2 text-xs">
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder={`Filtrar en ${selectedTable}...`}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded focus:border-blue-600 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium cursor-pointer"
            >
              Consultar
            </button>
          </form>
        </div>

        {/* Tabla de registros */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold sticky top-0 text-[11px]">
              <tr>
                {schemaInfo[selectedTable].map((col) => (
                  <th key={col.name} className="py-2.5 px-3 whitespace-nowrap">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={schemaInfo[selectedTable].length}
                    className="py-8 text-center text-slate-400"
                  >
                    No hay registros cargados en esta tabla.
                  </td>
                </tr>
              ) : (
                tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {schemaInfo[selectedTable].map((col) => {
                      const val = row[col.name] !== undefined ? row[col.name] : row[col.name.replace(/_([a-z])/g, (_, g) => g.toUpperCase())];
                      const rendered =
                        typeof val === 'boolean'
                          ? val
                            ? 'TRUE'
                            : 'FALSE'
                          : typeof val === 'object' && val !== null
                          ? JSON.stringify(val).slice(0, 40) + '...'
                          : String(val ?? '—');

                      return (
                        <td
                          key={col.name}
                          className="py-2 px-3 font-mono text-[11px] truncate max-w-xs"
                          title={typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val ?? '')}
                        >
                          {rendered}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
