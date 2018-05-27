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
  private baseURI   : string  = "http://"+constants.IPAddress+"/ionic-php-mysql/";

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

    this.phpService.getLikesPerPost(this.postId).subscribe(likedUserInfo => {
      if( likedUserInfo.length === 0 ){
        // this.hasData = false;
        }else {
          likedUserInfo.forEach(like=>{
            this.phpService.getUserInfo(like.UserUid).subscribe(userinfo => {
              this.phpService.getUserProfilePic(like.UserUid).subscribe(userProfilePic => {
                  this.likes.push({
                    "userId"     : like.UserUid,
                    "userName"   : userinfo.name,
                    "profilePic" : this.baseURI + userProfilePic.images_path
                  });
              });
            });
          });
        }
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
