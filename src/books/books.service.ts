import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './schemas/book.schema';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Action } from 'src/casl/action';
import { PaginationArgs } from './dto/pagination.args';
import { PaginatedBooks } from './dto/paginated-books.output';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>, 
    private caslAbilityFactory: CaslAbilityFactory) {}

  async create(createBookInput: CreateBookInput): Promise<Book> {
    this.logger.log(`Creating new book with title: ${createBookInput.title}`);
    const createdBook = new this.bookModel(createBookInput);
    const savedBook = await createdBook.save();
    this.logger.log(`Successfully created book with ID: ${savedBook._id}`);
    return savedBook;
  }

  async findAll(query: PaginationArgs, user: any): Promise<PaginatedBooks> {
    this.logger.log(`Fetching books with pagination: page=${query.page}, limit=${query.limit}`);
    const ability = this.caslAbilityFactory.createForUser(user);
    if (ability.can(Action.Read, 'all')) {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const queryBuilder = this.bookModel.find();
      
      // Apply sorting
      if (query.sortBy) {
        const sortOrder = query.sortOrder === 'DESC' ? -1 : 1;
        queryBuilder.sort({ [query.sortBy]: sortOrder });
        this.logger.debug(`Applying sort: ${query.sortBy} ${query.sortOrder}`);
      } else {
        queryBuilder.sort({ title: 1 });
      }

      // Apply search
      if (query.search) {
        this.logger.debug(`Applying search filter: ${query.search}`);
        queryBuilder.or([
          { title: { $regex: query.search, $options: 'i' } },
          { author: { $regex: query.search, $options: 'i' } }
        ]);
      }

      // Apply filter if it's a valid JSON string
      if (query.filter) {
        try {
          const filterObj = JSON.parse(query.filter);
          queryBuilder.where(filterObj);
          this.logger.debug(`Applying custom filter: ${query.filter}`);
        } catch (e) {
          this.logger.warn(`Invalid JSON filter provided: ${query.filter}`);
        }
      }

      const [data, total] = await Promise.all([
        queryBuilder
          .skip((page - 1) * limit)
          .limit(limit)
          .exec(),
        this.bookModel.countDocuments(queryBuilder.getFilter())
      ]);

      const totalPages = Math.ceil(total / limit);
      this.logger.log(`Found ${total} books, returning page ${page} of ${totalPages}`);

      return {
        data,
        meta: {
          itemsPerPage: limit,
          totalItems: total,
          currentPage: page,
          totalPages,
          sortBy: [[query.sortBy || 'title', query.sortOrder || 'ASC']],
          searchBy: ['title', 'author'],
          search: query.search || '',
          select: ['title', 'author', 'createdAt'],
          filter: query.filter || ''
        },
        links: {
          current: ''
        }
      };
    }
    this.logger.warn(`User ${user.id} does not have permission to read books`);
    return {
      data: [],
      meta: {
        itemsPerPage: query.limit || 10,
        totalItems: 0,
        currentPage: query.page || 1,
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
  }

  async findOne(id: string): Promise<Book | null> {
    this.logger.log(`Finding book with ID: ${id}`);
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      this.logger.warn(`Book with ID ${id} not found`);
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: string, updateBookInput: UpdateBookInput): Promise<Book> {
    this.logger.log(`Updating book with ID: ${id}`);
    const updatedBook = await this.bookModel
      .findByIdAndUpdate(id, updateBookInput, { new: true })
      .exec();
    
    if (!updatedBook) {
      this.logger.warn(`Book with ID ${id} not found for update`);
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    this.logger.log(`Successfully updated book with ID: ${id}`);
    return updatedBook;
  }

  async remove(id: string): Promise<Book> {
    this.logger.log(`Attempting to remove book with ID: ${id}`);
    const deletedBook = await this.bookModel.findByIdAndDelete(id).exec();
    if (!deletedBook) {
      this.logger.warn(`Book with ID ${id} not found for deletion`);
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    this.logger.log(`Successfully deleted book with ID: ${id}`);
    return deletedBook;
  }
}
