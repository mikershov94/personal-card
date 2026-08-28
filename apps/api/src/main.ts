import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
    const rawPort = process.env.PORT ?? '3000';
    const port = Number(rawPort);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid PORT value. Expected an integer.`);
    }

    const app = await NestFactory.create(AppModule);

    configureApp(app);

    await app.listen(port, '0.0.0.0');
}

void bootstrap();
