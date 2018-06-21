import { Component } from '@angular/core';
import { NavController, AlertController, ActionSheetController, LoadingController, ToastController } from 'ionic-angular';
//import { Http } from '@angular/http';
//import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app'; 

//Pages
import { AddPostPage } from '../add-post/add-post';
import { EditPostPage } from '../edit-post/edit-post';
import { CommentsPage } from '../comments/comments';
import { FilterPostsPage } from '../filter-posts/filter-posts';
import { UserProfilePage } from '../user-profile/user-profile';

//Constants
import { constants } from '../../constants/constants';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';
import { ProfileDataProvider } from '../../providers/profile-data/profile-data';

// Interfaces
import { IAllPosts } from '../../providers/interface/interface';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  // LoggedIn User Info variables
  user;

  // List of posts to display
  public posts: IAllPosts[] = [];

  // Pagination Variables
  page = 1;
  maximumPages = 40;

  constructor(//public http : Http, 
              public navCtrl: NavController,
              private profileData: ProfileDataProvider,
              public actionSheetCtrl: ActionSheetController,
              public phpService: PhpServiceProvider,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public toastCtrl: ToastController
            ) {
              
      this.user = firebase.auth().currentUser;  
  }

  ionViewDidLoad(){  
    this.posts.length = 0;
    this.page = 1;
    this.loadPosts();
  }

  // Load all posts to display
  loadPosts(infiniteScroll?){

    this.phpService.getAllPosts(this.user.uid, this.page).subscribe(postdata => {
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

  // Go to Add post Page to add a post
  gotoAddPost() {
    this.navCtrl.push(AddPostPage);
  }

  // Go to Edit Post Page to update the post
  gotoEditPostPage(postId: any, posts: IAllPosts[], postItem: any) {
    this.navCtrl.push(EditPostPage, {
      postId, posts, postItem
    });
  }

  // Go to Filter Posts page
  gotoFilterPostPage() {
    this.navCtrl.push(FilterPostsPage);
  }

  // Goto Comments Page
  gotoCommentsPage(postId: any, posts: IAllPosts[], postItem: any) {
    let updateIndex = 'UpdateIndex';
    this.navCtrl.push(CommentsPage, {
      postId, posts, postItem, updateIndex
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

                        let toast = this.toastCtrl.create({
                          message: `Your Post is Deleted!`,
                          duration: 2000
                        });
                        toast.present();
                        
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
  modifyCardActionSheet(postId: any, posts: IAllPosts[], postItem: any) {
    let actionSheet = this.actionSheetCtrl.create({
      //title: 'Modify your Post',
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

  // Add Wishlist
  addToWishlist(postId: any, postItem: any){
    this.phpService.addWishlist(this.user.uid, postId).subscribe(wishlistInfo => {
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
    this.phpService.deleteWishlist(this.user.uid, postId).subscribe(wishlistInfo => {
      var index = this.posts.indexOf(postItem);
      this.posts[index].isWished = 0;

      let toast = this.toastCtrl.create({
        message: `Removed from your wishlist!`,
        duration: 2000
      });
      toast.present();

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
