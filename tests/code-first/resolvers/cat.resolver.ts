import {
  Args,
  Context,
  ID,
  Parent,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { Cat } from '../types/cat';
import { CatService } from '../services/cat.service';
import { ParseIntPipe } from '@nestjs/common';
import { LoaderQuery, ResolveLoader, toAsyncIterator } from '../../../lib';
import { PubSub } from 'mercurius';

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

  @Subscription(() => Cat, {
    resolve: (payload) => payload,
  })
  onCatSub(@Context('pubsub') pubSub: PubSub) {
    return toAsyncIterator(pubSub.subscribe('CAT_SUB_TOPIC'));
  }
}
