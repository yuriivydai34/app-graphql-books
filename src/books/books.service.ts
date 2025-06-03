import { Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>, 
    private caslAbilityFactory: CaslAbilityFactory) {}

  async create(createBookInput: CreateBookInput): Promise<Book> {
    const createdBook = new this.bookModel(createBookInput);
    return createdBook.save();
  }

  async findAll(query: PaginationArgs, user: any): Promise<PaginatedBooks> {
    const ability = this.caslAbilityFactory.createForUser(user);
    if (ability.can(Action.Read, 'all')) {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const queryBuilder = this.bookModel.find();
      
      // Apply sorting
      if (query.sortBy) {
        const sortOrder = query.sortOrder === 'DESC' ? -1 : 1;
        queryBuilder.sort({ [query.sortBy]: sortOrder });
      } else {
        queryBuilder.sort({ title: 1 });
      }

      // Apply search
      if (query.search) {
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
        } catch (e) {
          // Invalid JSON string - ignore filter
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
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: string, updateBookInput: UpdateBookInput): Promise<Book> {
    const updatedBook = await this.bookModel
      .findByIdAndUpdate(id, updateBookInput, { new: true })
      .exec();
    
    if (!updatedBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return updatedBook;
  }

  async remove(id: string): Promise<Book> {
    const deletedBook = await this.bookModel.findByIdAndDelete(id).exec();
    if (!deletedBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return deletedBook;
  }
}
