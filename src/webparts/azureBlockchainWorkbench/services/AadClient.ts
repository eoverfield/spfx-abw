import { AadHttpClient, IHttpClientOptions, HttpClient } from "@microsoft/sp-http";
import { ServiceScope, Log } from '@microsoft/sp-core-library';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export class AadClient {
  private static aadHttpClient: AadHttpClient;
  private static httpClient: HttpClient;
  private static serviceScope: ServiceScope;
  private static aadAppId: string;
  private static apiUrl: string;

	//constructor(serviceScope: ServiceScope, aadAppId: string, apiUrl?: string) {}

  //public static init(inputServiceScope: ServiceScope, inputAadAppId: string, inputApiUrl?: string) {
  public static init(context: WebPartContext, inputAadAppId: string, inputApiUrl?: string) {
    //this.serviceScope = inputServiceScope;
    this.serviceScope = context.serviceScope;
    this.httpClient = context.httpClient;
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

  public static async post(url: string, body?: string, formData?: FormData, aadRequestHeaders?: Headers): Promise<any> {
    if (aadRequestHeaders == undefined) {
      aadRequestHeaders = new Headers();
      //by default, assume response is json
      aadRequestHeaders.append('Accept', 'application/json');
      //when formData is provided, fetch will auto populate content-type to provide boundary
      //aadRequestHeaders.append('Content-Type', 'multipart/form-data; boundary=AaB03x');
    }

    //we will assume that formData must have something as a backup in case body not provided
    if (formData == undefined) {
      formData = new FormData();
    }

    //set up get options
    const requestPostOptions: IHttpClientOptions = {
      headers: aadRequestHeaders,
      body: (body) ? body : formData
    };

    // create the request URL
    let requestUrl: string = this.apiUrl + url;

    //make the post request which is a wrapper to fetch, setting method to post
    return this.aadHttpClient
      .post(
        requestUrl,
        AadHttpClient.configurations.v1,
        requestPostOptions
      )
      .then(response => {
        return response.json();
      })
      .then(json => {
        return json;
      })
      .catch(error => {
        let aadError = new Error("an error was thrown attempting to complete a post request.");
        Log.error("Aad Client post", aadError);

        throw error;
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
