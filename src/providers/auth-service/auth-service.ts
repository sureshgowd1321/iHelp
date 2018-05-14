//import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { LoadingController, AlertController } from 'ionic-angular';

// Firebase
//import * as firebase from 'firebase/app'; 
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';

// Interfaces
import { IUser } from '../../providers/interface/interface';

/*
  Generated class for the AuthServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthServiceProvider {

  user: Observable<IUser>;
  loading: any;

  constructor(private afAuth: AngularFireAuth, 
              private afs: AngularFirestore, 
              public loadingCtrl: LoadingController, 
              public alertCtrl: AlertController,
              public phpService: PhpServiceProvider) {
        
    // Get auth data, then get firestore user document || null
    this.user = this.afAuth.authState
    .switchMap(user => {
      if (user) {
        return this.afs.doc<IUser>(`users/${user.uid}`).valueChanges()
      } else {
        return Observable.of(null)
      }
    })
  }

  // Signup with Username & Password
  signupWithEmailAndPassword(email: string, password: string, name: string, locationId: string, gender: string) {
    return this.afAuth
    .auth
    .createUserWithEmailAndPassword(email, password)
    .then((newUser) => {
      this.updateUserDataEmailAndPassword(newUser, name, locationId, gender)
    })
    .catch(err => {
      console.log('Something went wrong:',err.message);
      this.loading.dismiss().then( () => {
        let alert = this.alertCtrl.create({
          message: err.message,
          buttons: [
            {
              text: "Ok",
              role: 'cancel'
            }
          ]
        });
        alert.present();
      });
    });  
  }

  // Update User Data
  private updateUserDataEmailAndPassword(user, name: string, locationId: string, gender: string) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const data: IUser = {
      uid         : user.uid,
      email       : user.email,
      displayName : name,
      gender      : gender,  
      totalStars  : 0,
      createdDate : new Date().toISOString()
    }
    userRef.set(data);
    this.phpService.addNewOnlineUser(user.uid, name, user.email, locationId, gender);
  }

  Logout
  logout() {
    return this.afAuth
      .auth
      .signOut();
  }

}
