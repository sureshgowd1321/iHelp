import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import * as firebase from 'firebase/app'; 

// Interfaces
import { IAllPosts } from '../../providers/interface/interface';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';
import { ProfileDataProvider } from '../../providers/profile-data/profile-data';

//Constants
import { constants } from '../../constants/constants';

//Pages
import { EditPostPage } from '../edit-post/edit-post';
import { CommentsPage } from '../comments/comments';

/**
 * Generated class for the UserPostsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-posts',
  templateUrl: 'user-posts.html',
})
export class UserPostsPage {

  public loggedInUser;
  public posts: IAllPosts[] = [];
  public userUId: string;

  // Pagination Variables
  page = 1;
  maximumPages = 40;

  // Capture
  public base64Image: string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private profileData: ProfileDataProvider,
              public actionSheetCtrl: ActionSheetController,
              public phpService: PhpServiceProvider,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController) {

    this.loggedInUser = firebase.auth().currentUser.uid; 
    
    this.userUId = this.navParams.get('userId');
  }

  ionViewDidLoad()
  {  
    this.posts = [];
    this.page = 1;
    this.loadPosts();
  }

  loadPosts(infiniteScroll?){
    this.phpService.getPostsFromUserId(this.loggedInUser, this.userUId, this.page).subscribe(postdata => {
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
            "id"            : postInfo.ID,
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
            "isWished"      : postInfo.isWished
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
      this.navCtrl.push(CommentsPage, {
        postId, posts, postItem, updateIndex
      });
    }

    // Goto Signup Page
    goToUserPosts(userId): void {
      this.navCtrl.push(UserPostsPage, {
        userId
      });
    }

    // Display Image in Full Screen  
    displayImageFullScreen(imageToView) {
      this.profileData.displayImageInFullScreen(imageToView);
    }

    // Action sheet on each post to modify/delete your post
    modifyCardActionSheet(postId: any, posts: IAllPosts[], postItem: any) {
      let actionSheet = this.actionSheetCtrl.create({
        //title: 'Modify your album',
        buttons: [
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => {
              this.deletePost(postId, postItem);
            }
          },
          {
            text: 'Edit',
            handler: () => {
              this.gotoEditPostPage(postId, posts, postItem);
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

     // Go to Edit Post Page to update the post
    gotoEditPostPage(postId: any, posts: IAllPosts[], postItem: any) {
      this.navCtrl.push(EditPostPage, {
        postId, posts, postItem
      });
    }

    // Delete the post
    deletePost(postId: any, postItem: any){
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
              // Delete Comments of this post
              this.phpService.deleteCommentsOfPost(postId).subscribe(res => {
                // Delete Likes of this post
                this.phpService.deleteLikesOfPost(postId).subscribe(res => {
                  // Delete Dislikes of this post
                  this.phpService.deleteDislikesOfPost(postId).subscribe(res => {
                    // Delete Wishlist of this post
                    this.phpService.deleteWishlistOfPost(postId).subscribe(res => {
                      // Delete Image of post
                      this.phpService.deleteImage(postId).subscribe(res => {
                        // Delete Post
                        this.phpService.deletePost(postId).subscribe(res => {

                          var index = this.posts.indexOf(postItem);
                          if (index !== -1) {
                            this.posts.splice(index, 1);
                          }

                        });
                      });      
                    });
                  });     
                }); 
              });
            }
          }
        ]
      })
      alert.present();
    }

    // Add Like
    addLike(postId: any, postItem: any){
      this.phpService.addLike(this.loggedInUser, postId).subscribe(likeInfo => {
        var index = this.posts.indexOf(postItem);
        this.posts[index].likesCount += 1;
        this.posts[index].isPostLiked = 1;

        this.removeDislike(postId, postItem);

      });
    }

    // Remove Like
    removeLike(postId: any, postItem: any){
      this.phpService.deleteLike(this.loggedInUser, postId).subscribe(likeInfo => {
        var index = this.posts.indexOf(postItem);
        if( this.posts[index].likesCount > 0 && this.posts[index].isPostLiked === 1){
          this.posts[index].likesCount -= 1;
          this.posts[index].isPostLiked = 0;
        }
      });
    }

    // Add Dislike
    addDislike(postId: any, postItem: any){
      this.phpService.addDislike(this.loggedInUser, postId).subscribe(dislikeInfo => {
        var index = this.posts.indexOf(postItem);
        this.posts[index].dislikesCount += 1;
        this.posts[index].isPostDisliked = 1;

        this.removeLike(postId, postItem);
      });
    }

    // Remove Dislike
    removeDislike(postId: any, postItem: any){
      this.phpService.deleteDislike(this.loggedInUser, postId).subscribe(dislikeInfo => {
        var index = this.posts.indexOf(postItem);
        if( this.posts[index].dislikesCount > 0 && this.posts[index].isPostDisliked === 1){
          this.posts[index].dislikesCount -= 1;
          this.posts[index].isPostDisliked = 0;
        }  
      });
    }

    // Add Wishlist
    addToWishlist(postId: any, postItem: any){
      this.phpService.addWishlist(this.loggedInUser, postId).subscribe(wishlistInfo => {
        var index = this.posts.indexOf(postItem);
        this.posts[index].isWished = 1;

        let toast = this.toastCtrl.create({
          message: `Added to your wishlist!`,
          duration: 2000
        });
        toast.present();

      });
    }

    // Remove Wishlist
    removeFromWishlist(postId: any, postItem: any){
      this.phpService.deleteWishlist(this.loggedInUser, postId).subscribe(wishlistInfo => {
        var index = this.posts.indexOf(postItem);
        this.posts[index].isWished = 0;

        let toast = this.toastCtrl.create({
          message: `Added to your wishlist!`,
          duration: 2000
        });
        toast.present();

      });
    }

}
