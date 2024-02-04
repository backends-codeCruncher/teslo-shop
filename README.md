<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# Teslo API

1. Clonar proyecto
2. Ejecutar el comando: ```npm install```
3. Clonar el archivo ```.env.template``` y renombrar a ```.env```
4. Configurar las variables de entorno
5. Levantar base de datos 
```
docker compose up -d
```
6. Ejecutar aplicación 
```
npm run start:dev
```
7. Ejecutar SEED para llenar la base de datos
```
localhost:3000/api/seed
```