import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserPostsPage } from './user-posts';

@NgModule({
  declarations: [
    UserPostsPage,
  ],
  imports: [
    IonicPageModule.forChild(UserPostsPage),
  ],
})
export class UserPostsPageModule {}
