import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

//Constants
import { constants } from '../../constants/constants';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';
import { ProfileDataProvider } from '../../providers/profile-data/profile-data';

//Pages
import { UserPostsPage } from '../user-posts/user-posts';

// Interfaces
import { IHelpUser } from '../../providers/interface/interface';

/**
 * Generated class for the UserProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {

  userId;
  userInfo = <IHelpUser>{};

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public phpService: PhpServiceProvider,
              private profileData: ProfileDataProvider) {
            
    this.userId = this.navParams.get('userId');
  }

  ionViewWillEnter()
  {  
    this.phpService.getUserInfo(this.userId).subscribe(userinfo => {
      this.userInfo.uid        = userinfo.userUid;
      this.userInfo.email      = userinfo.email;
      this.userInfo.name       = userinfo.name;
      this.userInfo.gender     = userinfo.Gender;
      this.userInfo.profilepic = constants.baseURI + userinfo.ProfilePicURL;
      this.userInfo.city       = userinfo.City;
      this.userInfo.state      = userinfo.State;
      this.userInfo.country    = userinfo.Country;
    });
  }

  // Display Image in Full Screen  
	displayImageFullScreen(imageToView) {
		this.profileData.displayImageInFullScreen(imageToView);
  }

  // Goto Signup Page
  goToUserPosts(userId): void {
    this.navCtrl.push(UserPostsPage, {
      userId
    });
  }

}
