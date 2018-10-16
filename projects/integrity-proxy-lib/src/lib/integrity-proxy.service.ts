import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { JsonConvert, OperationMode, ValueCheckingMode } from 'json2typescript';
import { MandateToken, HttpRequest, HttpResponse, RegistrationRequest, RegistrationResponse } from './models';
import { v4 } from 'uuid/v4';
import * as jose from 'node-jose';

export interface Options {
  key?: any;
  session?: string;
  useSession?: boolean;
  signedMandateToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IntegrityProxyService {

  private _url: string;
  private _base: string;
  private _hostname: string;

  private handlers: { [path: string]: (request: HttpRequest) => Promise<HttpResponse>; } = {};

  private socket$: WebSocketSubject<{}>;
  private resolve: (value?: string | PromiseLike<string>) => void;
  private reject: (reason?: any) => void;

  private keystore;
  private jsonConvert: JsonConvert;

  constructor() {

    this.keystore = jose.JWK.createKeyStore();

    this.jsonConvert = new JsonConvert();
    this.jsonConvert.operationMode = OperationMode.ENABLE; // print some debug data
    this.jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    this.jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null

  }

  public connect(url: string, options: Options = {}): Promise<string> {

    this.socket$ = webSocket(url.replace('https://', 'wss://').replace('http://', 'ws://') + '/proxy/subscribe');
    this.socket$.subscribe((message: {}) => this.onMessage(message), (error: any) => this.onError(error), () => this.onComplete());

    return new Promise<string>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.createRegistrationRequest(url, options).then(request => this.socket$.next(request));
    });

  }

  public disconnect() {
    this.socket$.unsubscribe();
  }

  private async createRegistrationRequest(url: string, options: Options): Promise<string> {

    if (!options.signedMandateToken) {

      const mandateToken = new MandateToken();
      mandateToken.timestamp = new Date();
      mandateToken.uri = url;
      mandateToken.mandates = [];
      mandateToken.ttl = 60;

      if (!options.key) {
        options.key = await this.keystore.generate('EC', 'P-256');
      }

      options.signedMandateToken = await jose.JWS.createSign({ format: 'compact' }, { key: options.key, reference: 'jwk' })
        .update(JSON.stringify(this.jsonConvert.serializeObject(mandateToken)), 'utf8')
        .final();

    }

    if (options.useSession && !options.session) {
      options.session = v4();
    }

    const registrationRequest = new RegistrationRequest();
    registrationRequest.mandateToken = options.signedMandateToken;
    if (options.useSession) {
      registrationRequest.session = options.session;
    }

    this._url = url;

    return this.jsonConvert.serializeObject(registrationRequest);

  }

  private onMessage(message: {}) {
    switch (message['@type']) {
      case 'https://proxy.brickchain.com/v1/ping.json':
        break;
      case 'https://proxy.brickchain.com/v1/registration-response.json':
        const registrationResponse = <RegistrationResponse>this.jsonConvert.deserializeObject(message, RegistrationResponse);
        this.reject = undefined;
        this._base = `${this._url}/proxy/request/${registrationResponse.keyID}`;
        this._hostname = registrationResponse.hostname;
        this.resolve(this._hostname);
        break;
      case 'https://proxy.brickchain.com/v1/http-request.json':
        const req = <HttpRequest>this.jsonConvert.deserializeObject(message, HttpRequest);
        if (this.handlers[req.url] !== undefined) {
          if (req.method === 'OPTIONS') {
            const res = new HttpResponse(200, 'OK', 'text/plain', req.id);
            res.headers = {
              'Access-Control-Allow-Origin': req.headers['Origin'],
              'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Language, Content-Type'
            };
            this.socket$.next(this.jsonConvert.serializeObject(res));
          } else {
            this.handlers[req.url](req).then((res: HttpResponse) => {
              res.id = req.id;
              res.headers = res.headers || {
                'Access-Control-Allow-Origin': req.headers['Origin'],
                'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Language, Content-Type'
              };
              if (res.contentType) {
                res.headers['Content-Type'] = res.contentType;
              }
              this.socket$.next(this.jsonConvert.serializeObject(res));
            });
          }
        } else {
          const res = new HttpResponse(404, 'Not found', 'text/plain', req.id);
          res.headers = {
            'Access-Control-Allow-Origin': req.headers['Origin'],
            'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Language, Content-Type'
          };
          this.socket$.next(this.jsonConvert.serializeObject(res));
        }
        break;
      default:
        console.warn('Unsupported message type', message);
        break;
    }
  }

  private onError(error: any) {
    if (this.reject) {
      this.reject(error);
    }
  }

  private onComplete() {
  }

  public setHandler(path: string, handler: (request: HttpRequest) => Promise<HttpResponse>): IntegrityProxyService {
    this.handlers[path] = handler;
    return this;
  }

  public removeHandler(path: string): IntegrityProxyService {
    delete this.handlers[path];
    return this;
  }

  get url(): string {
    return this._url;
  }

  get base(): string {
    return this._base;
  }

  get hostname(): string {
    return this._hostname;
  }

}
