import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

import { ExperienceEntity } from './experience.entity';
import { ProfileSkillEntity } from './profile-skill.entity';

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

    @Field(() => [ProfileSkillEntity])
    skills!: ProfileSkillEntity[];
}
