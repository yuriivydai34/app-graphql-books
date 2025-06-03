import { Test, TestingModule } from '@nestjs/testing';
import { BooksResolver } from './books.resolver';
import { BooksService } from './books.service';
import { Types } from 'mongoose';
import { PaginationArgs } from './dto/pagination.args';

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

  const mockContext = {
    req: {
      user: {
        id: '1',
        isAdmin: true
      }
    }
  };

  const defaultPaginationArgs: PaginationArgs = {
    page: 1,
    limit: 10,
    sortBy: 'title',
    sortOrder: 'ASC'
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
        authorId: mockContext.req.user.id,
      };

      const expectedBook = {
        _id: new Types.ObjectId().toString(),
        title: 'Test Book',
        author: 'Test Author',
        authorId: mockContext.req.user.id,
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
    it('should return paginated books for admin user', async () => {
      const expectedBooks = {
        data: [
          {
            _id: new Types.ObjectId().toString(),
            title: 'Book 1',
            author: 'Author 1',
            authorId: mockContext.req.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: new Types.ObjectId().toString(),
            title: 'Book 2',
            author: 'Author 2',
            authorId: mockContext.req.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: {
          itemsPerPage: 10,
          totalItems: 2,
          currentPage: 1,
          totalPages: 1,
          sortBy: [['title', 'ASC']],
          searchBy: ['title', 'author'],
          search: '',
          select: ['title', 'author', 'createdAt'],
          filter: ''
        },
        links: {
          current: ''
        }
      };

      mockBooksService.findAll.mockResolvedValue(expectedBooks);

      const result = await resolver.findAll(mockContext.req, defaultPaginationArgs);
      expect(result).toEqual(expectedBooks);
      expect(mockBooksService.findAll).toHaveBeenCalledWith(defaultPaginationArgs, mockContext.req.user);
    });

    it('should handle unauthorized access', async () => {
      const unauthorizedContext = {
        req: {
          user: {
            id: '2',
            isAdmin: false
          }
        }
      };

      const expectedResponse = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 0,
          currentPage: 1,
          totalPages: 0,
          sortBy: [['title', 'ASC']],
          searchBy: ['title', 'author'],
          search: '',
          select: ['title', 'author', 'createdAt'],
          filter: ''
        },
        links: {
          current: ''
        }
      };

      mockBooksService.findAll.mockResolvedValue(expectedResponse);

      const result = await resolver.findAll(unauthorizedContext.req, defaultPaginationArgs);
      expect(result).toEqual(expectedResponse);
      expect(mockBooksService.findAll).toHaveBeenCalledWith(defaultPaginationArgs, unauthorizedContext.req.user);
    });
  });

  describe('findOne', () => {
    it('should return a single book', async () => {
      const bookId = new Types.ObjectId().toString();
      const expectedBook = {
        _id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        authorId: mockContext.req.user.id,
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
        authorId: mockContext.req.user.id,
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
        authorId: mockContext.req.user.id,
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
