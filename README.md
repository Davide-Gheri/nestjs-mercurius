
# Nestjs Mercurius

Use [Mercurius GraphQL](https://github.com/mercurius-js/mercurius) with Nestjs framework

> **Warning** still in heavy development, it is NOT production ready.

## Install

```bash
npm i @nestjs/platform-fastify fastify mercurius nestjs-mercurius
```

## Use

### Register the module
```typescript
import { Module } from '@nestjs/common';
import { MercuriusModule } from 'nestjs-mercurius';

@Module({
  imports: [
    // Work also with async configuration (MercuriusModule.forRootAsync)
    MercuriusModule.forRoot({
      autoschemaFile: true,
      context: (request, reply) => ({
        user: request.user,
      }),
      subscription: {
        context: (connection, request) => ({
          user: request.user,
        }),
      },
    }),
  ],
  providers: [
    CatResolver,
  ],
})
export class AppModule {}
```

### The Object type

```typescript
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Cat {
  @Field(() => ID)
  id: number;
  
  @Field()
  name: string;
  
  @Field(() => Int)
  ownerId: number;
}
```

### The Resolver

```typescript
import { Resolver, Query, ResolveField, Parent, Mutation, Subscription, Context, Args } from '@nestjs/graphql';
import { ParseIntPipe } from '@nestjs/common';
import { ResolveLoader, LoaderQueries, LoaderContext, toAsyncIterator, LoaderQuery } from 'nestjs-mercurius';
import { PubSub } from 'mercurius';
import { groupBy } from 'lodash';
import { Cat } from './cat';

@Resolver(() => Cat)
export class CatResolver {
  constructor(
    private readonly catService: CatService,
    private readonly userService: UserService,
  ) {}

  @Query(() => [Cat])
  cats(@Args({name: 'filter', type: () => String, nullable: true}) filter?: string) {
    return this.catService.find(filter);
  }

  @Query(() => Cat, { nullable: true })
  cat(@Args('id', ParseIntPipe) id: number) {
    return this.catService.findOne(id);
  }

  @Mutation(() => Cat)
  createCat(
    @Args('name') name: string,
    @Context('pubsub') pubSub: PubSub,
    @Context('user') user: User,
  ) {
    const cat = new Cat();
    cat.name = name;
    cat.ownerId = user.id;
    //...
    pubSub.publish({
      topic: 'CatCreated',
      payload: { cat },
    });
    return cat;
  }
  
  @Subscription(() => Cat, {
    resolve: (payload) => payload.cat,
    filter: (payload, vars, context) =>
      payload.cat.ownerId !== context.user.id,
  })
  onCatCreated(
    @Context('pubsub') pubSub: PubSub,
  ) {
    return toAsyncIterator(pubSub.subscribe('CatCreated'));
  }
  
  @ResolveField(() => Int)
  age(@Parent() cat: Cat) {
    return 5;
  }
  
  @ResolveLoader(() => User)
  owner(
    @LoaderQueries() queries: LoaderQuery<Cat>[],
  ) {
    return this.userService.findById(
      // queries is an array of objects defined as { obj, params } where obj is the current object and params are the GraphQL params
      queries.map(({ obj }) => obj.ownerId)
    );
  }
}
```

### TODO
* Query complexity
* Federation

