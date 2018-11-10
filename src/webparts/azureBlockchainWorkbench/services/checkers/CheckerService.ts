import { ICheckApplicationResponse } from '../../models/IChecker';
import { IFileObject } from '../../models/IFile';

import {AadClient} from "../AadClient";

import * as lodash from '@microsoft/sp-lodash-subset';

export interface ICheckerService {
	checkApplication(app: IFileObject): Promise<any>;
}

export class CheckerService implements ICheckerService {
  //private _checkApplicationMock: { [listName: string]: ITodoItem[] };

	constructor() {
  }

  public async checkApplication(app: IFileObject): Promise<any> {
    var p = new Promise<ICheckApplicationResponse>(async (resolve, reject) => {

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
          "checkers/checkApplication",
          null,
          formData,
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

  public async checkApplicationCode(app: IFileObject, code: IFileObject, ledgerId: number = 1): Promise<any> {
    var p = new Promise<ICheckApplicationResponse>(async (resolve, reject) => {

      const formData = new FormData();
      //other technique is to convert th ArrayBuffer back into a Blob
      //formData.append("appFile", new Blob([new Uint8Array(app.file)]));
      formData.append('appFile', app.file);
      formData.append('contractFile', code.file);

      const aadRequestHeaders: Headers = new Headers();
      aadRequestHeaders.append('Accept', 'application/json');
      //when formData is provided, fetch will auto populate content-type to provide boundary
      //aadRequestHeaders.append('Content-Type', 'multipart/form-data; boundary=AaB03x');

      //
      await AadClient
        .post(
          "checkers/checkContractCode?ledgerId=" + ledgerId,
          null,
          formData,
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

