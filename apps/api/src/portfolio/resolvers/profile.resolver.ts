import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateProfileDto } from '../dto/create-profile.input.dto';
import { UpdateProfileDto } from '../dto/update-profile.input.dto';
import { ProfileEntity } from '../entities/profile.entity';
import { ProfileService } from '../services/profile.service';

@Resolver(() => ProfileEntity)
export class ProfileResolver {
    constructor(private readonly profileService: ProfileService) {}

    @Mutation(() => ProfileEntity)
    @UseGuards(JwtAuthGuard)
    public createProfile(
        @Args('input', { type: () => CreateProfileDto }) dto: CreateProfileDto,
    ): Promise<ProfileEntity> {
        return this.profileService.createProfile(dto);
    }

    @Mutation(() => ProfileEntity)
    @UseGuards(JwtAuthGuard)
    public updateProfile(
        @Args('input', { type: () => UpdateProfileDto }) dto: UpdateProfileDto,
    ): Promise<ProfileEntity> {
        return this.profileService.updateProfile(dto);
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    public async deleteProfile(): Promise<boolean> {
        await this.profileService.deleteProfile();

        return true;
    }

    @Query(() => ProfileEntity)
    public getProfile(): Promise<ProfileEntity> {
        return this.profileService.getProfile();
    }
}
