/*
 * Public API Surface
 */

// Modules
export { FsPhoneModule } from './app/fs-phone.module';

export { FsPhoneFieldDeprecatedComponent } from './app/components/phone-field-deprecated/phone-field-deprecated.component';
export { FsPhoneFieldComponent } from './app/components/phone-field/phone-field.component';
export { FsPhoneComponent } from './app/components/phone/phone.component';

export { FsPhoneDirective } from './app/directives/phone.directive';
export { FsPhonePipe } from './app/pipes/phone-format.pipe';

export { IFsPhoneConfig, IPhoneConfig } from './app/interfaces/phone-config.interface';
export { IFsPhoneValue } from './app/interfaces/phone-value.interface';
export { PhoneMetadataService } from './app/services/phone-metadata.service';
export { PhoneService } from './app/services/phone.service';

export { FS_PHONE_CONFIG } from './app/providers/fs-phone-config';

export { extractPhoneData } from './app/helpers/extract-phone-data';
export { setPhoneData } from './app/helpers/set-phone-data';

