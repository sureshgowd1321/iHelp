import { Component, NgZone } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Pages
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';

// Angular components
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = LoginPage;
  zone: NgZone;

  constructor(platform: Platform, 
              statusBar: StatusBar, 
              splashScreen: SplashScreen,  
              private firebaseAuth: AngularFireAuth,
              private afs: AngularFirestore) {
    const firestore = afs.firestore.settings({timestampsInSnapshots: true});
    this.zone = new NgZone({});
    
    const unsubscribe = this.firebaseAuth.auth.onAuthStateChanged((user) => {
      this.zone.run( () => {
        if (!user) {
          this.rootPage = LoginPage;
          unsubscribe();
        } else { 
          console.log('***App Comp User: '+ user.uid);
          this.rootPage = TabsPage;
          unsubscribe();
        }
      });     
    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
