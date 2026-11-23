import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UpdatePostMediaDto } from './dtos/update-post-media.dto';
import { PostMediaService } from './post-media.service';
import { CreatePostMediaDto } from './dtos/create-post-media.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('post-media')
@UseGuards(JwtAuthGuard)
export class PostMediaController {
  constructor(
    private readonly postMediaService: PostMediaService,
  ) {}

  @Post()
  createPostMedia(
    @Req() req: any,
    @Body() createPostMediaDto: CreatePostMediaDto,
  ) {
    return this.postMediaService.createPostMedia(
      req.user.id,
      req.user.role,
      createPostMediaDto,
    );
  }

  // GET /post-media
  @Get()
  getAllPostMedia(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postMediaService.getAllPostMedia(
      req.user.id,
      req.user.role,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

// GET /post-media/:id
  @Get(':id')
  getPostMediaById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.postMediaService.getPostMediaById(
      id,
      req.user.id,
      req.user.role,
    );
  }

// PATCH /post-media/:id
  @Patch('update/:id')
  updatePostMedia(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
    @Body() updatePostMediaDto: UpdatePostMediaDto,
  ) {
    return this.postMediaService.updatePostMedia(
      id,
      req.user.id,
      req.user.role,
      updatePostMediaDto,
    );
  }

// DELETE /post-media/:id
  @Delete('delete/:id')
  deletePostMedia(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.postMediaService.deletePostMedia(
      id,
      req.user.id,
      req.user.role,
    );
  }


}
