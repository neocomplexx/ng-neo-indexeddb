import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxIDB } from './NgxIDB';

export * from './NgxIDB';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  exports: [ ]
})
export class NgxNeoIndexedDbModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxNeoIndexedDbModule,
      providers: []
    };
  }
}
