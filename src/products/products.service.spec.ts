import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '../auth/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let imageRepository: Repository<ProductImage>;

  beforeEach(async () => {
    const mockProductRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn(),
      preload: jest.fn(),
      remove: jest.fn(),
    };

    const mockImageRepository = {
      create: jest.fn(),
    };

    const mockDatasource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          delete: jest.fn(),
          save: jest.fn(),
        },
        commitTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: mockImageRepository,
        },
        {
          provide: DataSource,
          useValue: mockDatasource,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    imageRepository = module.get<Repository<ProductImage>>(
      getRepositoryToken(ProductImage),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const dto = {
      title: 'Test Product',
      price: 100,
      images: ['img1.png'],
    } as CreateProductDto;

    const { images: dtoWithNoImages, ...createDto } = dto;

    const user = {
      id: '1',
      email: 'test@google.com',
    } as User;

    const product = {
      id: '1',
      ...createDto,
      user,
    } as unknown as Product;

    jest.spyOn(productRepository, 'create').mockReturnValue(product);
    jest.spyOn(productRepository, 'save').mockResolvedValue(product);
    jest
      .spyOn(imageRepository, 'create')
      .mockImplementation((imageData) => imageData as unknown as ProductImage);

    const result = await service.create(dto, user);

    expect(result).toEqual({
      id: '1',
      title: 'Test Product',
      price: 100,
      images: ['img1.png'],
      user: { id: '1', email: 'test@google.com' },
    });
  });

  it('should throw a BadRequestException if create product fails', async () => {
    const dto = {} as CreateProductDto;
    const user = {} as User;

    jest
      .spyOn(productRepository, 'save')
      .mockRejectedValue({ code: '23505', detail: 'Something went wrong' });

    await expect(service.create(dto, user)).rejects.toThrow(
      BadRequestException,
    );
  });
});
