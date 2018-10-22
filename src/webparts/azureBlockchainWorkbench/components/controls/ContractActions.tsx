/*
Display a given activity row with a contract detail
*/
import * as React from 'react';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export interface IContractActionsProps {
  actions?: Array<any>;
}

export interface IContractActionsState {
  actionPanelVisible: boolean;
}

export class ContractActions extends React.Component<IContractActionsProps, IContractActionsState> {

  constructor(props:IContractActionsProps) {
    super(props);

    this.state = {
      actionPanelVisible: false
    };
  }

  public render(): React.ReactElement<IContractActionsProps> {
    return (
      <div className={styles.contractActions + (!this.props.actions ? " " + styles.contractActionsEmpty : "")}>
        <div className={styles.header}>
          <h2>Actions</h2>
        </div>

        <div className={styles.content}>
          <div className={styles.lastAction}>There's nothing for you to do right now.</div>
        </div>

        <div className="card-footer"></div>

        <Panel
          isOpen={this.state.actionPanelVisible}
          onDismiss={this.closeActionPanel}
          type={PanelType.medium}
          headerText="Offer"
          className={styles.contractActionsPanel}
        >
          <div>
          </div>
        </Panel>
      </div>
    );
  }

  @autobind
  private onActionClick(): void {
		this.setState({
      actionPanelVisible: true
    });
  }

  @autobind
  private closeActionPanel(): void {
    this.setState({
      actionPanelVisible: false
    });
  }
}
