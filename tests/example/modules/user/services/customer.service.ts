import { Injectable } from '@nestjs/common';
import { CustomerType } from '../../../types/customer.type';

const customers: CustomerType[] = [
  {
    id: '1',
    name: 'C1',
  },
  {
    id: '2',
    name: 'C2',
  },
];

@Injectable()
export class CustomerService {
  customers() {
    return customers;
  }
}
