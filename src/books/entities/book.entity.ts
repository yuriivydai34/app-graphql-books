import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Book {
  @PrimaryGeneratedColumn()
  @Field(() => Int, { description: 'Unique identifier for the book' })
  id: number;

  @Column()
  @Field(() => String, { description: 'The title of the book' })
  title: string;

  @Column()
  @Field(() => String, { description: 'The author of the book' })
  author: string;

  @CreateDateColumn()
  @Field(() => Date, { description: 'Timestamp of when the book was added to the system' })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { description: 'Timestamp of when the book was last updated' })
  updatedAt: Date;
}
