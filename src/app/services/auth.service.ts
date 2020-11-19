import { Observable ,throwError} from 'rxjs';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private loggedIn = new BehaviorSubject<boolean>(false); 
get isLoggedIn() {
return this.loggedIn.asObservable(); 
}
  form(username: string, password: string) {
    throw new Error('Method not implemented.');
  }
  AccessToken: string = "";
  constructor(private httpClient:HttpClient,private router: Router) { }
  private TokenAPI = 'http://35.239.208.211/authentication/authenticate-user';
  private appUrl = 'http://35.239.208.211';
  login(username:string,password:string):Observable<any>{
    let httpHeaders = new HttpHeaders({
      'content-type': 'application/json',
      'Authorization': 'Basic '+ btoa(username + ':' + password)     
    })
    return this.httpClient.get(this.TokenAPI, {headers: httpHeaders, responseType: 'text' as 'json',} )
  }
  public logout(){
    sessionStorage.removeItem("token");
  }
}
