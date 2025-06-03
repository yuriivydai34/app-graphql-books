import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Action } from 'src/casl/action';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private caslAbilityFactory: CaslAbilityFactory
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    this.logger.log(`Creating new user with username: ${createUserInput.username}`);
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    const createdUser = new this.userModel({
      ...createUserInput,
      password: hashedPassword,
      isAdmin: false,
    });
    const savedUser = await createdUser.save();
    this.logger.log(`Successfully created user with ID: ${savedUser._id}`);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    const users = await this.userModel.find().sort({ username: 1 }).exec();
    this.logger.debug(`Found ${users.length} users`);
    return users;
  }

  async findOne(username: string): Promise<User | null> {
    this.logger.log(`Finding user by username: ${username}`);
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      this.logger.warn(`User with username ${username} not found`);
    }
    return user;
  }

  async findById(id: string): Promise<User | null> {
    this.logger.log(`Finding user by ID: ${id}`);
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput, currentUser: any): Promise<User> {
    this.logger.log(`Attempting to update user with ID: ${id}`);
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      this.logger.warn(`User with ID ${id} not found for update`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!ability.can(Action.Update, user)) {
      this.logger.warn(`User ${currentUser.id} not authorized to update user ${id}`);
      throw new ForbiddenException('Cannot update this user');
    }

    if (updateUserInput.password) {
      this.logger.debug('Hashing new password for update');
      updateUserInput.password = await bcrypt.hash(updateUserInput.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserInput, { new: true })
      .exec();

    if (!updatedUser) {
      this.logger.error(`Failed to update user with ID ${id}`);
      throw new NotFoundException(`User with ID ${id} not found after update`);
    }

    this.logger.log(`Successfully updated user with ID: ${id}`);
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    this.logger.log(`Attempting to remove user with ID: ${id}`);
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      this.logger.warn(`User with ID ${id} not found for deletion`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.logger.log(`Successfully deleted user with ID: ${id}`);
    return deletedUser;
  }
}
