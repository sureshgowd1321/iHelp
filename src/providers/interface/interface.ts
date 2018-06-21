export interface IPosts {
  id           : number;
  post         : string;
  createdDate  : string;
  createdById  : string;
  name         : string;
  email        : string;
  nickname     : string;
  city         : string;
  state        : string;
  country      : string;
  profilePic   : string;  
  wishId       : number;
  addedToWishlist : boolean;
  likesCount      : number;
  dislikesCount   : number;
  isPostLiked     : boolean;
  isPostDisliked  : boolean;
  commentsCount   : number;
  postImages      : string;
}

export interface IUser {
  uid               : string;
  email?            : string;
  photoURL?         : string;
  displayName?      : string;
  favoriteColor?    : string;
  totalStars?       : number;
  createdDate?      : string;
  displayPostsFrom? : string;
  city?             : string;
  state?            : string;
  country?          : string;
  birthDate?        : Date;
  gender?           : string;
}

export interface IHelpUser {
  uid               : string;
  name?             : string;
  email?            : string;
  profilepic?       : string;
  gender?           : string;
  city?             : string;
  state?            : string;
  country?          : string;
  postalCode?       : string;
}

// export interface IComment {
//   id            : number;
//   postId        : number;
//   comment       : string;
//   commentedBy   : string;
//   commentedDate : string;
//   name          : string;
//   nickname      : string;
//   profilePic    : string;
// }

export interface ICountries {
  country   : string;
  state     : string;
  city      : string;
}

export interface IAllPosts {
  id           : number;
  post         : string;
  createdDate  : string;
  createdById  : string;
  name         : string;
  profilePic   : string;
  postImages   : string;
  likesCount      : number;
  dislikesCount   : number;
  commentsCount   : number;
  isPostLiked     : number;
  isPostDisliked  : number;
  isWished        : number;
}

export interface IComments {
  id                     : string;
  comment                : string;
  commentedById          : string;
  commentedDate          : string;
  commentedByName        : string;
  commentedByProfilePic  : string;
}

export interface CommentPost{
  postId                 : number;
  postImage              : string;
  postByName             : string;
  postedByProfilePic     : string;
  post                   : string;
  postedDate             : string;
  postedById             : string;
  postalCode             : string;
  postedCity             : string;
  postedState            : string;
  postedCountry          : string;
  likesCount             : number;
  dislikesCount          : number;
  commentsCount          : number;
  isLiked                : number;
  isdisLiked             : number;
  isWished               : number;
}