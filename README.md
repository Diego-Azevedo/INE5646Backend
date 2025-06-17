# Backend INE5646

## Sistema de Registro e Autenticação de Usuário

Este projeto implementa um sistema básico de registro, autenticação e gerenciamento de usuários, utilizando Node.js com MongoDB.

## Stack Utilizada

- **Node.js com Express** – Framework para criação de APIs REST.
- **Mongoose** – ODM para integração com o MongoDB.
- **bcrypt** – Para criptografia e validação de senhas (transforma a senha em hash e valida o hash).
- **jsonwebtoken** – Geração e validação de tokens JWT para autenticação.
- **dotenv** – Carregamento de variáveis de ambiente a partir de um arquivo `.env`.

## Configuração

Para executar o projeto, será necessário obter as seguintes informações e permissões:

- Credenciais de autenticação do MongoDB:
  - `DB_USER`
  - `DB_PASS`

- Variável de ambiente para autenticação JWT:
  - `SECRET`

Solicite o arquivo `.env` ao administrador do projeto.

Também é necessário solicitar a liberação do seu IP público junto ao administrador para acesso ao cluster MongoDB (Network Access).

## Execução

Requisitos: Node.js 18

```bash
nvm use 18
npm install
npm run start
