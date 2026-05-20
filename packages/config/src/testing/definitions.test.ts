import { describe, expect, it } from 'bun:test';
import { Test } from '@bunito/testing';
import { ConfigModule } from '../config-module';
import { ConfigService } from '../config-service';
import './index';

describe('config testing definitions', () => {
  it('registers config service and module test factories', () => {
    const context = Test as unknown as {
      configService: ConfigService;
      ConfigModule: unknown;
    };

    expect(context.configService.getEnv).toBeFunction();
    const configService = context.configService;

    expect(context.ConfigModule).toEqual({
      token: ConfigModule,
      providers: [
        {
          token: ConfigService,
          global: true,
          useValue: configService,
        },
      ],
      exports: [ConfigService],
    });
  });
});
