import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, ActionSheetController, LoadingController, ToastController } from 'ionic-angular';
import * as firebase from 'firebase/app'; 

// Interfaces
import { IAllPosts } from '../../providers/interface/interface';

//Constants
import { constants } from '../../constants/constants';

//Pages
import { CommentsPage } from '../comments/comments';
import { UserProfilePage } from '../user-profile/user-profile';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';
import { ProfileDataProvider } from '../../providers/profile-data/profile-data';

/**
 * Generated class for the MyWishlistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-wishlist',
  templateUrl: 'my-wishlist.html',
})
export class MyWishlistPage {

    // LoggedIn User
    user;

    // List of posts to display
    public posts: IAllPosts[] = [];
  
    // Pagination Variables
    page = 1;
    maximumPages = 40;
  
    constructor(public navCtrl: NavController,
                public phpService: PhpServiceProvider,
                public alertCtrl: AlertController,
                public actionSheetCtrl: ActionSheetController,
                private profileData: ProfileDataProvider,
                public loadingCtrl: LoadingController,
                public toastCtrl: ToastController) {
  
      this.user = firebase.auth().currentUser;
    }
  
    ionViewDidLoad()
    {  
      this.posts = [];
      this.page = 1;
      this.loadPosts();
    }
  
    // Retrieve the JSON encoded data from the remote server
    // Using Angular's Http class and an Observable - then
    // assign this to the items array for rendering to the HTML template
    loadPosts(infiniteScroll?){

      this.phpService.getMyWishlist(this.page, this.user.uid).subscribe(postdata => {
        postdata.forEach(postInfo => {

          // Check each post has Image or not
          let postImage;
          if(postInfo.images_path != null){
            postImage = constants.baseURI + postInfo.images_path;
          }

          let postStr = this.phpService.findAndReplace(postInfo.post, "&#39;", "'");
          postStr = this.phpService.findAndReplace(postStr, "&#34;", "\"");

          this.posts.push(
            {
              "id"            : postInfo.PostId,
              "post"          : postStr,
              "createdDate"   : postInfo.PostedDate,
              "name"          : postInfo.name,
              "profilePic"    : constants.baseURI + postInfo.ProfilePicURL,
              "createdById"   : postInfo.CreatedById,
              "postImages"    : postImage,
              "likesCount"    : postInfo.likesCount,
              "dislikesCount" : postInfo.dislikesCount,
              "commentsCount" : postInfo.commentsCount,
              "isPostLiked"   : postInfo.isLiked,
              "isPostDisliked": postInfo.isdisLiked,
              "isWished"      : 1
            }
          );
        });
      });
      
    }
  
    loadMore(infiniteScroll){
      this.page++;
  
      setTimeout(() => {
        this.loadPosts(infiniteScroll);
        infiniteScroll.complete();
      }, 500);
  
      if (this.page === this.maximumPages) {
        infiniteScroll.enable(false);
      }
    }
  
    // Pull to Refresh functionality
    loadrefresh(refresher) {
      this.posts.length = 0;
      this.page = 1;
      this.loadPosts();
      if(refresher != 0)
        refresher.complete();
    
    }
  
    // Goto Comments Page
    gotoCommentsPage(postId: any, posts: IAllPosts[], postItem: any) {
      let updateIndex = 'UpdateIndex';
      let removeFromList = 'RemoveSlice';

      this.navCtrl.push(CommentsPage, {
        postId, posts, postItem, updateIndex, removeFromList
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

    // Action sheet on each post to modify/delete your post
    modifyCardActionSheet(postId: any, postItem: any) {
      let actionSheet = this.actionSheetCtrl.create({
        //title: 'Modify your album',
        buttons: [
          {
            text: 'Remove from Wishlist',
            role: 'destructive',
            handler: () => {
              this.deleteFromWishlist(postId, postItem);
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

    // Remove Wishlist
    deleteFromWishlist(postId: any, postItem: any) {
      this.phpService.deleteWishlist(this.user.uid, postId).subscribe(wishlistInfo => {
        var index = this.posts.indexOf(postItem);
        if (index !== -1) {
          this.posts.splice(index, 1);

          let toast = this.toastCtrl.create({
            message: `Removed from your wishlist!`,
            duration: 2000
          });
          toast.present();

        }
      });
    }

    // Add Like
    addLike(postId: any, postItem: any){
      this.phpService.addLike(this.user.uid, postId).subscribe(likeInfo => {
        var index = this.posts.indexOf(postItem);
        this.posts[index].likesCount += 1;
        this.posts[index].isPostLiked = 1;

        this.removeDislike(postId, postItem);
      });
    }

    // Remove Like
    removeLike(postId: any, postItem: any){
      this.phpService.deleteLike(this.user.uid, postId).subscribe(likeInfo => {
        var index = this.posts.indexOf(postItem);
        if( this.posts[index].likesCount > 0 && this.posts[index].isPostLiked === 1 ){
          this.posts[index].likesCount -= 1;
          this.posts[index].isPostLiked = 0;
        }   
      });
    }

    // Add Dislike
    addDislike(postId: any, postItem: any){
      this.phpService.addDislike(this.user.uid, postId).subscribe(dislikeInfo => {
        var index = this.posts.indexOf(postItem);
        this.posts[index].dislikesCount += 1;
        this.posts[index].isPostDisliked = 1;

        this.removeLike(postId, postItem);
      });
    }

    // Remove Dislike
    removeDislike(postId: any, postItem: any){
      this.phpService.deleteDislike(this.user.uid, postId).subscribe(dislikeInfo => {
        var index = this.posts.indexOf(postItem);
        if( this.posts[index].dislikesCount > 0 && this.posts[index].isPostDisliked === 1){
          this.posts[index].dislikesCount -= 1;
          this.posts[index].isPostDisliked = 0;
        }  
      });
    }

}
