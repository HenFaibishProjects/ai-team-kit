import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExportModule } from './modules/export/export.module';
import { ConfigModule } from './modules/config/config.module';
import { TemplateModule } from './modules/templates/template.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    ExportModule,
    ConfigModule,
    TemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
