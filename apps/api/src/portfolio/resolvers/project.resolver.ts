import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from '../dto/create-project.input.dto';
import { UpdateProjectDto } from '../dto/update-project.input.dto';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectService } from '../services/project.service';

@Resolver(() => ProjectEntity)
export class ProjectResolver {
    constructor(private readonly projectService: ProjectService) {}

    @Mutation(() => ProjectEntity)
    @UseGuards(JwtAuthGuard)
    public createProject(
        @Args('input', { type: () => CreateProjectDto }) dto: CreateProjectDto,
    ): Promise<ProjectEntity> {
        return this.projectService.createProject(dto);
    }

    @Mutation(() => ProjectEntity)
    @UseGuards(JwtAuthGuard)
    public updateProject(
        @Args('id', { type: () => ID }) id: string,
        @Args('input', { type: () => UpdateProjectDto }) dto: UpdateProjectDto,
    ): Promise<ProjectEntity> {
        return this.projectService.updateProject(id, dto);
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    public async deleteProject(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
        await this.projectService.deleteProject(id);

        return true;
    }
}
