import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { FormGroup, FormBuilder, Validators } from
  '@angular/forms';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent {
  form: FormGroup;
  maxDate = new Date();
  public selectedMoments = [new Date(), new Date()];
  constructor(private apiService: ApiService, private authservice: AuthService) { }

  dt$: any[];
  onChange() {
    var earliest = this.selectedMoments[0].toISOString();
    var latest = this.selectedMoments[1].toISOString();
    console.log(earliest, latest)
    return this.apiService.getRest(earliest, latest)
      .subscribe(data => { this.dt$ = data; alert("Sucess") });
  }
  onSubmit() { }
}



