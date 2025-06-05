import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/auth/entities/user.entity';

const testingUser = {
  email: 'testing.user@google.com',
  password: 'Abc12345',
  fullName: 'Testing User',
};

describe('Auth - Register (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeEach(async () => {
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
  });

  afterEach(async () => {
    await userRepository.delete({ email: testingUser.email });
    await app.close();
  });

  it('/auth/register (POST) - no body', async () => {
    // Evaluar errores esperados
    const response = await request(app.getHttpServer()).post('/auth/register');

    const errorMessages = [
      'email must be an email',
      'email must be a string',
      'The password must have a Uppercase, lowercase letter and a number',
      'password must be shorter than or equal to 50 characters',
      'password must be longer than or equal to 6 characters',
      'password must be a string',
      'fullName must be longer than or equal to 1 characters',
      'fullName must be a string',
    ];

    expect(response.statusCode).toBe(400);
    errorMessages.forEach((message) => {
      expect(response.body.message).toContain(message);
    });
  });

  it('/auth/register (POST) - same email', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(testingUser);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: `Key (email)=(${testingUser.email}) already exists.`,
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('/auth/register (POST) - unsafe password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...testingUser,
        password: 'abc123',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: [
        'The password must have a Uppercase, lowercase letter and a number',
      ],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('/auth/register (POST) - valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      user: {
        email: testingUser.email,
        fullName: testingUser.fullName,
        id: expect.any(String),
        isActive: true,
        roles: ['user'],
      },
      token: expect.any(String),
    });
  });
});
