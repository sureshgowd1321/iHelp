import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { FormsModule } from '@angular/forms';

//Ionic Cache service
import { CacheModule } from 'ionic-cache';

// Angular Fire Modules
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';

// Environment
import { environment } from '../environments/environments';

// Pages
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { SignUpPage } from '../pages/sign-up/sign-up';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { MyProfilePage } from '../pages/my-profile/my-profile';
import { UserProfilePage } from '../pages/user-profile/user-profile';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { MyWishlistPage } from '../pages/my-wishlist/my-wishlist';
import { FilterPostsPage } from '../pages/filter-posts/filter-posts';
import { AddPostPage } from '../pages/add-post/add-post';
import { EditPostPage } from '../pages/edit-post/edit-post';
import { CommentsPage } from '../pages/comments/comments';
import { DisplayPostLikesPage } from '../pages/display-post-likes/display-post-likes';
import { DisplayPostDislikesPage } from '../pages/display-post-dislikes/display-post-dislikes';
import { UserPostsPage } from '../pages/user-posts/user-posts';
import { AddNewLocationPage } from '../pages/add-new-location/add-new-location';

// Native plugins
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Camera } from '@ionic-native/camera';
import { OrderModule } from 'ngx-order-pipe';

//Providers
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { PhpServiceProvider } from '../providers/php-service/php-service';
import { ProfileDataProvider } from '../providers/profile-data/profile-data';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabsPage,
    LoginPage,
    SignUpPage,
    ResetPasswordPage,
    MyProfilePage,
    UserProfilePage,
    EditProfilePage,
    MyWishlistPage,
    FilterPostsPage,
    AddPostPage,
    EditPostPage,
    CommentsPage,
    DisplayPostLikesPage,
    DisplayPostDislikesPage,
    UserPostsPage,
    AddNewLocationPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    CacheModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    FormsModule,
    IonicImageViewerModule,
    OrderModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    TabsPage,
    LoginPage,
    SignUpPage,
    ResetPasswordPage,
    MyProfilePage,
    UserProfilePage,
    EditProfilePage,
    MyWishlistPage,
    FilterPostsPage,
    AddPostPage,
    EditPostPage,
    CommentsPage,
    DisplayPostLikesPage,
    DisplayPostDislikesPage,
    UserPostsPage,
    AddNewLocationPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    FileTransfer,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthServiceProvider,
    PhpServiceProvider,
    ProfileDataProvider
  ]
})
export class AppModule {}
