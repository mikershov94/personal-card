import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateProfileDto } from './dto/create-profile.input.dto';
import { UpdateProfileDto } from './dto/update-profile.input.dto';
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

    @Mutation()
    public deleteProfile(): Promise<void> {
        return this.portfolioService.deleteProfile();
    }

    @Query(() => ProfileEntity)
    public getProfile(): Promise<ProfileEntity> {
        return this.portfolioService.getProfile();
    }
}
