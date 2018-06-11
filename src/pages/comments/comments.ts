import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController, LoadingController, ToastController } from 'ionic-angular';
import * as firebase from 'firebase/app'; 

//Constants
import { constants } from '../../constants/constants';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';
import { ProfileDataProvider } from '../../providers/profile-data/profile-data';

// Interfaces
import { IAllPosts } from '../../providers/interface/interface';
import { IComment } from '../../providers/interface/interface';
import { IComments } from '../../providers/interface/interface';
import { CommentPost } from '../../providers/interface/interface';

// Pages
import { UserProfilePage } from '../user-profile/user-profile';
import { DisplayPostLikesPage } from '../display-post-likes/display-post-likes';
import { DisplayPostDislikesPage } from '../display-post-dislikes/display-post-dislikes';
import { HomePage } from '../../pages/home/home';

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
  posts:  IAllPosts[] = [];
  postInfo = <CommentPost>{};
  postItem: any;
  isIndexed: string;
  isRemoveFromSlice: string;

  // public postObj : any;
  // public userObj : any;
  // public profilePic : string;
  // public isPostInWishlist: boolean;
  // public likesCount : number;
  // public isPostLiked : boolean;
  // public dislikesCount : number;
  // public isPostDisliked : boolean;
  public commentsCount : number;
  // public postImage: string;

  public comments: IComments[] = [];

  // Order By Variables
  // order: string = 'id';
  // reverse: boolean = false;

  commentInput: string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private profileData: ProfileDataProvider,
              public phpService: PhpServiceProvider,
              public alertCtrl: AlertController,
              public actionSheetCtrl: ActionSheetController,
              public loadingCtrl: LoadingController,
              public toastCtrl: ToastController ) {
    
    this.user = firebase.auth().currentUser; 
    
    this.postId = this.navParams.get('postId');
    this.posts = this.navParams.get('posts');
    this.postItem = this.navParams.get('postItem');
    this.isIndexed = this.navParams.get('updateIndex');
    this.isRemoveFromSlice = this.navParams.get('removeFromList');
  }

  ionViewWillEnter()
  {   
    this.comments.length = 0;
    //this.loadpostInfo();
    this.loadAllComments(this.postId);
  }

  // loadpostInfo(){

  //   let loader = this.loadingCtrl.create({
  //     content: "fetching..."
  //   });
  //   loader.present();

  //   this.phpService.getPostInfo(this.postId).subscribe(postInfo =>{ 
  //     this.phpService.getUserInfo(postInfo.CreatedById).subscribe(userinfo => {
  //       this.phpService.getUserProfilePic(postInfo.CreatedById).subscribe(userProfilePic => {
  //         this.phpService.getWishlistFromUserId(this.user.uid).subscribe(wishlistInfo => {   
  //           this.phpService.getlikesCount(postInfo.ID).subscribe(likesCount => {
  //             this.phpService.getdislikesCount(postInfo.ID).subscribe(dislikesCount => {
  //               this.phpService.getlikeInfoPerUser(this.user.uid, this.postId).subscribe(userLikeInfo => {
  //                 this.phpService.getDislikeInfoPerUser(this.user.uid, postInfo.ID).subscribe(userDislikeInfo => {
  //                 this.phpService.getCountOfComments(postInfo.ID).subscribe(commentsCount => {
  //                   this.phpService.getPostImages(postInfo.ID).subscribe(postImages => {

  //                       // Check post is liked by loggedin User or not
  //                       let isLiked = false;
  //                       if( userLikeInfo === 0 ){
  //                       }else{
  //                         isLiked = true;
  //                       }

  //                       // Check post is liked by loggedin User or not
  //                       let isDisliked = false;
  //                       if( userDislikeInfo === 0 ){
  //                       }else{
  //                         isDisliked = true;
  //                       }

  //                       // Get Wishlist information
  //                       let isInWishlist = false;

  //                       if( wishlistInfo.length === 0 ){
  //                       } else {
  //                         wishlistInfo.forEach(wishObj=>{
                
  //                           if(wishObj.PostId === this.postId){
  //                             isInWishlist = true;
  //                           }    
  //                         });
  //                       }

  //                       // Check each post has Image or not
  //                       let postImage;
  //                       if(postImages != false){
  //                         postImage = constants.baseURI + postImages.images_path;
  //                       }

  //                       this.postObj          = postInfo;
  //                       this.userObj          = userinfo;
  //                       this.profilePic       = constants.baseURI + userProfilePic.images_path;
  //                       this.isPostInWishlist = isInWishlist;
  //                       this.likesCount       = likesCount;
  //                       this.isPostLiked      = isLiked;
  //                       this.dislikesCount    = dislikesCount;
  //                       this.isPostDisliked   = isDisliked;
  //                       this.commentsCount    = commentsCount;
  //                       this.postImage        = postImage;

  //                       loader.dismiss();
  //                     });
  //                   });
  //                 });
  //               });
  //             });
  //           });
  //         });
  //       });
  //     });
  //   });

    
  // }

  // Retrieve the JSON encoded data from the remote server
  // Using Angular's Http class and an Observable - then
  // assign this to the items array for rendering to the HTML template
  loadAllComments(postId)
  {
    let hasPostInfo: boolean = false;
    this.comments = [];

    this.phpService.getAllComments(postId, this.user.uid).subscribe(commentsdata => {
      commentsdata.forEach(comment => {

        // Check each post has Image or not
        let postImage;
        if(comment.postimg != null){
          postImage = constants.baseURI + comment.postimg;
        }

        if(hasPostInfo == false){
          console.log('Inside haspostinfo: '+ hasPostInfo);
          this.postInfo.postId             = comment.postId;
          this.postInfo.postImage          = postImage;
          this.postInfo.postByName         = comment.postbyname;
          this.postInfo.postedByProfilePic = constants.baseURI + comment.postUserProfilepic;
          this.postInfo.post               = comment.post;
          this.postInfo.postedDate         = comment.posteddate;
          this.postInfo.postedById         = comment.postedby;
          this.postInfo.isWished           = comment.isWished;
          this.postInfo.likesCount         = comment.likesCount;
          this.postInfo.dislikesCount      = comment.dislikesCount;
          this.postInfo.commentsCount      = comment.commentsCount;
          this.postInfo.isLiked            = comment.isLiked;
          this.postInfo.isdisLiked         = comment.isdisLiked;
          hasPostInfo                      = true;
        }

        this.comments.push({
          "id"                    : comment.ID,
          "comment"               : comment.comment,
          "commentedById"         : comment.commentedBy,
          "commentedDate"         : comment.commentedDate,
          "commentedByName"       : comment.commentedbyname,
          "commentedByProfilePic" : constants.baseURI + comment.commentedbypic
        });
      });
    });

   /*this.phpService.getAllComments(postId).subscribe(commentsInfo => {

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
      });*/
  }

  // Add Comments
  postComment(commentDesc: string) {

    this.phpService.addComments(this.postId, commentDesc, this.user.uid)
    .subscribe(res => {
      this.commentInput = '';
      this.loadAllComments(this.postId);

      this.postInfo.commentsCount += 1;

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

                  this.postInfo.commentsCount -= 1;

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
    //this.loadpostInfo();
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
  addToWishlist(commentItem: any){
    this.phpService.addWishlist(this.user.uid, this.postId).subscribe(wishlistInfo => {

      this.postInfo.isWished = 1;

      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        this.posts[index].isWished = 1;

        let toast = this.toastCtrl.create({
          message: `Added to your wishlist!`,
          duration: 2000
        });
        toast.present();
      }
    });
  }

  // Remove Wishlist
  removeFromWishlist(commentItem: any){
    this.phpService.deleteWishlist(this.user.uid, this.postId).subscribe(wishlistInfo => {

      this.postInfo.isWished = 0;

      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        this.posts[index].isWished = 0;

        if(this.isRemoveFromSlice === 'RemoveSlice'){
          if (index !== -1) {
            this.posts.splice(index, 1);

            let toast = this.toastCtrl.create({
              message: `Removed from your wishlist!`,
              duration: 2000
            });
            toast.present();
          }
        }
      }
    });
  }

  // Add Like
  addLike(commentItem: any){
    
    this.phpService.addLike(this.user.uid, this.postId).subscribe(likeInfo => {

      this.postInfo.likesCount += 1;
      this.postInfo.isLiked = 1;

      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        this.posts[index].likesCount += 1;
        this.posts[index].isPostLiked = 1;
      }

      this.removeDislike(commentItem);

    });
  }

  // Remove Like
  removeLike(commentItem: any){
    this.phpService.deleteLike(this.user.uid, this.postId).subscribe(likeInfo => {

      if( this.postInfo.likesCount > 0 && this.postInfo.isLiked === 1){
        this.postInfo.likesCount -= 1;
        this.postInfo.isLiked = 0;
      }
      
      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        if( this.posts[index].likesCount > 0 ){
          this.posts[index].likesCount -= 1;
        }
        this.posts[index].isPostLiked = 0;
      }

    });
  }

  // Add Dislike
  addDislike(commentItem: any){
    
    this.phpService.addDislike(this.user.uid, this.postId).subscribe(dislikeInfo => {

      this.postInfo.dislikesCount += 1;
      this.postInfo.isdisLiked = 1;

      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        this.posts[index].dislikesCount += 1;
        this.posts[index].isPostDisliked = 1;
      }

      this.removeLike(commentItem);

    });
  }

  // Remove Like
  removeDislike(commentItem: any){
    this.phpService.deleteDislike(this.user.uid, this.postId).subscribe(dislikeInfo => {

      if( this.postInfo.dislikesCount > 0 && this.postInfo.isdisLiked === 1){
        this.postInfo.dislikesCount -= 1;
        this.postInfo.isdisLiked = 0;
      }

      if(this.isIndexed === 'UpdateIndex'){
        var index = this.posts.indexOf(this.postItem);
        if( this.posts[index].dislikesCount > 0 ){
          this.posts[index].dislikesCount -= 1;
        }
        this.posts[index].isPostDisliked = 0;
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
    var element = this.myInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + 'px';
    this.myInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
  } 
}
