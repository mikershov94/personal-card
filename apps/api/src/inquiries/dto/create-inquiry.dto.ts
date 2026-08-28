import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

@InputType('CreateInquiryInput')
export class CreateInquiryDto {
    @Field()
    @IsString()
    @Length(2, 100)
    name!: string;

    @Field()
    @IsString()
    @IsEmail()
    @MaxLength(254)
    email!: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    company?: string;

    @Field()
    @IsString()
    @Length(10, 2000)
    message!: string;
}
