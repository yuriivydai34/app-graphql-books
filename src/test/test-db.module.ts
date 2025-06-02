import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://user1:pwd123@192.168.0.234:27017/mydb1_test'),
  ],
})
export class TestDbModule {} 