import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, Length } from 'class-validator';

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

    @Field()
    @IsString()
    @Length(10, 2000)
    description!: string;

    @Field(() => GraphQLISODateTime)
    @IsDate()
    startDate!: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsOptional()
    @IsDate()
    endDate?: Date | null;
}
