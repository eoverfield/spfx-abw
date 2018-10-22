import { IUser, IUserResponse, ICurrentUserResponse } from '../../models/IUser';
import { ServiceScope, ServiceKey } from '@microsoft/sp-core-library';
import { AadHttpClient, IHttpClientOptions } from "@microsoft/sp-http";
import {AadClient} from "../AadClient";

export interface IUserService {
	getWorkbenchUsers(): Promise<IUserResponse>;
}

export class UserService implements IUserService {
	private aadHttpClient: AadHttpClient;

	constructor() {
	}

	private _restRequest(url: string, params: any = null): Promise<any> {
    /*
		const restUrl = this._getEffectiveUrl(url);
		const options: ISPHttpClientOptions = {
			body: JSON.stringify(params),
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
				ACCEPT: 'application/json; odata.metadata=minimal',
				'ODATA-VERSION': '4.0'
			}
		};
		return this.spHttpClient.post(restUrl, SPHttpClient.configurations.v1, options).then((response) => {
			if (response.status == 204) {
				return {};
			} else {
				return response.json();
			}
    });
    */

   const aadRequestHeaders: Headers = new Headers();
   aadRequestHeaders.append('Accept', 'application/json');
   aadRequestHeaders.append('Content-Type', 'application/json;charset=UTF-8');


   //set up the actual post options
   const requestGetOptions: IHttpClientOptions = {
     headers: aadRequestHeaders
   };


   /*
    // we want something like this
    return AadClient
      .get(
        "https://pmdev1azw01-lbt5oa-api.azurewebsites.net/api/v1/users",
        AadHttpClient.configurations.v1,
        requestGetOptions
      )
      .then(response => {
        return response.json();
      })
      .then(json => {
        // Log the result in the console for testing purposes
        console.log("what was returned after posting a contract");
        console.log(json);

        return json;
      })
      .catch(error => {
        console.error(error);
        return {};
      });
    */
   return;
  }

  private _getEffectiveUrl(relativeUrl: string): string {
		return ('https://pmdev1azw01-lbt5oa-api.azurewebsites.net/api/v1/' + relativeUrl);
	}

	public getWorkbenchUsers(): Promise<any> {
    return AadClient
      .get(
        "users?sortBy=FirstName&top=50&skip=0"
      )
      .then((response: IUserResponse): IUserResponse => {
        return response;
      })
      .catch(error => {
        console.error(error);
      });
  }

  public getCurrentUser(): Promise<any> {
    return AadClient
      .get(
        "users/me"
      )
      .then((response: ICurrentUserResponse): ICurrentUserResponse => {
        return response;
      })
      .catch(error => {
        console.error(error);
      });
  }
}
