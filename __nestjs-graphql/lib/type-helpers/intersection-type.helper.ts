import { Type } from '@nestjs/common';
import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from '@nestjs/mapped-types';
import { Field } from '../decorators';
import { ClassDecoratorFactory } from '../interfaces/class-decorator-factory.interface';
import { getFieldsAndDecoratorForType } from '../schema-builder/utils/get-fields-and-decorator.util';

export function IntersectionType<A, B>(
  classARef: Type<A>,
  classBRef: Type<B>,
  decorator?: ClassDecoratorFactory,
): Type<A & B> {
  const { decoratorFactory, fields: fieldsA } = getFieldsAndDecoratorForType(
    classARef,
  );
  const { fields: fieldsB } = getFieldsAndDecoratorForType(classBRef);
  const fields = [...fieldsA, ...fieldsB];

  abstract class IntersectionObjectType {
    constructor() {
      inheritPropertyInitializers(this, classARef);
      inheritPropertyInitializers(this, classBRef);
    }
  }
  if (decorator) {
    decorator({ isAbstract: true })(IntersectionObjectType);
  } else {
    decoratorFactory({ isAbstract: true })(IntersectionObjectType);
  }

  inheritValidationMetadata(classARef, IntersectionObjectType);
  inheritTransformationMetadata(classARef, IntersectionObjectType);
  inheritValidationMetadata(classBRef, IntersectionObjectType);
  inheritTransformationMetadata(classBRef, IntersectionObjectType);

  fields.forEach((item) => {
    Field(item.typeFn, { ...item.options })(
      IntersectionObjectType.prototype,
      item.name,
    );
  });

  Object.defineProperty(IntersectionObjectType, 'name', {
    value: `Intersection${classARef.name}${classBRef.name}`,
  });
  return IntersectionObjectType as Type<A & B>;
}
