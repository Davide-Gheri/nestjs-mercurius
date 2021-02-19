import { InputType, OmitType } from '@nestjs/graphql';
import { UserType } from '../../../types/user.type';

@InputType()
export class CreateUserInput extends OmitType(UserType, ['id'], InputType) {}
