import { Module } from '@nestjs/common';
import { DrawProjectService } from './draw-project.service';
import { DrawProjectController } from './draw-project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrawProject } from './entities/draw-project.entity';
import { Post } from 'src/posts/entities/post.entity';

@Module({
  imports : [TypeOrmModule.forFeature([DrawProject, Post])],
  controllers: [DrawProjectController],
  providers: [DrawProjectService],
})
export class DrawProjectModule {}
