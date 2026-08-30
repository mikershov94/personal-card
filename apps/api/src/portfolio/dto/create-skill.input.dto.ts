import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType('CreateSkillInput')
export class CreateSkillDto {
    @Field()
    @IsString()
    @Length(2, 100)
    name!: string;
}
