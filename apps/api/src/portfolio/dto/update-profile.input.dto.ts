import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, Length } from 'class-validator';

@InputType('UpdateProfileInput')
export class UpdateProfileDto {
    @Field()
    @IsOptional()
    @IsString()
    @Length(2, 100)
    displayName?: string;

    @Field()
    @IsOptional()
    @IsString()
    @Length(2, 100)
    headline?: string;

    @Field()
    @IsOptional()
    @IsString()
    @Length(10, 400)
    summary?: string;

    @Field()
    @IsOptional()
    @IsString()
    @Length(2, 100)
    location?: string;

    @Field()
    @IsOptional()
    @IsString()
    @Length(10, 100)
    avatarUrl?: string;
}
