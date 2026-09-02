import { INestApplication, ValidationPipe } from '@nestjs/common';

import { createCorsOptions } from './config/cors.config';

export function configureApp(app: INestApplication): void {
    app.enableCors(createCorsOptions(process.env.FRONTEND_ORIGINS));
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
}
