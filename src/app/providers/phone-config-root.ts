import { InjectionToken } from '@angular/core';
import { IFsPhoneConfig } from '../interfaces/phone-config.interface';

export const PHONE_CONFIG_ROOT = new InjectionToken<IFsPhoneConfig>('app-phone-config-root');
