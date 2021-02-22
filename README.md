
# Nestjs Mercurius

Use [Mercurius GraphQL](https://github.com/mercurius-js/mercurius) with Nestjs framework

> **Warning** still in heavy development, it is NOT production ready.

Visit the [Wiki](https://github.com/Davide-Gheri/nestjs-mercurius/wiki)

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
import { ResolveLoader, toAsyncIterator, LoaderQuery } from 'nestjs-mercurius';
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
  
  @ResolveLoader(() => User, { opts: { cache: false } })
  owner(
    @Parent() queries: LoaderQuery<Cat>[],
  ) {
    return this.userService.findById(
      // queries is an array of objects defined as { obj, params } where obj is the current object and params are the GraphQL params
      queries.map(({ obj }) => obj.ownerId)
    );
  }
}
```

## Federation

Install necessary dependencies
```typescript
npm i @apollo/federation
```

### The Gateway

```typescript
import { Module } from '@nestjs/common';
import { MercuriusGatewayModule } from 'nestjs-mercurius';

@Module({
  imports: [
    MercuriusGatewayModule.forRoot({
      graphiql: 'playground',
      subscription: true,
      gateway: {
        pollingInterval: 10000,
        services: [
          {
            name: 'users',
            url: 'https://....',
            wsUrl: 'wss://...',
          },
          {
            name: 'pets',
            url: 'https://...',
            rewriteHeaders: headers => headers,
          },
        ],
      },
    }),
  ],
})
export class GatewayModule {}
```

### The Service

```typescript
import { Module } from '@nestjs/common';
import { MercuriusModule } from './mercurius.module';
import { User } from './user';
import { PetResolver, UserResolver } from './resolvers';

@Module({
  imports: [
    MercuriusModule.forRoot({
      autoSchemaFile: true,
      federationMetadata: true,
      buildSchemaOptions: {
        orphanedTypes: [User],
      },
      //...
    }),
  ],
  providers: [
    PetResolver,
    UserResolver,
  ],
})
export class PetModule {}
```

### The Resolver

```typescript
import { Resolver, ResolveReference } from '@nestjs/graphql';
import { Pet } from './pet';
import { Reference } from './reference.interface';

@Resolver(() => Pet)
export class PetResolver {
  constructor(
    private readonly petService: PetService,
  ) {}

  @ResolveReference()
  resolveReference(ref: Reference<'Pet', 'id'>) {
    return this.petService.findOne(ref.id);
  }
}
```

Resolve reference could also be defined as Loader, potentially improving performance:

```typescript
import { ResolveReferenceLoader } from './resolve-reference-loader.decorator';
import { LoaderQuery } from './loader.interface';

@Resolver(() => Pet)
export class PetResolver {
  constructor(
    private readonly petService: PetService,
  ) {}

  @ResolveReferenceLoader()
  resolveReference(refs: LoaderQuery<Reference<'Pet', 'id'>>) {
    return this.petService.findById(
      refs.map(({ obj }) => obj.id)
    );
  }
}
```
