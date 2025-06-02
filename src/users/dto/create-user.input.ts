import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @IsString()
  @MinLength(4)
  @Field(() => String, { description: 'Username for the new account (minimum 4 characters)' })
  username: string;

  @IsString()
  @MinLength(6)
  @Field(() => String, { description: 'Password for the new account (minimum 6 characters)' })
  password: string;
} 