import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    Length,
    MaxLength,
    Min,
} from 'class-validator';

@InputType('UpdateProjectInput')
export class UpdateProjectDto {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(2, 150)
    title?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(10, 2000)
    description?: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsUrl()
    @MaxLength(2048)
    url?: string | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsUrl()
    @MaxLength(2048)
    repositoryUrl?: string | null;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsUUID()
    experienceId?: string | null;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
