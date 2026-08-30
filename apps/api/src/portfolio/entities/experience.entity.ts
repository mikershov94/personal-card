import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Experience')
export class ExperienceEntity {
    @Field(() => ID)
    id!: string;

    @Field()
    company!: string;

    @Field()
    position!: string;

    @Field()
    description!: string;

    @Field(() => GraphQLISODateTime)
    startDate!: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    endDate!: Date | null;

    @Field(() => GraphQLISODateTime)
    createdAt!: Date;

    @Field(() => GraphQLISODateTime)
    updatedAt!: Date;
}
