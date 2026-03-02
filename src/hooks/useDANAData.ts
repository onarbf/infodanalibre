import { useEffect, useState } from "react";
import {
  fetchMunicipios,
  fetchComarcas,
  fetchActuaciones,
  CATEGORIES,
} from "../api";
import type { MunicipioFeature, ActuacionFeature } from "../api";

export interface Totals {
  inversion: number;
  byCategory: Record<string, number>;
}

export function useDANAData() {
  const [municipios, setMunicipios] = useState<MunicipioFeature[]>([]);
  const [comarcas, setComarcas] = useState<MunicipioFeature[]>([]);
  const [actuaciones, setActuaciones] = useState<ActuacionFeature[]>([]);
  const [totals, setTotals] = useState<Totals>({
    inversion: 0,
    byCategory: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [muniData, comarcaData, actuData] = await Promise.all([
          fetchMunicipios(),
          fetchComarcas(),
          fetchActuaciones(),
        ]);

        setMunicipios(muniData);
        setComarcas(comarcaData);
        setActuaciones(actuData);

        // Calculate totals from municipios data
        let totalInversion = 0;
        const catTotals: Record<string, number> = {};

        CATEGORIES.forEach((c) => {
          catTotals[c.field] = 0;
        });

        muniData.forEach((f) => {
          totalInversion += f.attributes.inversion || 0;
          CATEGORIES.forEach((c) => {
            catTotals[c.field] += (f.attributes[c.field] as number) || 0;
          });
        });

        setTotals({ inversion: totalInversion, byCategory: catTotals });
      } catch (error) {
        console.error("Error loading DANA data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { municipios, comarcas, actuaciones, totals, loading };
}
