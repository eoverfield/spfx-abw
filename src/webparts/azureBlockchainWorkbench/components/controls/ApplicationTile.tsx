/*
display a given application tiele
*/
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';

import { IApplication } from '../../models/IApplication';

import { IApplicationState, IHashTable } from '../../state/State';
import { setSelectedApplicationsAction } from '../../state/Actions';
import { HelperFunctions } from '../../helpers/HelperFunctions';

export interface IApplicationTileProps {
  displayIndex: number;
  application: IApplication;
  onClick?: (appId: string) => void;
  onSelect?: (appId: number) => void;

  //selectedApplications?: IHashTable<number>;
  //setSelectedApplicationsAction?: (selectedApplications: IHashTable<number>) => void;
}

export interface IApplicationTileState {
  checked: boolean;
}

export class ApplicationTile extends React.Component<IApplicationTileProps, IApplicationTileState> {

  constructor(props:IApplicationTileProps) {
    super(props);

    this.state = {
      checked: false
    };
  }

  public render(): React.ReactElement<IApplicationTileState> {
    return (
      <div className={styles.applicationTileContainer}>
        <div key={this.props.displayIndex} className={styles.applicationTile} data-selection-index={this.props.displayIndex}>
          <div
            className={((this.state.checked) ? (" " + styles.appTileContentChecked) : styles.appTileContent)}
            role="button"
            tabIndex={this.props.displayIndex}
            onClick={this.applicationSelected}
            >

              <div className={styles.appTileCheckboxDiv}>
                <span
                  className={styles.appTileCheckmark}
                  role="checkbox"
                  aria-checked="true"
                  tabIndex={this.props.application.id}
                  onClick={this.onCheckBoxChange}
                  ></span>
              </div>

            <div className={styles.appCustomTile} style={{backgroundColor: HelperFunctions.getColorFromString(this.props.application.displayName)}}>
              <span className={styles.appCustomTileContent}>{HelperFunctions.getInitials(this.props.application.displayName)}</span>
            </div>
            <div className={styles.applicationTitle}>
              {this.props.application.displayName}
            </div>
            <p className={styles.applicationDate}>Deployed {new Date(this.props.application.createdDtTm).toLocaleDateString()}</p>
            <p className={styles.applicationEnabledDisabled}>{this.props.application.enabled ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
      </div>
    );
  }

  @autobind
  private applicationSelected(): void {
    this.props.onClick(this.props.application.id.toString());
  }
  @autobind
  private onCheckBoxChange(ev?: React.MouseEvent<HTMLSpanElement>): void {
    ev.stopPropagation();

    this.props.onSelect(this.props.application.id);

    //set state
    this.setState({
      checked: this.state.checked ? false : true
    });
  }


}

/*
function mapStateToProps(state: IApplicationState, passedProps: IApplicationTileProps): IApplicationTileProps{
	return {
    displayIndex: passedProps.displayIndex,
    application: passedProps.application,
    selectedApplications: state.context.application.selectedApplications
	};
}

function mapDispatchToProps(dispatch: Dispatch<IApplicationTileProps>, passedProps: IApplicationTileProps): IApplicationTileProps{
	return {
    displayIndex: passedProps.displayIndex,
    application: passedProps.application,
    setSelectedApplicationsAction: (selectedApplications: IHashTable<number>) => {
      dispatch(setSelectedApplicationsAction(selectedApplications));
    }
	};
}

export const ApplicationTile = connect(mapStateToProps, mapDispatchToProps)(ApplicationTile_);
*/
