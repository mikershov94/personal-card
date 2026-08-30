import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';

import { CreateSkillDto } from '../dto/create-skill.input.dto';
import { UpdateSkillDto } from '../dto/update-skill.input.dto';
import { SkillEntity } from '../entities/skill.entity';
import { SkillService } from '../services/skill.service';

@Resolver(() => SkillEntity)
export class SkillResolver {
    constructor(private readonly skillService: SkillService) {}

    @Mutation(() => SkillEntity)
    public createSkill(
        @Args('input', { type: () => CreateSkillDto }) dto: CreateSkillDto,
    ): Promise<SkillEntity> {
        return this.skillService.createSkill(dto);
    }

    @Mutation(() => SkillEntity)
    public updateSkill(
        @Args('id', { type: () => ID }) id: string,
        @Args('input', { type: () => UpdateSkillDto }) dto: UpdateSkillDto,
    ): Promise<SkillEntity> {
        return this.skillService.updateSkill(id, dto);
    }

    @Mutation(() => Boolean)
    public async deleteSkill(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
        await this.skillService.deleteSkill(id);

        return true;
    }

    @Mutation(() => Boolean)
    public async attachSkillToProfile(
        @Args('skillId', { type: () => ID }) skillId: string,
        @Args('sortOrder', { type: () => Int, nullable: true, defaultValue: 0 }) sortOrder = 0,
    ): Promise<boolean> {
        await this.skillService.attachSkillToProfile(skillId, sortOrder);

        return true;
    }

    @Mutation(() => Boolean)
    public async detachSkillFromProfile(
        @Args('skillId', { type: () => ID }) skillId: string,
    ): Promise<boolean> {
        await this.skillService.detachSkillFromProfile(skillId);

        return true;
    }

    @Mutation(() => Boolean)
    public async attachSkillToProject(
        @Args('projectId', { type: () => ID }) projectId: string,
        @Args('skillId', { type: () => ID }) skillId: string,
        @Args('sortOrder', { type: () => Int, nullable: true, defaultValue: 0 }) sortOrder = 0,
    ): Promise<boolean> {
        await this.skillService.attachSkillToProject(projectId, skillId, sortOrder);

        return true;
    }

    @Mutation(() => Boolean)
    public async detachSkillFromProject(
        @Args('projectId', { type: () => ID }) projectId: string,
        @Args('skillId', { type: () => ID }) skillId: string,
    ): Promise<boolean> {
        await this.skillService.detachSkillFromProject(projectId, skillId);

        return true;
    }
}
