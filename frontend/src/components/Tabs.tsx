import { useState } from "react";
import type { PatientSummaryBundle } from "../types/fhir";
import { formatDate, formatDateTime } from "../utils/formatters";

type TabsProps = {
  summary: PatientSummaryBundle;
};

type TabKey = "observations" | "encounters" | "allergies";

const TAB_LABELS: Record<TabKey, string> = {
  observations: "Exames de Laboratório",
  encounters: "Últimas Visitas",
  allergies: "Alergias"
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
    default:
      return null;
  }
}


