import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';

import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/auth/entities/user.entity';

import { validate } from 'uuid';

const testingUser = {
  email: 'testing.user@google.com',
  password: 'Abc12345',
  fullName: 'Testing user',
};

const testingAdminUser = {
  email: 'testing.admin@google.com',
  password: 'Abc12345',
  fullName: 'Testing admin',
};

describe('AuthModule Private (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  let token: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    await userRepository.delete({ email: testingUser.email });
    await userRepository.delete({ email: testingAdminUser.email });

    const responseUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    const responseAdmin = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingAdminUser);

    token = responseUser.body.token;
    adminToken = responseAdmin.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/private')
      .send();

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized', statusCode: 401 });
  });

  it('should return new token and user if token is provided', async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 800);
    });

    const response = await request(app.getHttpServer())
      .get('/auth/check-auth-status')
      .set('Authorization', `Bearer ${token}`);

    const responseToken = response.body.token;

    expect(response.statusCode).toBe(200);
    expect(responseToken).not.toBe(token);
  });

  it('should return custom object if token is valid', async () => {
    // Validar la respuesta
  });

  it('should return 401 if admin token is provided', async () => {
    const response = await request(app.getHttpServer()).get('/auth/private3');
  });

  it('should return user if admin token is provided', async () => {
    const response = await request(app.getHttpServer()).get('/auth/private3');
  });
});
