import { ServiceScope } from '@microsoft/sp-core-library';
import { IPropertyPaneAccessor, IClientSideWebPartStatusRenderer } from '@microsoft/sp-webpart-base';

import { IAzureBlockchainWorkbenchWebPartProps } from '../AzureBlockchainWorkbenchWebPart';

import { IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';

import { uiState, IHashTable } from './State';
import { IUser, IUserCapabilities } from '../models/IUser';
import { IApplication, IWorkflow, IRoleAssignment } from '../models/IApplication';
import { IContract } from '../models/IContract';

//** All the action interfaces */
export type ActionTypes =
  | ISetContextAction
  | ISetCurrentUserContextAction
  | ISetHeightAction
  | ISetAppsPerPageAction
  | ISetWorkbenchApiUrlAction
  | ISetWorkbenchAADAppIdAction
  | ISetCurrentApplicationAction
  | ISetCurrentApplicationAppAction
  | ISetCurrentWorkflowAction
  | ISetCurrentContractAction
  | ISetCurrentRoleAssignmentsAction
  | ISetSelectedApplicationsAction
  | IResetCurrentApplicationAction
  | IAddCurrentBreadcrumbAction
	| IChangeUIStateAction
	| IOtherAction;

//** Action keys (by using strings, TS can deduce the action interface in the reducer which is convienent)*/
export enum typeKeys {
  SET_CONTEXT = "SET_CONTEXT",
  SET_CURRENTUSERCONTEXT = "SET_CURRENTUSERCONTEXT",
  SET_HEIGHT = "SET_HEIGHT",
  SET_APPSPERPAGE = "SET_APPSPERPAGE",
  SET_WORKBENCHAPIURL = "SET_WORKBENCHAPIURL",
  SET_WORKBENCHAADAPPID = "SET_WORKBENCHAADAPPID",

  SET_CURRENTAPPLICATION = "SET_CURRENTAPPLICATION",
  SET_CURRENTAPPLICATIONAPP = "SET_CURRENTAPPLICATIONAPP",
  SET_CURRENTWORKFLOW = "SET_CURRENTWORKFLOW",
  SET_CURRENTCONTRACT = "SET_CURRENTCONTRACT",
  SET_CURRENTROLEASSIGNMENTS = "SET_CURRENTROLEASSIGNMENTS",
  SET_SELECTEDAPPLICATIONS = "SET_SELECTEDAPPLICATIONS",
  RESET_CURRENTAPPLICATION = "RESET_CURRENTAPPLICATION",

  ADD_CURRENTBREADCRUMB = "ADD_CURRENTBREADCRUMB",

  CHANGE_UISTATE = "CHANGE_UISTATE",

	OTHER_ACTION = "ANY_OTHER_ACTION"
}


//initiate the context
export interface ISetContextAction {
	type: typeKeys.SET_CONTEXT;
	isOnline: boolean;
	webAbsoluteUrl: string;
	userDisplayName: string;
	userEmail: string;
  properties: IAzureBlockchainWorkbenchWebPartProps;
  serviceScope: ServiceScope;
  propertyPane: IPropertyPaneAccessor;
  statusRenderer: IClientSideWebPartStatusRenderer;
}
export const setContext = (isOnline:boolean, webAbsoluteUrl:string, userDisplayName:string, userEmail:string, serviceScope:ServiceScope, properties:IAzureBlockchainWorkbenchWebPartProps, propertyPane:IPropertyPaneAccessor, statusRenderer: IClientSideWebPartStatusRenderer ): ISetContextAction => ({
  type: typeKeys.SET_CONTEXT,
	isOnline,
	webAbsoluteUrl,
	userDisplayName,
  userEmail,
  serviceScope,
  properties,
  propertyPane,
  statusRenderer
});

//set the current user in context
export interface ISetCurrentUserContextAction {
  type: typeKeys.SET_CURRENTUSERCONTEXT;
	currentUser: IUser;
  capabilities: IUserCapabilities;
}
export const setCurrentUserContext = (currentUser: IUser, capabilities: IUserCapabilities): ISetCurrentUserContextAction => ({
	type: typeKeys.SET_CURRENTUSERCONTEXT,
	currentUser,
	capabilities
});

//set the application UI height
export interface ISetHeightAction {
	type: typeKeys.SET_HEIGHT;
	height: number;
}
export const setHeight = (height:number): ISetHeightAction => ({
	type: typeKeys.SET_HEIGHT,
	height
});

//set the applications per page
export interface ISetAppsPerPageAction {
	type: typeKeys.SET_APPSPERPAGE;
	appsPerPage: number;
}
export const setAppsPerPage = (appsPerPage:number): ISetAppsPerPageAction => ({
	type: typeKeys.SET_APPSPERPAGE,
	appsPerPage
});

//set the context workbench api url
export interface ISetWorkbenchApiUrlAction {
	type: typeKeys.SET_WORKBENCHAPIURL;
	workbenchApiUrl: string;
}
export const setWorkbenchApiUrl = (workbenchApiUrl:string): ISetWorkbenchApiUrlAction => ({
	type: typeKeys.SET_WORKBENCHAPIURL,
	workbenchApiUrl
});

//set the context workbench AAD App ID
export interface ISetWorkbenchAADAppIdAction {
	type: typeKeys.SET_WORKBENCHAADAPPID;
	workbenchAADAppId: string;
}
export const setWorkbenchAADAppId = (workbenchAADAppId:string): ISetWorkbenchAADAppIdAction => ({
	type: typeKeys.SET_WORKBENCHAADAPPID,
	workbenchAADAppId
});

//set the context current application, workflow, and/or contract
export interface ISetCurrentApplicationAction {
	type: typeKeys.SET_CURRENTAPPLICATION;
  applicationId: string;
  workflowId: string;
  contractId: string;
}
export const setCurrentApplicationAction = (applicationId:string, workflowId?:string, contractId?:string): ISetCurrentApplicationAction => ({
	type: typeKeys.SET_CURRENTAPPLICATION,
  applicationId,
  workflowId,
  contractId
});
export interface ISetCurrentApplicationAppAction {
	type: typeKeys.SET_CURRENTAPPLICATIONAPP;
  application: IApplication;
}
export const setCurrentApplicationAppAction = (application:IApplication): ISetCurrentApplicationAppAction => ({
	type: typeKeys.SET_CURRENTAPPLICATIONAPP,
  application
});
export interface ISetCurrentWorkflowAction {
	type: typeKeys.SET_CURRENTWORKFLOW;
  workflow: IWorkflow;
}
export const setCurrentWorkflowAction = (workflow:IWorkflow): ISetCurrentWorkflowAction => ({
	type: typeKeys.SET_CURRENTWORKFLOW,
  workflow
});
export interface ISetCurrentContractAction {
	type: typeKeys.SET_CURRENTCONTRACT;
  contract: IContract;
}
export const setCurrentContractAction = (contract:IContract): ISetCurrentContractAction => ({
	type: typeKeys.SET_CURRENTCONTRACT,
  contract
});
export interface ISetCurrentRoleAssignmentsAction {
	type: typeKeys.SET_CURRENTROLEASSIGNMENTS;
  roleAssignments: Array<IRoleAssignment>;
}
export const setCurrentRoleAssignmentsAction = (roleAssignments:Array<IRoleAssignment>): ISetCurrentRoleAssignmentsAction => ({
	type: typeKeys.SET_CURRENTROLEASSIGNMENTS,
  roleAssignments
});
export interface ISetSelectedApplicationsAction {
	type: typeKeys.SET_SELECTEDAPPLICATIONS;
  selectedApplications: IHashTable<number>;
}
export const setSelectedApplicationsAction = (selectedApplications:IHashTable<number>): ISetSelectedApplicationsAction => ({
	type: typeKeys.SET_SELECTEDAPPLICATIONS,
  selectedApplications
});

export interface IResetCurrentApplicationAction {
	type: typeKeys.RESET_CURRENTAPPLICATION;
}
export const resetCurrentApplicationAction = (): IResetCurrentApplicationAction => ({
	type: typeKeys.RESET_CURRENTAPPLICATION
});

//set the context current breadcrumb list
export interface IAddCurrentBreadcrumbAction {
	type: typeKeys.ADD_CURRENTBREADCRUMB;
  breadcrumbItem: IBreadcrumbItem;
}
export const addCurrentBreadcrumbAction = (breadcrumbItem: IBreadcrumbItem): IAddCurrentBreadcrumbAction => ({
	type: typeKeys.ADD_CURRENTBREADCRUMB,
  breadcrumbItem
});

//set the new UI state
export interface IChangeUIStateAction {
	type: typeKeys.CHANGE_UISTATE;
	state: uiState;
}
export const changeUIState = (state:uiState): IChangeUIStateAction => ({
	type: typeKeys.CHANGE_UISTATE,
	state
});

//catch all for other actions
export interface IOtherAction {
	type: typeKeys.OTHER_ACTION;
}
