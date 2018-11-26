import { ServiceScope } from '@microsoft/sp-core-library';
import { IPropertyPaneAccessor, IClientSideWebPartStatusRenderer } from '@microsoft/sp-webpart-base';

import { IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';

import { IAzureBlockchainWorkbenchWebPartProps } from '../AzureBlockchainWorkbenchWebPart';

import { IUser, IUserCapabilities } from '../models/IUser';
import { IApplication, IWorkflow, IRoleAssignment } from '../models/IApplication';
import { IContract } from '../models/IContract';

export interface IHashTable<T> {
  [key: string]: T;
}
export enum uiState {
  configurationRequired,
  loadingCurrentUser,
	applicationList,
  applicationDetail,
  contractDetail,
  fatalError
}
export interface IUI {
	state: uiState;
  height: number;
  appsPerPage: number;
}

export interface IUserContext {
	displayName: string;
  email: string;
  currentUser?: IUser;
  capabilities?: IUserCapabilities;
}

export interface IApplicationContext {
  applicationId: string;
  workflowId: string;
  contractId: string;
  currentApplication: IApplication;
  currentWorkflow: IWorkflow;
  currentContract: IContract;
  currentRoleAssignments: Array<IRoleAssignment>;
  selectedApplications: IHashTable<number>;
}

export interface IWorkbenchContext {
	apiUrl: string;
  aadAppId: string;
}

export interface IContext {
  isOnline: boolean;
	webAbsoluteUrl: string;
  user: IUserContext;
  breadcrumb: IBreadcrumbItem[];
  application: IApplicationContext;
  workbench: IWorkbenchContext;
  propertyPane: IPropertyPaneAccessor;
  statusRenderer: IClientSideWebPartStatusRenderer;
  serviceScope?: ServiceScope;
	properties?: IAzureBlockchainWorkbenchWebPartProps;
}

export interface IApplicationState {
	ui: IUI;
	context: IContext;
}

export const initialState: IApplicationState = {
	ui: {
		state: uiState.configurationRequired,
    height: 480,
    appsPerPage: 10
  },
	context: {
    isOnline: false,
		webAbsoluteUrl:'',
		user: {
			displayName: undefined,
			email: undefined
    },
    breadcrumb: undefined,
    //the current loaded application, workflow, and contract if loaded
    application: {
      applicationId: undefined,
      workflowId: undefined,
      contractId: undefined,
      currentApplication: undefined,
      currentWorkflow: undefined,
      currentContract: undefined,
      currentRoleAssignments: undefined,
      selectedApplications: {} as IHashTable<number>
    },
    workbench: {
      apiUrl: undefined,
      aadAppId: undefined
    },
    propertyPane: undefined,
    statusRenderer: undefined
	}
};
