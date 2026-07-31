# Projeto futuro: Pipeline de Dados — Indicadores Econômicos do Banco Central

> Projeto **separado** do SmartDocs (repo próprio, quando for começar). Isso aqui é
> a especificação detalhada pra guardar até você ter tempo de iniciar. Nenhum
> código foi criado ainda — é só o plano.

## Pitch (pra README / LinkedIn / entrevista)

> Pipeline batch ELT que extrai indicadores econômicos (câmbio, Selic, IPCA) da
> API pública do Banco Central, processa em camadas (bronze/silver/gold) com
> testes de qualidade de dado em cada etapa, orquestrado via Airflow, com
> dashboard final em Metabase — tudo reprodutível via docker-compose.

## Por que essa ideia se destaca (não é genérica)

- **Fonte real, não CSV limpo do Kaggle**: a API do BCB tem paginação por data, limite de 10 anos por consulta (desde 26/03/2025) e formato de retorno que exige tratamento — é fricção de engenharia de verdade, não um `pd.read_csv()`.
- **Teste de dado é o que menos gente faz em portfólio** — ter `dbt test` rodando (not null, unique, freshness) é a primeira coisa que separa quem "brinca com dado" de quem "constrói pipeline".
- **Contexto reconhecível**: qualquer recrutador brasileiro entende "indicadores do Banco Central" sem explicação extra — não precisa vender o domínio.
- **Resiliência como tema consistente**: você já foi atrás disso no SmartDocs (DLQ/retry); aqui o mesmo raciocínio aparece como retry/backfill de DAG no Airflow — dá pra contar essa história como um fio condutor entre os dois projetos numa entrevista.

## Arquitetura (visão geral)

```
API BCB (SGS)  →  [Extract]  →  Bronze (raw JSON/Parquet)
                                     ↓
                              [dbt staging]  →  Silver (tipado, limpo)
                                     ↓
                              [dbt marts]     →  Gold (agregado, pronto p/ consumo)
                                     ↓
                              Metabase (dashboard)

Tudo orquestrado por uma DAG do Airflow (extract → staging → marts → testes),
com retry e possibilidade de backfill por intervalo de datas.
Tudo sobe via docker-compose (Airflow + Postgres + Metabase [+ MinIO opcional]).
```

## Fonte de dados: API SGS do Banco Central

Endpoint base:
```
https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo_serie}/dados?formato=json&dataInicial=DD/MM/AAAA&dataFinal=DD/MM/AAAA
```
Também existe a variante dos N últimos valores:
```
https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo_serie}/dados/ultimos/{N}?formato=json
```

Séries sugeridas pra começar (dá pra combinar as 3 num gold layer sem exagerar no escopo):

| Código | Indicador |
|---|---|
| 1 | Câmbio USD/BRL (dólar comercial, venda) |
| 11 | Taxa Selic |
| 433 | IPCA (variação mensal) |

**Limitação real da API (usar isso a seu favor na narrativa)**: desde 26/03/2025, consultas por período são limitadas a 10 anos. Pra série histórica maior, o job de extração precisa **paginar por janelas de data** — isso é decisão de engenharia de verdade pra justificar numa entrevista, não só "chamei uma API".

Retorno é um array de objetos `{ "data": "...", "valor": "..." }` por série.

## Stack recomendada (e por quê)

| Camada | Escolha | Por quê |
|---|---|---|
| Linguagem | Python | Padrão de mercado em DE; mostra que você não é só Java |
| Orquestração | Airflow | Nome mais reconhecido/filtrado em vaga (ATS); DAG com retry/backfill |
| Warehouse | PostgreSQL | Você já sabe operar; integra fácil com Metabase |
| Transformação | dbt-core (+ dbt-postgres) | Padrão de mercado pra modelagem em camadas + testes de dado nativos |
| Armazenamento bronze | Parquet (via pandas/polars) | Formato colunar padrão de data lake |
| Object storage (opcional) | MinIO | Simula S3 localmente, deixa o "data lake" mais realista |
| BI | Metabase | Open-source, sobe em container, resultado visual rápido |
| CI | GitHub Actions | Rodar `dbt test` a cada PR — mesma disciplina que já aplicamos no SmartDocs |
| Infra | docker-compose | `docker compose up` sobe tudo |

**Decisão em aberto pra quando for começar**: Airflow (mais pesado, mais reconhecido) vs Dagster (mais leve, DX melhor, também crescendo em vaga). Não precisa decidir agora.

## Modelo de dados em camadas (exemplo concreto)

- **Bronze** (`raw_bcb_sgs`): JSON/Parquet cru por série e data de extração, sem transformação — só o que a API devolveu.
- **Silver** (`stg_cambio`, `stg_selic`, `stg_ipca`): tipos corretos (data como `date`, valor como `numeric`), uma linha por indicador/dia, deduplicado.
- **Gold** (`mart_indicadores_diarios`, `mart_indicadores_mensais`): tabela unificada com as 3 séries lado a lado por data, mais agregações (média mensal do câmbio, variação acumulada do IPCA, etc.) — é o que o Metabase consome.

## Testes de dado (dbt) — o diferencial

Exemplos concretos pra incluir desde o início, não como "melhoria futura":
- `not_null` e `unique` na chave `data` de cada série em silver
- `accepted_range` no valor do câmbio (ex: entre 0 e 20 — pega erro grosseiro de parsing)
- teste de **freshness**: alertar se a série mais recente está mais velha que N dias (mostra que você pensa em pipeline rodando de verdade, não só uma vez)

## Ordem sugerida de construção (mesmo espírito dos sprints do SmartDocs)

| Sprint | Entregável |
|---|---|
| 0 | Repo + docker-compose (Postgres + Airflow) rodando vazio |
| 1 | Script de extração de 1 série (câmbio) → bronze em Parquet, tratando paginação por data |
| 2 | dbt configurado, staging model da 1ª série + primeiros testes |
| 3 | Extrair as outras 2 séries + marts (gold) unificando as 3 |
| 4 | DAG do Airflow orquestrando extract → staging → marts → testes, com retry configurado |
| 5 | Metabase conectado ao gold, 1 dashboard simples |
| 6 | CI (GitHub Actions rodando `dbt test`), README explicando arquitetura e decisões |

## Quando for começar

Me chama e eu monto o roadmap em sprints + kanban board (mesmo formato que fizemos pro SmartDocs) já dentro do repo novo, e começamos pelo Sprint 0.

Sources:
- [API - documentação python-bcb](https://wilsonfreitas.github.io/python-bcb/api.html)
- [SGS - documentação python-bcb](https://wilsonfreitas.github.io/python-bcb/sgs.html)
- [Taxa de juros - Selic - Portal de Dados Abertos do Banco Central do Brasil](https://dadosabertos.bcb.gov.br/dataset/11-taxa-de-juros---selic/resource/b73edc07-bbac-430c-a2cb-b1639e605fa8)
