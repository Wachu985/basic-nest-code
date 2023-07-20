import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto, CreateUserDto } from './dto';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');
  constructor(
    @InjectModel(User.name)
    private readonly userRepository: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      // Creando el Usuario
      const user = await this.userRepository.create({
        email: userData.email,
        fullName: userData.fullName,
        password: bcrypt.hashSync(password, 10),
      });

      return {
        user: this.cleanUser(user),
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository
      .findOne({ email })
      .select('+password')
      .exec();

    if (!user)
      throw new UnauthorizedException(`Credentials are not valid (email)`);

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(`Credentials are not valid (password)`);

    return {
      user: this.cleanUser(user),
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async checkAuthStatus(user: User) {
    return {
      user: this.cleanUser(user),
      token: this.getJwtToken({ id: user._id.toString() }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    // Generar el Token
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleErrors(error: any): never {
    if (error.code === 11000)
      throw new BadRequestException(`Your email exists please insert other`);
    console.log(error);
    this.logger.error(error);
    throw new InternalServerErrorException(`Please check server logs`);
  }

  private cleanUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, __v: __, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}
