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

import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
  ) {}

  // POST /comments
  @Post()
  createComment(
    @Req() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(
      req.user.id,
      createCommentDto,
    );
  }

  // GET /comments
  @Get()
  getAllComments(
    @Query('postId') postId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.getAllComments(
      postId,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  // GET /comments/:id
  @Get(':id')
  getCommentById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.commentsService.getCommentById(id);
  }

  // PATCH /comments/:id
  @Patch('update/:id')
  updateComment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(
      id,
      req.user.id,
      req.user.role,
      updateCommentDto,
    );
  }

  // DELETE /comments/:id
  @Delete('delete/:id')
  deleteComment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.commentsService.deleteComment(
      id,
      req.user.id,
      req.user.role,
    );
  }
}