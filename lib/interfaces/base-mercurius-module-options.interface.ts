import { MercuriusCommonOptions } from 'mercurius';
import { ValidationRule } from 'graphql';

export interface BaseMercuriusModuleOptions extends MercuriusCommonOptions {
  path?: string;
  useGlobalPrefix?: boolean;
  uploads?: boolean | FileUploadOptions;
  validationRules?: ValidationRules;
  altair?: boolean | any;
}

export interface FileUploadOptions {
  //Max allowed non-file multipart form field size in bytes; enough for your queries (default: 1 MB).
  maxFieldSize?: number;
  //Max allowed file size in bytes (default: Infinity).
  maxFileSize?: number;
  //Max allowed number of files (default: Infinity).
  maxFiles?: number;
}

export type ValidationRules = (params: {
  source: string;
  variables?: Record<string, any>;
  operationName?: string;
}) => ValidationRule[];
