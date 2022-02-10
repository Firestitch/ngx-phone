/*
 * Public API Surface
 */

// Modules
export { FsPhoneModule } from './app/fs-phone.module';

export { FsPhoneFieldComponent } from './app/components/phone-field/phone-field.component';
export { FsPhoneComponent } from './app/components/phone/phone.component';

export { FsPhoneDirective } from './app/directives/phone.directive';
export { FsPhonePipe } from './app/pipes/phone-format.pipe';

export { PhoneMetadataService } from './app/services/phone-metadata.service';
export { PhoneService } from './app/services/phone.service';
export { IFsPhoneConfig, IPhoneConfig } from './app/interfaces/phone-config.interface';
export { IFsPhoneValue } from './app/interfaces/phone-value.interface';

export { FS_PHONE_CONFIG } from './app/providers/phone-config';
