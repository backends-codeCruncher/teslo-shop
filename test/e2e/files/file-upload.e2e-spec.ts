import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import * as request from 'supertest';
import { join } from 'path';
import { existsSync, unlink, unlinkSync } from 'fs';

describe('Files - Upload (e2e)', () => {
  let app: INestApplication;

  const testImagePath = join(__dirname, 'test-image.jpg');

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('should throw an error if not file selected', async () => {
    const response = await request(app.getHttpServer()).post('/files/product');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Make sure that file is an image',
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should throw an error if file is not valid', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/product')
      .attach('file', Buffer.from('This is a test file'), 'test.txt');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Make sure that file is an image',
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should upload image file succesfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/product')
      .attach('file', testImagePath);

    const fileName = response.body.fileName;

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('secureUrl');
    expect(response.body).toHaveProperty('fileName');
    expect(response.body.secureUrl).toContain('/files/product');

    const filePath = join(__dirname, '../../../static/products', fileName);
    const fileExist = existsSync(filePath);

    expect(fileExist).toBe(true);
    unlinkSync(filePath);
  });

  it('should throw an error if image does not exist', async () => {
    const response = await request(app.getHttpServer()).get(
      '/files/product/non-image.jpg',
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'No product found with image non-image.jpg',
      error: 'Not Found',
      statusCode: 404,
    });
  });
});
