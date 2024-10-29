import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { FilesModule } from './files/files.module';
import { PaymentModule } from './payment/payment.module';
import { OrdersModule } from './orders/orders.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { DatabasesModule } from './databases/databases.module';
import { MailModule } from './mail/mail.module';
import mongooseDelete from 'mongoose-delete';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        connectionFactory: (connection) => {
          connection.plugin(mongooseDelete, {
            deletedAt: true,
            deletedBy: true,
            overrideMethods: 'all',
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    AuthModule,
    StoresModule,
    ProductsModule,
    FilesModule,
    PaymentModule,
    OrdersModule,
    PermissionsModule,
    RolesModule,
    DatabasesModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
