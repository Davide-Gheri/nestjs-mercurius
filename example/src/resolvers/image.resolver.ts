import * as fs from 'fs';
import * as util from 'util';
import * as stream from 'stream';
import * as path from 'path';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { OnModuleInit } from '@nestjs/common';

const pipeline = util.promisify(stream.pipeline);

@Resolver()
export class ImageResolver implements OnModuleInit {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  async onModuleInit() {
    if (!fs.existsSync(this.uploadDir)) {
      await fs.promises.mkdir(this.uploadDir);
    }
  }

  @Mutation(() => Boolean)
  async uploadImage(
    @Args({ name: 'file', type: () => GraphQLUpload }) image: Promise<FileUpload>,
  ) {
    const { filename, createReadStream } = await image;
    const rs = createReadStream();
    const ws = fs.createWriteStream(path.join(this.uploadDir, filename));
    await pipeline(rs, ws);

    return true;
  }
}
