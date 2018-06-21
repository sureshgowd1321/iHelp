import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

// Providers
import { PhpServiceProvider } from '../../providers/php-service/php-service';

/**
 * Generated class for the AddNewLocationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-new-location',
  templateUrl: 'add-new-location.html',
})
export class AddNewLocationPage {

  public newLocationForm: FormGroup;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public formBuilder: FormBuilder,
              public phpService: PhpServiceProvider,
              public alertCtrl: AlertController) {

      this.newLocationForm = formBuilder.group({
        country: ['', Validators.compose([Validators.minLength(1), Validators.required])],
        state  : ['', Validators.compose([Validators.minLength(1), Validators.required])],
        city   : ['', Validators.compose([Validators.minLength(1), Validators.required])]
      });
  }

  // Add New location and Go back to previous page
  addNewLocation() {

    if (!this.newLocationForm.valid) {
      console.log(this.newLocationForm.value);
      let alert = this.alertCtrl.create({
        message: 'Please enter valid location',
        buttons: [
          {
            text: "Ok",
            role: 'cancel'
          }
        ]
      });
      alert.present();
    } else {
      this.phpService.addNewLocation(this.newLocationForm.value.country, this.newLocationForm.value.state, this.newLocationForm.value.city).subscribe(newLocationInfo => {
        this.navCtrl.pop();
      }); 
    }
  }

  goBack(): void {
	  this.navCtrl.pop();
  }

}
