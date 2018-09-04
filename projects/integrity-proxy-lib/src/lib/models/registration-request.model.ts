import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class RegistrationRequest extends Base {

  constructor() {
    super('https://proxy.brickchain.com/v1/registration-request.json');
  }

  @JsonProperty('mandateToken', String, true)
  mandateToken: string = undefined;

  @JsonProperty('session', String, false)
  session: string = undefined;

}
