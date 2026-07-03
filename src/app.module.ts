import { Module } from '@nestjs/common';
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
import { PermissionModule } from './permission/permission.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  imports: [
    ConfigTypeOrm,
    UserModule,
    TravelplaceModule,
    AuthModule,
    RagModule,
    ReviewModule,
    ChatModule,
    RecommendationModule,
    TripModule,
    PermissionModule,
    PermissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
