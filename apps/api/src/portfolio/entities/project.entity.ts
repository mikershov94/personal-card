import { Field, GraphQLISODateTime, ID, Int, ObjectType } from '@nestjs/graphql';

import { ProjectSkillEntity } from './project-skill.entity';

@ObjectType('Project')
export class ProjectEntity {
    @Field(() => ID)
    id!: string;

    @Field(() => ID, { nullable: true })
    experienceId!: string | null;

    @Field()
    title!: string;

    @Field()
    description!: string;

    @Field(() => String, { nullable: true })
    url!: string | null;

    @Field(() => String, { nullable: true })
    repositoryUrl!: string | null;

    @Field(() => Int)
    sortOrder!: number;

    @Field(() => GraphQLISODateTime)
    createdAt!: Date;

    @Field(() => GraphQLISODateTime)
    updatedAt!: Date;

    @Field(() => [ProjectSkillEntity])
    skills!: ProjectSkillEntity[];
}
