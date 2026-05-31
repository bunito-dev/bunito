import type { ModuleLike } from '@bunito/bunito';
import { ConfigModule, LoggerModule } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { EXAMPLE_NAME_ID } from './constants';
import { ExampleController } from './example.controller';

export class ExampleModule {
  static forRoot(name: string): ModuleLike {
    return {
      token: ExampleModule,
      imports: [ConfigModule, LoggerModule, HTTPModule],
      providers: [
        {
          token: EXAMPLE_NAME_ID,
          useValue: name,
        },
      ],
      controllers: [ExampleController],
    };
  }
}
