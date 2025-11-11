import type {
  Prisma,
  AllergyIntolerance,
  Encounter,
  Identifier as PrismaIdentifier,
  Observation as PrismaObservation,
  Patient as PrismaPatient
} from "@prisma/client";
import type {
  AllergyIntoleranceResource,
  EncounterResource,
  Identifier,
  ObservationResource,
  ObservationValue,
  PatientResource
} from "../types/fhir";

type PatientWithRelations = PrismaPatient & {
  names: {
    use: string | null;
    text: string | null;
    family: string | null;
    given: string | null;
  }[];
  identifiers: PrismaIdentifier[];
};

export function mapPatientToResource(patient: PatientWithRelations): PatientResource {
  const identifier: Identifier[] = patient.identifiers.map((item) => ({
    use: item.use ?? undefined,
    system: item.system ?? undefined,
    value: item.value,
    type: item.typeCode
      ? {
          coding: [
            {
              system: item.system ?? undefined,
              code: item.typeCode ?? undefined,
              display: item.typeDisplay ?? undefined
            }
          ]
        }
      : undefined
  }));

  return {
    resourceType: "Patient",
    id: patient.id,
    identifier,
    name: patient.names.map((name) => ({
      use: name.use ?? undefined,
      text: name.text ?? undefined,
      family: name.family ?? undefined,
      given: name.given ? name.given.split(" ") : undefined
    })),
    gender: patient.gender ?? undefined,
    birthDate: patient.birthDate?.toISOString().split("T")[0]
  };
}

type EncounterWithOrg = Encounter & {
  serviceProvider?: {
    id: string;
    name: string;
  } | null;
};

export function mapEncountersToResource(encounters: EncounterWithOrg[]): EncounterResource[] {
  return encounters.map((encounter) => ({
    resourceType: "Encounter",
    id: encounter.id,
    status: encounter.status,
    class: encounter.classCode
      ? {
          code: encounter.classCode ?? undefined,
          display: encounter.classDisplay ?? undefined
        }
      : undefined,
    type: encounter.typeCode
      ? [
          {
            coding: [
              {
                code: encounter.typeCode ?? undefined,
                display: encounter.typeDisplay ?? undefined
              }
            ],
            text: encounter.typeDisplay ?? undefined
          }
        ]
      : undefined,
    reasonCode: encounter.reasonCode
      ? [
          {
            coding: [
              {
                code: encounter.reasonCode ?? undefined,
                display: encounter.reasonDisplay ?? undefined
              }
            ],
            text: encounter.reasonDisplay ?? undefined
          }
        ]
      : undefined,
    period: {
      start: encounter.start?.toISOString(),
      end: encounter.end?.toISOString()
    },
    serviceProvider: encounter.serviceProvider
      ? {
          id: encounter.serviceProvider.id,
          display: encounter.serviceProvider.name
        }
      : undefined
  }));
}

type ObservationWithRelations = PrismaObservation & {
  components: Array<{
    codeSystem: string | null;
    code: string | null;
    codeDisplay: string | null;
    valueQuantity: Prisma.Decimal | null;
    valueQuantityUnit: string | null;
    valueString: string | null;
    valueCodeSystem: string | null;
    valueCode: string | null;
    valueCodeDisplay: string | null;
  }>;
};

export function mapObservationsToResource(
  observations: ObservationWithRelations[]
): ObservationResource[] {
  return observations.map((observation) => {
    const value = resolveObservationValue(observation);

    return {
      resourceType: "Observation",
      id: observation.id,
      status: observation.status,
      category: observation.categoryCode
        ? [
            {
              coding: [
                {
                  code: observation.categoryCode ?? undefined,
                  display: observation.categoryDisplay ?? undefined
                }
              ],
              text: observation.categoryDisplay ?? undefined
            }
          ]
        : undefined,
      code: {
        coding: [
          {
            system: observation.codeSystem ?? undefined,
            code: observation.code ?? undefined,
            display: observation.codeDisplay ?? undefined
          }
        ],
        text: observation.codeDisplay ?? undefined
      },
      issued: observation.issued?.toISOString(),
      effectiveDateTime: observation.effectiveDateTime?.toISOString(),
      value,
      interpretation: observation.interpretationText
        ? [
            {
              text: observation.interpretationText ?? undefined,
              coding: [
                {
                  code: observation.interpretationCode ?? undefined
                }
              ]
            }
          ]
        : undefined
    };
  });
}

function resolveObservationValue(observation: PrismaObservation): ObservationValue | undefined {
  if (observation.valueQuantity !== null && observation.valueQuantity !== undefined) {
    return {
      kind: "Quantity",
      value: Number(observation.valueQuantity),
      unit: observation.valueQuantityUnit ?? undefined,
      system: "http://unitsofmeasure.org",
      code: observation.valueQuantityUnit ?? undefined
    };
  }

  if (observation.valueString) {
    return {
      kind: "String",
      value: observation.valueString
    };
  }

  if (observation.valueCode || observation.valueCodeDisplay) {
    return {
      kind: "CodeableConcept",
      value: {
        coding: [
          {
            system: observation.valueCodeSystem ?? undefined,
            code: observation.valueCode ?? undefined,
            display: observation.valueCodeDisplay ?? undefined
          }
        ],
        text: observation.valueCodeDisplay ?? undefined
      }
    };
  }

  return undefined;
}

export function mapAllergiesToResource(
  allergies: AllergyIntolerance[]
): AllergyIntoleranceResource[] {
  return allergies.map((allergy) => ({
    resourceType: "AllergyIntolerance",
    id: allergy.id,
    clinicalStatus: allergy.clinicalStatusText
      ? {
          text: allergy.clinicalStatusText ?? undefined
        }
      : undefined,
    verificationStatus: allergy.verificationStatus
      ? {
          text: allergy.verificationStatus ?? undefined
        }
      : undefined,
    code: allergy.codeDisplay
      ? {
          text: allergy.codeDisplay ?? undefined,
          coding: [
            {
              system: allergy.codeSystem ?? undefined,
              code: allergy.code ?? undefined,
              display: allergy.codeDisplay ?? undefined
            }
          ]
        }
      : undefined,
    criticality: allergy.criticality ?? undefined,
    lastOccurrence: allergy.lastOccurrence?.toISOString()
  }));
}


