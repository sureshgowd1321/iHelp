import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ActionSheetController } from 'ionic-angular';

import * as firebase from 'firebase/app';

//Constants
import { constants } from '../../constants/constants';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';
import { ProfileDataProvider } from '../../providers/profile-data/profile-data';

// Interfaces
import { ICountries } from '../../providers/interface/interface';

// Native Plugins
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Camera } from '@ionic-native/camera';

//Pages
import { AddNewLocationPage } from '../add-new-location/add-new-location';

/**
 * Generated class for the EditProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {

  user;

  allLocations: ICountries[] = [];
  countries: any = [];
  selectedStates: any = [];
  selectedCities: any = [];

  public userCountry: string;
  public userState: string;
  public userCity: string;
  public userProfilePic: string;

  public selectedCountry: string;
  public selectedState: string;
  public selectedCity: string;
  public updatedName: string;
  public updatedGender: string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public phpService: PhpServiceProvider,
              private transfer: FileTransfer,
              private camera: Camera,
              public loadingCtrl: LoadingController,
              private profileData: ProfileDataProvider,
              public alertCtrl: AlertController,
              public actionSheetCtrl: ActionSheetController) {

    this.user = firebase.auth().currentUser; 
    
  }

  ionViewWillEnter()
  {  

    this.phpService.getUserInfo(this.user.uid).subscribe(userinfo => {
      this.phpService.getLocationInfo(userinfo.PostalCode).subscribe(locationinfo => {
        this.phpService.getUserProfilePic(this.user.uid).subscribe(userProfilePic => {

          this.updatedName = userinfo.name;
          this.updatedGender = userinfo.Gender;
          this.userCountry = locationinfo.Country;
          this.userState = locationinfo.State;
          this.userCity = locationinfo.City;
          this.userProfilePic = constants.baseURI + userProfilePic.images_path;

          this.selectedCountry = locationinfo.Country;
          this.selectedState = locationinfo.State;
          this.selectedCity = locationinfo.City;

        });
      }); 
    });
   
    this.phpService.getAllCountries().subscribe(countriesInfo => {
      countriesInfo.forEach(countryObj=>{

        this.allLocations.push({
              country   : countryObj.Country,
              state     : countryObj.State,
              city      : countryObj.City
        });  

        var index = this.countries.findIndex(item => item === countryObj.Country);
                
        if (index > -1){
        } else {

          this.countries.push(countryObj.Country);   
        }
      });
    }); 
  }

  // Set State values based on selected country
  setStateValues() {
      this.selectedStates.length = 0;
      this.selectedCities.length = 0;
      this.selectedState = '';
      this.selectedCity = '';

      this.allLocations.forEach(stateObj => {
        if(stateObj.country === this.selectedCountry.trim()){

          var index = this.selectedStates.findIndex(item => item === stateObj.state);

          if (index > -1){
          } else {  
            this.selectedStates.push(stateObj.state);   
          }          
        }
      });     
  }

  // Set Cities based in selected state
  setCityValues() {
    this.selectedCities.length = 0;
    this.selectedCity = '';

    this.allLocations.forEach(cityObj => {
      if(cityObj.state === this.selectedState.trim()){

        var index = this.selectedCities.findIndex(item => item === cityObj.city);

        if (index > -1){
        } else {  
          this.selectedCities.push(cityObj.city);   
        }          
      }
    });     
  }

  goToProfilePage(): void {
    this.phpService.getLocationId(this.selectedCity, this.selectedState, this.selectedCountry).subscribe(locationInfo => {
        this.phpService.updateUserData(this.user.uid, this.updatedName, this.updatedGender, locationInfo.ID).subscribe(locationInfo => {
          this.navCtrl.pop();
        });
    });
	  
  }

  // Upload Picture From Camera
  public base64Image: string;

  takePicture(){

    this.camera.getPicture({
        sourceType: this.camera.PictureSourceType.CAMERA,
        destinationType: this.camera.DestinationType.DATA_URL,
        targetWidth: 1000,
        targetHeight: 1000,
        quality: 50
    }).then((imageData) => {
      // imageData is a base64 encoded string
        this.base64Image = "data:image/jpeg;base64," + imageData;

        let loader = this.loadingCtrl.create({
          content: "Uploading..."
        });
        loader.present();

        const fileTransfer: FileTransferObject = this.transfer.create();

        let options_file: FileUploadOptions = {
          fileKey: 'file',
          fileName: 'name.jpg',
          chunkedMode: false,
          params : {'userUid': this.user.uid},
          headers: {}
        }

        fileTransfer.upload(this.base64Image, constants.baseURI+'saveimage.php', options_file)
        .then((data) => {
          this.currentUserProfilePicture();
          loader.dismiss();
        }, (err) => {
          loader.dismiss();
        });
    }, (err) => {
        console.log(err);
    });
  }

  // Method to select Profile Picture from Gallery
	selectFromGallery() {

    let options = {
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
			destinationType: this.camera.DestinationType.DATA_URL,
			targetWidth: 1000,
			targetHeight: 1000
    };

		this.camera.getPicture(options).then((imageData) => {
        
        this.base64Image = "data:image/jpeg;base64," + imageData;

        let loader = this.loadingCtrl.create({
          content: "Uploading..."
        });
        loader.present();

        const fileTransfer: FileTransferObject = this.transfer.create();
        
        let options_file: FileUploadOptions = {
          fileKey: 'file',
          fileName: 'name.jpg',
          chunkedMode: false,
          params : {'userUid': this.user.uid},
          headers: {}
        }

        console.log('Entered Gallery: '+ imageData);
        fileTransfer.upload(this.base64Image, constants.baseURI+'saveimage.php', options_file)
          .then((data) => {
          // success
          this.currentUserProfilePicture();
          loader.dismiss();
          console.log("success Camera: "+data.response);
        }, (err) => {
          // error
          loader.dismiss();
          alert("error"+JSON.stringify(err));
        });
		}, (error) => {
			console.log("ERROR -> " + JSON.stringify(error));
		});
  }

  //Get Current User Profile Picture
  currentUserProfilePicture()
  {
    this.phpService.getUserProfilePic(this.user.uid)
    .subscribe(userProfilePic => {
      this.userProfilePic = constants.baseURI + userProfilePic.images_path;
    });
  }

  // Display Image in Full Screen  
	displayImageFullScreen(imageToView) {
		this.profileData.displayImageInFullScreen(imageToView);
  }

  // Action sheet to display options on selecting profile picture
  editPictureOptions() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Take Picture',
          role: 'destructive',
          handler: () => {
           this.takePicture();
          }
        },
        {
          text: 'Select From Gallery',
          handler: () => {
           this.selectFromGallery();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();
  }

  // Go to Add New Location Page to add new location
  gotoAddNewLocationPage() {
    this.navCtrl.push(AddNewLocationPage);
  }
  
}
