import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getModelToken } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import { Model } from 'mongoose';
import { TestDbModule } from '../test/test-db.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BookSchema } from './schemas/book.schema';
import { NotFoundException } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { PaginationArgs } from './dto/pagination.args';

describe('BooksService', () => {
  let service: BooksService;
  let model: Model<Book>;

  const mockAdminUser = {
    id: '1',
    isAdmin: true,
  };

  const defaultPaginationArgs: PaginationArgs = {
    page: 1,
    limit: 10,
    sortBy: 'title',
    sortOrder: 'ASC'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
        CaslModule
      ],
      providers: [BooksService],
    }).compile();

    service = module.get<BooksService>(BooksService);
    model = module.get<Model<Book>>(getModelToken(Book.name));

    // Clear the database before each test
    await model.deleteMany({});
  });

  afterEach(async () => {
    // Clean up after each test
    await model.deleteMany({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a book', async () => {
      const createBookDto = {
        title: 'Test Book',
        author: 'Test Author',
        authorId: mockAdminUser.id,
      };

      const book = await service.create(createBookDto);

      expect(book.title).toBe(createBookDto.title);
      expect(book.author).toBe(createBookDto.author);
      expect(book.authorId).toBe(createBookDto.authorId);
      expect(book._id).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return paginated books for admin user', async () => {
      const books = [
        { title: 'Book 1', author: 'Author 1', authorId: mockAdminUser.id },
        { title: 'Book 2', author: 'Author 2', authorId: mockAdminUser.id },
      ];

      const savedBooks = await model.create(books);
      expect(savedBooks).toBeDefined();

      const result = await service.findAll(defaultPaginationArgs, mockAdminUser);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].title).toBe('Book 1');
      expect(result.data[1].title).toBe('Book 2');
      expect(result.meta.totalItems).toBe(2);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should return an empty array for unauthorized user', async () => {
      const unauthorizedUser = {
        id: '2',
        isAdmin: false,
      };

      const result = await service.findAll(defaultPaginationArgs, unauthorizedUser);
      expect(result.data).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should handle search parameter', async () => {
      const books = [
        { title: 'First Book', author: 'Author 1', authorId: mockAdminUser.id },
        { title: 'Second Book', author: 'Author 2', authorId: mockAdminUser.id },
        { title: 'Third Book', author: 'Special Author', authorId: mockAdminUser.id },
      ];

      await model.create(books);

      const searchArgs: PaginationArgs = {
        ...defaultPaginationArgs,
        search: 'Special'
      };

      const result = await service.findAll(searchArgs, mockAdminUser);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].author).toBe('Special Author');
      expect(result.meta.totalItems).toBe(1);
    });

    it('should handle sorting', async () => {
      const books = [
        { title: 'C Book', author: 'Author 1', authorId: mockAdminUser.id },
        { title: 'A Book', author: 'Author 2', authorId: mockAdminUser.id },
        { title: 'B Book', author: 'Author 3', authorId: mockAdminUser.id },
      ];

      await model.create(books);

      const sortArgs: PaginationArgs = {
        ...defaultPaginationArgs,
        sortBy: 'title',
        sortOrder: 'DESC'
      };

      const result = await service.findAll(sortArgs, mockAdminUser);
      expect(result.data).toHaveLength(3);
      expect(result.data[0].title).toBe('C Book');
      expect(result.data[1].title).toBe('B Book');
      expect(result.data[2].title).toBe('A Book');
    });
  });

  describe('findOne', () => {
    it('should find a book by id', async () => {
      const book = await model.create({
        title: 'Test Book',
        author: 'Test Author',
        authorId: mockAdminUser.id,
      });

      const found = await service.findOne(book._id.toString());
      expect(found).toBeDefined();
      if (!found) throw new Error('Book should be found');
      
      expect(found.title).toBe(book.title);
      expect(found._id.toString()).toBe(book._id.toString());
    });

    it('should throw NotFoundException when book not found', async () => {
      await expect(service.findOne('000000000000000000000000')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const book = await model.create({
        title: 'Old Title',
        author: 'Old Author',
        authorId: mockAdminUser.id,
      });

      const updateBookDto = {
        id: book._id.toString(),
        title: 'New Title',
        author: 'New Author',
      };

      const updated = await service.update(book._id.toString(), updateBookDto);
      expect(updated).toBeDefined();
      if (!updated) throw new Error('Updated book should be defined');

      expect(updated.title).toBe('New Title');
      expect(updated.author).toBe('New Author');
      expect(updated.authorId).toBe(mockAdminUser.id);
    });

    it('should throw NotFoundException when book not found', async () => {
      await expect(
        service.update('000000000000000000000000', {
          id: '000000000000000000000000',
          title: 'New Title',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a book', async () => {
      const book = await model.create({
        title: 'Test Book',
        author: 'Test Author',
        authorId: mockAdminUser.id,
      });

      const removed = await service.remove(book._id.toString());
      expect(removed).toBeDefined();
      if (!removed) throw new Error('Removed book should be defined');

      expect(removed._id.toString()).toBe(book._id.toString());

      const found = await model.findById(book._id);
      expect(found).toBeNull();
    });

    it('should throw NotFoundException when book not found', async () => {
      await expect(
        service.remove('000000000000000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
