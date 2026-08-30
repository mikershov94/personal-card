import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Experience')
export class ExperienceEntity {
    @Field(() => ID)
    id!: string;

    @Field()
    company!: string;

    @Field()
    position!: string;

    @Field(() => String, { nullable: true })
    location!: string | null;

    @Field(() => String, { nullable: true })
    description!: string | null;

    @Field(() => GraphQLISODateTime)
    startedAt!: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    endedAt!: Date | null;

    @Field()
    sortOrder!: number;

    @Field(() => GraphQLISODateTime)
    createdAt!: Date;

    @Field(() => GraphQLISODateTime)
    updatedAt!: Date;
}
