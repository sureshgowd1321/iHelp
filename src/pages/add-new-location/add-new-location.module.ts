import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddNewLocationPage } from './add-new-location';

@NgModule({
  declarations: [
    AddNewLocationPage,
  ],
  imports: [
    IonicPageModule.forChild(AddNewLocationPage),
  ],
})
export class AddNewLocationPageModule {}
