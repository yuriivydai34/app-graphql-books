import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from './casl/casl.module';

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as WinstonGraylog2 from 'winston-graylog2';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console(),
        new WinstonGraylog2({
          name: 'Graylog',
          level: 'info',
          silent: false,
          handleExceptions: true,
          graylog: {
            servers: [{ host: 'localhost', port: 12201 }],
            hostname: 'nest-app',
            facility: 'nest-graylog',
            bufferSize: 1400,
          },
          staticMeta: {
            env: process.env.NODE_ENV || 'development',
          },
        }),
      ],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/nest-app'),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    AuthModule,
    UsersModule,
    BooksModule,
    CaslModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
