import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateBookInput {
  @Field(() => String, { description: 'The title of the book to create' })
  title: string;

  @Field(() => String, { description: 'The author of the book to create' })
  author: string;
}
