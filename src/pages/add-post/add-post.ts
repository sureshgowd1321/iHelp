import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, LoadingController, ActionSheetController, AlertController } from 'ionic-angular';

import * as firebase from 'firebase/app'; 

//Constants
import { constants } from '../../constants/constants';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';
import { ProfileDataProvider } from '../../providers/profile-data/profile-data';

//Pages
import { TabsPage } from '../tabs/tabs';

// Native Plugins
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Camera } from '@ionic-native/camera';

// Platform Plugin
import { Platform } from 'ionic-angular';

/**
 * Generated class for the AddPostPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-post',
  templateUrl: 'add-post.html',
})
export class AddPostPage {

  @ViewChild('myInput') myInput: ElementRef;

  user;
  
  public userObj : any;
  public locationObj : any;
  public profilePic : string;
  selectedLocation;
  postDesc: any;

  // Capture Photo
  public base64Image: string;

  constructor(public navCtrl: NavController, 
              private profileData: ProfileDataProvider,
              public phpService: PhpServiceProvider,
              private transfer: FileTransfer,
              private camera: Camera,
              public loadingCtrl: LoadingController,
              public actionSheetCtrl: ActionSheetController,
              public alertCtrl: AlertController,
              public platform: Platform) {
    
    this.user = firebase.auth().currentUser; 
    this.base64Image = null;
    this.postDesc = '';

    this.phpService.getUserInfo(this.user.uid).subscribe(userinfo => {
      this.phpService.getUserProfilePic(this.user.uid).subscribe(userProfilePic => {
        this.phpService.getLocationInfo(userinfo.PostalCode).subscribe(locationInfo => {
          
          this.locationObj = locationInfo;
          this.userObj = userinfo;
          this.profilePic = constants.baseURI + userProfilePic.images_path;

        });
      });
    });
  }

  ionViewWillEnter()
  {  
    this.selectedLocation = 'CT';
  }

  // Add post method
  addPost() {
    let postId: string;

    this.phpService.addPost(this.postDesc, this.user.uid, this.selectedLocation, this.userObj.PostalCode,
                            this.locationObj.City, this.locationObj.State, this.locationObj.Country).subscribe(res => { 
      postId = JSON.stringify(res["id"]).replace(/"/g, "");

      if( this.base64Image != null ){
        this.fileTransferMethod( postId );
      }else{
        this.navCtrl.setRoot(TabsPage);
      }
    });
  }

  // Display Image in Full Screen  
	displayImageFullScreen(imageToView) {
		this.profileData.displayImageInFullScreen(imageToView);
  }

  // Action sheet on each post to upload Image
  uploadImageActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      //title: 'Modify your Post',
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
  
  // Upload Picture From Camera
  takePicture(){

    this.camera.getPicture({
        sourceType: this.camera.PictureSourceType.CAMERA,
        destinationType: this.camera.DestinationType.DATA_URL,
        targetWidth: 1000,
        targetHeight: 1000,
        allowEdit : false,
        quality: 100,
        saveToPhotoAlbum: false
    }).then((imageData) => {
      // imageData is a base64 encoded string
        this.base64Image = "data:image/jpeg;base64," + imageData;

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

		}, (error) => {
			console.log("ERROR -> " + JSON.stringify(error));
		});
  }

  fileTransferMethod(postId){

    let loader = this.loadingCtrl.create({
      content: "Uploading..."
    });
    loader.present();

    const fileTransfer: FileTransferObject = this.transfer.create();

    let options_file: FileUploadOptions = {
      fileKey: 'file',
      fileName: 'name.jpg',
      chunkedMode: false,
      params : {'postId': postId},
      headers: {}
    }

    fileTransfer.upload(this.base64Image, constants.baseURI+'upload-post-image.php', options_file)
      .then((data) => {
      // success
      this.navCtrl.setRoot(TabsPage);
      console.log("success Camera: "+data.response);
      loader.dismiss();
    }, (err) => {
      // error
      alert("error"+JSON.stringify(err));
      loader.dismiss();

    });

  }

  resize() {
    var element = this.myInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + 'px';
    this.myInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
  }

  // Delete the Picture
  deletePhoto(){
    let alert = this.alertCtrl.create({
      title: 'Confirm',
      message: 'Are you sure, you want to Delete?',
      buttons: [
        {
          text: "No",
          role: 'cancel'
        },
        {
          text: "Yes",
          handler: () => { 
            this.base64Image = null; 
          }
        }
      ]
    })
    alert.present();
  }

}
