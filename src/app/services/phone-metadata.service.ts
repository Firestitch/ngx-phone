import { Inject, Injectable, Optional } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { switchMap } from 'rxjs/operators';

import { delayedRetry } from '@firestitch/common';

import { MetadataJson } from 'libphonenumber-js';

import { FS_PHONE_CONFIG } from '../providers/phone-config';
import { IFsPhoneConfig } from '../interfaces/phone-config.interface';

const DEFAULT_LOAD_PATH = '/assets/metadata.full.json';


@Injectable({
  providedIn: 'root',
})
export class PhoneMetadataService {

  private _metadata = new BehaviorSubject<MetadataJson>(null);
  private _ready$ = new BehaviorSubject<boolean>(false);

  constructor(
    @Optional() @Inject(FS_PHONE_CONFIG) private readonly _phoneConfig: IFsPhoneConfig,
  ) {
    this._loadMetadata();
  }

  public get ready(): boolean {
    return this._ready$.getValue();
  }

  public get ready$(): Observable<boolean> {
    return this._ready$.asObservable();
  }

  public get metadata$(): Observable<MetadataJson> {
    return this._metadata.asObservable();
  }

  public get metadata(): MetadataJson {
    return this._metadata.getValue();
  }

  private _loadMetadata(): void {
    fromFetch(this._phoneConfig?.metadataPath || DEFAULT_LOAD_PATH)
      .pipe(
        switchMap((response) => response.json()),
        delayedRetry(2000, 3)
      )
      .subscribe({
        next: (data: MetadataJson) => {
          this._metadata.next(data);
          this._ready$.next(true)
        },
        error: (e) => {
          throw new Error('Phones metadata can not be loaded. ' + e);
        }
      });
  }

}
