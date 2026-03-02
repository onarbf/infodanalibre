// API endpoints and data types for infoDANA

const BASE_URL = "https://infodanarecuperacion.es/arcgis/rest/services/ifDANA";
const ACTUACIONES_BASE =
  "https://mapas1.tragsatec.es/server/rest/services/Hosted/actuaciones/FeatureServer/0";

export const ENDPOINTS = {
  municipios: `${BASE_URL}/dana_view/FeatureServer/0/query`,
  comarcas: `${BASE_URL}/dana_comarca_view/FeatureServer/0/query`,
  actuaciones: `${ACTUACIONES_BASE}/query`,
  actuacionAttachments: (objectid: number) =>
    `${ACTUACIONES_BASE}/${objectid}/attachments`,
  actuacionAttachmentUrl: (objectid: number, attachmentId: number) =>
    `${ACTUACIONES_BASE}/${objectid}/attachments/${attachmentId}`,
};

export interface MunicipioData {
  objectid: number;
  pro: number;
  provincia: string;
  provmun: number;
  nombre: string;
  ine_txt: string;
  municipio: string;
  ine: number;
  comarca: string;
  inversion: number;
  n1: number; // Consorcio de Compensación de Seguros
  n2: number; // Infraestructuras Afectadas
  n3: number; // Ciclo del Agua y Obras en Cauces
  n4: number; // Empresas, Trabajadores y Autónomos
  n5: number; // Atención a Personas Afectadas
  n6: number; // Ayudas a la Agricultura
  n7: number;
  // Subcategorías Infraestructuras
  n21: number; // Carreteras
  n22: number; // Ferrocarril
  n23: number; // Otras infraestructuras
  // Subcategorías Agua
  n31: number; // Depuración
  n32: number; // Obras hidráulicas
  n33: number;
  // Subcategorías Empresas
  n41: number; // Línea directa empresas
  n42: number; // Autónomos
  n43: number; // Línea ICO
  n44: number;
  n45: number;
  n46: number;
  // Subcategorías Personas
  n51: number;
  n52: number;
  n53: number;
  n54: number;
  n55: number;
  n56: number;
  n57: number;
  n58: number;
  n59: number;
  n510: number;
  n511: number;
  n512: number;
  // Subcategorías Agricultura
  n61: number;
  n62: number;
  n63: number;
  n64: number;
  n65: number;
  n66: number;
  fecha: number;
}

export interface MunicipioFeature {
  attributes: MunicipioData;
  centroid?: { x: number; y: number };
  geometry?: {
    rings: number[][][];
  };
}

export interface ActuacionData {
  objectid: number;
  globalid: string;
  nombre: string;
  importe: number;
  video: string | null;
  descripcion: string;
  ministerio: string;
  id: string;
  display: number;
  count_attach: number;
}

export interface ActuacionFeature {
  attributes: ActuacionData;
  geometry: { x: number; y: number };
}

export interface AttachmentInfo {
  id: number;
  contentType: string;
  name: string;
  size: number;
}

export interface CategoryInfo {
  id: string;
  field: keyof MunicipioData;
  name: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "seguros",
    field: "n1",
    name: "Consorcio de Compensación de Seguros",
    icon: "🛡️",
  },
  {
    id: "infraestructuras",
    field: "n2",
    name: "Infraestructuras Afectadas",
    icon: "🏗️",
  },
  {
    id: "agua",
    field: "n3",
    name: "Ciclo del Agua y Obras en Cauces",
    icon: "🌊",
  },
  {
    id: "empresas",
    field: "n4",
    name: "Empresas, Trabajadores y Autónomos",
    icon: "💼",
  },
  {
    id: "personas",
    field: "n5",
    name: "Atención a Personas Afectadas",
    icon: "🧳",
  },
  {
    id: "agricultura",
    field: "n6",
    name: "Ayudas a la Agricultura",
    icon: "🚜",
  },
];

export async function fetchMunicipios(): Promise<MunicipioFeature[]> {
  const url = `${ENDPOINTS.municipios}?f=json&where=1%3D1&outFields=*&returnGeometry=true&returnCentroid=true&outSR=4326&resultRecordCount=2000`;
  const response = await fetch(url);
  const data = await response.json();
  return data.features || [];
}

export async function fetchComarcas(): Promise<MunicipioFeature[]> {
  const url = `${ENDPOINTS.comarcas}?f=json&where=1%3D1&outFields=*&returnGeometry=true&returnCentroid=true&outSR=4326&resultRecordCount=2000`;
  const response = await fetch(url);
  const data = await response.json();
  return data.features || [];
}

export async function fetchActuaciones(): Promise<ActuacionFeature[]> {
  const url = `${ENDPOINTS.actuaciones}?f=json&where=display%3D1&outFields=*&returnGeometry=true&outSR=4326&resultRecordCount=2000`;
  const response = await fetch(url);
  const data = await response.json();
  return data.features || [];
}

export async function fetchAttachments(
  objectid: number,
): Promise<AttachmentInfo[]> {
  const url = `${ENDPOINTS.actuacionAttachments(objectid)}?f=json`;
  const response = await fetch(url);
  const data = await response.json();
  return data.attachmentInfos || [];
}

export function getAttachmentUrl(
  objectid: number,
  attachmentId: number,
): string {
  return ENDPOINTS.actuacionAttachmentUrl(objectid, attachmentId);
}

export function formatCurrency(value: number): string {
  if (value == null || isNaN(value)) return "0,00 €";
  return (
    value.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

export function formatCurrencyShort(value: number): string {
  if (value == null || isNaN(value)) return "0 €";
  if (value >= 1_000_000_000)
    return (value / 1_000_000_000).toFixed(1).replace(".", ",") + " MM €";
  if (value >= 1_000_000)
    return (value / 1_000_000).toFixed(1).replace(".", ",") + " M €";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + " K €";
  return value.toFixed(0) + " €";
}

// Color scale for choropleth
export function getInversionColor(value: number): string {
  if (value > 500_000_000) return "#7f2704";
  if (value > 200_000_000) return "#a63603";
  if (value > 100_000_000) return "#d94801";
  if (value > 50_000_000) return "#f16913";
  if (value > 20_000_000) return "#fd8d3c";
  if (value > 10_000_000) return "#fdae6b";
  if (value > 5_000_000) return "#fdd0a2";
  if (value > 1_000_000) return "#fee6ce";
  return "#fff5eb";
}

export const LEGEND_ITEMS = [
  { color: "#7f2704", label: "> 500 M €" },
  { color: "#a63603", label: "200 - 500 M €" },
  { color: "#d94801", label: "100 - 200 M €" },
  { color: "#f16913", label: "50 - 100 M €" },
  { color: "#fd8d3c", label: "20 - 50 M €" },
  { color: "#fdae6b", label: "10 - 20 M €" },
  { color: "#fdd0a2", label: "5 - 10 M €" },
  { color: "#fee6ce", label: "1 - 5 M €" },
  { color: "#fff5eb", label: "< 1 M €" },
];
