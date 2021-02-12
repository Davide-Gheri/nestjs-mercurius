import { Type } from 'class-transformer';
import { Length, MaxLength } from 'class-validator';
import { Field, InputType } from '../../../../lib';

@InputType({ description: 'new recipe input' })
export class NewRecipeInput {
  @Field({ description: 'recipe title' })
  @MaxLength(30)
  title: string;

  @Field({ nullable: true })
  @Length(30, 255)
  description?: string;

  @Type(() => String)
  @Field((type) => [String])
  ingredients: string[];
}
