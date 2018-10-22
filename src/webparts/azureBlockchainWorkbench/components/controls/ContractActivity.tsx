/*
Display a given activity row with a contract detail
*/
import * as React from 'react';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export interface IContractActivityProps {
  activity?: any;
}

export interface IContractActivityState {
  activityPanelVisible: boolean;
}

export class ContractActivity extends React.Component<IContractActivityProps, IContractActivityState> {

  constructor(props:IContractActivityProps) {
    super(props);

    this.state = {
      activityPanelVisible: false
    };
  }

  public render(): React.ReactElement<IContractActivityProps> {
    return (
      <div className={styles.contractActivity}>
        <div className={styles.timelineRow} role="button" tabIndex={0} onClick={this.onActivityClick}>
          <div className={styles.timelineItem}>
            <p className={styles.leftSide}>{this.props.activity.displayName + " recorded action " + this.props.activity.action}</p>
          </div>
          <p className={styles.rightSide}>{this.props.activity.activityTime}</p>
        </div>

        <Panel
          isOpen={this.state.activityPanelVisible}
          onDismiss={this.closeActivityPanel}
          type={PanelType.medium}
          headerText="Details"
          className={styles.contractActivityPanel}
        >
          <div>
            <div className={styles.contractActivityPanelRow}>
              <p className={styles.title}>CONTRACT STATE</p>
              <p>{'Respond'}</p>
            </div>
            <div className={styles.contractActivityPanelRow}>
              <p className={styles.title}>ACTION TAKEN</p>
              <p>{this.props.activity.action}</p>
            </div>
            <div className={styles.contractActivityPanelRow}>
              <p className={styles.title}>BY</p>
              <Persona
                text={this.props.activity.displayName}
                size={PersonaSize.size48}
                hidePersonaDetails={false}
              />
            </div>

            {this.props.activity.activityParameters && this.props.activity.activityParameters.length > 0 && (this.props.activity.activityParameters.map((item, index) => (
              <div className={styles.contractActivityPanelRow}>
                <p className={styles.title}>{item.name}</p>
                <p>{item.value}</p>
              </div>
            )))}

            <div className={styles.contractActivityPanelRow}>
              <p className={styles.title}>DATE</p>
              <p>{this.props.activity.activityDate}</p>
            </div>
            <div className={styles.contractActivityPanelRow}>
              <p className={styles.title}>TIME</p>
              <p>{this.props.activity.activityTime}</p>
            </div>
            <div>
                <div className={styles.contractActivityPanelRow}>
                  <p className={styles.title}>BLOCK</p>
                  <p>{this.props.activity.block}</p>
                </div>
                <div className={styles.contractActivityPanelRow}>
                  <p className={styles.title}>FROM ADDRESS</p>
                  <p>{this.props.activity.blockFromAddress}</p>
                </div>
                <div className={styles.contractActivityPanelRow}>
                  <p className={styles.title}>TX HASH</p>
                  <p>{this.props.activity.blockTxHash}</p>
                </div>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  @autobind
  private onActivityClick(): void {
		this.setState({
      activityPanelVisible: true
    });
  }

  @autobind
  private closeActivityPanel(): void {
    this.setState({
      activityPanelVisible: false
    });
  }
}
