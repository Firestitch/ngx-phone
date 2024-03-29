import { InjectionToken } from '@angular/core';
import { IFsPhoneConfig } from '../interfaces/phone-config.interface';

export const PHONE_CONFIG = new InjectionToken<IFsPhoneConfig>('app-phone-config');
