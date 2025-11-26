import { useEffect, useState } from "react";
import { useAuth } from "../modules/auth/AuthContext";
import { fhirClient } from "../services/fhirClient";
import type { PatientSummaryBundle } from "../types/fhir";
import { formatCpf, formatDate } from "../utils/formatters";

export function ProfilePage() {
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

  if (isLoading) {
    return (
      <main className="app-container">
        <p>Carregando dados do perfil...</p>
      </main>
    );
  }

  if (!summary) {
    return (
      <main className="app-container">
        <p>Não foi possível carregar os dados do perfil.</p>
      </main>
    );
  }

  const patient = summary.patient;
  const officialName = patient.name?.find((n) => n.use === "official") || patient.name?.[0];
  const cpfIdentifier = patient.identifier?.find(
    (id) => id.system?.includes("CPF") || id.value?.length === 11
  );
  const cnsIdentifier = patient.identifier?.find(
    (id) => id.system?.includes("CNS") || id.value?.length === 15
  );

  const genderMap: Record<string, string> = {
    male: "Masculino",
    female: "Feminino",
    other: "Outro",
    unknown: "Não informado"
  };

  return (
    <main className="app-container">
      <div className="profile-container">
        <h1>Meu Perfil</h1>

        <section className="profile-section">
          <h2>Informações Pessoais</h2>
          <div className="profile-info-grid">
            <div className="info-item">
              <strong>Nome Completo:</strong>
              <span>{officialName?.text || officialName?.family || "Não informado"}</span>
            </div>
            {patient.gender && (
              <div className="info-item">
                <strong>Sexo:</strong>
                <span>{genderMap[patient.gender] || patient.gender}</span>
              </div>
            )}
            {patient.birthDate && (
              <div className="info-item">
                <strong>Data de Nascimento:</strong>
                <span>{formatDate(patient.birthDate)}</span>
              </div>
            )}
            {cpfIdentifier && (
              <div className="info-item">
                <strong>CPF:</strong>
                <span>{formatCpf(cpfIdentifier.value || "")}</span>
              </div>
            )}
            {cnsIdentifier && (
              <div className="info-item">
                <strong>CNS:</strong>
                <span>{cnsIdentifier.value}</span>
              </div>
            )}
          </div>
        </section>

        {patient.telecom && patient.telecom.length > 0 && (
          <section className="profile-section">
            <h2>Contato</h2>
            <div className="profile-info-grid">
              {patient.telecom.map((contact, index) => (
                <div key={index} className="info-item">
                  <strong>
                    {contact.system === "phone"
                      ? contact.use === "mobile"
                        ? "Celular"
                        : "Telefone"
                      : contact.system === "email"
                        ? "E-mail"
                        : "Contato"}
                    :
                  </strong>
                  <span>{contact.value || "Não informado"}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {patient.address && patient.address.length > 0 && (
          <section className="profile-section">
            <h2>Endereço</h2>
            {patient.address.map((address, index) => (
              <div key={index} className="address-block">
                {address.line && address.line.length > 0 && (
                  <div className="info-item">
                    <strong>Logradouro:</strong>
                    <span>{address.line.join(", ")}</span>
                  </div>
                )}
                <div className="address-row">
                  {address.district && (
                    <div className="info-item">
                      <strong>Bairro:</strong>
                      <span>{address.district}</span>
                    </div>
                  )}
                  {address.city && (
                    <div className="info-item">
                      <strong>Cidade:</strong>
                      <span>{address.city}</span>
                    </div>
                  )}
                  {address.state && (
                    <div className="info-item">
                      <strong>Estado:</strong>
                      <span>{address.state}</span>
                    </div>
                  )}
                  {address.postalCode && (
                    <div className="info-item">
                      <strong>CEP:</strong>
                      <span>{address.postalCode}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="profile-section">
          <h2>Resumo Clínico</h2>
          <div className="profile-stats">
            <div className="stat-item">
              <strong>{summary.encounters.length}</strong>
              <span>Atendimentos</span>
            </div>
            <div className="stat-item">
              <strong>{summary.observations.length}</strong>
              <span>Exames</span>
            </div>
            <div className="stat-item">
              <strong>{summary.allergies.length}</strong>
              <span>Alergias</span>
            </div>
            <div className="stat-item">
              <strong>{(summary.conditions || []).length}</strong>
              <span>Condições</span>
            </div>
            <div className="stat-item">
              <strong>{(summary.procedures || []).length}</strong>
              <span>Procedimentos</span>
            </div>
            <div className="stat-item">
              <strong>{(summary.medications || []).length}</strong>
              <span>Medicamentos</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

