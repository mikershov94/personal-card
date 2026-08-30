import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';

import { CreateSkillDto } from '../dto/create-skill.input.dto';
import { UpdateSkillDto } from '../dto/update-skill.input.dto';
import { SkillEntity } from '../entities/skill.entity';
import { PortfolioService } from '../portfolio.service';

@Resolver(() => SkillEntity)
export class SkillResolver {
    constructor(private readonly portfolioService: PortfolioService) {}

    @Mutation(() => SkillEntity)
    public createSkill(
        @Args('input', { type: () => CreateSkillDto }) dto: CreateSkillDto,
    ): Promise<SkillEntity> {
        return this.portfolioService.createSkill(dto);
    }

    @Mutation(() => SkillEntity)
    public updateSkill(
        @Args('id', { type: () => ID }) id: string,
        @Args('input', { type: () => UpdateSkillDto }) dto: UpdateSkillDto,
    ): Promise<SkillEntity> {
        return this.portfolioService.updateSkill(id, dto);
    }

    @Mutation(() => Boolean)
    public async deleteSkill(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
        await this.portfolioService.deleteSkill(id);

        return true;
    }

    @Mutation(() => Boolean)
    public async attachSkillToProfile(
        @Args('skillId', { type: () => ID }) skillId: string,
        @Args('sortOrder', { type: () => Int, nullable: true, defaultValue: 0 }) sortOrder = 0,
    ): Promise<boolean> {
        await this.portfolioService.attachSkillToProfile(skillId, sortOrder);

        return true;
    }

    @Mutation(() => Boolean)
    public async detachSkillFromProfile(
        @Args('skillId', { type: () => ID }) skillId: string,
    ): Promise<boolean> {
        await this.portfolioService.detachSkillFromProfile(skillId);

        return true;
    }
}
