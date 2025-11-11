## Backend – Portal Saúde Digital (BR Core FHIR)

### Tecnologias
- Node.js + Express + TypeScript
- Prisma ORM (PostgreSQL)
- JWT para autenticação
- Helmet, CORS, Morgan

### Scripts
```bash
npm install
npm run generate   # gera cliente Prisma
npm run migrate    # aplica migrações após ajustar schema
npm run dev        # modo desenvolvimento (tsx watch)
npm run build      # compila para dist
npm run start      # inicia build compilado
```

### Configuração de Ambiente
1. Copie `env.template` para `.env` e ajuste as variáveis.
2. Garanta um banco PostgreSQL disponível e habilite a extensão `uuid-ossp` caso deseje usar UUID.
3. Execute `npm run migrate` para criar o schema BR Core.

### Endpoints
- `POST /auth/login`  
  Recebe `{ cpf, password }` e devolve `{ token, user }`.  
  Se `ENABLE_MOCK_AUTH=true`, aceita as credenciais de protótipo `12345678910 / 12345`.

- `GET /patients/:patientId/summary`  
  Requer cabeçalho `Authorization: Bearer <token>`.  
  Retorna um resumo FHIR (paciente, encontros, observações laboratoriais e alergias).

### Estrutura do Projeto
- `src/services/patientSummaryService.ts`: camada que consulta o banco e transforma para FHIR.
- `src/utils/fhirMappers.ts`: mapeadores focados em BR Core R4.
- `prisma/schema.prisma`: schema relacional alinhado aos principais perfis nacionais.

### Próximos Passos
- Implementar migrations versionadas (`prisma migrate dev --name init`).
- Popular tabelas com dados de exemplo usando `prisma/seed.ts`.
- Expandir coverage para Condition, Procedure, Medication e outros perfis conforme a necessidade do portal.


