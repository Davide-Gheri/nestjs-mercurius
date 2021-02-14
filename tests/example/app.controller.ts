import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  home(): string {
    return 'ok';
  }
}
