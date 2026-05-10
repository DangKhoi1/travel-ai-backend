import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TravelplaceModule } from './modules/travelplace/travelplace.module';
import { ConfigTypeOrm } from './config/typeorm.config';

@Module({
  imports: [
    ConfigTypeOrm,
    UserModule,
    TravelplaceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
