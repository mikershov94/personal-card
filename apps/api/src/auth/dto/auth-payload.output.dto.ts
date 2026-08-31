import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthPayloadDto {
    @Field()
    public accessToken!: string;
}
