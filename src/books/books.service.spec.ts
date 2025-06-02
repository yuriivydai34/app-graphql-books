import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';

describe('BooksService', () => {
  let service: BooksService;
  let repository: Repository<Book>;

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const createBookDto = {
        title: 'Test Book',
        author: 'Test Author',
      };

      const expectedBook = {
        id: 1,
        ...createBookDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.save.mockResolvedValue(expectedBook);

      const result = await service.create(createBookDto);
      expect(result).toEqual(expectedBook);
      expect(mockRepository.save).toHaveBeenCalledWith(createBookDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const expectedBooks = [
        {
          id: 1,
          title: 'Test Book 1',
          author: 'Test Author 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Test Book 2',
          author: 'Test Author 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(expectedBooks);

      const result = await service.findAll();
      expect(result).toEqual(expectedBooks);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single book', async () => {
      const bookId = 1;
      const expectedBook = {
        id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(expectedBook);

      const result = await service.findOne(bookId);
      expect(result).toEqual(expectedBook);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: bookId },
      });
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const bookId = 1;
      const updateBookDto = {
        id: bookId,
        title: 'Updated Book',
        author: 'Updated Author',
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.update(bookId, updateBookDto);
      expect(mockRepository.update).toHaveBeenCalledWith(bookId, updateBookDto);
    });
  });

  describe('remove', () => {
    it('should remove a book', async () => {
      const bookId = 1;

      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(bookId);
      expect(mockRepository.delete).toHaveBeenCalledWith(bookId);
    });
  });
});
