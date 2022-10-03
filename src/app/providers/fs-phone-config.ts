import { InjectionToken } from '@angular/core';
import { IFsPhoneConfig } from '../interfaces/phone-config.interface';

export const FS_PHONE_CONFIG = new InjectionToken<IFsPhoneConfig>('Config for phone package');
