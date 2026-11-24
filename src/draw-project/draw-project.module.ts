import { Module } from '@nestjs/common';
import { DrawProjectService } from './draw-project.service';
import { DrawProjectController } from './draw-project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrawProject } from './entities/draw-project.entity';
import { Post } from 'src/posts/entities/post.entity';
import { ActivityLogsModule } from 'src/activity-logs/activity-logs.module';

@Module({
  imports : [TypeOrmModule.forFeature([DrawProject, Post]), ActivityLogsModule],
  controllers: [DrawProjectController],
  providers: [DrawProjectService],
})
export class DrawProjectModule {}
