import { Injectable } from '@nestjs/common';

import { CreateProfileDto } from './dto/create-profile.input.dto';
import { UpdateProfileDto } from './dto/update-profile.input.dto';
import { ProfileEntity } from './entities/profile.entity';
import { PortfolioRepository } from './repositories/portfolio.repository';

@Injectable()
export class PortfolioService {
    constructor(private readonly portfolioRepo: PortfolioRepository) {}

    public async createProfile(dto: CreateProfileDto): Promise<ProfileEntity> {
        return this.portfolioRepo.createProfile(dto);
    }

    public async updateProfile(dto: UpdateProfileDto): Promise<ProfileEntity> {
        return this.portfolioRepo.updatedProfile(dto);
    }

    public async deleteProfile(): Promise<void> {
        await this.portfolioRepo.deleteProfile();
    }

    public async getProfile(): Promise<ProfileEntity> {
        return this.portfolioRepo.getProfile();
    }
}
