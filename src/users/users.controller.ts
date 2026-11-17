import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateUserStatusDto } from './dtos/update-user-status.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  get(){
    return this.usersService.get();
  }

  @Get("me")
  getMe(@Req() req: any){
    return this.usersService.getMe(req.user.id);
  }

  @Patch('update/profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(
      req.user.id,
      updateProfileDto,
    );
  }

  @Delete('deactivate')
  deactivateUser(@Req() req: any) {
    return this.usersService.deactivateUser(req.user.id);
  }

  @Patch(':id/status')
  // @Roles(UserRole.SUPER_ADMIN)
  updateUserStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(
      id,
      updateUserStatusDto.status,
    );
  }

  @Get(':id')
  //@Roles(UserRole.CONSUMER)
  getById(@Param('id', new ParseUUIDPipe()) id: string){
    return this.usersService.getById(id);
  }

  
}
