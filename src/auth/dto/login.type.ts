import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  access_token: string;
} 