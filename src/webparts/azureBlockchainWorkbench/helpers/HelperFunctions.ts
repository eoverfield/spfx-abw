import { IRoleAssignment, IWorkflowProperty, IWorkflowState } from '../models/IApplication';
import { IContractProperty, ITransaction } from '../models/IContract';
import { IUserChainMapping } from '../models/IUser';
import { IApplication } from '../models/IApplication';

import { IHashTable } from '../state/State';

export class HelperFunctions {
  public static getUserFromRoleAssignments(inputArray: Array<IRoleAssignment>, userId: number): IRoleAssignment {
    if (inputArray == null) {
      throw new TypeError('Input array requred');
    }

    var length = inputArray.length >>> 0;
    var currentObject: IRoleAssignment;

    for (var i = 0; i < length; i++) {
      currentObject = inputArray[i];
      if (currentObject.user && currentObject.user.userID == userId) {
        return currentObject;
      }
    }
    return undefined;
  }

  public static getValueFromProperties(inputArray: Array<IContractProperty>, propertyId: number): IContractProperty {
    if (inputArray == null) {
      throw new TypeError('Input array requred');
    }

    var length = inputArray.length >>> 0;
    var currentObject: IContractProperty;

    for (var i = 0; i < length; i++) {
      currentObject = inputArray[i];
      if (currentObject.workflowPropertyId == propertyId) {
        return currentObject;
      }
    }
    return undefined;
  }

  public static getWorkflowProperyById(inputArray: Array<IWorkflowProperty>, propertyId: number): IWorkflowProperty {
    if (inputArray == null) {
      throw new TypeError('Input array requred');
    }

    var length = inputArray.length >>> 0;
    var currentObject: IWorkflowProperty;

    for (var i = 0; i < length; i++) {
      currentObject = inputArray[i];
      if (currentObject.id == propertyId) {
        return currentObject;
      }
    }
    return undefined;
  }

  public static getWorkflowStateById(inputArray: Array<IWorkflowState>, propertyId: string): IWorkflowState {
    if (inputArray == null) {
      throw new TypeError('Input array requred');
    }

    var length = inputArray.length >>> 0;
    var currentObject: IWorkflowState;

    for (var i = 0; i < length; i++) {
      currentObject = inputArray[i];
      if (currentObject.id.toString() == propertyId) {
        return currentObject;
      }
    }
    return undefined;
  }

  public static getTransactionById(inputArray: Array<ITransaction>, propertyId: string): ITransaction {
    if (inputArray == null) {
      throw new TypeError('Input array requred');
    }

    var length = inputArray.length >>> 0;
    var currentObject: ITransaction;

    for (var i = 0; i < length; i++) {
      currentObject = inputArray[i];
      if (currentObject.id.toString() == propertyId) {
        return currentObject;
      }
    }
    return undefined;
  }

  public static getUserFromUserChainMappingIdentifer(inputArray: Array<IRoleAssignment>, chainIdentifier: string): IRoleAssignment {
    if (inputArray == null) {
      throw new TypeError('Input array requred');
    }

    var length = inputArray.length >>> 0;
    var currentObject: IRoleAssignment;

    //loop through each role assignment
    for (var i = 0; i < length; i++) {
      currentObject = inputArray[i];
      var chainLength = currentObject.user.userChainMappings.length >>> 0;
      var currentUserChainMapping: IUserChainMapping;

      //now need to loop through each userChainMappings
      for (var j = 0; j < chainLength; j++) {
        currentUserChainMapping = currentObject.user.userChainMappings[j];

        if (currentUserChainMapping.chainIdentifier == chainIdentifier) {
          return currentObject;
        }
      }
    }
    return undefined;
  }

  //given a number, convert to currency string
  public static formatCurrency(currency: number): string {
    var options: Intl.NumberFormatOptions = {} as Intl.NumberFormatOptions;
    options.style = 'decimal';
    options.minimumFractionDigits = 2;
    options.maximumFractionDigits = 4;

    const nf = new Intl.NumberFormat(navigator.language || 'en-US', options);
    return nf.format(currency);
  }

  public static getInitials(name: string) : string {
    var initials: Array<string> = name.replace(/[^a-zA-Z- ]/g, "").match(/\b\w/g);

    var sReturn: string = initials.join('');
    if (sReturn.length > 2) {
      sReturn = sReturn.substring(0, 2);
    }

    return sReturn.toUpperCase();
  }

  public static getColorFromString(app: IApplication) : string {
    var sReturn: string = "#";
    var sHashValue: number = 0;
    var iRGBCode: number; //temp stroage for code
    var i: number; //counter

    let name: string = app.name + " " + app.id;

    //create a random has based on string characters
    for (i = 0; i < name.length; i++) {
      sHashValue = name.charCodeAt(i) + ((sHashValue << 5) - sHashValue);
    }

    //get three valid codes
    for (i = 0; i < 3; i++) {
      iRGBCode = (sHashValue >> (i * 8)) & 0xFF;
      sReturn += ('00' + iRGBCode.toString(16)).substr(-2);
    }

    return sReturn;
  }

  //quickly determine if a hashTable is empty or not, quicker than counting
  //could also get length: Object.keys(hashTable).length
  public static hashTableEmpty(hashTable: IHashTable<any>): boolean {
    if (!hashTable) {
      return true;
    }

    for(var i in hashTable) {
      if (hashTable[i]) {
        return false;
      }
    }

    return true;
  }
}
