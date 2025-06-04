import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '../auth/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let imageRepository: Repository<ProductImage>;

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 'UUID-VALID',
        title: 'Product 1',
        slug: 'product-1',
        images: [
          {
            id: '1',
            url: 'image1.jpg',
          },
        ],
      }),
    };

    const mockProductRepository = {
      create: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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

  it('should find all products', async () => {
    const dto: PaginationDto = {
      limit: 10,
      offset: 0,
    };

    const products = [
      {
        id: '1',
        title: 'Test Product 1',
        images: [{ id: 1, url: 'image1.jpg' }],
      },
      {
        id: '2',
        title: 'Test Product 2',
        images: [{ id: 2, url: 'image2.jpg' }],
      },
    ] as Product[];

    jest.spyOn(productRepository, 'find').mockResolvedValue(products);
    jest.spyOn(productRepository, 'count').mockResolvedValue(products.length);

    const result = await service.findAll(dto);

    expect(result).toEqual({
      count: products.length,
      pages: dto.offset + 1,
      products: products.map((product) => ({
        ...product,
        images: product.images.map((img) => img.url),
      })),
    });
  });

  it('should find a product by id', async () => {
    const productId = '01cf0faf-00f9-4cfb-b27f-1f4ad57dda16';
    const product = {
      id: productId,
      title: 'Product 1',
    } as Product;

    jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(product);

    const result = await service.findOne(productId);

    expect(result).toEqual(product);
  });

  it('should throw error if id was not found', async () => {
    const productId = '01cf0faf-00f9-4cfb-b27f-1f4ad57dda16';

    jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(undefined);

    await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(productId)).rejects.toThrow(
      `Product with ${productId} not found`,
    );
  });

  it('should return product by term or slug', async () => {
    const result = await service.findOne('Product 1');

    expect(result).toEqual({
      id: 'UUID-VALID',
      title: 'Product 1',
      slug: 'product-1',
      images: [{ id: '1', url: 'image1.jpg' }],
    });
  });

  it('should throw an error NotFoundException if product not found', async () => {
    const productId = '01cf0faf-00f9-4cfb-b27f-1f4ad57dda16';

    const dto = {} as UpdateProductDto;
    const user = {} as User;

    jest.spyOn(productRepository, 'preload').mockResolvedValue(undefined);

    await expect(service.update(productId, dto, user)).rejects.toThrow(
      new NotFoundException(`Product with ${productId} not found`),
    );
  });

  it('should update product successfully', async () => {
    const productId = 'ABC';

    const dto = {
      title: 'Updated Product',
      slug: 'updated-product',
    } as UpdateProductDto;

    const user = { id: '1', fullName: 'Sergio Barreras' } as User;

    const product = {
      ...dto,
      price: 100,
      description: 'some description',
    } as unknown as Product;

    jest.spyOn(productRepository, 'preload').mockResolvedValue(product);

    const updatedProduct = await service.update(productId, dto, user);

    expect(updatedProduct).toEqual({
      id: 'UUID-VALID',
      title: 'Product 1',
      slug: 'product-1',
      images: ['image1.jpg'],
    });
  });
});
