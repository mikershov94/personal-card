import { Field, Int, ObjectType } from '@nestjs/graphql';

import { SkillEntity } from './skill.entity';

@ObjectType('ProjectSkill')
export class ProjectSkillEntity {
    @Field(() => SkillEntity)
    skill!: SkillEntity;

    @Field(() => Int)
    sortOrder!: number;
}
