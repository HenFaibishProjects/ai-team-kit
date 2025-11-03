import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:4200', 'http://lida.virtualteam.software'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
