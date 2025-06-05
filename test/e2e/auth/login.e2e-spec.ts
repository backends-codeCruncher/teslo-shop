import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../../../src/auth/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { testingAdmin, testingUser } from '../../../test/testing-users';

describe('Auth - Login (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

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

    await request(app.getHttpServer()).post('/auth/register').send(testingUser);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingAdmin);

    await userRepository.update(
      {
        email: testingAdmin.email,
      },
      { roles: ['admin'] },
    );
  });

  afterAll(async () => {
    await userRepository.delete({ email: testingUser.email });
    await userRepository.delete({ email: testingAdmin.email });

    await app.close();
  });

  it('/auth/login (POST) - should throw 400 if no body', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login');

    const errorMessages = [
      'email must be an email',
      'email must be a string',
      'The password must have a Uppercase, lowercase letter and a number',
      'password must be shorter than or equal to 50 characters',
      'password must be longer than or equal to 6 characters',
      'password must be a string',
    ];

    expect(response.statusCode).toBe(400);

    errorMessages.forEach((message) => {
      expect(response.body.message).toContain(message);
    });
  });

  it('/auth/login (POST) - wrong credentials - email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'testingUser.email@google.com',
        password: testingUser.password,
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      message: 'User not found',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('/auth/login (POST) - wrong credentials - password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testingUser.email,
        password: 'testingUser.password',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      message: 'User not valid',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('/auth/login (POST) - valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testingAdmin.email,
        password: testingAdmin.password,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        email: testingAdmin.email,
        fullName: testingAdmin.fullName,
        isActive: true,
        roles: ['admin'],
      },
      token: expect.any(String),
    });
  });
});
