import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';

import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/auth/entities/user.entity';
import { testingAdmin, testingUser } from '../../../test/testing-users';

import { validate } from 'uuid';

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

    const responseUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    const responseAdmin = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingAdmin);

    await userRepository.update(
      { email: testingAdmin.email },
      { roles: ['admin', 'super-user'] },
    );

    token = responseUser.body.token;
    adminToken = responseAdmin.body.token;
  });

  afterAll(async () => {
    await userRepository.delete({ email: testingUser.email });
    await userRepository.delete({ email: testingAdmin.email });

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
    const response = await request(app.getHttpServer())
      .get('/auth/private')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        email: testingUser.email,
        fullName: testingUser.fullName,
        isActive: true,
        roles: ['user'],
      },
      userEmail: testingUser.email,
      rawHeaders: [
        'Host',
        expect.stringContaining('127.0.0.1'),
        'Accept-Encoding',
        'gzip, deflate',
        'Authorization',
        expect.stringContaining('Bearer'),
        'Connection',
        'close',
      ],
    });
  });

  it('should return 403 if user token is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/private3')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({
      error: 'Forbidden',
      message: 'User Testing User need a valid role: [admin]',
      statusCode: 403,
    });
  });

  it('should return user if admin token is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/private3')
      .set('Authorization', `Bearer ${adminToken}`);

    const userId = response.body.user.id;

    expect(validate(userId)).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      user: {
        id: expect.any(String),
        email: testingAdmin.email,
        fullName: testingAdmin.fullName,
        isActive: true,
        roles: ['admin', 'super-user'],
      },
    });
  });
});
