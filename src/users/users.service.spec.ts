import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { TestDbModule } from '../test/test-db.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((str) => Promise.resolve(`hashed_${str}`)),
}));

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));

    // Clear the database before each test
    await model.deleteMany({});
  });

  afterEach(async () => {
    // Clean up after each test
    await model.deleteMany({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const createUserDto = {
        username: 'testuser',
        password: 'testpass',
      };

      const user = await service.create(createUserDto);
      expect(user).toBeDefined();
      expect(user.username).toBe(createUserDto.username);
      expect(user.password).toBe(`hashed_${createUserDto.password}`);
      expect(user._id).toBeDefined();
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { username: 'user1', password: 'hashed_pass1' },
        { username: 'user2', password: 'hashed_pass2' },
      ];

      const savedUsers = await model.create(users);
      expect(savedUsers).toBeDefined();

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].username).toBe('user1');
      expect(result[1].username).toBe('user2');
    });
  });

  describe('findOne', () => {
    it('should find a user by username', async () => {
      const user = await model.create({
        username: 'testuser',
        password: 'hashed_testpass',
      });

      const found = await service.findOne('testuser');
      expect(found).toBeDefined();
      if (!found) throw new Error('User should be found');

      expect(found.username).toBe(user.username);
      expect(found._id.toString()).toBe(user._id.toString());
    });

    it('should return null if user not found', async () => {
      const found = await service.findOne('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const user = await model.create({
        username: 'testuser',
        password: 'hashed_testpass',
      });

      const found = await service.findById(user._id.toString());
      expect(found).toBeDefined();
      if (!found) throw new Error('User should be found');

      expect(found.username).toBe(user.username);
      expect(found._id.toString()).toBe(user._id.toString());
    });

    it('should return null if user not found', async () => {
      const found = await service.findById('000000000000000000000000');
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user = await model.create({
        username: 'oldusername',
        password: 'hashed_oldpass',
      });

      const updateUserDto = {
        id: user._id.toString(),
        username: 'newusername',
        password: 'newpass',
      };

      const updated = await service.update(user._id.toString(), updateUserDto);
      expect(updated).toBeDefined();
      if (!updated) throw new Error('Updated user should be defined');

      expect(updated.username).toBe('newusername');
      expect(updated.password).toBe('hashed_newpass');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
    });

    it('should throw NotFoundException if user not found', async () => {
      await expect(
        service.update('000000000000000000000000', {
          id: '000000000000000000000000',
          username: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const user = await model.create({
        username: 'testuser',
        password: 'hashed_testpass',
      });

      const removed = await service.remove(user._id.toString());
      expect(removed).toBeDefined();
      if (!removed) throw new Error('Removed user should be defined');

      expect(removed._id.toString()).toBe(user._id.toString());

      const found = await model.findById(user._id);
      expect(found).toBeNull();
    });

    it('should throw NotFoundException if user not found', async () => {
      await expect(
        service.remove('000000000000000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
