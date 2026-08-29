import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

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
}
