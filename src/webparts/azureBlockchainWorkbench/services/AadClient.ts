import { AadHttpClient, IHttpClientOptions } from "@microsoft/sp-http";
import { ServiceScope, Log } from '@microsoft/sp-core-library';

export class AadClient {
  private static aadHttpClient: AadHttpClient;
  private static serviceScope: ServiceScope;
  private static aadAppId: string;
  private static apiUrl: string;

	//constructor(serviceScope: ServiceScope, aadAppId: string, apiUrl?: string) {}

  public static init(inputServiceScope: ServiceScope, inputAadAppId: string, inputApiUrl?: string) {
    this.serviceScope = inputServiceScope;
    this.aadAppId = inputAadAppId;
    this.apiUrl = AadClient.validateApiUrl(inputApiUrl);

    this.aadHttpClient = new AadHttpClient(
      this.serviceScope,
      this.aadAppId
    );
  }

  public static reset() {
    this.serviceScope = null;
    this.aadAppId = "";
    this.apiUrl = "";

    this.aadHttpClient = null;
  }

  public static validateApiUrl(url: string) : string {
    if (url && url.length > 0) {
      url = url.trim();
      url = (url[url.length-1] == '/') ? url : url + '/';
    }

    return url;
  }

  public static getAppId(): string {
    return this.aadAppId;
  }
  public static getApiUrl(): string {
    return this.apiUrl;
  }

  public static async get(url: string, aadRequestHeaders?: Headers, includeCommonHeaders?: boolean): Promise<any> {
    if (aadRequestHeaders == undefined) {
      aadRequestHeaders = new Headers();
    }

    if (includeCommonHeaders == undefined || includeCommonHeaders) {
      aadRequestHeaders.append('Accept', 'application/json');
      aadRequestHeaders.append('Content-Type', 'application/json;charset=UTF-8');
    }

    //set up get options
    const requestGetOptions: IHttpClientOptions = {
      headers: aadRequestHeaders
    };

    let requestUrl: string = this.apiUrl + url;

    // we want something like this
    return this.aadHttpClient
      .get(
        requestUrl,
        AadHttpClient.configurations.v1,
        requestGetOptions
      )
      .then(response => {
        return response.json();
      })
      .then(json => {
        return json;
      })
      .catch(error => {
        let aadError = new Error("an error was thrown attempting to complete a get request.");
        Log.error("Aad Client get", aadError);

        throw error;
      });
  }

  public static async post(aadHttpClient: AadHttpClient, url: string, body: any, aadRequestHeaders?: Headers): Promise<any> {
    if (aadRequestHeaders == undefined) {
      aadRequestHeaders = new Headers();
    }

    if (body == undefined) {
      body = "";
    }

    //if (this.includeCommonHeaders) {
      aadRequestHeaders.append('Accept', 'application/json');
      aadRequestHeaders.append('Content-Type', 'application/json;charset=UTF-8');
    //}

    //set up get options
    const requestGetOptions: IHttpClientOptions = {
      body: body,
      headers: aadRequestHeaders
    };

    // we want something like this
    return aadHttpClient
      .post(
        url,
        AadHttpClient.configurations.v1,
        requestGetOptions
      )
      .then(response => {
        return response.json();
      })
      .then(json => {
        return json;
      })
      .catch(error => {
        console.log("AadHttpRequest Post error occured");
        console.error(error);
        return {};
      });
  }

  public static async patch(url: string, body?: any, aadRequestHeaders?: Headers, includeCommonHeaders?: boolean): Promise<any> {
    if (aadRequestHeaders == undefined) {
      aadRequestHeaders = new Headers();
    }

    if (includeCommonHeaders == undefined || includeCommonHeaders) {
      aadRequestHeaders.append('Accept', 'application/json, text/plain, */*');
      aadRequestHeaders.append('Content-Type', 'application/json;charset=UTF-8');
    }

    //set up get options
    const requestPatchOptions: IHttpClientOptions = {
      //body: body,
      method: 'PATCH',
      headers: aadRequestHeaders
    };

    let requestUrl: string = this.apiUrl + url;

    // we want something like this
    return this.aadHttpClient
      .fetch(
        requestUrl,
        AadHttpClient.configurations.v1,
        requestPatchOptions
      )
      .then(response => {
        return response;
      })
      .catch(error => {
        let aadError = new Error("an error was thrown attempting to complete a patch request.");
        Log.error("Aad Client patch", aadError);

        throw error;
      });
  }
}
