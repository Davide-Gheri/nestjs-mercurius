import { Query, Resolver } from '@nestjs/graphql';
import { CustomerType } from '../../../types/customer.type';
import { CustomerService } from '../services/customer.service';

@Resolver(() => CustomerType)
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Query(() => [CustomerType])
  customers() {
    return this.customerService.customers();
  }
}
