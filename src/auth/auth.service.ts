import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { bcryptAdapter } from 'src/config/bcrypt.adaptar';
import { CreateUserDto, LoginUserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger('AuthService');

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcryptAdapter.hash(password),
      });

      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true },
    });

    if (!user) throw new UnauthorizedException('User not found');
    if (!bcryptAdapter.compare(password, user.password))
      throw new UnauthorizedException('User not valid');

    return user;
  }

  private handleDBException(error: any) {
    this.logger.error(error.detail);
    switch (error.code) {
      case '23505':
        throw new BadRequestException(error.detail);
      default:
        throw new InternalServerErrorException('Error al crear el producto');
    }
  }
}
