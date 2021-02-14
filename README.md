
## Nestjs Mercurius

WIP

### Loader implementation

```typescript

@Resolver(() => Dog)
export class DogResolver {
  @Query(() => [Dog])
  dogs() {
  ...
  }

  @ResolveLoader(() => [String])
  owner(
    @Args({ name: 'someFilter', type: () => String, nullable: true }) someFilter: undefined, 
    @LoaderQueries() queries: LoaderQuery<Dog, { someFilter?: string }>[],
    @LoaderContext() ctx: any,
  ) {
    // queries is an array of objects defined as { obj, params } where obj is the current object and params are the GraphQL params
    
    // Params must be defined as any GraphQL params with @Args decorator but must be accessed from queries[].params 

    return queries.map(({ obj }) => owners[obj.name])
  }
}
```


### Subscription

```typescript
// AppModule
import { MercuriusModule } from 'nestjs-mercurius';

@Module({
  MercuriusModule.forRoot({
    //...
    subscription: {
      context(connection, request) {
        return {
          user: request.user,
        }
      },
    },
  })
})
export class AppModule {}



// DogResolver
import { PubSub } from 'mercurius';
import { toAsyncIterator } from 'nestjs-mercurius';

//...
@Mutation(() => Dog)
createDog(
  @Args({ name: 'input', type: () => CreateDogInput })) data: CreateDogInput,
  @Context('pubsub') pubSub: PubSub,
) {
  const dog: Dog = {/**/};
  pubSub.publish({
    topic: 'DogCreated',
    payload: { dog },
  });
  return dog;
}

@Subscription(() => Dog, {
  resolve: (payload) => payload.dog, 
  filter: (payload, variables, context) => {
    return payload.dog.owner === context.user.id;
  },
})
onDogCreated(@Context('pubsub') pubSub: PubSub) {
  return toAsyncIterator(pubSub.subscribe('DogCreated'));
}
//...
```


### TODO
* Query complexity
* Federation

