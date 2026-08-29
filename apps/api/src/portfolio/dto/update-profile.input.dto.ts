import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, Length } from 'class-validator';

@InputType('UpdateProfileInput')
export class UpdateProfileDto {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    displayName?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    headline?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(10, 400)
    summary?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    location?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(10, 100)
    avatarUrl?: string;
}
