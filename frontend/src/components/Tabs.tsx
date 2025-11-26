import { useState } from "react";
import type { PatientSummaryBundle } from "../types/fhir";
import { formatDate, formatDateTime } from "../utils/formatters";

type TabsProps = {
  summary: PatientSummaryBundle;
};

type TabKey = "observations" | "encounters" | "allergies" | "conditions" | "procedures" | "medications";

const TAB_LABELS: Record<TabKey, string> = {
  observations: "Exames de Laboratório",
  encounters: "Últimas Visitas",
  allergies: "Alergias",
  conditions: "Condições",
  procedures: "Procedimentos",
  medications: "Medicamentos"
};

export function Tabs({ summary }: TabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("observations");

  return (
    <div id="tabs">
      <nav>
        {(Object.keys(TAB_LABELS) as TabKey[]).map((tabKey) => (
          <button
            key={tabKey}
            className={`tab-btn ${activeTab === tabKey ? "active" : ""}`}
            onClick={() => setActiveTab(tabKey)}
            type="button"
          >
            {TAB_LABELS[tabKey]}
          </button>
        ))}
      </nav>
      <section id="tab-content">{renderTabContent(activeTab, summary)}</section>
    </div>
  );
}

function renderTabContent(tab: TabKey, summary: PatientSummaryBundle) {
  switch (tab) {
    case "observations":
      return (
        <section>
          <h2>Exames de Sangue/Urina</h2>
          <ul>
            {summary.observations.map((observation) => {
              const concept = observation.code.text ?? observation.code.coding?.[0]?.display;
              let valueText = "-";
              if (observation.value?.kind === "Quantity") {
                valueText = `${observation.value.value} ${observation.value.unit ?? ""}`.trim();
              } else if (observation.value?.kind === "String") {
                valueText = observation.value.value;
              } else if (observation.value?.kind === "CodeableConcept") {
                valueText =
                  observation.value.value.text ?? observation.value.value.coding?.[0]?.display ?? "-";
              }
              const interpretation = observation.interpretation?.[0]?.text;

              return (
                <li key={observation.id}>
                  <strong>{concept}</strong> • {valueText}{" "}
                  {interpretation ? <>({interpretation})</> : null}
                  <br />
                  <span className="meta">
                    Atualizado em {formatDateTime(observation.effectiveDateTime ?? observation.issued)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      );
    case "encounters":
      return (
        <section>
          <h2>Últimas Visitas</h2>
          <ul>
            {summary.encounters.map((encounter) => {
              const description =
                encounter.type?.[0]?.text ??
                encounter.reasonCode?.[0]?.text ??
                encounter.class?.display ??
                "Visita";
              return (
                <li key={encounter.id}>
                  <strong>{formatDate(encounter.period?.start)}</strong> • {description}
                  {encounter.serviceProvider?.display ? (
                    <>
                      <br />
                      <span className="meta">{encounter.serviceProvider.display}</span>
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      );
    case "allergies":
      return (
        <section>
          <h2>Alergias</h2>
          <ul>
            {summary.allergies.map((allergy) => (
              <li key={allergy.id}>
                <strong>{allergy.code?.text ?? "Sensibilidade não especificada"}</strong>
                {allergy.clinicalStatus?.text ? (
                  <>
                    {" "}
                    • Status: {allergy.clinicalStatus.text}
                  </>
                ) : null}
                {allergy.lastOccurrence ? (
                  <>
                    <br />
                    <span className="meta">
                      Última ocorrência: {formatDate(allergy.lastOccurrence)}
                    </span>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      );
    case "conditions":
      return (
        <section>
          <h2>Condições de Saúde</h2>
          <ul>
            {(summary.conditions || []).map((condition) => (
              <li key={condition.id}>
                <strong>
                  {condition.code?.text ??
                    condition.code?.coding?.[0]?.display ??
                    "Condição não especificada"}
                </strong>
                {condition.clinicalStatus?.text ? (
                  <>
                    {" "}
                    • Status: {condition.clinicalStatus.text}
                  </>
                ) : null}
                {condition.severity?.text ? (
                  <>
                    {" "}
                    • Gravidade: {condition.severity.text}
                  </>
                ) : null}
                {condition.onsetDateTime ? (
                  <>
                    <br />
                    <span className="meta">
                      Início: {formatDate(condition.onsetDateTime)}
                    </span>
                  </>
                ) : null}
                {condition.note ? (
                  <>
                    <br />
                    <span className="meta">{condition.note}</span>
                  </>
                ) : null}
              </li>
            ))}
            {(!summary.conditions || summary.conditions.length === 0) && (
              <li>Nenhuma condição registrada</li>
            )}
          </ul>
        </section>
      );
    case "procedures":
      return (
        <section>
          <h2>Procedimentos Realizados</h2>
          <ul>
            {(summary.procedures || []).map((procedure) => (
              <li key={procedure.id}>
                <strong>
                  {procedure.code?.text ??
                    procedure.code?.coding?.[0]?.display ??
                    "Procedimento não especificado"}
                </strong>
                {procedure.status ? (
                  <>
                    {" "}
                    • Status: {procedure.status}
                  </>
                ) : null}
                {procedure.performedStart ? (
                  <>
                    <br />
                    <span className="meta">
                      Realizado em: {formatDate(procedure.performedStart)}
                    </span>
                  </>
                ) : null}
                {procedure.note ? (
                  <>
                    <br />
                    <span className="meta">{procedure.note}</span>
                  </>
                ) : null}
              </li>
            ))}
            {(!summary.procedures || summary.procedures.length === 0) && (
              <li>Nenhum procedimento registrado</li>
            )}
          </ul>
        </section>
      );
    case "medications":
      return (
        <section>
          <h2>Medicamentos</h2>
          <ul>
            {(summary.medications || []).map((medication) => (
              <li key={medication.id}>
                <strong>
                  {medication.medication?.text ??
                    medication.medication?.coding?.[0]?.display ??
                    "Medicamento não especificado"}
                </strong>
                {medication.status ? (
                  <>
                    {" "}
                    • Status: {medication.status}
                  </>
                ) : null}
                {medication.dosage ? (
                  <>
                    <br />
                    <span className="meta">Dosagem: {medication.dosage}</span>
                  </>
                ) : null}
                {medication.route ? (
                  <>
                    {" "}
                    • Via: {medication.route}
                  </>
                ) : null}
                {medication.effectiveStart ? (
                  <>
                    <br />
                    <span className="meta">
                      Início: {formatDate(medication.effectiveStart)}
                      {medication.effectiveEnd
                        ? ` - Fim: ${formatDate(medication.effectiveEnd)}`
                        : ""}
                    </span>
                  </>
                ) : null}
                {medication.note ? (
                  <>
                    <br />
                    <span className="meta">{medication.note}</span>
                  </>
                ) : null}
              </li>
            ))}
            {(!summary.medications || summary.medications.length === 0) && (
              <li>Nenhum medicamento registrado</li>
            )}
          </ul>
        </section>
      );
    default:
      return null;
  }
}


