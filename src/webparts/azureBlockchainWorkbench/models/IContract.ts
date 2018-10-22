export interface IContractResponse {
  nextLink: string;
  contracts: IContract[];
}

export interface IContract {
  id: number;
  provisioningStatus: number;
  timestamp: string;
  connectionID: number;
  ledgerIdentifier: string;
  deployedByUserId: number;
  workflowId: number;
  contractCodeId: number;
  contractProperties: IContractProperty[];
  transactions: ITransaction[];
  contractActions: IContractAction[];
}

export interface IContractAction {
  id: number;
  userId: number;
  provisioningStatus: number;
  timestamp: string;
  parameters: IParameter[];
  workflowFunctionId: number;
  transactionId: number;
  workflowStateId: number;
}

export interface IParameter {
  name: string;
  value: string;
  workflowFunctionParameterId: number;
}

export interface ITransaction {
  id: number;
  connectionId: number;
  transactionHash: string;
  blockID: number;
  from: string;
  to: string;
  value: number;
  isAppBuilderTx: boolean;
}

export interface IContractProperty {
  workflowPropertyId: number;
  value: string;
}
