import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TravelplaceModule } from './modules/travelplace/travelplace.module';
import { ConfigTypeOrm } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { RagModule } from './modules/rag/rag.module';
import { ReviewModule } from './modules/review/review.module';
import { ChatModule } from './modules/chat/chat.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { TripModule } from './modules/trip/trip.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { CacheModule } from './common/cache/cache.module';
import { UploadModule } from './modules/upload/upload.module';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigTypeOrm,
    UserModule,
    TravelplaceModule,
    AuthModule,
    RagModule,
    ReviewModule,
    ChatModule,
    RecommendationModule,
    TripModule,
    PermissionsModule,
    RolesModule,
    FavoriteModule,
    CacheModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
