import { Module } from '@nestjs/common';
import { DrawProjectService } from './draw-project.service';
import { DrawProjectController } from './draw-project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrawProject } from './entities/draw-project.entity';

@Module({
  imports : [TypeOrmModule.forFeature([DrawProject])],
  controllers: [DrawProjectController],
  providers: [DrawProjectService],
})
export class DrawProjectModule {}
