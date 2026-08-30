import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateExperienceDto } from './dto/create-experience.input.dto';
import { CreateProfileDto } from './dto/create-profile.input.dto';
import { UpdateExperienceDto } from './dto/update-experience.input.dto';
import { UpdateProfileDto } from './dto/update-profile.input.dto';
import { ExperienceEntity } from './entities/experience.entity';
import { ProfileEntity } from './entities/profile.entity';
import { PortfolioService } from './portfolio.service';

@Resolver(() => ProfileEntity)
export class PortfolioResolver {
    constructor(private readonly portfolioService: PortfolioService) {}

    @Mutation(() => ProfileEntity)
    public createProfile(
        @Args('input', { type: () => CreateProfileDto }) dto: CreateProfileDto,
    ): Promise<ProfileEntity> {
        return this.portfolioService.createProfile(dto);
    }

    @Mutation(() => ProfileEntity)
    public updateProfile(
        @Args('input', { type: () => UpdateProfileDto }) dto: UpdateProfileDto,
    ): Promise<ProfileEntity> {
        return this.portfolioService.updateProfile(dto);
    }

    @Mutation(() => Boolean)
    public async deleteProfile(): Promise<boolean> {
        await this.portfolioService.deleteProfile();

        return true;
    }

    @Query(() => ProfileEntity)
    public getProfile(): Promise<ProfileEntity> {
        return this.portfolioService.getProfile();
    }

    @Mutation(() => ExperienceEntity)
    public createExperience(
        @Args('input', { type: () => CreateExperienceDto }) dto: CreateExperienceDto,
    ): Promise<ExperienceEntity> {
        return this.portfolioService.createExperience(dto);
    }

    @Mutation(() => ExperienceEntity)
    public updateExperience(
        @Args('id', { type: () => ID }) id: string,
        @Args('input', { type: () => UpdateExperienceDto }) dto: UpdateExperienceDto,
    ): Promise<ExperienceEntity> {
        return this.portfolioService.updateExperience(id, dto);
    }

    @Mutation(() => Boolean)
    public async deleteExperience(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
        await this.portfolioService.deleteExperience(id);

        return true;
    }
}
