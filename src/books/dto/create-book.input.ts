import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateBookInput {
  @Field(() => String, { description: 'Example field (placeholder)' })
  title: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  author: string;
}
