import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { LoginResponse } from './dto/login.type';
import { UserProfile } from './dto/user-profile.type';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { Public } from './decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') loginInput: LoginInput) {
    return this.authService.signIn(loginInput.username, loginInput.password);
  }

  @Query(() => UserProfile)
  @UseGuards(AuthGuard)
  async profile(@Context('req') request: any) {
    return request.user;
  }
} 