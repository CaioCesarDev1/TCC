import { useEffect, useState } from "react";
import { Tabs } from "../components/Tabs";
import { useAuth } from "../modules/auth/AuthContext";
import { fhirClient } from "../services/fhirClient";
import type { PatientSummaryBundle } from "../types/fhir";

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PatientSummaryBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      if (!user) {
        return;
      }
      setIsLoading(true);
      try {
        const data = await fhirClient.getPatientSummary(user.id, user.token);
        setSummary(data);
      } finally {
        setIsLoading(false);
      }
    }
    void loadSummary();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <main className="app-container">
      {isLoading && <p>Carregando dados clínicos...</p>}
      {!isLoading && summary ? <Tabs summary={summary} /> : null}
    </main>
  );
}


