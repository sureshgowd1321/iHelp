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
 * Generated class for the DisplayPostDislikesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

interface dislikesInfo {
  userId?: string;
  userName?: string;
  profilePic?: string; 
}

@IonicPage()
@Component({
  selector: 'page-display-post-dislikes',
  templateUrl: 'display-post-dislikes.html',
})
export class DisplayPostDislikesPage {

  postId: string;
  dislikes: dislikesInfo[] = [];
  private baseURI   : string  = "http://"+constants.IPAddress+"/ionic-php-mysql/";

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public phpService: PhpServiceProvider,
              private profileData: ProfileDataProvider) {

    this.postId = this.navParams.get('postId');
  }

  ionViewWillEnter() {
    this.loadDislikes();
  }

  loadDislikes(){
    this.dislikes = [];

    this.phpService.getDislikesPerPost(this.postId).subscribe(dislikedUserInfo => {
      if( dislikedUserInfo.length === 0 ){
        // this.hasData = false;
        }else {
          dislikedUserInfo.forEach(dislike=>{
            this.phpService.getUserInfo(dislike.UserUid).subscribe(userinfo => {
              this.phpService.getUserProfilePic(dislike.UserUid).subscribe(userProfilePic => {
                  this.dislikes.push({
                    "userId"     : dislike.UserUid,
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
