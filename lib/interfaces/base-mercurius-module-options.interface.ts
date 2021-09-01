import { MercuriusCommonOptions } from 'mercurius';
import { FastifyReply, FastifyRequest } from 'fastify';

export interface BaseMercuriusModuleOptions extends MercuriusCommonOptions {
  path?: string;
  useGlobalPrefix?: boolean;
  uploads?: boolean | FileUploadOptions;
  altair?: boolean | any;
  openTelemetry?: boolean | OpenTelemetryPluginOptions;
}

export interface FileUploadOptions {
  //Max allowed non-file multipart form field size in bytes; enough for your queries (default: 1 MB).
  maxFieldSize?: number;
  //Max allowed file size in bytes (default: Infinity).
  maxFileSize?: number;
  //Max allowed number of files (default: Infinity).
  maxFiles?: number;
}

// Open Telemetry Plugin Options copied to not require it as a dependency
export interface OpenTelemetryPluginOptions {
  readonly exposeApi?: boolean;
  readonly formatSpanName?: (request: FastifyRequest) => string;
  readonly formatSpanAttributes?: {
    readonly request?: (request: FastifyRequest) => SpanAttributes;
    readonly reply?: (reply: FastifyReply) => SpanAttributes;
    readonly error?: (error: Error) => SpanAttributes;
  };
  readonly wrapRoutes?: boolean | string[];
  readonly ignoreRoutes?:
    | string[]
    | ((path: string, method: string) => boolean);
}

export interface SpanAttributes {
  [attributeKey: string]: SpanAttributeValue | undefined;
}

export type SpanAttributeValue =
  | string
  | number
  | boolean
  | Array<null | undefined | string>
  | Array<null | undefined | number>
  | Array<null | undefined | boolean>;
