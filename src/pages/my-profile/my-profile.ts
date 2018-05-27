import { Component } from '@angular/core';
import { App, IonicPage, NavController, AlertController, LoadingController } from 'ionic-angular';

// Firebase
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

//Constants
import { constants } from '../../constants/constants';

//Pages
import { UserPostsPage } from '../user-posts/user-posts';
import { LoginPage } from '../login/login';
import { EditProfilePage } from '../edit-profile/edit-profile';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';
import { ProfileDataProvider } from '../../providers/profile-data/profile-data';

/**
 * Generated class for the MyProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-profile',
  templateUrl: 'my-profile.html',
})
export class MyProfilePage {

  user;

  nameVar: string;
  genderVar: string;
  cityVar: string;
  stateVar: string;
  countryVar: string;
  emailVar: string;
  userProfilePic: string;
  userUid: string;

  constructor(public _app: App,
              private profileData: ProfileDataProvider, 
              private afAuth: AngularFireAuth, 
              public alertCtrl: AlertController,
              public phpService: PhpServiceProvider,
              public loadingCtrl: LoadingController,
              public navCtrl: NavController) {
                
    this.user = firebase.auth().currentUser; 
  }

  ionViewWillEnter(){    
    this.phpService.getUserInfo(this.user.uid).subscribe(userinfo => {
      this.phpService.getLocationInfo(userinfo.PostalCode).subscribe(locationinfo => {
        this.phpService.getUserProfilePic(this.user.uid).subscribe(userProfilePic => {

          this.userUid = userinfo.userUid;
          this.genderVar = userinfo.Gender;
          this.nameVar = userinfo.name;
          this.emailVar = userinfo.email;
          this.countryVar = locationinfo.Country;
          this.stateVar = locationinfo.State;
          this.cityVar = locationinfo.City;
          this.userProfilePic = constants.baseURI + userProfilePic.images_path;

        });
      }); 
    });  
  }

  // Display Image in Full Screen  
	displayImageFullScreen(imageToView) {
		this.profileData.displayImageInFullScreen(imageToView);
  }

  // Goto Signup Page
  goToEditProfilePage(): void {
	  this.navCtrl.push(EditProfilePage);
  }

  // Goto Signup Page
  goToMyPosts(userId): void {
    this.navCtrl.push(UserPostsPage, {
      userId
    });
  }

  // Logout
  logout() {
    this.afAuth
    .auth
    .signOut().then(value => {
      this._app.getRootNav().setRoot(LoginPage);
    });
  }
}
