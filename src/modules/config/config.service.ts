import configSchema from '@config/config.schema';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { z } from 'zod';

type Config = z.infer<typeof configSchema>;

@Injectable()
export class ConfigService extends NestConfigService<Config> {}