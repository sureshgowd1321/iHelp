import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostFilterPage } from './post-filter';

@NgModule({
  declarations: [
    PostFilterPage,
  ],
  imports: [
    IonicPageModule.forChild(PostFilterPage),
  ],
})
export class PostFilterPageModule {}
