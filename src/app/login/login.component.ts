import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from
  '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from '@angular/platform-browser';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { Logger, CryptoUtils } from 'msal';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { InteractionRequiredAuthError, AuthError } from 'msal';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  errorMessage;
  /*private _username: string;
  public get username(): string {
    return this._username;
  }
  public set username(value: string) {
    this._username = value;
  }*/
  username: string;
  password: string;
  subscriptions: Subscription[] = [];
  loggedIn = false;
  isIframe = false;

  private formSubmitAttempt: boolean;

  constructor(private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService,
    private matIconRegistry: MatIconRegistry,
    private http: HttpClient,
    private broadcastService: BroadcastService, private msalService: MsalService,
    private domSanitizer: DomSanitizer,) { 
      this.matIconRegistry.addSvgIcon(
        'g-icon',
        this.domSanitizer.bypassSecurityTrustResourceUrl("assets/google.svg")
      );
      this.matIconRegistry.addSvgIcon(
        'ms-icon',
        this.domSanitizer.bypassSecurityTrustResourceUrl("assets/microsoft.svg")
      );
      }

  ngOnInit(): void {
    this.form = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.isIframe = window !== window.parent && !window.opener;


    let loginSuccessSubscription: Subscription;
    let loginFailureSubscription: Subscription;
    let acquireTokenSuccess: Subscription;
    let acquireTokenFailure: Subscription;

    this.checkAccount();

    loginSuccessSubscription = this.broadcastService.subscribe('msal:loginSuccess', () => {
      this.checkAccount();
      this.getProfile();
    });

    loginFailureSubscription = this.broadcastService.subscribe('msal:loginFailure', (error) => {
      console.log('Login Fails:', error);
    });

    acquireTokenSuccess = this.broadcastService.subscribe("msal:acquireTokenSuccess", payload => {
      console.log('Token Success:', payload );
  });
    
  acquireTokenFailure = this.broadcastService.subscribe("msal:acquireTokenFailure", error => {
    console.log('Token Fails:', error);
  });

    this.subscriptions.push(loginSuccessSubscription);
    this.subscriptions.push(loginFailureSubscription);
    this.subscriptions.push(acquireTokenSuccess);
    this.subscriptions.push(acquireTokenFailure);

    this.msalService.handleRedirectCallback((authError, response) => {
      if (authError) {
        console.error('Redirect Error: ', authError.errorMessage);
        return;
      }

      console.log('Redirect Success: ', response.accessToken);
    });

    this.msalService.setLogger(new Logger((logLevel, message, piiEnabled) => {
      console.log('MSAL Logging: ', message);
    }, {
      correlationId: CryptoUtils.createNewGuid(),
      piiLoggingEnabled: false
    }));
  }
  isFieldInvalid(field: string) {
    return (
      (!this.form.get(field).valid && this.form.get(field).touched) ||
      (this.form.get(field).untouched && this.formSubmitAttempt)
    );
  }

  login() {
    const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

    if (isIE) {
      this.msalService.loginRedirect();
    } else {
      this.msalService.loginPopup();
    }
  }

  getProfile() {
    this.http.get(GRAPH_ENDPOINT)
    .subscribe({
      next: (profile) => {
         console.log(profile);
      },
      error: (err: AuthError) => {
        if (InteractionRequiredAuthError.isInteractionRequiredError(err.errorCode)) {
          this.msalService.acquireTokenPopup({
            scopes: this.msalService.getScopesForEndpoint(GRAPH_ENDPOINT)
          })
          .then(() => {
            this.http.get(GRAPH_ENDPOINT)
              .toPromise()
              .then(profile => {
                console.log(profile);
              });
          });
        }
      }
    });
  }

  onSubmit() {
    this.errorMessage = "";
    this.authService.login(this.username, this.password).subscribe(data => {
      this.authService.AccessToken = data;
      this.router.navigate(['monitoring']);
      sessionStorage.setItem("token", data);
    }, error => {
      this.errorMessage = error;
    }
    );
  }

  checkAccount() {
    this.loggedIn = !!this.msalService.getAccount();
  }
}
