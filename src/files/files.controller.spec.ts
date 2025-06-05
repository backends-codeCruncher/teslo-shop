import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('FilesController', () => {
  let controller: FilesController;
  let fileService: FilesService;

  beforeEach(async () => {
    const mockFilesService = {
      getStaticProductImage: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: FilesService, useValue: mockFilesService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    fileService = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return file path when findProductImage is called', () => {
    const mockResponse = { sendFile: jest.fn() } as unknown as Response;
    const imageName = 'test-tmage.jpg';
    const filePath = `/static/products/${imageName}`;

    jest.spyOn(fileService, 'getStaticProductImage').mockReturnValue(filePath);

    controller.findProductImage(mockResponse, imageName);

    expect(mockResponse.sendFile).toHaveBeenCalledWith(filePath);
  });

  it('should return a secureUrl when upload image is called with a file', () => {
    const file = {
      file: 'test-image.jpg',
      filename: 'testImage',
    } as unknown as Express.Multer.File;

    const result = controller.uploadFile(file);

    console.log(result);

    expect(result).toEqual({
      secureUrl: 'http://localhost:3000/files/product/testImage',
      fileName: 'testImage',
    });
  });

  it('should throw a bad request exception if file is not provided', () => {
    expect(() => controller.uploadFile(null)).toThrow(BadRequestException);
  });
});
