import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostLikesPage } from './post-likes';

@NgModule({
  declarations: [
    PostLikesPage,
  ],
  imports: [
    IonicPageModule.forChild(PostLikesPage),
  ],
})
export class PostLikesPageModule {}
