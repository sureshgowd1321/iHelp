import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { MyProfilePage } from '../my-profile/my-profile';
import { MyWishlistPage } from '../my-wishlist/my-wishlist';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = MyWishlistPage;
  tab3Root = MyProfilePage;

  constructor() {

  }
}
