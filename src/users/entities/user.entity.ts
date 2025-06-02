import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int, { description: 'Unique identifier for the user' })
  id: number;

  @Column({ unique: true })
  @Field(() => String, { description: 'Unique username for the user account' })
  username: string;

  @Column()
  password: string;

  @CreateDateColumn()
  @Field(() => Date, { description: 'Timestamp of when the user account was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { description: 'Timestamp of when the user account was last updated' })
  updatedAt: Date;
} 