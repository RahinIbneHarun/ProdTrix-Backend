import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';
import { UserStatus } from 'src/users/enums/user-status.enum';

@Injectable()
export class AuthService 
{
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService
    ){} 

    async register(registerDto: RegisterDto){

        const existingUser = this.userService.getByEmail(registerDto.email);

        if((await existingUser)){
            throw new ConflictException('Email already exist')
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash( registerDto.password, 10, );

        const user = await this.userService.create({
          ...registerDto,
          passwordHash: hashedPassword,
        });

        return {
          message: 'Registration successful',
          data: user,
        };
    }


async login(loginDto: LoginDto) {
  
  const user = await this.userService.getByEmail(
    loginDto.email,
  );

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const isPasswordMatched = await bcrypt.compare(
    loginDto.password,
    user.passwordHash,
  );

  if (!isPasswordMatched) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // Check account status
  if (user.status !== UserStatus.ACTIVE) {
    throw new UnauthorizedException('Your account is not active');
  }

  // Create JWT payload
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  // Generate JWT token
  const accessToken = await this.jwtService.signAsync(payload);

  // Return safe user information and token
  return {
    message: 'Login successful',
    access_token: accessToken,
  };
}



}
