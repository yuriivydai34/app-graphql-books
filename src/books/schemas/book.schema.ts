import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class Book extends Document {
  @Field(() => ID, { description: 'Unique identifier for the book' })
  declare _id: string;

  @Field(() => String, { description: 'The title of the book' })
  @Prop({ required: true })
  title: string;

  @Field(() => String, { description: 'The author of the book' })
  @Prop({ required: true })
  author: string;

  @Field(() => Date, { description: 'Timestamp of when the book was added to the system' })
  createdAt: Date;

  @Field(() => Date, { description: 'Timestamp of when the book was last updated' })
  updatedAt: Date;

  @Field(() => Boolean, { description: 'Whether the book is published' })
  @Prop({ default: false })
  isPublished: boolean;

  @Field(() => String, { description: 'The ID of the author of the book' })
  @Prop({ required: true })
  authorId: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);