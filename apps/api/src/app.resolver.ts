import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  apiStatus(): string {
    return 'ok';
  }
}
