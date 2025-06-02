import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('login', () => {
    it('should return access token', async () => {
      const loginInput = {
        username: 'testuser',
        password: 'testpass',
      };

      const expectedResult = {
        access_token: 'test-token',
      };

      mockAuthService.signIn.mockResolvedValue(expectedResult);

      const result = await resolver.login(loginInput);
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        loginInput.username,
        loginInput.password,
      );
    });
  });

  describe('profile', () => {
    it('should return user profile from request', async () => {
      const mockUser = {
        sub: 1,
        username: 'testuser',
      };

      const mockRequest = {
        user: mockUser,
      };

      const result = await resolver.profile(mockRequest);
      expect(result).toEqual(mockUser);
    });
  });
}); 