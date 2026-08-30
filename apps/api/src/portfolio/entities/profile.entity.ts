import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

import { ExperienceEntity } from './experience.entity';
import { ProfileSkillEntity } from './profile-skill.entity';
import { ProjectEntity } from './project.entity';

@ObjectType('Profile')
export class ProfileEntity {
    @Field(() => ID)
    id!: string;

    @Field()
    displayName!: string;

    @Field()
    headline!: string;

    @Field()
    summary!: string;

    @Field()
    location!: string;

    @Field()
    avatarUrl!: string;

    @Field(() => GraphQLISODateTime)
    createdAt!: Date;

    @Field(() => GraphQLISODateTime)
    updatedAt!: Date;

    @Field(() => [ExperienceEntity])
    experiences!: ExperienceEntity[];

    @Field(() => [ProjectEntity])
    projects!: ProjectEntity[];

    @Field(() => [ProfileSkillEntity])
    skills!: ProfileSkillEntity[];
}
