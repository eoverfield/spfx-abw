import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { IPropertyPaneAccessor, IClientSideWebPartStatusRenderer } from '@microsoft/sp-webpart-base';
//import { escape } from '@microsoft/sp-lodash-subset';

import styles from './AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";

import { ApplicationList } from './panes/ApplicationList';
import { ApplicationDetail } from './panes/ApplicationDetail';
import { ContractDetail } from './panes/ContractDetail';

import { BlockchainBreadcrumb } from './controls/Breadcrumb';

import { IUserService, UserService } from '../services/users/UserService';

import { IUser, IUserCapabilities } from '../models/IUser';
import { ICurrentUserResponse } from '../models/IUser';

import { IApplicationState, uiState } from '../state/State';
import { changeUIState, setCurrentUserContext } from '../state/Actions';

export default interface IAzureBlockchainWorkbenchProps {
  uistate?: uiState;
  uiHeight?: number;
  propertyPane?: IPropertyPaneAccessor;
  statusRenderer?: IClientSideWebPartStatusRenderer;
  changeUIState?: (state:uiState) => void;
  setCurrentUserContext?: (currentUser: IUser, capabilities: IUserCapabilities) => void;
}

class AzureBlockchainWorkbench_ extends React.Component<IAzureBlockchainWorkbenchProps, {}> {

  private userService: IUserService;

  constructor(props:IAzureBlockchainWorkbenchProps) {
    super(props);
  }

  public render(): React.ReactElement<IAzureBlockchainWorkbenchProps> {
    if (this.props.uistate == uiState.loadingCurrentUser) {
      this.loadCurrentUser();
    }

    return (
      <div className={styles.azureBlockchainWorkbench} style={{height: this.props.uiHeight + 'px'}}>
        {this.props.uistate == uiState.configurationRequired ? (
          <Placeholder
            iconName='Edit'
            iconText='Configure your web part'
            description='Please configure the web part.'
            buttonLabel='Configure'
            onConfigure={this._onConfigure} />
        ) : (
          <div>
            {this.props.uistate == uiState.loadingCurrentUser ? (
              <Spinner size={SpinnerSize.large} label="Loading Azure Blockchain Workbench"/>
            ) : (
              <div>
                <div>
                  <BlockchainBreadcrumb/>
                </div>
                <div>
                  {this.props.uistate == uiState.applicationList && (
                    <ApplicationList/>
                  )}
                  {this.props.uistate == uiState.applicationDetail && (
                    <ApplicationDetail/>
                  )}
                  {this.props.uistate == uiState.contractDetail && (
                    <ContractDetail/>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  private loadCurrentUser(): void {
    let userService: UserService = new UserService();

    //always go and get the user again to restart primary process
    userService
      .getCurrentUser()
      .then((response: ICurrentUserResponse): void => {
        if (response && response.currentUser && response.capabilities) {
          this.props.setCurrentUserContext(response.currentUser, response.capabilities);

          this.props.changeUIState(uiState.applicationList);
        }
      })
      .catch(error => {
        console.error(error);

        console.log("AzureBlockchainWorkbench: A fatal error occurred attempting to retrieve the current user");
        this.props.changeUIState(uiState.fatalError);
      });
  }

  @autobind
  private _onConfigure() {
    this.props.propertyPane.open();
  }
}

//map redux state properties that we want to this particular React Component properties
function mapStateToProps(state: IApplicationState): IAzureBlockchainWorkbenchProps{
	return {
    uistate: state.ui.state,
    uiHeight: state.ui.height,
    propertyPane: state.context.propertyPane,
    statusRenderer: state.context.statusRenderer
	};
}

function mapDispatchToProps(dispatch: Dispatch<IAzureBlockchainWorkbenchProps>): IAzureBlockchainWorkbenchProps{
	return {
    changeUIState: (state:uiState) => {
      dispatch(changeUIState(state));
    },
    setCurrentUserContext: (currentUser: IUser, capabilities: IUserCapabilities) => {
      dispatch(setCurrentUserContext(currentUser, capabilities));
    }
	};
}

export const AzureBlockchainWorkbench = connect(mapStateToProps, mapDispatchToProps)(AzureBlockchainWorkbench_);
