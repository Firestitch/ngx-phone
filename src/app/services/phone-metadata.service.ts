import { Injectable, inject } from '@angular/core';

import { delayedRetry } from '@firestitch/common';

import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { MetadataJson } from 'libphonenumber-js';
import { fromFetch } from 'rxjs/fetch';

import { IFsPhoneConfig } from '../interfaces/phone-config.interface';
import { FS_PHONE_CONFIG } from '../providers';


@Injectable({
  providedIn: 'root',
})
export class PhoneMetadataService {
  private readonly _phoneConfig = inject<IFsPhoneConfig>(FS_PHONE_CONFIG, { optional: true });


  private _metadata = new BehaviorSubject<MetadataJson>(null);
  private _ready$ = new BehaviorSubject<boolean>(false);

  constructor() {
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
    const assetPath = (this._phoneConfig?.assetPath || '/assets/phone')
      .replace(/([^:]\/)\/+/g, '$1');

    fromFetch(`${assetPath}/metadata.min.json`)
      .pipe(
        switchMap((response) => response.json()),
        delayedRetry(2000, 3),
      )
      .subscribe({
        next: (data: MetadataJson) => {
          this._metadata.next(data);
          this._ready$.next(true);
        },
        error: (e) => {
          throw new Error(`Phones metadata can not be loaded. ${  e}`);
        },
      });
  }

}
