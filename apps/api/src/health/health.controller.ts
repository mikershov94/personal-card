import { Controller, Get } from '@nestjs/common';

import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Get('live')
    checkLive() {
        return this.healthService.checkLive();
    }

    @Get('ready')
    checkReady() {
        return this.healthService.checkReady();
    }
}
