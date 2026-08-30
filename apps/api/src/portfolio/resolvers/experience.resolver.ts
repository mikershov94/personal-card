import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';

import { CreateExperienceDto } from '../dto/create-experience.input.dto';
import { UpdateExperienceDto } from '../dto/update-experience.input.dto';
import { ExperienceEntity } from '../entities/experience.entity';
import { PortfolioService } from '../portfolio.service';

@Resolver(() => ExperienceEntity)
export class ExperienceResolver {
    constructor(private readonly portfolioService: PortfolioService) {}

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
