/*
display a given application tiele
*/
import * as React from 'react';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { createRef } from 'office-ui-fabric-react/lib/Utilities';

export interface IApplicationTileNewProps {
  onClick?: () => void;
}

export interface IApplicationTileNewState {
  calloutVisible: boolean;
}

export class ApplicationTileNew extends React.Component<IApplicationTileNewProps, IApplicationTileNewState> {
  private _menuButtonElement = createRef<HTMLElement>();

  constructor(props:IApplicationTileNewProps) {
    super(props);

    this.state = {
      calloutVisible: false
    };
  }

  public render(): React.ReactElement<IApplicationTileNewProps> {
    return (
      <div className={styles.applicationTileContainer}>
        <div key={0} className={styles.applicationTile} data-selection-index={0}>
          <div
            className={styles.appTileContent}
            role="button"
            tabIndex={0}
            onClick={this.applicationSelected}
            >

            <div className={styles.appCustomTile} style={{backgroundColor: "rgb(0, 120, 215)"}}>
              <span className={styles.appCustomTileContent}>
                <Icon
                  iconName={"CircleAddition"}
                  className={styles.tileNew}
                />
              </span>
            </div>
            <div className={styles.applicationTitle} ref={this._menuButtonElement}>
              New
            </div>
            <p className={styles.applicationDate}></p>
            <p className={styles.applicationEnabledDisabled}></p>
            {this.state.calloutVisible && (
              <Callout
                className={styles.appTileNewCallout}
                role={'alertdialog'}
                gapSpace={0}
                target={this._menuButtonElement.current}
              >
                <p>
                  Start here by building your first application
                </p>
              </Callout>
            )}
          </div>
        </div>
      </div>
    );
  }

  public componentDidMount(): void {
    //we want the callout to appear after the first render for proper positioning
    if (!this.state.calloutVisible) {
      this.setState({calloutVisible: true});
    }
  }

  @autobind
  private applicationSelected(): void {
    this.props.onClick();
  }
}
