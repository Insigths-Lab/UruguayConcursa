# UruguayConcursa Data Consolidation Layer & Document Analyzer

Capa base de consolidación de base de datos y consumo de información de la web UruguayConcursa (uruguayconcursa.gub.uy), integrando un conector HTTP en backend con parser para recolección en vivo de llamados, ventana de novedades, descarga y almacenamiento de adjuntos, detección de concursos externos no gestionados por UruguayConcursa, y análisis estructurado de bases y actas con IA para extraer criterios de selección y nóminas de postulantes ordenadas con estados y puntajes.

### User Review & Critical Decisions

> [!IMPORTANT]
> Decisiones de arquitectura y modelo de datos confirmadas por el usuario:

- **Estructura de consumo de datos**: Conector HTTP en backend con parser del portal UruguayConcursa y recolección en vivo, capaz de rastrear llamados por catálogo o identificador, extraer metadatos oficiales (número, nombre, organismo, fecha de cierre, descripción), monitorear la ventana de novedades y registrar la publicación de nuevos archivos adjuntos.
- **Base de datos consolidada relacional**: Repositorio centralizado con esquema relacional normalizado compuesto por tablas vinculadas (`concursos`, `novedades`, `adjuntos`, `criterios_evaluacion`, `postulantes_evaluados`), con visor interactivo de tablas, consola de consultas y exportación completa a SQL (`.sql`), JSON estructurado y CSV tabular.
- **Distinción inequívoca de concursos externos**: Marcado obligatorio para llamados de entes autónomos, intendencias o servicios descentralizados con la etiqueta destacada `"Concurso no gestionado por UruguayConcursa"` y preservación del enlace al portal convocante.
- **Extracción estructurada de bases y actas**:
  - *Bases del concurso*: Criterios de admisión, etapas eliminatorias, requisitos excluyentes y matriz de ponderación de méritos/pruebas/entrevistas.
  - *Actas de evaluación*: Tablas de postulantes ordenadas con detección de preselección (`Preseleccionado` / `No preseleccionado`), convocatoria (`Convocado` / `No convocado`), puntajes desglosados y orden de mérito/prelación.

---

### 1. Overview & Core Concept

- **What It Does**: Provee una plataforma y capa base para consolidar de forma centralizada la información pública de UruguayConcursa. Conecta con la web oficial, extrae y almacena la estructura de cada llamado con su historial de novedades y adjuntos, y procesa mediante modelos multimodales de Gemini el contenido de los documentos descargados (bases y actas) para normalizar postulantes, criterios y resultados.
- **Target Audience / Persona**: Equipos técnicos, analistas de recursos humanos estatales, postulantes y auditores que requieren acceder a una base consolidada y consultable de llamados públicos, sin depender de la navegación manual por PDFs dispersos.
- **Key Value**: Convierte documentos no estructurados (PDFs escaneados o tabulados) y datos web dispersos en una base de datos relacional limpia, auditable y exportable en SQL/JSON/CSV en segundos.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Centro de Consolidación & Monitoreo*: Vista principal con métricas clave de la base consolidada (total de llamados registrados, llamados externos identificados, novedades recientes detectadas, actas procesadas) y barra de acción para recolección en vivo o sincronización por ID de llamado.
  2. *Explorador Relacional de Concursos*: Tabla de alta densidad con filtrado por organismo, estado del concurso (Abierto / En evaluación / Cerrado), tipo de gestión (`UruguayConcursa` vs. `No gestionado por UruguayConcursa`) y rango de fechas de cierre.
  3. *Ficha Técnica y Ventana de Novedades*: Vista de detalle dividida donde se exhibe la información general del llamado, la línea de novedades con marcas de tiempo, y el catálogo de archivos adjuntos (bases, actas, resoluciones) con botón de descarga y estado de extracción.
  4. *Analizador de Documentos (Bases & Actas)*:
     - Pestaña de Criterios: Desglose de requisitos excluyentes, valorables y ponderaciones por etapa.
     - Pestaña de Postulantes: Nómina clasificada y ordenable por puntaje y orden de mérito, con filtros rápidos por estado (`Preseleccionado`, `No preseleccionado`, `Convocado`, `No convocado`) y buscador por cédula o número de inscripción.
  5. *Consola de Datos & Exportación*: Interfaz dedicada para consultar la base consolidada mediante filtros avanzados o consultas, inspeccionar el esquema relacional de tablas y exportar datos en un clic en formato SQL (DDL + INSERTs), JSON jerárquico o CSV normalizado.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Diseño de consola analítica institucional de nivel gubernamental / auditoría pública. Estilo limpio, tipografía nítida, sin elementos decorativos superfluos ("anti-slop"), con alta densidad de información estructurada.
  - *Color Palette & Mood*:
    - Lienzo neutro: `bg-slate-50` / `bg-white` con bordes sutiles `border-slate-200`.
    - Azul institucional: `#1E3A8A` / `#2563EB` para encabezados y acciones primarias.
    - Indicador de Concurso Externo: Pizarra violeta sobrio (`#6D28D9`) para la etiqueta `"No gestionado por UruguayConcursa"`.
    - Estados funcionales: Verde esmeralda (`#16A34A`) para preseleccionados/convocados y convocatorias abiertas; ámbar (`#D97706`) para cierres próximos; gris neutro (`#64748B`) para no convocados.
  - *Typography & Hierarchy*:
    - Encabezados: `Plus Jakarta Sans` en pesos 600 y 700.
    - Texto y descripciones: `Plus Jakarta Sans` / `Public Sans` para máxima legibilidad.
    - Cifras, códigos de llamado y puntajes: `font-mono tabular-nums` para alineación vertical en tablas.
  - *Component Styling & Layout*:
    - Top bar estricto de tres zonas: Identificador de plataforma a la izquierda, enlaces directos (`Llamados`, `Capa de Datos`, `Novedades`, `Consola SQL/Exportar`), y botón de recolección en vivo.
    - Cero píldoras estáticas: metadatos con separadores tipográficos limpios (`·` o `/`).

- **Interactive Feedback & Motion**:
  - Feedback visual inmediato durante la recolección en vivo y análisis con Gemini (<200ms de latencia de UI).
  - Estados vacíos claros con opciones de recolección o carga de llamado de prueba real.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Conector HTTP en Backend con Parser del Portal**
  - *Chosen Approach*: Servidor Express con rutas de proxy `/api/crawler/*` y parser HTML/JSON para consultar la web de UruguayConcursa, sortear restricciones CORS del navegador y procesar respuestas en vivo.
  - *Why*: Permite consultar directamente los llamados públicos y la ventana de novedades en tiempo real, almacenando los adjuntos descargados en la base de datos centralizada.
  - *Trade-off*: Si la red externa de uruguayconcursa.gub.uy experimenta caídas o bloqueos temporales, el backend dispone de un mecanismo de respaldo con datos de muestra verificados y posibilidad de introducir la URL o cargar el documento manualmente.

- **Decision 2: Repositorio Relacional con Exportador Multi-formato (SQL, JSON, CSV)**
  - *Chosen Approach*: Motor de base de datos relacional en memoria persistido en disco y localStorage, con esquema normalizado en tercera forma normal (3NF) y un generador nativo de scripts SQL (`CREATE TABLE` + `INSERT INTO`), archivos JSON anidados y hojas CSV separadas por entidad.
  - *Why*: Cumple con la preferencia explícita del usuario para construir la capa base de consolidación de datos, permitiendo migrar o consumir la información en PostgreSQL, SQLite o herramientas de BI.

- **Decision 3: Extracción Inteligente de Tablas Complejas con Gemini 2.5 Flash**
  - *Chosen Approach*: Empleo de Gemini 2.5 Flash para interpretar textos y tablas de bases y actas, detectando automáticamente si un candidato figura como "Convocado a prueba", "Eliminado en méritos", "No convocado", "Preseleccionado", etc., y extrayendo los puntajes desglosados.
  - *Why*: Las actas de UruguayConcursa presentan una enorme variedad de formatos dependiendo del tribunal del concurso. Los LLMs modernos estructuran estas matrices con altísima fidelidad.

---

### 4. Technical Architecture & Data Strategy (Technical Reference)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                     UruguayConcursa Explorer & Data UI                        │
│  ┌───────────────────────┐  ┌──────────────────────────────────────────────┐  │
│  │  Top Bar (3 Zones)    │  │  Pestañas: Llamados / Esquema DB / Exportar  │  │
│  └───────────────────────┘  └──────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  Panel de Concursos & Novedades  │  Analizador de Bases & Postulantes   │  │
│  │  - Indicador "No gestionado..."  │  - Criterios de selección            │  │
│  │  - Historial de novedades        │  - Lista ordenada por mérito/puntaje │  │
│  │  - Descarga y estado de adjuntos │  - Clasificación de estados          │  │
│  └──────────────────────────────────┴──────────────────────────────────────┘  │
└──────────────────────────────────────┬────────────────────────────────────────┘
                                       │ HTTP REST / JSON
┌──────────────────────────────────────▼────────────────────────────────────────┐
│                        Express Backend API (/api/*)                           │
│  ┌──────────────────────────┐  ┌───────────────────────────────────────────┐  │
│  │  /api/concursos          │  │  /api/crawler/fetch-llamado               │  │
│  │  - CRUD & búsqueda en DB │  │  - Parser HTML y ventana de novedades     │  │
│  │  - Sincronizador en vivo │  │  - Gestor de adjuntos                     │  │
│  ├──────────────────────────┤  ├───────────────────────────────────────────┤  │
│  │  /api/analizar-documento │  │  /api/export                              │  │
│  │  - Gemini 2.5 Flash SDK  │  │  - Generador SQL Dump / JSON / CSV        │  │
│  └──────────────────────────┘  └───────────────────────────────────────────┘  │
└──────────────────────────────────────┬────────────────────────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
┌───────────────────────────────┐             ┌────────────────────────────────┐
│   Google GenAI SDK (Gemini)   │             │  Base de Datos Relacional      │
│   - Extracción de Criterios   │             │  - Tabla `concursos`           │
│   - Normalización Postulantes │             │  - Tabla `novedades`           │
│   - Puntajes y Estados        │             │  - Tabla `adjuntos`            │
│                               │             │  - Tabla `criterios`           │
│                               │             │  - Tabla `postulantes`         │
└───────────────────────────────┘             └────────────────────────────────┘
```

- **Data Model & Schema Relacional (Tablas Normalizadas)**:
  1. `concursos`:
     - `id`: VARCHAR(64) PRIMARY KEY
     - `numero_llamado`: VARCHAR(32) NOT NULL (ej. "0142/2026")
     - `nombre_llamado`: TEXT NOT NULL
     - `organismo`: VARCHAR(255) NOT NULL
     - `departamento`: VARCHAR(100)
     - `fecha_cierre`: TIMESTAMP NOT NULL
     - `descripcion`: TEXT
     - `es_externo`: BOOLEAN NOT NULL (TRUE si no es gestionado por UruguayConcursa)
     - `gestionado_por_uruguayconcursa`: BOOLEAN NOT NULL
     - `etiqueta_gestion`: VARCHAR(100) (ej. "Concurso no gestionado por UruguayConcursa")
     - `portal_origen_url`: TEXT
     - `estado_concurso`: VARCHAR(50) ('Inscripciones Abiertas', 'En Evaluacion', 'Finalizado')
     - `created_at`: TIMESTAMP
  2. `novedades`:
     - `id`: VARCHAR(64) PRIMARY KEY
     - `concurso_id`: VARCHAR(64) REFERENCES concursos(id)
     - `fecha_publicacion`: TIMESTAMP
     - `titulo`: VARCHAR(255) NOT NULL
     - `descripcion`: TEXT
  3. `adjuntos`:
     - `id`: VARCHAR(64) PRIMARY KEY
     - `concurso_id`: VARCHAR(64) REFERENCES concursos(id)
     - `novedad_id`: VARCHAR(64) REFERENCES novedades(id)
     - `nombre_archivo`: VARCHAR(255) NOT NULL
     - `tipo_documento`: VARCHAR(50) ('bases', 'acta', 'resolucion', 'orden_prelacion', 'comunicado')
     - `url_descarga`: TEXT
     - `peso_bytes`: INTEGER
     - `contenido_extraido`: TEXT
     - `fecha_subida`: TIMESTAMP
  4. `criterios_evaluacion`:
     - `id`: VARCHAR(64) PRIMARY KEY
     - `concurso_id`: VARCHAR(64) REFERENCES concursos(id)
     - `requisitos_excluyentes`: JSON
     - `etapas`: JSON (nombre, ponderacion_max, minimo_eliminatorio)
     - `puntaje_maximo`: NUMERIC(5,2)
  5. `postulantes_evaluados`:
     - `id`: VARCHAR(64) PRIMARY KEY
     - `concurso_id`: VARCHAR(64) REFERENCES concursos(id)
     - `adjunto_origen_id`: VARCHAR(64) REFERENCES adjuntos(id)
     - `identificador_postulante`: VARCHAR(64) NOT NULL (Cédula / Código de inscripción)
     - `orden_merito`: INTEGER
     - `estado`: VARCHAR(50) NOT NULL ('Preseleccionado', 'No preseleccionado', 'Convocado', 'No convocado')
     - `puntaje_total`: NUMERIC(5,2)
     - `desglose_etapas`: JSON (méritos, prueba, entrevista)
     - `observaciones`: TEXT

- **Interactive Handlers & State Mapping**:
  - `handleFetchLlamadoLive(idOrUrl)`: Realiza la petición al backend para consultar el portal de UruguayConcursa en tiempo real y poblar las tablas del concurso.
  - `handleFilterExternos(filterType)`: Alterna entre todos los llamados, exclusivamente gestionados por UruguayConcursa, o concursos externos no gestionados.
  - `handleProcessAttachment(adjuntoId)`: Ejecuta la extracción de criterios o nómina de postulantes sobre el documento seleccionado.
  - `handleExport(format)`: Descarga el volcado completo en `.sql`, `.json` o `.csv`.
