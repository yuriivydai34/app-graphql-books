import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access token when credentials are valid', async () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        password: 'testpass',
      };

      const expectedToken = 'test-jwt-token';

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.signIn('testuser', 'testpass');

      expect(result).toEqual({
        access_token: expectedToken,
      });

      expect(mockUsersService.findOne).toHaveBeenCalledWith('testuser');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.userId,
        username: mockUser.username,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.signIn('wronguser', 'wrongpass')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUsersService.findOne).toHaveBeenCalledWith('wronguser');
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        password: 'correctpass',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);

      await expect(service.signIn('testuser', 'wrongpass')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUsersService.findOne).toHaveBeenCalledWith('testuser');
    });
  });
});
