/**
 * Seed - Dados iniciais simulando RAC da RNDS
 * Cria um paciente com histórico clínico completo
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpa dados existentes (cuidado em produção!)
  await prisma.auditEvent.deleteMany();
  await prisma.observationComponent.deleteMany();
  await prisma.observation.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.medicationStatement.deleteMany();
  await prisma.condition.deleteMany();
  await prisma.allergyIntolerance.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.patientCredential.deleteMany();
  await prisma.identifier.deleteMany();
  await prisma.humanName.deleteMany();
  await prisma.contactPoint.deleteMany();
  await prisma.address.deleteMany();
  await prisma.practitioner.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.patient.deleteMany();

  console.log('✅ Dados antigos removidos');

  // Cria organização (estabelecimento de saúde)
  const organization = await prisma.organization.create({
    data: {
      fhirId: 'org-hosp-santa-luzia',
      cnes: '1234567',
      name: 'Hospital Santa Luzia',
      alias: 'HSL',
      typeCode: 'hosp',
      typeDisplay: 'Hospital',
      active: true,
      identifiers: {
        create: [
          {
            use: 'official',
            system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cnes',
            value: '1234567',
            resourceType: 'Organization',
          },
        ],
      },
      telecoms: {
        create: [
          {
            system: 'phone',
            value: '(11) 3456-7890',
            use: 'work',
          },
        ],
      },
      addresses: {
        create: [
          {
            use: 'work',
            type: 'physical',
            line1: 'Rua das Flores, 123',
            district: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            postalCode: '01310-100',
            country: 'BR',
          },
        ],
      },
    },
  });

  console.log('✅ Organização criada:', organization.name);

  // Cria profissional de saúde
  const practitioner = await prisma.practitioner.create({
    data: {
      fhirId: 'pract-dr-silva',
      cpf: '98765432100',
      cns: '123456789012345',
      active: true,
      gender: 'female',
      qualificationCode: '225100',
      qualificationText: 'Médico Clínico Geral',
      councilType: 'CRM',
      councilNumber: '123456',
      councilUF: 'SP',
      names: {
        create: [
          {
            use: 'official',
            text: 'Dra. Ana Silva',
            family: 'Silva',
            given: 'Ana',
          },
        ],
      },
      identifiers: {
        create: [
          {
            use: 'official',
            system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cpf',
            value: '98765432100',
            resourceType: 'Practitioner',
          },
        ],
      },
    },
  });

  console.log('✅ Profissional criado:', practitioner.names?.[0] || practitioner.fhirId);

  // Cria paciente principal
  const patient = await prisma.patient.create({
    data: {
      fhirId: 'patient-123',
      cpf: '12345678910',
      cns: '987654321098765',
      active: true,
      gender: 'female',
      birthDate: new Date('1985-03-15'),
      maritalStatus: 'M',
      deceased: false,
      language: 'pt-BR',
      names: {
        create: [
          {
            use: 'official',
            text: 'Maria Oliveira Santos',
            family: 'Santos',
            given: 'Maria Oliveira',
          },
        ],
      },
      identifiers: {
        create: [
          {
            use: 'official',
            system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cpf',
            value: '12345678910',
            resourceType: 'Patient',
          },
          {
            use: 'official',
            system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cns',
            value: '987654321098765',
            resourceType: 'Patient',
          },
        ],
      },
      telecoms: {
        create: [
          {
            system: 'phone',
            value: '(11) 98765-4321',
            use: 'mobile',
          },
          {
            system: 'email',
            value: 'maria.santos@email.com',
            use: 'home',
          },
        ],
      },
      addresses: {
        create: [
          {
            use: 'home',
            type: 'physical',
            line1: 'Avenida Paulista, 1000',
            line2: 'Apto 501',
            district: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            postalCode: '01310-100',
            country: 'BR',
          },
        ],
      },
    },
  });

  console.log('✅ Paciente criado:', patient.names?.[0] || patient.fhirId);

  // Cria credenciais de login
  const passwordHash = await bcrypt.hash('12345', 10);
  await prisma.patientCredential.create({
    data: {
      patientId: patient.id,
      username: '12345678910',
      passwordHash,
    },
  });

  console.log('✅ Credenciais criadas (CPF: 12345678910, Senha: 12345)');

  // Cria encontros (atendimentos)
  const encounter1 = await prisma.encounter.create({
    data: {
      fhirId: 'enc-001',
      status: 'finished',
      classCode: 'AMB',
      classDisplay: 'Ambulatorial',
      typeCode: 'rotina',
      typeDisplay: 'Consulta de Rotina',
      reasonCode: 'checkup',
      reasonDisplay: 'Check-up anual',
      start: new Date('2024-10-02T09:00:00Z'),
      end: new Date('2024-10-02T10:00:00Z'),
      patientId: patient.id,
      practitionerId: practitioner.id,
      serviceProviderId: organization.id,
    },
  });

  const encounter2 = await prisma.encounter.create({
    data: {
      fhirId: 'enc-002',
      status: 'finished',
      classCode: 'AMB',
      classDisplay: 'Ambulatorial',
      typeCode: 'exame',
      typeDisplay: 'Realização de Exames',
      start: new Date('2024-09-20T14:00:00Z'),
      end: new Date('2024-09-20T14:30:00Z'),
      patientId: patient.id,
      serviceProviderId: organization.id,
    },
  });

  console.log('✅ Encontros criados: 2');

  // Cria observações (exames laboratoriais e sinais vitais)
  await prisma.observation.createMany({
    data: [
      {
        fhirId: 'obs-001',
        status: 'final',
        categoryCode: 'laboratory',
        categoryDisplay: 'Laboratório',
        codeSystem: 'http://loinc.org',
        code: '2339-0',
        codeDisplay: 'Glicose',
        effectiveDateTime: new Date('2024-09-20T14:30:00Z'),
        issued: new Date('2024-09-21T08:00:00Z'),
        valueQuantity: 97,
        valueQuantityUnit: 'mg/dL',
        interpretationCode: 'N',
        interpretationText: 'Normal',
        patientId: patient.id,
        encounterId: encounter2.id,
        performerId: practitioner.id,
      },
      {
        fhirId: 'obs-002',
        status: 'final',
        categoryCode: 'laboratory',
        categoryDisplay: 'Laboratório',
        codeSystem: 'http://loinc.org',
        code: '2571-8',
        codeDisplay: 'Triglicerídeos',
        effectiveDateTime: new Date('2024-09-20T14:30:00Z'),
        issued: new Date('2024-09-21T08:00:00Z'),
        valueQuantity: 145,
        valueQuantityUnit: 'mg/dL',
        interpretationCode: 'N',
        interpretationText: 'Normal',
        patientId: patient.id,
        encounterId: encounter2.id,
        performerId: practitioner.id,
      },
      {
        fhirId: 'obs-003',
        status: 'final',
        categoryCode: 'vital-signs',
        categoryDisplay: 'Sinais Vitais',
        codeSystem: 'http://loinc.org',
        code: '85354-9',
        codeDisplay: 'Pressão Arterial',
        effectiveDateTime: new Date('2024-10-02T09:15:00Z'),
        patientId: patient.id,
        encounterId: encounter1.id,
        performerId: practitioner.id,
        note: 'Pressão arterial medida no braço esquerdo, paciente sentada',
      },
      {
        fhirId: 'obs-004',
        status: 'final',
        categoryCode: 'vital-signs',
        categoryDisplay: 'Sinais Vitais',
        codeSystem: 'http://loinc.org',
        code: '8867-4',
        codeDisplay: 'Frequência Cardíaca',
        effectiveDateTime: new Date('2024-10-02T09:15:00Z'),
        valueQuantity: 72,
        valueQuantityUnit: 'bpm',
        patientId: patient.id,
        encounterId: encounter1.id,
      },
    ],
  });

  // Adiciona componentes para pressão arterial
  const obs003 = await prisma.observation.findUnique({
    where: { fhirId: 'obs-003' },
  });

  if (obs003) {
    await prisma.observationComponent.createMany({
      data: [
        {
          observationId: obs003.id,
          codeSystem: 'http://loinc.org',
          code: '8480-6',
          codeDisplay: 'Sistólica',
          valueQuantity: 120,
          valueQuantityUnit: 'mmHg',
        },
        {
          observationId: obs003.id,
          codeSystem: 'http://loinc.org',
          code: '8462-4',
          codeDisplay: 'Diastólica',
          valueQuantity: 80,
          valueQuantityUnit: 'mmHg',
        },
      ],
    });
  }

  console.log('✅ Observações criadas: 4');

  // Cria alergias
  await prisma.allergyIntolerance.createMany({
    data: [
      {
        fhirId: 'allergy-001',
        clinicalStatusCode: 'active',
        clinicalStatusText: 'Ativa',
        verificationStatus: 'confirmed',
        type: 'allergy',
        category: 'medication',
        criticality: 'high',
        codeSystem: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRSubstancia',
        code: 'dipirona',
        codeDisplay: 'Dipirona',
        recordedDate: new Date('2020-05-10T00:00:00Z'),
        note: 'Reação alérgica grave com edema de glote',
        patientId: patient.id,
        recorderId: practitioner.id,
      },
      {
        fhirId: 'allergy-002',
        clinicalStatusCode: 'active',
        clinicalStatusText: 'Ativa',
        verificationStatus: 'confirmed',
        type: 'intolerance',
        category: 'food',
        criticality: 'low',
        code: 'crustaceos',
        codeDisplay: 'Crustáceos',
        recordedDate: new Date('2018-03-22T00:00:00Z'),
        note: 'Paciente relata coceira e mal-estar após ingestão',
        patientId: patient.id,
        recorderId: practitioner.id,
      },
    ],
  });

  console.log('✅ Alergias criadas: 2');

  // Cria condições (problemas de saúde)
  await prisma.condition.createMany({
    data: [
      {
        fhirId: 'cond-001',
        clinicalStatus: 'active',
        verificationStatus: 'confirmed',
        categoryCode: 'problem-list-item',
        severity: 'mild',
        codeSystem: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRCID10',
        code: 'E78.5',
        codeDisplay: 'Hiperlipidemia não especificada',
        onsetDateTime: new Date('2022-06-15T00:00:00Z'),
        recordedDate: new Date('2022-06-15T00:00:00Z'),
        note: 'Controle com dieta e atividade física',
        patientId: patient.id,
        recorderId: practitioner.id,
      },
    ],
  });

  console.log('✅ Condições criadas: 1');

  // Cria procedimentos
  await prisma.procedure.createMany({
    data: [
      {
        fhirId: 'proc-001',
        status: 'completed',
        categoryCode: 'diagnostic',
        codeSystem: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRTUSS',
        code: '0202010430',
        codeDisplay: 'Hemograma completo',
        performedStart: new Date('2024-09-20T14:30:00Z'),
        performedEnd: new Date('2024-09-20T14:45:00Z'),
        patientId: patient.id,
        performerId: practitioner.id,
        encounterId: encounter2.id,
      },
    ],
  });

  console.log('✅ Procedimentos criados: 1');

  // Cria medicamentos
  await prisma.medicationStatement.createMany({
    data: [
      {
        fhirId: 'med-001',
        status: 'active',
        categoryCode: 'outpatient',
        medicationCode: 'sinvastatina',
        medicationDisplay: 'Sinvastatina 20mg',
        dosage: '1 comprimido à noite',
        route: 'oral',
        effectiveStart: new Date('2022-06-15T00:00:00Z'),
        taken: 'y',
        note: 'Uso contínuo para controle do colesterol',
        patientId: patient.id,
        recorderId: practitioner.id,
      },
    ],
  });

  console.log('✅ Medicamentos criados: 1');

  // Cria evento de auditoria
  await prisma.auditEvent.create({
    data: {
      action: 'read',
      outcome: 'success',
      agentUserId: patient.id,
      sourceName: 'seed-script',
      patientId: patient.id,
      details: {
        message: 'Dados iniciais carregados via seed',
      },
    },
  });

  console.log('✅ Auditoria registrada');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📝 Dados de acesso:');
  console.log('   CPF: 12345678910');
  console.log('   Senha: 12345');
  console.log('   Patient ID: ' + patient.id);
  console.log('   Patient FHIR ID: ' + patient.fhirId);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

