/*
display a given application tiele
*/
import * as React from 'react';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { Label } from 'office-ui-fabric-react/lib/Label';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export interface IMessageListProps {
  warningList?: Array<string>;
  errorList?: Array<string>;
}

export class MessageList extends React.Component<IMessageListProps, null> {

  constructor(props:IMessageListProps) {
    super(props);
  }

  public render(): React.ReactElement<IMessageListProps> {
    return (
      <div className={styles.messageList}>
        {this.props.warningList && this.props.warningList.length > 0 && (
          <div className={styles.messageWarningContainer}>
            <div>
              <div className={styles.messageHeader}>
                <div>
                  <Icon
                    iconName={"Warning"}
                    className={styles.messageIcon}
                  />
                  <Label className={styles.messageLabel}>We found these warnings in the file you submitted. Resolve or ignore them to continue.</Label>
                </div>
              </div>
              {this.props.warningList.map((item, index) => (
                <div className={styles.messageItems}>
                  <Icon
                    iconName={"Warning"}
                    className={styles.messageIcon}
                  />
                  <Label className={styles.messageLabel}>{item}</Label>
                </div>
              ))}
            </div>
            <div className={styles.messageHeader}>
              <div className={styles.messageCopyAll} role="button" onClick={() => this.copyAll("warning")}>
                <Icon
                  iconName={"Copy"}
                  className={styles.messageIcon}
                />
                <Label className={styles.messageLabel}>Copy All</Label>
              </div>
            </div>
          </div>
        )}


        {this.props.errorList && this.props.errorList.length > 0 && (
          <div className={styles.messageErrorContainer}>
            <div>
              <div className={styles.messageHeader}>
                <div>
                  <Icon
                    iconName={"ErrorBadge"}
                    className={styles.messageIcon}
                  />
                  <Label className={styles.messageLabel}>We found these errors in the file you submitted. Resolve them and upload the file again.</Label>
                </div>
              </div>
              {this.props.errorList.map((item, index) => (
                <div className={styles.messageItems}>
                  <Icon
                    iconName={"ErrorBadge"}
                    className={styles.messageIcon}
                  />
                  <Label className={styles.messageLabel}>{item}</Label>
                </div>
              ))}
            </div>
            <div className={styles.messageHeader} role="button">
              <div className={styles.messageCopyAll} role="button" onClick={() => this.copyAll("error")}>
                <Icon
                  iconName={"Copy"}
                  className={styles.messageIcon}
                />
                <Label className={styles.messageLabel}>Copy All</Label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  @autobind
  private copyAll(type: string) : void {
    const data = (type == "error") ? JSON.stringify(this.props.errorList) : JSON.stringify(this.props.warningList);
    const textField = document.createElement('textarea');
    textField.innerText = data;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();

    alert("Messages available in clipboard");
  }
}
