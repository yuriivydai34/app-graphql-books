import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Book {
  @PrimaryGeneratedColumn()
  @Field(() => Int, { description: 'Example field (placeholder)' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Example field (placeholder)' })
  title: string;

  @Column()
  @Field(() => String, { description: 'Example field (placeholder)' })
  author: string;

  @CreateDateColumn()
  @Field(() => Date, { description: 'Example field (placeholder)' })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { description: 'Example field (placeholder)' })
  updatedAt: Date;
}
