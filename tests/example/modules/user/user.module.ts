import { Module } from '@nestjs/common';
import { PersonResolver } from './resolvers/person.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { SearchResolver } from './resolvers/search.resolver';
import { PostService } from './services/post.service';
import { UserService } from './services/user.service';

@Module({
  providers: [
    PostService,
    UserService,
    PersonResolver,
    UserResolver,
    SearchResolver,
  ],
})
export class UserModule {}
