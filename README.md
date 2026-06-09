# Cassandra Playground

Interface web para explorar e executar queries CQL em um cluster Apache Cassandra. Desenvolvido para fins educacionais.

![screenshot](packages/frontend/src/assets/hero.png)

## Funcionalidades

- **Conexão em tempo de execução** — conecte a qualquer nó Cassandra informando host, porta e datacenter
- **Navegação de schema** — explore keyspaces e tabelas na barra lateral
- **Editor CQL** — syntax highlighting, histórico de comandos e atalho `Ctrl+Enter` para executar
- **Resultados em tabela** — exibe colunas, linhas, contagem e tempo de execução

## Rodando com Docker

A forma mais simples — tudo em um único container:

```bash
docker pull gustavoleitao/cassandra-playground   # ou use a imagem local abaixo
```

Ou construa localmente:

```bash
git clone git@github.com:gustavoleitao/cassandra-playground.git
cd cassandra-playground

docker build -t cassandra-playground .
docker run -p 3001:3001 cassandra-playground
```

Acesse **http://localhost:3001** no navegador.

> O container não inclui um nó Cassandra. É necessário ter um cluster acessível na rede.

## Desenvolvimento local

Pré-requisitos: **Node.js 22+**

```bash
npm install
npm run dev
```

| Serviço  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3001 |

O Vite faz proxy automático de `/api/*` para o backend durante o desenvolvimento.

### Comandos úteis

```bash
npm run build              # compila frontend e backend
npm run test -w backend    # testes unitários
npm run lint -w backend    # lint do backend
npm run lint -w frontend   # lint do frontend
```

## Conectando ao Cassandra

Preencha o formulário de conexão no topo da página:

| Campo            | Exemplo         | Descrição                                      |
|------------------|-----------------|------------------------------------------------|
| Host             | `127.0.0.1`     | IP ou hostname de um nó do cluster             |
| Porta            | `9042`          | Porta nativa CQL (padrão)                      |
| Datacenter       | `datacenter1`   | Nome do datacenter local (`nodetool status`)   |
| Usuário / Senha  | *(opcional)*    | Apenas se autenticação estiver habilitada      |

## Estrutura do projeto

```
packages/
  backend/   NestJS — API REST em /api, porta 3001
  frontend/  React + Vite — editor CQL e visualização de resultados
```

## Stack

- **Backend:** Node.js, NestJS, `cassandra-driver`
- **Frontend:** React 19, Vite, CodeMirror 6
- **Container:** Docker (build multi-stage, imagem Alpine)
