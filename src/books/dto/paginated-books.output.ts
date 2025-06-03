import { Field, ObjectType } from '@nestjs/graphql';
import { Book } from '../schemas/book.schema';

@ObjectType()
class PaginationMeta {
  @Field()
  itemsPerPage: number;

  @Field()
  totalItems: number;

  @Field()
  currentPage: number;

  @Field()
  totalPages: number;

  @Field(() => [[String]])
  sortBy: [string, string][];

  @Field(() => [String])
  searchBy: string[];

  @Field()
  search: string;

  @Field(() => [String])
  select: string[];

  @Field(() => String, { nullable: true })
  filter?: string;
}

@ObjectType()
class PaginationLinks {
  @Field()
  current: string;
}

@ObjectType()
export class PaginatedBooks {
  @Field(() => [Book])
  data: Book[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;

  @Field(() => PaginationLinks)
  links: PaginationLinks;
} 