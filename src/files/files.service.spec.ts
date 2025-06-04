import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { join } from 'path';
import { existsSync } from 'fs';
import { NotFoundException } from '@nestjs/common';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return path if image exists', () => {
    const imageName = 'test-image';
    const expectedPath = join(__dirname, '../../static/products', imageName);

    (existsSync as jest.Mock).mockReturnValue(true);

    const result = service.getStaticProductImage(imageName);

    expect(result).toBe(expectedPath);
  });

  it('should throw NotFoundException if the image does not exist', () => {
    const imageName = 'test-image';

    (existsSync as jest.Mock).mockReturnValue(false);

    expect(() => service.getStaticProductImage(imageName)).toThrow(
      NotFoundException,
    );
  });
});
