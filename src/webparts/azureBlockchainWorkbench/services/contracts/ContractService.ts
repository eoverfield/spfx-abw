import { IContractResponse, IContract, INewContract } from '../../models/IContract';
import {AadClient} from "../AadClient";

export interface IContractService {
	getContracts(appId: string, workflowId: string): Promise<IContractResponse>;
}

export class ContractService implements IContractService {
	constructor() {
	}

	public getContracts(appId: string, workflowId: string): Promise<any> {
    return AadClient
      .get(
        "contracts?workflowId=" + workflowId.toString() + "&sortBy=Timestamp&top=50&skip=0"
      )
      .then((response: IContractResponse): IContractResponse => {
        return response;
      })
      .catch(error => {
        console.error(error);
      });
  }


  public getContractDetail(contractId: string): Promise<any> {
    return AadClient
      .get(
        "contracts/" + contractId + ""
      )
      .then((response: IContract): IContract => {
        return response;
      })
      .catch(error => {
        console.error(error);
      });
  }

  public addContract(newContract: INewContract): Promise<any> {
    var p = new Promise<any>(async (resolve, reject) => {

      let body: string = JSON.stringify(newContract.constructor);

      const aadRequestHeaders: Headers = new Headers();
      aadRequestHeaders.append('Accept', 'application/json');
      aadRequestHeaders.append('Content-Type', 'application/json');

      //api/v1/contracts?workflowId=1&contractCodeId=1&connectionId=1
      await AadClient
        .post(
          "contracts?workflowId=" + newContract.workflowId + "&contractCodeId=" + newContract.contractCodeId + "&connectionId="+ newContract.connectionId,
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
}
