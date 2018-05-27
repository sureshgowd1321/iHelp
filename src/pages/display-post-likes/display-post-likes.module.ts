import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DisplayPostLikesPage } from './display-post-likes';

@NgModule({
  declarations: [
    DisplayPostLikesPage,
  ],
  imports: [
    IonicPageModule.forChild(DisplayPostLikesPage),
  ],
})
export class DisplayPostLikesPageModule {}
