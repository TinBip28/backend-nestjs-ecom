import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from './entities/store.schemas';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [StoresController],
  providers: [StoresService],
  imports: [
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
    UsersModule,
  ],
})
export class StoresModule {}
