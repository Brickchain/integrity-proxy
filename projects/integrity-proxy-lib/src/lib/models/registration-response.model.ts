import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class RegistrationResponse extends Base {

  constructor() {
    super('https://proxy.brickchain.com/v1/registration-response.json');
  }

  @JsonProperty('keyID', String, true)
  keyID: string = undefined;

  @JsonProperty('hostname', String, true)
  hostname: string = undefined;

}
