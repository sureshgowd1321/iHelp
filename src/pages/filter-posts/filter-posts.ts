import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as firebase from 'firebase/app';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';

//Pages
import { TabsPage } from '../tabs/tabs';

/**
 * Generated class for the FilterPostsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-filter-posts',
  templateUrl: 'filter-posts.html',
})
export class FilterPostsPage {

  public selectedLocation: string;
  user;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public phpService: PhpServiceProvider ) {
    
    this.user = firebase.auth().currentUser;
  }

  ionViewDidLoad() {
    this.phpService.getUserInfo(this.user.uid).subscribe(userinfo => {     
      this.selectedLocation = userinfo.PostFilter;   
    });
  }

  gotoHomePage(): void {    
    this.phpService.updateUserFilter(this.user.uid, this.selectedLocation).subscribe(userinfo => {     
      this.navCtrl.setRoot(TabsPage);
    });	  
  }

}
