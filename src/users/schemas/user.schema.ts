import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class User extends Document {
  @Field(() => ID, { description: 'Unique identifier for the user' })
  declare _id: string;

  @Field(() => String, { description: 'Unique username for the user account' })
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Field(() => Date, { description: 'Timestamp of when the user account was created' })
  createdAt: Date;

  @Field(() => Date, { description: 'Timestamp of when the user account was last updated' })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);