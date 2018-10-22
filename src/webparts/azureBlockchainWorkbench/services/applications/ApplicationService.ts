import { IApplicationResponse, IApplication, IApplicationRoleAssignmentResponse, IApplicationWorkflowsResponse, IWorkflow, IApplicationQuery } from '../../models/IApplication';
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
}

