import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyWishlistPage } from './my-wishlist';

@NgModule({
  declarations: [
    MyWishlistPage,
  ],
  imports: [
    IonicPageModule.forChild(MyWishlistPage),
  ],
})
export class MyWishlistPageModule {}
