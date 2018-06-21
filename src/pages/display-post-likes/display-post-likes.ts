import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

//Constants
import { constants } from '../../constants/constants';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';
import { ProfileDataProvider } from '../../providers/profile-data/profile-data';

// Pages
import { UserProfilePage } from '../user-profile/user-profile';

/**
 * Generated class for the DisplayPostLikesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

interface likesInfo {
  userId?: string;
  userName?: string;
  profilePic?: string; 
}

@IonicPage()
@Component({
  selector: 'page-display-post-likes',
  templateUrl: 'display-post-likes.html',
})
export class DisplayPostLikesPage {

  postId: string;
  likes: likesInfo[] = [];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public phpService: PhpServiceProvider,
              private profileData: ProfileDataProvider) {

    this.postId = this.navParams.get('postId');
  }

  ionViewWillEnter() {
    this.loadLikes();
  }

  loadLikes(){
    this.likes = [];

    this.phpService.getLikes(this.postId).subscribe(likedUserInfo => {
      likedUserInfo.forEach(like=>{
              this.likes.push({
                "userId"     : like.UserUid,
                "userName"   : like.name,
                "profilePic" : constants.baseURI + like.images_path
              });
        });
    });
  }

  // Goto Comments Page
  gotoUsersPage(userId: any) {
    this.navCtrl.push(UserProfilePage, {
      userId
    });
  }

  // Display Image in Full Screen  
  displayImageFullScreen(imageToView) {
    this.profileData.displayImageInFullScreen(imageToView);
  }

}
