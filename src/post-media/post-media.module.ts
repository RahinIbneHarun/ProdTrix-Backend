import { Module } from '@nestjs/common';
import { PostMediaService } from './post-media.service';
import { PostMediaController } from './post-media.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostMedia } from './entities/post-media.entity';
import { Post } from 'src/posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostMedia, Post])],
  controllers: [PostMediaController],
  providers: [PostMediaService],
})
export class PostMediaModule {}
