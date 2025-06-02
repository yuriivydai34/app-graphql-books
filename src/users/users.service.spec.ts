import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((str) => Promise.resolve(`hashed_${str}`)),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto = {
        username: 'testuser',
        password: 'testpass',
      };

      const expectedUser = {
        id: 1,
        username: 'testuser',
        password: 'hashed_testpass',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedUser);
      mockRepository.save.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual(expectedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed_testpass',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        {
          id: 1,
          username: 'user1',
          password: 'hashed_pass1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          username: 'user2',
          password: 'hashed_pass2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findAll();
      expect(result).toEqual(expectedUsers);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a user by username', async () => {
      const username = 'testuser';
      const expectedUser = {
        id: 1,
        username,
        password: 'hashed_pass',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOne(username);
      expect(result).toEqual(expectedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const id = 1;
      const expectedUser = {
        id,
        username: 'testuser',
        password: 'hashed_pass',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findById(id);
      expect(result).toEqual(expectedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const id = 1;
      const updateUserDto = {
        id,
        username: 'updateduser',
        password: 'newpassword',
      };

      const existingUser = {
        id,
        username: 'testuser',
        password: 'hashed_oldpass',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedUser = {
        ...existingUser,
        username: updateUserDto.username,
        password: 'hashed_newpassword',
      };

      mockRepository.findOne
        .mockResolvedValueOnce(existingUser)  // First call for checking existence
        .mockResolvedValueOnce(expectedUser); // Second call after update
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(id, updateUserDto);

      expect(result).toEqual(expectedUser);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockRepository.update).toHaveBeenCalledWith(id, {
        ...updateUserDto,
        password: 'hashed_newpassword',
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const id = 999;
      const updateUserDto = {
        id,
        username: 'updateduser',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = 1;
      const expectedUser = {
        id,
        username: 'testuser',
        password: 'hashed_pass',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(expectedUser);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(id);
      expect(result).toEqual(expectedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const id = 999;
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
