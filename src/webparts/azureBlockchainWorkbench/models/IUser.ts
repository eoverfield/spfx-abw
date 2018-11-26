export interface IUserResponse {
  nextLink: string;
  users: IUser[];
}

export interface IGraphUserResponse {
  '@odata.context': string;
  value: IGraphUser[];
}

export interface ICurrentUserResponse {
  currentUser: IUser;
  capabilities: IUserCapabilities;
}

export interface IUser {
  userID: number;
  externalID: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  userChainMappings: IUserChainMapping[];
}

export interface IUserChainMapping {
  userChainMappingID: number;
  userID: number;
  connectionID: number;
  chainIdentifier: string;
  chainBalance: number;
}

export interface IUserCapabilities {
  canUploadApplication: boolean;
  canUploadContractCode: boolean;
  canModifyRoleAssignments: boolean;
  canProvisionUser: boolean;
}

export interface IGraphUser {
  id: string;
  displayName: string;
  mail: string;
  givenName: string;
  surname: string;
  userPrincipalName: string;
}
