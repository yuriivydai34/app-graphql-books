import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getModelToken } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import { Model } from 'mongoose';
import { TestDbModule } from '../test/test-db.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BookSchema } from './schemas/book.schema';
import { NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;
  let model: Model<Book>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }])
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
      };

      const book = await service.create(createBookDto);

      expect(book.title).toBe(createBookDto.title);
      expect(book.author).toBe(createBookDto.author);
      expect(book._id).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const books = [
        { title: 'Book 1', author: 'Author 1' },
        { title: 'Book 2', author: 'Author 2' },
      ];

      const savedBooks = await model.create(books);
      expect(savedBooks).toBeDefined();

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Book 1');
      expect(result[1].title).toBe('Book 2');
    });
  });

  describe('findOne', () => {
    it('should find a book by id', async () => {
      const book = await model.create({
        title: 'Test Book',
        author: 'Test Author',
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
