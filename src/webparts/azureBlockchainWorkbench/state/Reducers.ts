import { clone } from '@microsoft/sp-lodash-subset';

import {
    ActionTypes,
    ISetContextAction,
    typeKeys,
} from './Actions';

import {
    IApplicationState,
    IContext,
    initialState,
    uiState,
    IHashTable
} from './State';
import { IBreadcrumbItem } from '../../../../node_modules/office-ui-fabric-react/lib/Breadcrumb';

//** Primary reducer for adjusting redux state, calls individual reducer functions as necessary */
export const abwReducer = (state:IApplicationState = initialState, action:ActionTypes): IApplicationState => {
	let newState:IApplicationState = clone(state);

  switch (action.type) {

		case typeKeys.SET_CONTEXT:
			newState.context = SetContextReducer(newState.context, action);
			newState.ui.height = action.properties.height;
      break;

    case typeKeys.SET_CURRENTUSERCONTEXT:
      newState.context.user.currentUser = action.currentUser;
      newState.context.user.capabilities = action.capabilities;
			break;

		case typeKeys.SET_HEIGHT:
			newState.ui.height = action.height;
      break;

    case typeKeys.SET_APPSPERPAGE:
			newState.ui.appsPerPage = action.appsPerPage;
      break;

    case typeKeys.SET_WORKBENCHAPIURL:
			newState.context.workbench.apiUrl = action.workbenchApiUrl;
      break;

    case typeKeys.SET_WORKBENCHAADAPPID:
			newState.context.workbench.aadAppId = action.workbenchAADAppId;
      break;

    case typeKeys.SET_CURRENTAPPLICATION:
      newState.context.application.applicationId = action.applicationId;
      newState.context.application.workflowId = action.workflowId ? action.workflowId : undefined;
      newState.context.application.contractId = action.contractId ? action.contractId : undefined;
      break;

    case typeKeys.SET_CURRENTAPPLICATIONAPP:
      newState.context.application.currentApplication = action.application;
      break;
    case typeKeys.SET_CURRENTWORKFLOW:
      newState.context.application.currentWorkflow = action.workflow;
      break;
    case typeKeys.SET_CURRENTCONTRACT:
      newState.context.application.currentContract = action.contract;
      break;
    case typeKeys.SET_SELECTEDAPPLICATIONS:
      newState.context.application.selectedApplications = action.selectedApplications;
      break;

    case typeKeys.ADD_CURRENTBREADCRUMB:
      if (!newState.context.breadcrumb) {
        newState.context.breadcrumb = new Array<IBreadcrumbItem>();
      }
      newState.context.breadcrumb = [...newState.context.breadcrumb, action.breadcrumbItem];

      break;

    case typeKeys.CHANGE_UISTATE:
      //always reset breadcrumbs when new state
      newState.context.breadcrumb = new Array<IBreadcrumbItem>();
			newState.ui.state = action.state;
			break;

		default:
			return state;
  }

	return newState;
};

function SetContextReducer(context:IContext, action:ISetContextAction): IContext {
	return {
		isOnline: action.isOnline,
		webAbsoluteUrl: action.webAbsoluteUrl,
		user: {
			displayName: action.userDisplayName,
			email: action.userEmail
    },
    breadcrumb: undefined,
    application: {
      applicationId: undefined,
      workflowId: undefined,
      contractId: undefined,
      currentApplication: undefined,
      currentWorkflow: undefined,
      currentContract: undefined,
      selectedApplications: {} as IHashTable<number>
    },
    properties: action.properties,
    workbench: {
			apiUrl: action.properties.workbenchApiUrl,
      aadAppId: action.properties.workbenchAADAppId
    },
    propertyPane: action.propertyPane,
    statusRenderer: action.statusRenderer
	};
}
