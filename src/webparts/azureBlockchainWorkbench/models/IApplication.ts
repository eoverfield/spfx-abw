import { IUser } from './IUser';
import { IContract } from './IContract';

//Root Responses
export interface IApplicationResponse {
  nextLink: string;
  applications: IApplication[];
}

export interface IApplicationRoleAssignmentResponse {
  nextLink: string;
  roleAssignments: IRoleAssignment[];
}

export interface IApplicationWorkflowsResponse {
  nextLink: string;
  workflows: IWorkflow[];
}

export interface INewApplicationResponse {
  result: boolean;
  id: number;
  errors?: Array<string>;
}

export interface IContractCodeResponse {
  nextLink: string;
  contractCodes: IContractCode[];
}

//Query Interfaces
export interface IApplicationQuery {
  top: number;
  skip: number;
  enabled: boolean;
  sortBy: string;
}

export interface IContractCodeQuery {
  top: number;
  skip: number;
  ledgerId: number;
}

//Applications
export interface IApplication {
  id: number;
  name: string;
  description: string;
  displayName: string;
  createdByUserId: number;
  createdDtTm: string;
  enabled: boolean;
  blobStorageURL: string;
  applicationRoles: IApplicationRole[];
  workflows?: Array<IWorkflow>;
  contracts?: Array<IContract>;
}

export interface IApplicationRole {
  id: number;
  name: string;
  description: string;
}

//role Assignments
export interface IRoleAssignment {
  id: number;
  applicationRoleId: number;
  user: IUser;
}

//workflows


export interface IWorkflow {
  id: number;
  name: string;
  description: string;
  displayName: string;
  applicationId: number;
  constructorId: number;
  startStateId: number;
  initiators: string[];
  properties: IWorkflowProperty[];
  constructor: IWorkflowFunction;
  functions: IWorkflowFunction[];
  startState: IWorkflowState;
  states: IWorkflowState[];
}

export interface IWorkflowState {
  id: number;
  name: string;
  description: string;
  displayName: string;
  percentComplete: number;
  value: number;
  style: string;
  workflowStateTransitions: IWorkflowStateTransition[];
}

export interface IWorkflowStateTransition {
  id: number;
  workflowFunctionId: number;
  currStateId: number;
  allowedRoles: string[];
  allowedInstanceRoles: string[];
  description: string;
  function: string;
  currentState: string;
  displayName: string;
}

export interface IWorkflowFunction {
  id: number;
  name: string;
  description: string;
  displayName: string;
  parameters: IWorkflowProperty[];
  workflowId: number;
}

export interface IWorkflowProperty {
  id: number;
  name: string;
  description: string;
  displayName: string;
  type: IWorkflowType;
}

export interface IWorkflowType {
  id: number;
  name: string;
  applicationId: number;
  elementType: IWorkflowElementType;
  elementTypeId: number;
  enumValues: string[];
}

export interface IWorkflowElementType {
}

export interface IContractCode {
  contractCodeID: number;
  ledgerID: number;
  createdByUserId: number;
  createdDtTm: string;
}
