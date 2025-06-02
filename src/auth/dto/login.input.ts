import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field(() => String, { description: 'Username of the account to login with' })
  username: string;

  @Field(() => String, { description: 'Password of the account to login with' })
  password: string;
} 