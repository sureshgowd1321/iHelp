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

  public commentsCount : number;

  public comments: IComments[] = [];

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
    this.loadAllComments(this.postId);
  }

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
        if(comment.puImg != null){
          postImage = constants.baseURI + comment.puImg;
        }

        let postStr = this.phpService.findAndReplace(comment.post, "&#39;", "'");
        postStr = this.phpService.findAndReplace(postStr, "&#34;", "\"");

        if(hasPostInfo == false){
          this.postInfo.postId             = comment.ID;
          this.postInfo.postImage          = postImage;
          this.postInfo.postByName         = comment.puname;
          this.postInfo.postedByProfilePic = constants.baseURI + comment.pupic;
          this.postInfo.post               = postStr;
          this.postInfo.postedDate         = comment.PostedDate;
          this.postInfo.postedById         = comment.CreatedById;
          this.postInfo.isWished           = comment.isWished;
          this.postInfo.likesCount         = comment.likesCount;
          this.postInfo.dislikesCount      = comment.dislikesCount;
          this.postInfo.commentsCount      = comment.commentsCount;
          this.postInfo.isLiked            = comment.isLiked;
          this.postInfo.isdisLiked         = comment.isdisLiked;
          hasPostInfo                      = true;
        }

        let commentStr;
        if(comment.comment != null){
          commentStr = this.phpService.findAndReplace(comment.comment, "&#39;", "'");
          commentStr = this.phpService.findAndReplace(commentStr, "&#34;", "\"");
        }else{
          commentStr = comment.comment;
        }


        if(this.postInfo.commentsCount > 0){
          this.comments.push({
            "id"                    : comment.commentId,
            "comment"               : commentStr,
            "commentedById"         : comment.commentBy,
            "commentedDate"         : comment.commentDate,
            "commentedByName"       : comment.cuname,
            "commentedByProfilePic" : constants.baseURI + comment.cupic
          });
        }
      });
    });
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
