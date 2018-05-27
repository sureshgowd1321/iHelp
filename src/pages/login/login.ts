import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { EmailValidator } from '../../validators/email';

// Firebase
import { AngularFireAuth } from 'angularfire2/auth';

// Pages
import { TabsPage } from '../tabs/tabs';
import { SignUpPage } from '../sign-up/sign-up';
import { ResetPasswordPage } from '../reset-password/reset-password';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public loginForm: FormGroup;
  loading: any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public formBuilder: FormBuilder, 
              private firebaseAuth: AngularFireAuth,
              public alertCtrl: AlertController, 
              public loadingCtrl: LoadingController) {

    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6),
      Validators.required])]
    });
  }

  // Login
  login() {
    if (!this.loginForm.valid) {
      console.log(this.loginForm.value);
    } else {
    this.firebaseAuth
      .auth
      .signInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password)
      .then(value => {
        console.log('Nice, it worked!');
        this.loading.dismiss().then(() => {
          this.navCtrl.setRoot(TabsPage);
        });
      })
      .catch(error => {
        console.log('Something went wrong:',error.message);
        this.loading.dismiss().then(() => {
          let alert = this.alertCtrl.create({
            message: error.message,
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
      this.loading = this.loadingCtrl.create();
      this.loading.present();

      this.loginForm.value.email = this.loginForm.value.password = '';

    }
  }

  // Goto Signup Page
  goToSignup(): void {
	  this.navCtrl.push(SignUpPage);
  }
  
  // Goto Reset password page
	goToResetPassword(): void {
	  this.navCtrl.push(ResetPasswordPage);
  }

}
