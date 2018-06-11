import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

//Constants
import { constants } from '../../constants/constants';

/*
  Generated class for the PhpServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PhpServiceProvider {

  constructor(public http : Http) {}

  // Get User Info
  getUserInfo(id: string){
    return this.http.get(constants.baseURI + 'getUserInfoFromId.php?userId='+id)
    .map(response => response.json());
  }

  // Get User Profile Picture
  getUserProfilePic(id: string) {
    return this.http.get(constants.baseURI + 'getUserProfilePic.php?userId='+id)
    .map(response => response.json());
  }

  // Get All Posts
  // getPosts(page: number, postFilter: string, postCity: string, postState: string, postCountry: string, userUid: string, createdDate: string) {
  //     return this.http.get(constants.baseURI + 'get-posts.php?page=' + page
  //                                       + '&userPostFilter=' + postFilter
  //                                       + '&postedCity=' + postCity
  //                                       + '&postedState=' + postState
  //                                       + '&postedCountry=' + postCountry
  //                                       + '&userUid=' + userUid
  //                                       + '&userCreatedDate=' + createdDate)
  //     .map(response => response.json());
  // } 
  // Get All Posts
  getAllPosts(userUid: string, page: number){
    return this.http.get(constants.baseURI + 'get-all-posts.php?userUid='+userUid
                                          + '&page=' + page)
      .map(response => response.json());
  }

  getTimeAgo(date: string){
    return this.http.get(constants.baseURI + 'time-ago.php?date='+date)
          .map(response => response.text());
  }

  // Get Post Information
  getPostInfo(postId: string) {
    return this.http.get(constants.baseURI + 'getDataFromId.php?postId='+postId)
    .map(response => response.json());
  }

  // Get All Posts from User Id
  getPostsFromUserId(page: number, userUid: string) {
    return this.http.get(constants.baseURI + 'getPostsFromUserId.php?userUid='+userUid
                                      + '&page=' + page)
    .map(response => response.json());
  }

  // Get Images from Post
  getPostImages(id: string) {
    return this.http.get(constants.baseURI + 'get-Post-Images.php?postId='+id)
    .map(response => response.json());
  }

  // Get All Comments per post
  getAllComments(postId: string, userId: string) {
    return this.http.get(constants.baseURI + 'get-all-comments.php?postId='+postId
                                                + '&userId=' + userId)
    .map(response => response.json());
  }

  // Get Count of Comments per post
  getCountOfComments(postId: string) {
    return this.http.get(constants.baseURI + 'get-all-comments.php?key=countOfCommentsPerPost&postId='+postId)
    .map(response => response.json());
  }

  // Get Location from Location Id
  getLocationInfo(locationId: string) {
    return this.http.get(constants.baseURI + 'getLocationsFromId.php?locationId='+locationId)
    .map(response => response.json());
  }

  // Get Location Id from Locations
  getLocationId(city: string, state: string, country: string) {
    return this.http.get(constants.baseURI + 'getLocationIdFromLocations.php?city=' + city + '&state=' + state + '&country=' + country )
    .map(response => response.json());
  }

  // Get Wishlist information from User Id
  getWishlistFromUserId(userUid: string) {
    return this.http.get(constants.baseURI + 'getWishlistFromUserId.php?userUid=' + userUid)
    .map(response => response.json());
  }

  // Get Wishlist information from User Id
  getMyWishlist(page: number, userUid: string) {
    return this.http.get(constants.baseURI + 'get-my-wishlist.php?userUid=' + userUid
                                      + '&page=' + page)
    .map(response => response.json());
  }

  //Get count of Likes for each post
  getlikesCount(postId: string) {
    return this.http.get(constants.baseURI + 'getCountOfLikes.php?key=totalLikesCountPerPost&postId=' + postId)
    .map(response => response.json());
  }

  //Get count of Likes for each post - new
  getLikes(postId: string) {
    return this.http.get(constants.baseURI + 'getCountOfLikes.php?key=totalLikes&postId=' + postId)
    .map(response => response.json());
  }

  //Get count of Dislikes for each post
  getdislikesCount(postId: string) {
    return this.http.get(constants.baseURI + 'getCountOfLikes.php?key=totalDislikesCountPerPost&postId=' + postId)
    .map(response => response.json());
  }

  //Get like info per user per post
  getlikeInfoPerUser(userId: string, postId: string) {
    return this.http.get(constants.baseURI + 'getCountOfLikes.php?key=likesPerUser&userId=' + userId + '&postId=' + postId)
    .map(response => response.json());
  }

  //Get Dislike info per user per post
  getDislikeInfoPerUser(userId: string, postId: string) {
    return this.http.get(constants.baseURI + 'getCountOfLikes.php?key=dislikesPerUser&userId=' + userId + '&postId=' + postId)
    .map(response => response.json());
  }

  //Get like info per user per post
  getLikesPerPost(postId: string) {
    return this.http.get(constants.baseURI + 'getCountOfLikes.php?key=totalLikesPerPost&postId=' + postId)
    .map(response => response.json());
  }

  //Get Dislike info per user per post
  getDislikesPerPost(postId: string) {
    return this.http.get(constants.baseURI + 'getCountOfLikes.php?key=totalDislikesPerPost&postId=' + postId)
    .map(response => response.json());
  }

  // Get All Countries
  getAllCountries() {
    console.log('Inside PHP:');
    //return this.http.get(constants.baseURI + 'get-all-locations.php?key=countries')
    return this.http.get(constants.baseURI + 'get-all-locations.php')
    .map(response => response.json());
  }

  // Adding New Post
  addPost(postDesc, userId, postedLocation, PostalCode, postedCity, postedState, postedCountry)
  {
      let body     : string   = "key=create&post=" + postDesc + '&userId=' + userId + '&postedLocation=' + postedLocation + '&postalCode=' + PostalCode + 
                                '&postedCity='+ postedCity + '&postedState=' + postedState + '&postedCountry=' + postedCountry,
          type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
          headers  : any      = new Headers({ 'Content-Type': type}),
          options  : any      = new RequestOptions({ headers: headers }),
          url      : any      = constants.baseURI + "manage-data.php";

      return this.http.post(url, body, options)
                  .map(response => response.json());
  }

  // Updating existing post
  updatePost(postDesc, recordID, postedLocation, PostalCode, postedCity, postedState, postedCountry)
  {
     let body       : string = "key=update&post=" + postDesc + "&recordID=" + recordID+ '&postedLocation=' + postedLocation + '&postalCode=' + PostalCode + 
                                '&postedCity='+ postedCity + '&postedState=' + postedState + '&postedCountry=' + postedCountry,
         type       : string = "application/x-www-form-urlencoded; charset=UTF-8",
         headers    : any     = new Headers({ 'Content-Type': type}),
         options    : any     = new RequestOptions({ headers: headers }),
         url        : any     = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
              .map(response => response.json());
  }
  
  // Deleting post
  deletePost(recordID)
  {
     let body       : string = "key=delete&recordID=" + recordID,
         type       : string = "application/x-www-form-urlencoded; charset=UTF-8",
         headers    : any    = new Headers({ 'Content-Type': type}),
         options    : any    = new RequestOptions({ headers: headers }),
         url        : any    = constants.baseURI + "manage-data.php";

     return this.http.post(url, body, options)
              .map(response => response.json());
  }

  // Upload Post Image
  uploadPostImage(postId){
    let body     : string   = "postId=" + postId ,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "upload-post-image.php";

      return this.http.post(url, body, options)
                  .map(response => response.json());
  }

  // Delete Post Image
  deleteImage(postId){
    let body     : string   = "key=deleteImagesOfPost&postId=" + postId,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                .map(response => response.json());
  }

  // Adding New comments
  addComments(postId, comment, commentedBy){
    console.log('Asyn Starts: ');
    let body     : string   = "key=addComment&postId=" + postId + "&comment=" + comment + "&commentedBy=" + commentedBy,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                .map(response => response.json());
  }

  // Updating comments
  updateComment(commentId, comment)
  {
    let body     : string   = "key=updateComment&commentId=" + commentId + "&comment=" + comment,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

        return this.http.post(url, body, options)
                    .map(response => response.json());
  }

  // Deleting comments from CommentId
  deleteComment(commentId)
  {
    let body     : string   = "key=deleteComment&commentId=" + commentId,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                .map(response => response.json());
  }

  // Deleting all comments of deleted Post
  deleteCommentsOfPost(postId)
  {
    let body     : string   = "key=deleteCommentsOfPost&postId=" + postId,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                .map(response => response.json());
  }

  // Deleting all Likes of deleted Post
  deleteLikesOfPost(postId)
  {
    let body     : string   = "key=deleteLikesOfPost&postId=" + postId,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                .map(response => response.json());
  }

  // Deleting all Dislikes of deleted Post
  deleteDislikesOfPost(postId)
  {
    let body     : string   = "key=deleteDislikesOfPost&postId=" + postId,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                .map(response => response.json());
  }

  // Deleting all comments of deleted Post
  deleteWishlistOfPost(postId)
  {
    let body     : string   = "key=deleteWishlistOfPost&postId=" + postId,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                .map(response => response.json());
  }

  // Add New User service
  addNewOnlineUser(userId, name, email, locationId, gender)
  {
    let body     : string   = "key=addUser" + 
                              "&userId=" + userId + 
                              "&name=" + name +
                              "&gender=" + gender +
                              "&email=" + email +
                              "&locationId=" + locationId +
                              "&totalStars=" + 0 ,

        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    this.http.post(url, body, options)
    .subscribe((data) =>
    {
      //If the request was successful notify the user
      if(data.status === 200)
      {
          console.log('***Add User Success:' + data);
      }
      // Otherwise let 'em know anyway
      else
      {   
          console.log('***Add User Error');
      }
    });
  }

  // Add New User service
  updateUserFilter(userId, postFilter)
  {
    let body     : string   = "key=updateUserPostFilter" + 
                              "&userId=" + userId + 
                              "&postFilter=" + postFilter ,

        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                  .map(response => response.json());
  }

  // Update User Data
  updateUserData(userId, updatedName, updatedGender, locId)
  {
    let body     : string   = "key=updateUserData" + 
                              "&userId=" + userId + 
                              "&userName=" + updatedName + 
                              "&gender=" + updatedGender + 
                              "&locationId=" + locId ,

        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                  .map(response => response.json());
  }

  // Adding New Wishlist
  addWishlist(userId, postId)
  {
      let body     : string   = "key=addWishlist&postId=" + postId + '&userUid=' + userId,
          type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
          headers  : any      = new Headers({ 'Content-Type': type}),
          options  : any      = new RequestOptions({ headers: headers }),
          url      : any      = constants.baseURI + "manage-data.php";

      return this.http.post(url, body, options)
                  .map(response => response.json());
  }

  // Deleting Wishlist
  deleteWishlist(userId, postId)
  {
    let body     : string   = "key=deleteWishlist&postId=" + postId + '&userUid=' + userId,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                .map(response => response.json());
  }

  // Adding Like to a post
  addLike(userId, postId)
  {
      let body     : string   = "key=addLike&postId=" + postId + '&userUid=' + userId,
          type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
          headers  : any      = new Headers({ 'Content-Type': type}),
          options  : any      = new RequestOptions({ headers: headers }),
          url      : any      = constants.baseURI + "manage-data.php";

      return this.http.post(url, body, options)
                  .map(response => response.json());
  }

  // Deleting Like
  deleteLike(userId, postId)
  {
    let body     : string   = "key=deleteLike&postId=" + postId + '&userUid=' + userId,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                .map(response => response.json());
  }

  // Adding Dislike to a post
  addDislike(userId, postId)
  {
      let body     : string   = "key=addDislike&postId=" + postId + '&userUid=' + userId,
          type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
          headers  : any      = new Headers({ 'Content-Type': type}),
          options  : any      = new RequestOptions({ headers: headers }),
          url      : any      = constants.baseURI + "manage-data.php";

      return this.http.post(url, body, options)
                  .map(response => response.json());
  }

  // Deleting Dislike
  deleteDislike(userId, postId)
  {
    let body     : string   = "key=deleteDislike&postId=" + postId + '&userUid=' + userId,
        type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
        headers  : any      = new Headers({ 'Content-Type': type}),
        options  : any      = new RequestOptions({ headers: headers }),
        url      : any      = constants.baseURI + "manage-data.php";

    return this.http.post(url, body, options)
                .map(response => response.json());
  }

  // Adding New Location
  addNewLocation(country, state, city)
  {
      let body     : string   = "key=addNewLocation&country=" + country + '&state=' + state + '&city=' + city,
          type     : string   = "application/x-www-form-urlencoded; charset=UTF-8",
          headers  : any      = new Headers({ 'Content-Type': type}),
          options  : any      = new RequestOptions({ headers: headers }),
          url      : any      = constants.baseURI + "manage-data.php";

      return this.http.post(url, body, options)
                  .map(response => response.json());
  }

}
