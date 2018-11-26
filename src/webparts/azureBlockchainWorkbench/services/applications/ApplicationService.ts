import {
  IApplicationResponse,
  IApplication,
  IApplicationRoleAssignmentResponse,
  IApplicationWorkflowsResponse,
  IWorkflow,
  IApplicationQuery,
  INewApplicationResponse } from '../../models/IApplication';
import { IFileObject } from '../../models/IFile';

import {AadClient} from "../AadClient";

export interface IApplicationService {
	getMyApplications(): Promise<IApplicationResponse>;
}

export class ApplicationService implements IApplicationService {
	constructor() {
  }

  public static initializeApplicationQuery(): IApplicationQuery {
    return {
      top: 50,
      skip: 0,
      enabled: true,
      sortBy: "displayName"
    } as IApplicationQuery;
  }

	public getMyApplications(query?: IApplicationQuery): Promise<any> {
    if (typeof query == "undefined" || !query) {
      query = ApplicationService.initializeApplicationQuery();
    }

    return AadClient
      .get(
        "applications?sortBy=" + query.sortBy + "&top=" + query.top + "&skip=" + query.skip + "&enabled=" + (query.enabled ? "true" : "false")
      )
      .then((response: IApplicationResponse): IApplicationResponse => {
        return response;
      })
      .catch(error => {
        console.error(error);
        return;
      });
  }

  public getApplicationDetail(appId: string): Promise<any> {
    return AadClient
      .get(
        "applications/" + appId + ""
      )
      .then((response: IApplication): IApplication => {
        return response;
      })
      .catch(error => {
        console.error(error);
      });
  }

  public async setApplicationStatus(appId: number, enable: boolean): Promise<any> {
    var p = new Promise<string>(async (resolve, reject) => {
        await AadClient
          .patch(
            "applications/" + appId + "/" + (enable ? "enable" : "disable")
          )
          .then((response: any) => {
            resolve(response);
          })
          .catch(error => {
            console.error(error);
            reject(error);
          });
    });
    return p;
  }

  public async addApplication(app: IFileObject): Promise<any> {
    var p = new Promise<any>(async (resolve, reject) => {

      const formData = new FormData();
      //other technique is to convert th ArrayBuffer back into a Blob
      //formData.append("appFile", new Blob([new Uint8Array(app.file)]));
      formData.append('appFile', app.file);

      const aadRequestHeaders: Headers = new Headers();
      aadRequestHeaders.append('Accept', 'application/json');
      //when formData is provided, fetch will auto populate content-type to provide boundary
      //aadRequestHeaders.append('Content-Type', 'multipart/form-data; boundary=AaB03x');

      await AadClient
        .post(
          "applications",
          null,
          formData,
          aadRequestHeaders
        )
        .then((response: any) => {
          let result: INewApplicationResponse = {} as INewApplicationResponse;

          //parse out response, if a json result, then we can get errors, otherwise was a success
          if (typeof response == 'object') {
            result.result = false;
            result.id = -1;

            //get error messages
            result.errors = new Array<string>();
            result.errors.push(response.error.replace(/\"/g, ""));
          }
          else {
            //was a success
            result.result = true;
            result.id = response;
          }

          resolve(result);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });

    return p;
  }

  public getApplicationDetailRoleAssignments(appId: string): Promise<any> {
    return AadClient
      .get(
        "applications/" + appId + "/roleAssignments"
      )
      .then((response: IApplicationRoleAssignmentResponse): IApplicationRoleAssignmentResponse => {
        return response;
      })
      .catch(error => {
        console.error(error);
      });
  }

  public getApplicationWorkflows(appId: string): Promise<any> {
    return AadClient
      .get(
        "applications/" + appId + "/workflows"
      )
      .then((response: IApplicationWorkflowsResponse): IApplicationWorkflowsResponse => {
        return response;
      })
      .catch(error => {
        console.error(error);
      });
  }

  public getApplicationWorkflow(workflowId: string): Promise<any> {
    return AadClient
      .get(
        "applications/workflows/" + workflowId + ""
      )
      .then((response: IWorkflow): IWorkflow => {
        return response;
      })
      .catch(error => {
        console.error(error);
      });
  }

  public async addApplicationContractCode(code: IFileObject, appId: number, ledgerId: number = 1): Promise<any> {
    var p = new Promise<any>(async (resolve, reject) => {

      const formData = new FormData();
      //other technique is to convert th ArrayBuffer back into a Blob
      formData.append('contractFile', code.file);

      const aadRequestHeaders: Headers = new Headers();
      aadRequestHeaders.append('Accept', 'application/json');
      //when formData is provided, fetch will auto populate content-type to provide boundary
      //aadRequestHeaders.append('Content-Type', 'multipart/form-data; boundary=AaB03x');

      await AadClient
        .post(
          "applications/" + appId + "/contractCode?ledgerId=" + ledgerId,
          null,
          formData,
          aadRequestHeaders
        )
        .then((response: any) => {
          let result: INewApplicationResponse = {} as INewApplicationResponse;

          //parse out response, if a json result, then we can get errors, otherwise was a success
          if (typeof response == 'object') {
            result.result = false;
            result.id = -1;

            //get error messages
            result.errors = new Array<string>();
            result.errors.push(response.error.replace(/\"/g, ""));
          }
          else {
            //was a success
            result.result = true;
            result.id = response;
          }

          resolve(result);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });

    return p;
  }

  public addApplicationDetailRoleAssignments(appId: string, userId: string, roleId: string): Promise<any> {
    var p = new Promise<any>(async (resolve, reject) => {

      let body: string = JSON.stringify({userId: userId, applicationRoleId: roleId});

      const aadRequestHeaders: Headers = new Headers();
      aadRequestHeaders.append('Accept', 'application/json');
      aadRequestHeaders.append('Content-Type', 'application/json');

      await AadClient
        .post(
          "applications/" + appId + "/roleAssignments",
          body,
          null,
          aadRequestHeaders
        )
        .then((response: any) => {
          resolve(response);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });

    return p;
  }

  public updateApplicationDetailRoleAssignment(appId: string, roleAssignmentId: string, userId: string, roleId: string): Promise<any> {
    var p = new Promise<any>(async (resolve, reject) => {

      let body: string = JSON.stringify({userId: userId, applicationRoleId: roleId});

      const aadRequestHeaders: Headers = new Headers();
      aadRequestHeaders.append('Accept', 'application/json');
      aadRequestHeaders.append('Content-Type', 'application/json');

      //applications/1/roleAssignments/10
      await AadClient
        .put(
          "applications/" + appId + "/roleAssignments/" + roleAssignmentId,
          body,
          aadRequestHeaders
        )
        .then((response: any) => {
          resolve(response);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });

    return p;
  }

  public deleteApplicationDetailRoleAssignment(appId: string, roleAssignmentId: string): Promise<any> {
    var p = new Promise<any>(async (resolve, reject) => {

      const aadRequestHeaders: Headers = new Headers();
      aadRequestHeaders.append('Accept', 'application/json');
      aadRequestHeaders.append('Content-Type', 'application/json');

      //applications/1/roleAssignments/10
      await AadClient
        .delete(
          "applications/" + appId + "/roleAssignments/" + roleAssignmentId,
          aadRequestHeaders
        )
        .then((response: any) => {
          resolve(response);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });

    return p;
  }
}

