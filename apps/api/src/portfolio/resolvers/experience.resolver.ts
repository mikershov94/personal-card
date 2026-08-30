import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateExperienceDto } from '../dto/create-experience.input.dto';
import { UpdateExperienceDto } from '../dto/update-experience.input.dto';
import { ExperienceEntity } from '../entities/experience.entity';
import { ExperienceService } from '../services/experience.service';

@Resolver(() => ExperienceEntity)
export class ExperienceResolver {
    constructor(private readonly experienceService: ExperienceService) {}

    @Mutation(() => ExperienceEntity)
    @UseGuards(JwtAuthGuard)
    public createExperience(
        @Args('input', { type: () => CreateExperienceDto }) dto: CreateExperienceDto,
    ): Promise<ExperienceEntity> {
        return this.experienceService.createExperience(dto);
    }

    @Mutation(() => ExperienceEntity)
    @UseGuards(JwtAuthGuard)
    public updateExperience(
        @Args('id', { type: () => ID }) id: string,
        @Args('input', { type: () => UpdateExperienceDto }) dto: UpdateExperienceDto,
    ): Promise<ExperienceEntity> {
        return this.experienceService.updateExperience(id, dto);
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    public async deleteExperience(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
        await this.experienceService.deleteExperience(id);

        return true;
    }
}
