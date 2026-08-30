import { Injectable } from '@nestjs/common';

import { CreateProfileDto } from './dto/create-profile.input.dto';
import { UpdateProfileDto } from './dto/update-profile.input.dto';
import { ProfileEntity } from './entities/profile.entity';
import { ProfileRepository } from './repositories/profile.repository';

@Injectable()
export class PortfolioService {
    constructor(private readonly profileRepo: ProfileRepository) {}

    public async createProfile(dto: CreateProfileDto): Promise<ProfileEntity> {
        return this.profileRepo.createProfile(dto);
    }

    public async updateProfile(dto: UpdateProfileDto): Promise<ProfileEntity> {
        return this.profileRepo.updateProfile(dto);
    }

    public async deleteProfile(): Promise<void> {
        await this.profileRepo.deleteProfile();
    }

    public async getProfile(): Promise<ProfileEntity> {
        return this.profileRepo.getProfile();
    }
}
