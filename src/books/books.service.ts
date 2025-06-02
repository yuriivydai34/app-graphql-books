import { Injectable } from '@nestjs/common';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  create(createBookInput: CreateBookInput) {
    return this.booksRepository.save(createBookInput);
  }

  findAll() {
    return this.booksRepository.find();
  }

  findOne(id: number) {
    return this.booksRepository.findOne({ where: { id } });
  }

  update(id: number, updateBookInput: UpdateBookInput) {
    return this.booksRepository.update(id, updateBookInput);
  }

  remove(id: number) {
    return this.booksRepository.delete(id);
  }
}
