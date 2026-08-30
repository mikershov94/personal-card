import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, Length } from 'class-validator';

@InputType('UpdateSkillInput')
export class UpdateSkillDto {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    name?: string;
}
