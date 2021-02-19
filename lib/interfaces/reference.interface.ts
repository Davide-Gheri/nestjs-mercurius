export type Reference<T extends string = string, K extends string = 'id'> = {
  [R in K]: string;
} & {
  __typename: T;
};
