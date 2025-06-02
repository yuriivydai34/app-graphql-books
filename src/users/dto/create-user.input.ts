import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @IsString()
  @MinLength(4)
  @Field(() => String)
  username: string;

  @IsString()
  @MinLength(6)
  @Field(() => String)
  password: string;
} 