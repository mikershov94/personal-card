import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth-payload.output.dto';
import { LoginInput } from './dto/login.input.dto';

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {}

    @Mutation(() => AuthPayloadDto)
    public login(
        @Args('input', { type: () => LoginInput }) input: LoginInput,
    ): Promise<AuthPayloadDto> {
        return this.authService.login(input);
    }
}
