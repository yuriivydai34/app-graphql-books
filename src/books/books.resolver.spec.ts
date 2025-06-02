import { Test, TestingModule } from '@nestjs/testing';
import { BooksResolver } from './books.resolver';
import { BooksService } from './books.service';
import { Types } from 'mongoose';

describe('BooksResolver', () => {
  let resolver: BooksResolver;
  let booksService: BooksService;

  const mockBooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksResolver,
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    }).compile();

    resolver = module.get<BooksResolver>(BooksResolver);
    booksService = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createBook', () => {
    it('should create a new book', async () => {
      const createBookInput = {
        title: 'Test Book',
        author: 'Test Author',
      };

      const expectedBook = {
        _id: new Types.ObjectId().toString(),
        title: 'Test Book',
        author: 'Test Author',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBooksService.create.mockResolvedValue(expectedBook);

      const result = await resolver.createBook(createBookInput);
      expect(result).toEqual(expectedBook);
      expect(mockBooksService.create).toHaveBeenCalledWith(createBookInput);
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const expectedBooks = [
        {
          _id: new Types.ObjectId().toString(),
          title: 'Book 1',
          author: 'Author 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId().toString(),
          title: 'Book 2',
          author: 'Author 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockBooksService.findAll.mockResolvedValue(expectedBooks);

      const result = await resolver.findAll();
      expect(result).toEqual(expectedBooks);
      expect(mockBooksService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single book', async () => {
      const bookId = new Types.ObjectId().toString();
      const expectedBook = {
        _id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBooksService.findOne.mockResolvedValue(expectedBook);

      const result = await resolver.findOne(bookId);
      expect(result).toEqual(expectedBook);
      expect(mockBooksService.findOne).toHaveBeenCalledWith(bookId);
    });
  });

  describe('updateBook', () => {
    it('should update a book', async () => {
      const bookId = new Types.ObjectId().toString();
      const updateBookInput = {
        id: bookId,
        title: 'Updated Book',
        author: 'Updated Author',
      };

      const expectedBook = {
        _id: bookId,
        ...updateBookInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBooksService.update.mockResolvedValue(expectedBook);

      const result = await resolver.updateBook(updateBookInput);
      expect(result).toEqual(expectedBook);
      expect(mockBooksService.update).toHaveBeenCalledWith(
        updateBookInput.id,
        updateBookInput,
      );
    });
  });

  describe('removeBook', () => {
    it('should remove a book', async () => {
      const bookId = new Types.ObjectId().toString();
      const expectedBook = {
        _id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBooksService.remove.mockResolvedValue(expectedBook);

      const result = await resolver.removeBook(bookId);
      expect(result).toEqual(expectedBook);
      expect(mockBooksService.remove).toHaveBeenCalledWith(bookId);
    });
  });
});
