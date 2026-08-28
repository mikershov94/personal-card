import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Inquiry')
export class InquiryEntity {
    @Field(() => ID)
    id!: string;

    @Field()
    name!: string;

    @Field()
    email!: string;

    @Field(() => String, { nullable: true })
    company!: string | null;

    @Field()
    message!: string;

    @Field(() => GraphQLISODateTime)
    createdAt!: Date;

    @Field(() => GraphQLISODateTime)
    updatedAt!: Date;
}
