import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    this.logger.log(`Attempting sign in for user: ${username}`);
    const user = await this.usersService.findOne(username);
    
    if (!user) {
      this.logger.warn(`Sign in failed: User ${username} not found`);
      throw new UnauthorizedException();
    }
    
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Sign in failed: Invalid password for user ${username}`);
      throw new UnauthorizedException();
    }
    
    const payload = { 
      sub: user._id, 
      username: user.username,
      isAdmin: user.isAdmin 
    };
    
    this.logger.log(`User ${username} successfully signed in`);
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
