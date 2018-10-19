import { JsonConverter, JsonCustomConvert } from 'json2typescript';

@JsonConverter
export class Base64Converter implements JsonCustomConvert<string> {

  serialize(data: string): string {
    return btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  }

  deserialize(data: string): string {
    return decodeURIComponent(Array.prototype.map.call(atob(data), c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

}
