import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  get(){
    return this.usersService.get();
  }

  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string){
    return this.usersService.getById(id);
  }
}
