import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { BooksService } from './books.service';
import { Book } from './schemas/book.schema';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { PaginatedBooks } from './dto/paginated-books.output';
import { PaginationArgs } from './dto/pagination.args';

@Resolver(() => Book)
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  @Mutation(() => Book)
  createBook(@Args('createBookInput') createBookInput: CreateBookInput) {
    return this.booksService.create(createBookInput);
  }

  @Query(() => PaginatedBooks, { name: 'books', description: 'Get a paginated list of books' })
  findAll(
    @Context('req') request: any,
    @Args() paginationArgs: PaginationArgs
  ): Promise<PaginatedBooks> {
    return this.booksService.findAll(paginationArgs, request.user);
  }

  @Query(() => Book, { name: 'book' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.booksService.findOne(id);
  }

  @Mutation(() => Book)
  updateBook(@Args('updateBookInput') updateBookInput: UpdateBookInput) {
    return this.booksService.update(updateBookInput.id, updateBookInput);
  }

  @Mutation(() => Book)
  removeBook(@Args('id', { type: () => ID }) id: string) {
    return this.booksService.remove(id);
  }
}
