import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostDislikesPage } from './post-dislikes';

@NgModule({
  declarations: [
    PostDislikesPage,
  ],
  imports: [
    IonicPageModule.forChild(PostDislikesPage),
  ],
})
export class PostDislikesPageModule {}
