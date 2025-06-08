# Backend INE5646

# Sistema de registro e autenticação de usuário

# Stack utilizada:
bcrypt -> tranforma a senha em um hash, decodifica o hash
dotenv -> carrega as variaveis de ambiente do arquivo .env
node 18
node express -> framework para criar APIs 
jsonwebtoken -> cria e valida tokens JWT
mongoose -> ODM para MongoDB

# Run
Você vai precisar das credenciais de autentucação do mongodb, DB_USER e DB_PASSWORD
Solicite o arquivo .env para o admin do projeto

```bash
nvm use 18
npm install
npm run start
```