import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql';
import { IsDate, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

@InputType('CreateExperienceInput')
export class CreateExperienceDto {
    @Field()
    @IsString()
    @Length(2, 150)
    company!: string;

    @Field()
    @IsString()
    @Length(2, 150)
    position!: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    location?: string | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @Length(10, 2000)
    description?: string | null;

    @Field(() => GraphQLISODateTime)
    @IsDate()
    startedAt!: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsOptional()
    @IsDate()
    endedAt?: Date | null;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
