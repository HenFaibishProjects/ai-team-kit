import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExportModule } from './modules/export/export.module';
import { ConfigModule } from './modules/config/config.module';
import { TemplateModule } from './modules/templates/template.module';
import { AuthModule } from './modules/auth/auth.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    AuthModule,
    ExportModule,
    ConfigModule,
    TemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
