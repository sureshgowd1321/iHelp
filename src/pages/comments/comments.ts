import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController, LoadingController } from 'ionic-angular';
import * as firebase from 'firebase/app'; 

//Constants
import { constants } from '../../constants/constants';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';
import { ProfileDataProvider } from '../../providers/profile-data/profile-data';

// Interfaces
import { IPosts } from '../../providers/interface/interface';
import { IComment } from '../../providers/interface/interface';

// Pages
import { UserProfilePage } from '../user-profile/user-profile';
import { DisplayPostLikesPage } from '../display-post-likes/display-post-likes';
import { DisplayPostDislikesPage } from '../display-post-dislikes/display-post-dislikes';
import { HomePage } from '../../pages/home/home';

// Order Pipe
import { OrderPipe } from 'ngx-order-pipe';

/**
 * Generated class for the CommentsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-comments',
  templateUrl: 'comments.html',
})
export class CommentsPage {

  @ViewChild('myInput') myInput: ElementRef;

  user;
  postId: any;
  posts:  IPosts[] = [];
  postItem: any;
  isIndexed: string;
  isRemoveFromSlice: string;

  public postObj : any;
  public userObj : any;
  public profilePic : string;
  public isPostInWishlist: boolean;
  public likesCount : number;
  public isPostLiked : boolean;
  public dislikesCount : number;
  public isPostDisliked : boolean;
  public commentsCount : number;
  public postImage: string;

  public comments: IComment[] = [];

  // Order By Variables
  order: string = 'id';
  reverse: boolean = false;

  commentInput: string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private profileData: ProfileDataProvider,
              public phpService: PhpServiceProvider,
              public alertCtrl: AlertController,
              public actionSheetCtrl: ActionSheetController,
              private orderPipe: OrderPipe,
              public loadingCtrl: LoadingController ) {
    
    this.user = firebase.auth().currentUser; 
    
    this.postId = this.navParams.get('postId');
    this.posts = this.navParams.get('posts');
    this.postItem = this.navParams.get('postItem');
    this.isIndexed = this.navParams.get('updateIndex');
    this.isRemoveFromSlice = this.navParams.get('removeFromList');
  }

  //ionViewWillEnter()
  ionViewDidLoad()
  {   
    this.loadpostInfo();
    this.loadAllComments(this.postId);
  }

  loadpostInfo(){

    let loader = this.loadingCtrl.create({
      content: "fetching..."
    });
    loader.present();

    this.phpService.getPostInfo(this.postId).subscribe(postInfo =>{ 
      this.phpService.getUserInfo(postInfo.CreatedById).subscribe(userinfo => {
        this.phpService.getUserProfilePic(postInfo.CreatedById).subscribe(userProfilePic => {
          this.phpService.getWishlistFromUserId(this.user.uid).subscribe(wishlistInfo => {   
            this.phpService.getlikesCount(postInfo.ID).subscribe(likesCount => {
              this.phpService.getdislikesCount(postInfo.ID).subscribe(dislikesCount => {
                this.phpService.getlikeInfoPerUser(this.user.uid, this.postId).subscribe(userLikeInfo => {
                  this.phpService.getDislikeInfoPerUser(this.user.uid, postInfo.ID).subscribe(userDislikeInfo => {
                  this.phpService.getCountOfComments(postInfo.ID).subscribe(commentsCount => {
                    this.phpService.getPostImages(postInfo.ID).subscribe(postImages => {

                        // Check post is liked by loggedin User or not
                        let isLiked = false;
                        if( userLikeInfo === 0 ){
                        }else{
                          isLiked = true;
                        }

                        // Check post is liked by loggedin User or not
                        let isDisliked = false;
                        if( userDislikeInfo === 0 ){
                        }else{
                          isDisliked = true;
                        }

                        // Get Wishlist information
                        let isInWishlist = false;

                        if( wishlistInfo.length === 0 ){
                        } else {
                          wishlistInfo.forEach(wishObj=>{
                
                            if(wishObj.PostId === this.postId){
                              isInWishlist = true;
                            }    
                          });
                        }

                        // Check each post has Image or not
                        let postImage;
                        if(postImages != false){
                          postImage = constants.baseURI + postImages.images_path;
                        }

                        this.postObj          = postInfo;
                        this.userObj          = userinfo;
                        this.profilePic       = constants.baseURI + userProfilePic.images_path;
                        this.isPostInWishlist = isInWishlist;
                        this.likesCount       = likesCount;
                        this.isPostLiked      = isLiked;
                        this.dislikesCount    = dislikesCount;
                        this.isPostDisliked   = isDisliked;
                        this.commentsCount    = commentsCount;
                        this.postImage        = postImage;

                        loader.dismiss();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    
  }

  // Retrieve the JSON encoded data from the remote server
  // Using Angular's Http class and an Observable - then
  // assign this to the items array for rendering to the HTML template
  loadAllComments(postId)
  {
    this.comments = [];

   this.phpService.getAllComments(postId).subscribe(commentsInfo => {

        if( commentsInfo.length === 0 ){
          console.log('***Empty Comments');
        } else {
          commentsInfo.forEach(commentObj=>{

            this.phpService.getUserInfo(commentObj.commentedBy).subscribe(userinfo => {
              this.phpService.getUserProfilePic(commentObj.commentedBy).subscribe(userProfilePic => {

                this.comments.push({
                  "id"            : commentObj.ID,
                  "postId"        : commentObj.postId,
                  "comment"       : commentObj.comment,
                  "commentedBy"   : commentObj.commentedBy,
                  "commentedDate" : commentObj.commentedDate,
                  "name"          : userinfo.name,
                  "nickname"      : userinfo.nickname,
                  "profilePic"    : constants.baseURI + userProfilePic.images_path
                });
              });      
            });     
          });
          this.comments = this.orderPipe.transform(this.comments, 'id');
        }
      });
  }

  // Add Comments
  postComment(commentDesc: string) {

    this.phpService.addComments(this.postId, commentDesc, this.user.uid)
    .subscribe(res => {
      this.commentInput = '';
      this.loadAllComments(this.postId);

      this.commentsCount += 1;

      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        this.posts[index].commentsCount += 1;
      }

      this.myInput['_elementRef'].nativeElement.style.height = (16) + 'px';

    });
  }

  // Edit Comments
  editComment(commentId: string, commentDesc: string): void {
    let alert = this.alertCtrl.create({
      message: "Update your comment",
      inputs: [
        {
          name: 'editPostDesc',
          value: commentDesc
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            this.loadAllComments(this.postId);
          }
        },
        {
          text: 'Save',
          handler: data => {
            this.phpService.updateComment(commentId, data.editPostDesc)
                .subscribe(res => {
                  this.loadAllComments(this.postId);
                });
          }
        }
      ]
    });
    alert.present();
  }

  // Delete Comments
  deleteComment(commentId: string): void {
    let alert = this.alertCtrl.create({
      title: 'Confirm',
      message: 'Are you sure, you want to Delete?',
      buttons: [
        {
          text: "No",
          role: 'cancel',
          handler: () => {
            this.loadAllComments(this.postId);
          }
        },
        {
          text: "Yes",
          handler: () => {  
            this.phpService.deleteComment(commentId)
                .subscribe(res => {
                  this.loadAllComments(this.postId);

                  this.commentsCount -= 1;

                  if(this.isIndexed === 'UpdateIndex'){
                    var index = this.posts.indexOf(this.postItem);
                    this.posts[index].commentsCount -= 1;
                  }
                });
          }
        }
      ]
    })
    alert.present();
  }

  // Pull to Refresh functionality
  dorefresh(refresher) {
    this.loadpostInfo();
    this.loadAllComments(this.postId);
    if(refresher != 0)
      refresher.complete();
  
  }

  // Display Image in Full Screen  
  displayImageFullScreen(imageToView) {
    this.profileData.displayImageInFullScreen(imageToView);
  }

  // Goto Comments Page
  gotoUsersPage(userId: any) {
    this.navCtrl.push(UserProfilePage, {
      userId
    });
  }

  // Add Wishlist
  addToWishlist(){
    this.phpService.addWishlist(this.user.uid, this.postId).subscribe(wishlistInfo => {
      this.isPostInWishlist = true;

      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        this.posts[index].addedToWishlist = true;
      }
    });
  }

  // Remove Wishlist
  removeFromWishlist(){
    this.phpService.deleteWishlist(this.user.uid, this.postId).subscribe(wishlistInfo => {
      this.isPostInWishlist = false;

      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        this.posts[index].addedToWishlist = false;

        if(this.isRemoveFromSlice === 'RemoveSlice'){
          if (index !== -1) {
            this.posts.splice(index, 1);
          }
        }
      }
    });
  }

  // Add Like
  addLike(){
    
    this.phpService.addLike(this.user.uid, this.postId).subscribe(likeInfo => {
      this.likesCount += 1;
      this.isPostLiked = true;  

      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        this.posts[index].likesCount = this.likesCount;
        this.posts[index].isPostLiked =  this.isPostLiked;
      }

      this.removeDislike();

    });
  }

  // Remove Like
  removeLike(){
    this.phpService.deleteLike(this.user.uid, this.postId).subscribe(likeInfo => {
      if( this.likesCount > 0 && this.isPostLiked === true){
        this.likesCount -= 1;
        this.isPostLiked = false;
      }
      
      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        if( this.posts[index].likesCount > 0 ){
          this.posts[index].likesCount = this.likesCount;
        }
        this.posts[index].isPostLiked = this.isPostLiked;
      }

    });
  }

  // Add Dislike
  addDislike(){
    
    this.phpService.addDislike(this.user.uid, this.postId).subscribe(dislikeInfo => {
      this.dislikesCount += 1;
      this.isPostDisliked = true;  

      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        this.posts[index].dislikesCount = this.dislikesCount;
        this.posts[index].isPostDisliked = this.isPostDisliked;
      }

      this.removeLike();

    });
  }

  // Remove Like
  removeDislike(){
    this.phpService.deleteDislike(this.user.uid, this.postId).subscribe(dislikeInfo => {
      if( this.dislikesCount > 0 && this.isPostDisliked === true){
        this.dislikesCount -= 1;
        this.isPostDisliked = false;
      }

      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        if( this.posts[index].dislikesCount > 0 ){
          this.posts[index].dislikesCount = this.dislikesCount;
        }
        this.posts[index].isPostDisliked = this.isPostDisliked;
      }

    });
  }

  // Go to likes Page to see the liked users
  gotoLikesPage(postId: any) {
    this.navCtrl.push(DisplayPostLikesPage, {
      postId
    });
  }

  // Go to dislikes Page to see the liked users
  gotoDislikesPage(postId: any) {
    this.navCtrl.push(DisplayPostDislikesPage, {
      postId
    });
  }

  resize() {
    //this.myInput.nativeElement.style.height = this.myInput.nativeElement.scrollHeight + 'px';
    var element = this.myInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + 'px';
    this.myInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
  } 


}
