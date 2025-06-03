import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { Types } from 'mongoose';

// Create a mock AuthGuard
const mockAuthGuard = jest.fn().mockImplementation(() => ({
  canActivate: jest.fn().mockReturnValue(true),
}));

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockContext = {
    req: {
      user: {
        id: '1',
        isAdmin: true,
      }
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard())
      .compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserInput = {
        username: 'testuser',
        password: 'testpass',
      };

      const expectedUser = {
        _id: new Types.ObjectId().toString(),
        username: 'testuser',
        password: 'hashedpass',
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
      };

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await resolver.createUser(createUserInput);
      expect(result).toEqual(expectedUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserInput);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        {
          _id: new Types.ObjectId().toString(),
          username: 'user1',
          password: 'hashedpass1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isAdmin: false,
        },
        {
          _id: new Types.ObjectId().toString(),
          username: 'user2',
          password: 'hashedpass2',
          createdAt: new Date(),
          updatedAt: new Date(),
          isAdmin: false,
        },
      ];

      mockUsersService.findAll.mockResolvedValue(expectedUsers);

      const result = await resolver.findAll();
      expect(result).toEqual(expectedUsers);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const userId = new Types.ObjectId().toString();
      const expectedUser = {
        _id: userId,
        username: 'testuser',
        password: 'hashedpass',
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
      };

      mockUsersService.findById.mockResolvedValue(expectedUser);

      const result = await resolver.findOne(userId);
      expect(result).toEqual(expectedUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = new Types.ObjectId().toString();
      const updateUserInput = {
        id: userId,
        username: 'updateduser',
      };

      const expectedUser = {
        _id: userId,
        username: 'updateduser',
        password: 'hashedpass',
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
      };

      mockUsersService.update.mockResolvedValue(expectedUser);

      const result = await resolver.updateUser(updateUserInput, mockContext.req);
      expect(result).toEqual(expectedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        updateUserInput.id,
        updateUserInput,
        mockContext.req.user,
      );
    });
  });

  describe('removeUser', () => {
    it('should remove a user', async () => {
      const userId = new Types.ObjectId().toString();
      const expectedUser = {
        _id: userId,
        username: 'testuser',
        password: 'hashedpass',
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
      };

      mockUsersService.remove.mockResolvedValue(expectedUser);

      const result = await resolver.removeUser(userId);
      expect(result).toEqual(expectedUser);
      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
    });
  });
}); 