import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType('CreateProfileInput')
export class CreateProfileDto {
    @Field()
    @IsString()
    @Length(2, 100)
    displayName!: string;

    @Field()
    @IsString()
    @Length(2, 100)
    headline!: string;

    @Field()
    @IsString()
    @Length(10, 400)
    summary!: string;

    @Field()
    @IsString()
    @Length(2, 100)
    location!: string;

    @Field()
    @IsString()
    @Length(10, 100)
    avatarUrl!: string;
}
