import { Args, ID, Parent, Query, Resolver } from '@nestjs/graphql';
import { Cat } from '../types/cat';
import { CatService } from '../services/cat.service';
import { ParseIntPipe } from '@nestjs/common';
import { LoaderQuery, ResolveLoader } from '../../../lib';

@Resolver(() => Cat)
export class CatResolver {
  constructor(private readonly catService: CatService) {}

  @Query(() => [Cat])
  cats() {
    return this.catService.cats();
  }

  @Query(() => Cat, { nullable: true })
  cat(@Args({ name: 'id', type: () => ID }, ParseIntPipe) id: number) {
    return this.catService.cat(id);
  }

  @ResolveLoader(() => Boolean)
  hasFur(@Parent() queries: LoaderQuery<Cat>[]) {
    return queries.map(({ obj }) => obj.lives > 1);
  }
}
