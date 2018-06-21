import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ActionSheetController, AlertController } from 'ionic-angular';
import * as firebase from 'firebase/app'; 

//Constants
import { constants } from '../../constants/constants';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';
import { ProfileDataProvider } from '../../providers/profile-data/profile-data';

// Interfaces
import { IPosts } from '../../providers/interface/interface';
import { IHelpUser } from '../../providers/interface/interface';
import { CommentPost } from '../../providers/interface/interface';

//Pages
import { TabsPage } from '../tabs/tabs';

// Native Plugins
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Camera } from '@ionic-native/camera';

// Platform Plugin
import { Platform } from 'ionic-angular';

/**
 * Generated class for the EditPostPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-post',
  templateUrl: 'edit-post.html',
})
export class EditPostPage {

  @ViewChild('myInput') myInput: ElementRef;

  postId: string;
  user;
  userInfo = <IHelpUser>{};
  postInfo = <CommentPost>{};
  
  postDesc: any;
  originalPostDesc: any;
  selectedLocation;
  originalSelectedLocation;

  posts:  IPosts[] = [];
  postItem: any;

  public postedDate: string;
  public base64Image: string;
  public isImageDeleted: boolean;
  public isImageChanged: boolean;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private profileData: ProfileDataProvider,
              public phpService: PhpServiceProvider,
              private transfer: FileTransfer,
              private camera: Camera,
              public loadingCtrl: LoadingController,
              public actionSheetCtrl: ActionSheetController,
              public alertCtrl: AlertController,
              public platform: Platform) {
    
    // NavParams
    this.user = firebase.auth().currentUser;
    this.postId = this.navParams.get('postId');
    this.posts = this.navParams.get('posts');
    this.postItem = this.navParams.get('postItem');

    this.base64Image = null;
    this.isImageDeleted = false;
    this.isImageChanged = false;
    
    this.phpService.getPostInfo(this.postId).subscribe(postInfo =>{

        // Check each post has Image or not
        let postImage = null;
        if(postInfo.puImg != null){
          postImage = constants.baseURI + postInfo.puImg;
        }

        let postStr = this.phpService.findAndReplace(postInfo.post, "&#39;", "'");
        postStr = this.phpService.findAndReplace(postStr, "&#34;", "\"");

        this.postInfo.postId             = postInfo.ID;
        this.base64Image                 = postImage;
        this.postInfo.postByName         = postInfo.puname;
        this.postInfo.postedByProfilePic = constants.baseURI + postInfo.pupic;
        this.postDesc                    = postStr;
        this.originalPostDesc            = postStr;
        this.postInfo.postedDate         = postInfo.PostedDate;
        this.postInfo.postedById         = postInfo.CreatedById;
        this.postInfo.postalCode         = postInfo.pucode;
        this.selectedLocation            = postInfo.PostedLocation;
        this.originalSelectedLocation    = postInfo.PostedLocation;
        this.postInfo.postedCity         = postInfo.City;
        this.postInfo.postedState        = postInfo.State;
        this.postInfo.postedCountry      = postInfo.Country;
    });
    }

    ionViewWillEnter()
    {  
      this.selectedLocation = 'CT';
    }

  // Edit post method
  updatePost(postDesc: string ) {

    if( this.originalPostDesc === postDesc && this.isImageDeleted === false && this.isImageChanged === false && this.selectedLocation === this.originalSelectedLocation){
      // Do Nothing
      this.navCtrl.pop();

    }else{
      this.phpService.updatePost(postDesc, this.postId, this.selectedLocation, this.postInfo.postalCode,
                                  this.postInfo.postedCity, this.postInfo.postedState, this.postInfo.postedCountry).subscribe(res => {

        var index = this.posts.indexOf(this.postItem);

        if( this.originalPostDesc !== postDesc ){
          this.posts[index].post = postDesc;
        }

        if( this.base64Image !== null && this.isImageDeleted === true){

          this.fileTransferMethod( this.postId );
          this.posts[index].postImages = this.base64Image;

        }else if( this.base64Image === null && this.isImageDeleted === true ){

          this.posts[index].postImages = null;

        }else if( this.base64Image !== null && this.isImageChanged === true){

          this.fileTransferMethod( this.postId );
          this.posts[index].postImages = this.base64Image;

        }
      
        this.navCtrl.pop();  
      }); 
    }
  }

  // Display Image in Full Screen  
	displayImageFullScreen(imageToView) {
		this.profileData.displayImageInFullScreen(imageToView);
  }
  
  // Cancel the post and back to Home Page
  cancelPost() {
    this.navCtrl.pop();
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

      // Delete Image from Php
      this.phpService.deleteImage(this.postId).subscribe(res => {
        this.base64Image = "data:image/jpeg;base64," + imageData;
        this.isImageChanged = true;
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
        
      // Delete Image from Php
      this.phpService.deleteImage(this.postId).subscribe(res => {
        this.base64Image = "data:image/jpeg;base64," + imageData;
        this.isImageChanged = true;
      });

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
      params : {'postId': postId},
      headers: {}
    }

    fileTransfer.upload(this.base64Image, constants.baseURI+'upload-post-image.php', options_file)
      .then((data) => {
      // success
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
      message: 'Are you sure, you want to Delete? Cannot Redo',
      buttons: [
        {
          text: "No",
          role: 'cancel'
        },
        {
          text: "Yes",
          handler: () => { 
            // Delete Image from Php
            this.phpService.deleteImage(this.postId).subscribe(res => {
              this.base64Image = null;
              this.isImageDeleted = true;
            });
          }
        }
      ]
    })
    alert.present();
  }

}
