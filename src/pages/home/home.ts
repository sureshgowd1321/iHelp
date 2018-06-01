import { Component } from '@angular/core';
import { NavController, AlertController, ActionSheetController, LoadingController, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
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
import { IPosts } from '../../providers/interface/interface';

// Order Pipe
import { OrderPipe } from 'ngx-order-pipe';

//Ionic Cache service
import { CacheService } from "ionic-cache";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  // LoggedIn User Info variables
  user;

  // List of posts to display
  public posts: IPosts[] = [];

  // Order By Variables
  order: string = 'id';
  reverse: boolean = true;
  hasPosts: boolean = false;

  // Pagination Variables
  page = 1;
  maximumPages = 40;

  // Variables to pass comments page
  postId: any;
  postItem: any;

  constructor(public http : Http, 
              public navCtrl: NavController,
              private profileData: ProfileDataProvider,
              public actionSheetCtrl: ActionSheetController,
              public phpService: PhpServiceProvider,
              public alertCtrl: AlertController,
              private orderPipe: OrderPipe,
              private cache: CacheService,
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
    let loader = this.loadingCtrl.create({
      content: "fetching..."
    });

    if (!infiniteScroll) {
      loader.present();
    }

    this.phpService.getUserInfo(this.user.uid).subscribe(loggedInUserInfo => {
      this.phpService.getLocationInfo(loggedInUserInfo.PostalCode).subscribe(userLocationInfo => {
        this.phpService.getPosts(this.page, loggedInUserInfo.PostFilter, userLocationInfo.City, 
                                  userLocationInfo.State, userLocationInfo.Country, this.user.uid, loggedInUserInfo.CreatedDate).subscribe(postdata => {
          console.log('***postdata: '+ postdata);
          if( postdata.length === 0 ){
            if (!infiniteScroll) {
              this.hasPosts = false;
              loader.dismiss();
            }
          }else {                         
            postdata.forEach(postInfo => {
              this.hasPosts = true;

              this.phpService.getUserInfo(postInfo.CreatedById).subscribe(userinfo => {
                this.phpService.getUserProfilePic(postInfo.CreatedById).subscribe(userProfilePic => {                        
                  this.phpService.getLocationInfo(userinfo.PostalCode).subscribe(userLocationInfo => {                         
                    this.phpService.getlikesCount(postInfo.ID).subscribe(likesCount => {
                      this.phpService.getdislikesCount(postInfo.ID).subscribe(dislikesCount => {
                        this.phpService.getlikeInfoPerUser(this.user.uid, postInfo.ID).subscribe(userLikeInfo => {
                          this.phpService.getDislikeInfoPerUser(this.user.uid, postInfo.ID).subscribe(userDislikeInfo => {
                            this.phpService.getWishlistFromUserId(this.user.uid).subscribe(wishlistInfo => {                                
                              this.phpService.getCountOfComments(postInfo.ID).subscribe(commentsCount => {
                                this.phpService.getPostImages(postInfo.ID).subscribe(postImages => {

                                  // Check post is liked by loggedin User or not
                                  let isPostLiked = false;
                                  if( userLikeInfo === 0 ){
                                  }else{
                                    isPostLiked = true;
                                  }

                                  // Check post is Disliked by loggedin User or not
                                  let isPostDisliked = false;
                                  if( userDislikeInfo === 0 ){
                                  }else{
                                    isPostDisliked = true;
                                  }

                                  // Check post is added to wishlist or not
                                  let isPostInWishlist = false;
                                  if( wishlistInfo.length === 0 ){
                                  } else {
                                    wishlistInfo.forEach(wishObj=>{
                          
                                      if(wishObj.PostId === postInfo.ID){
                                        isPostInWishlist = true;
                                      }    
                                    });
                                  }

                                  // Check each post has Image or not
                                  let postImage;
                                  if(postImages != false){
                                    postImage = constants.baseURI + postImages.images_path;
                                  }

                                  this.posts.push(
                                    {
                                      "id"           : postInfo.ID,
                                      "post"         : postInfo.post,
                                      "createdDate"  : postInfo.CreatedDate,
                                      "createdById"  : postInfo.CreatedById,
                                      "name"         : userinfo.name,
                                      "email"        : userinfo.email,
                                      "nickname"     : userinfo.nickname,
                                      "city"         : userLocationInfo.City,
                                      "state"        : userLocationInfo.State,
                                      "country"      : userLocationInfo.Country,
                                      "profilePic"   : constants.baseURI + userProfilePic.images_path,
                                      "wishId"       : wishlistInfo.id,
                                      "addedToWishlist" : isPostInWishlist,
                                      "likesCount"      : likesCount,
                                      "dislikesCount"   : dislikesCount,
                                      "isPostLiked"     : isPostLiked,
                                      "isPostDisliked"  : isPostDisliked,
                                      "commentsCount"   : commentsCount,
                                      "postImages"      : postImage
                                    }
                                  );
                                  if (!infiniteScroll) {
                                    loader.dismiss();
                                  }
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
            });
          }
          console.log('***this.posts: '+ this.posts);
          this.posts = this.orderPipe.transform(this.posts, 'id');

          if (infiniteScroll) {
            infiniteScroll.complete();
          }
        });
      });
    });
  }

  loadMore(infiniteScroll){
    this.page++;

    this.loadPosts(infiniteScroll);

    if (this.page === this.maximumPages) {
      infiniteScroll.enable(false);
    }
  }

  // Pull to Refresh functionality
  loadrefresh(refresher) {
    this.posts.length = 0;
    this.posts = [];
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
  gotoEditPostPage(postId: any, posts: IPosts[], postItem: any) {
    this.navCtrl.push(EditPostPage, {
      postId, posts, postItem
    });
  }

  // Go to Filter Posts page
  gotoFilterPostPage() {
    this.navCtrl.push(FilterPostsPage);
  }

  // Goto Comments Page
  gotoCommentsPage(postId: any, posts: IPosts[], postItem: any) {
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
  modifyCardActionSheet(postId: any, posts: IPosts[], postItem: any) {
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
      this.posts[index].addedToWishlist = true;

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
      this.posts[index].addedToWishlist = false;

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
      this.posts[index].isPostLiked = true;

      this.removeDislike(postId, postItem);
    });
  }

  // Remove Like
  removeLike(postId: any, postItem: any){
    this.phpService.deleteLike(this.user.uid, postId).subscribe(likeInfo => {
      var index = this.posts.indexOf(postItem);
      if( this.posts[index].likesCount > 0 && this.posts[index].isPostLiked === true ){
        this.posts[index].likesCount -= 1;
        this.posts[index].isPostLiked = false;
      }     
    });
  }

  // Add Dislike
  addDislike(postId: any, postItem: any){
    this.phpService.addDislike(this.user.uid, postId).subscribe(dislikeInfo => {
      var index = this.posts.indexOf(postItem);
      this.posts[index].dislikesCount += 1;
      this.posts[index].isPostDisliked = true;

      this.removeLike(postId, postItem);
    });
  }

  // Remove Dislike
  removeDislike(postId: any, postItem: any){
    this.phpService.deleteDislike(this.user.uid, postId).subscribe(dislikeInfo => {
      var index = this.posts.indexOf(postItem);
      if( this.posts[index].dislikesCount > 0 && this.posts[index].isPostDisliked === true){
        this.posts[index].dislikesCount -= 1;
        this.posts[index].isPostDisliked = false;
      }
    });
  }
} 
