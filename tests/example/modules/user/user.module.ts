import { Module } from '@nestjs/common';
import { PersonResolver } from './resolvers/person.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { SearchResolver } from './resolvers/search.resolver';
import { PostService } from './services/post.service';
import { UserService } from './services/user.service';
import { CustomerService } from './services/customer.service';
import { CustomerResolver } from './resolvers/customer.resolver';

@Module({
  providers: [
    PostService,
    UserService,
    CustomerService,
    PersonResolver,
    UserResolver,
    SearchResolver,
    CustomerResolver,
  ],
})
export class UserModule {}
