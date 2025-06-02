import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UserProfile {
  @Field(() => Int)
  sub: number;

  @Field(() => String)
  username: string;
} 