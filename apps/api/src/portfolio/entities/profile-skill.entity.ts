import { Field, Int, ObjectType } from '@nestjs/graphql';

import { SkillEntity } from './skill.entity';

@ObjectType('ProfileSkill')
export class ProfileSkillEntity {
    @Field(() => SkillEntity)
    skill!: SkillEntity;

    @Field(() => Int)
    sortOrder!: number;
}
