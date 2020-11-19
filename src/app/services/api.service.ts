import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private httpclient: HttpClient,private authService: AuthService) { }
  public getRest(earliest,latest): Observable<any> {
    let httpHeaders = new HttpHeaders({
      'content-type': 'application/json',
      'earliestTimeInUTC': earliest,
      'latestTimeInUTC': latest,
      'Authorization': 'Bearer ' + sessionStorage.getItem("token")
    })
    return this.httpclient.get('http://35.239.208.211/monitoring/get-monitoring-data/gcp/admin@admin.com', {headers: httpHeaders });
  }
}
