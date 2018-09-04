import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/websocket';
import { JsonConvert, OperationMode, ValueCheckingMode } from 'json2typescript';
import { MandateToken, HttpRequest, HttpResponse, RegistrationRequest, RegistrationResponse } from './models';
import { v4 } from 'uuid/v4';
import * as jose from 'node-jose';

@Injectable({
  providedIn: 'root'
})
export class IntegrityProxyService {

  private session: string;
  private base: string;
  private hostname: string;

  private keystore;
  private jsonConvert: JsonConvert;

  constructor() {

    this.session = v4();

    this.jsonConvert = new JsonConvert();
    this.jsonConvert.operationMode = OperationMode.ENABLE; // print some debug data
    this.jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    this.jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null

    this.keystore = jose.JWK.createKeyStore();

  }

  public initialize(url: string, signedMandateToken?: string) {
    this.base = url;
    const subscribeUrl = this.base.replace('https://', 'wss://').replace('http://', 'ws://') + '/proxy/subscribe';
    // const url = 'wss://echo.websocket.org';
    const socket$ = webSocket(subscribeUrl);
    this.createRegistrationRequest(signedMandateToken)
      .then(request => socket$
        .multiplex(
          () => request,
          () => 'close',
          (value: {}) => { console.log(value); return true; })
        .subscribe(
          this.onMessage,
          this.onError,
          this.onComplete));
  }

  private async createRegistrationRequest(signedMandateToken?: string): Promise<string> {

    if (!signedMandateToken) {

      const mandateToken = new MandateToken();
      mandateToken.timestamp = new Date();
      mandateToken.uri = this.base;
      mandateToken.mandates = [];
      mandateToken.ttl = 60;

      const key = await this.keystore.generate('EC', 'P-256');

      signedMandateToken = await jose.JWS.createSign({ format: 'compact' }, { key: key, reference: 'jwk' })
        .update(JSON.stringify(this.jsonConvert.serializeObject(mandateToken)), 'utf8')
        .final();

    }

    const registrationRequest = new RegistrationRequest();
    registrationRequest.mandateToken = signedMandateToken;
    registrationRequest.session = this.session;

    return this.jsonConvert.serializeObject(registrationRequest);

  }

  private onMessage(message: {}) {
    switch (message['@type']) {
      case 'https://proxy.brickchain.com/v1/ping.json':
        break;
      case 'https://proxy.brickchain.com/v1/registration-response.json':
        const registrationResponse = <RegistrationResponse>this.jsonConvert.deserializeObject(message, RegistrationResponse);
        console.log(registrationResponse);
        this.hostname = this.hostname;
        break;
      default:
        console.warn('Unsupported message type', message);
        break;
    }
  }

  private onError(error: any) {
    console.log('onError', error);
  }

  private onComplete() {
    console.log('onComplete');
  }

}
