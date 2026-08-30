import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, Length } from 'class-validator';

@InputType('UpdateExperienceInput')
export class UpdateExperienceDto {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(2, 150)
    company?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(2, 150)
    position?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(10, 2000)
    description?: string;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsOptional()
    @IsDate()
    startDate?: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsOptional()
    @IsDate()
    endDate?: Date | null;
}
