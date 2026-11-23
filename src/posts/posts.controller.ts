import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdatePostDto } from './dtos/update-post.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  createPost(
  @Req() req: any,
  @Body() createPostDto: CreatePostDto,) 
  {
    return this.postsService.createPost(
      req.user.id,
      createPostDto,
    );
  }

  //example requeste : GET /posts?page=2&limit=10
  @Get()
  getAllPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.getAllPosts(
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  // GET /posts/:id
@Get(':id')
getPostById(
  @Param('id', new ParseUUIDPipe()) id: string,
) {
  return this.postsService.getPostById(id);
}

// PATCH /posts/:id
@Patch('update/:id')
updatePost(
  @Param('id', new ParseUUIDPipe()) id: string,
  @Req() req: any,
  @Body() updatePostDto: UpdatePostDto,
) {
  return this.postsService.updatePost(
    id,
    req.user.id,
    req.user.role,
    updatePostDto,
  );
}

// DELETE /posts/:id
@Delete(':id')
deletePost(
  @Param('id', new ParseUUIDPipe()) id: string,
  @Req() req: any,
) {
  return this.postsService.deletePost(
    id,
    req.user.id,
    req.user.role,
  );
}


}
