import { IContractResponse, IContract } from '../../models/IContract';
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
}
