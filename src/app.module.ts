import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { FollowsModule } from './follows/follows.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { LearningRequestModule } from './learning-request/learning-request.module';
import { PostMediaModule } from './post-media/post-media.module';
import { DrawProjectModule } from './draw-project/draw-project.module';
import { EventModule } from './event/event.module';
import { AdvertisementsModule } from './advertisements/advertisements.module';
import { PaymentsModule } from './payments/payments.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';

@Module({
  imports: [
    //load the variables from env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    //connect to Postgre
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT') ?? 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      })
    }),
    UsersModule,
    FollowsModule,
    PostsModule,
    CommentsModule,
    ReactionsModule,
    LearningRequestModule,
    PostMediaModule,
    DrawProjectModule,
    EventModule,
    AdvertisementsModule,
    PaymentsModule,
    ActivityLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
