/*
New Application Panel
// basic examples
// https://github.com/Azure-Samples/blockchain/tree/master/blockchain-workbench/application-and-smart-contract-samples
*/
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';


import { FileUploader } from '../controls/FileUploader';
import { MessageList } from '../controls/MessageList';

import { IFileObject } from '../../models/IFile';
import { ICheckApplicationResponse } from '../../models/IChecker';
import { INewApplicationResponse } from '../../models/IApplication';

import { CheckerService } from '../../services/checkers/CheckerService';
import { ApplicationService  } from '../../services/applications/ApplicationService';

import { IApplicationState, uiState } from '../../state/State';
import { changeUIState, setCurrentApplicationAction } from '../../state/Actions';

export interface INewAppStatusMessage {
  message: string;
  icon: string;
  warningList?: Array<string>;
  errorList?: Array<string>;
}

export interface INewApplicationPanelProps {
  onDismiss: any;
  onSuccess: any;
  type: PanelType;
  headerText: string;
  changeUIState?: (state:uiState) => void;
  setCurrentApplicationAction?: (applicationId:string, workflowId?:string, contractId?:string) => void;
}

export interface INewApplicationPanelState {
  requestConfiguration: boolean;
  showConfigurationStatus: boolean;
  configurationStatusMessage: INewAppStatusMessage;

  requestCode: boolean;
  showCodeStatus: boolean;
  codeStatusMessage: INewAppStatusMessage;

  configurationFile: IFileObject;
  codeFile: IFileObject;

  warningList: Array<string>;
  errorList: Array<string>;

  applyAvailable: boolean;

  provisioning: boolean;
  provisioningMessage: INewAppStatusMessage;
}

export class NewApplicationPanel_ extends React.Component<INewApplicationPanelProps, INewApplicationPanelState> {

  constructor(props:INewApplicationPanelProps) {
    super(props);

    this.state = {
      requestConfiguration: true,
      showConfigurationStatus: false,
      configurationStatusMessage: {} as INewAppStatusMessage,

      requestCode: false,
      showCodeStatus: false,
      codeStatusMessage: {} as INewAppStatusMessage,

      configurationFile: null,
      codeFile: null,

      warningList: null,
      errorList: null,

      applyAvailable: false,
      provisioning: false,
      provisioningMessage: {} as INewAppStatusMessage,
    };
  }

  public render(): React.ReactElement<INewApplicationPanelProps> {
    return (
      <Panel
        isOpen={true}
        onDismiss={this.props.onDismiss}
        type={this.props.type}
        headerText={this.props.headerText}
        isFooterAtBottom={true}
        onRenderFooterContent={this._onRenderFooterContent}
      >

        {!this.state.provisioning && (
          <div>
            {this.state.requestConfiguration && (
              <div>
                <Label required={true}>UPLOAD THE CONTRACT CONFIGURATION (.json)</Label>

                <FileUploader
                  accept=".json"
                  dropAreaMessage="Only *.json files will be accepted"
                  onFileLoaded={this.onConfigurationFileReceived}
                />

                {this.state.showConfigurationStatus && (
                  <div className={styles.fileUploaderResult}>
                    <hr aria-hidden="true" role="presentation" className={styles.divider}/>

                    <Label>CONTRACT CONFIGURATION</Label>

                    <div className="upload-indicator upload-saved">
                      {(this.state.configurationStatusMessage.icon == "Spinner") ? (
                        <div>
                          <Spinner
                            size={SpinnerSize.xSmall}
                            label={this.state.configurationStatusMessage.message}
                            className={styles.msSpinner}
                            />
                        </div>
                      ) : (
                        <div>
                          <Icon
                            iconName={this.state.configurationStatusMessage.icon}
                            className={styles.uploadFeedbackIcon}
                          />
                          <Label
                            className={styles.uploadFeedback}
                          >{this.state.configurationStatusMessage.message}</Label>
                        </div>
                      )}
                    </div>

                    {(this.state.configurationStatusMessage.warningList || this.state.configurationStatusMessage.errorList) && (
                      <MessageList
                        warningList={this.state.configurationStatusMessage.warningList}
                        errorList={this.state.configurationStatusMessage.errorList}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {this.state.requestCode && (
              <div>
                <hr aria-hidden="true" role="presentation" className={styles.divider}/>

                <Label required={true}>UPLOAD THE CONTRACT CODE (.sol, .zip)</Label>

                <FileUploader
                  accept=".sol, .zip"
                  dropAreaMessage="Only *.sol or *.zip files will be accepted"
                  onFileLoaded={this.onCodeFileReceived}
                />

                {this.state.showCodeStatus && (
                  <div className={styles.fileUploaderResult}>
                    <hr aria-hidden="true" role="presentation" className={styles.divider}/>

                    <Label>CONTRACT CODE</Label>

                    {(this.state.codeStatusMessage.warningList || this.state.codeStatusMessage.errorList) && (
                      <MessageList
                        warningList={this.state.codeStatusMessage.warningList}
                        errorList={this.state.codeStatusMessage.errorList}
                      />
                    )}

                    <div className="upload-indicator upload-saved">
                      {(this.state.codeStatusMessage.icon == "Spinner") ? (
                        <div>
                          <Spinner
                            size={SpinnerSize.xSmall}
                            label={this.state.codeStatusMessage.message}
                            className={styles.msSpinner}
                            />
                        </div>
                      ) : (
                        <div>
                          <Icon
                            iconName={this.state.codeStatusMessage.icon}
                            className={styles.uploadFeedbackIcon}
                          />
                          <Label
                            className={styles.uploadFeedback}
                          >{this.state.codeStatusMessage.message}</Label>
                        </div>
                      )}
                    </div>


                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {this.state.provisioning && (
          <div>
            {this.state.provisioningMessage.icon == "Spinner" ? (
              <Spinner
                size={SpinnerSize.xSmall}
                label={this.state.provisioningMessage.message}
                className={styles.msSpinner}
                />
            ) : (
              <div>
                <Icon
                  iconName={this.state.provisioningMessage.icon}
                  className={styles.uploadFeedbackIcon}
                />
                <Label
                  className={styles.uploadFeedback}
                >{this.state.provisioningMessage.message}</Label>
              </div>
            )}
          </div>
        )}


      </Panel>
    );
    //FabricFolder
    //Spinner
  }

  private _onRenderFooterContent = (): JSX.Element => {
    return (
      <div>
        <hr aria-hidden="true" role="presentation" className={styles.divider}/>

        <PrimaryButton onClick={this.onApplyApplication} disabled={!this.state.applyAvailable}>
          Deploy
        </PrimaryButton>
        <DefaultButton onClick={this.props.onDismiss}>Cancel</DefaultButton>
      </div>
    );
  }

  private onApplyApplication = () => {
    this.setState({provisioning: true,
      provisioningMessage: {
        icon: "Spinner",
        message: "Creating application"
      } as INewAppStatusMessage
    });

    let applicationService: ApplicationService = new ApplicationService();

    applicationService
      .addApplication(this.state.configurationFile)
      .then((response: INewApplicationResponse): void => {
        if (response && response.result) {
          let appId = response.id;

          this.setState({provisioningMessage: {
              icon: "Spinner",
              message: "Application created: " + appId + ". Adding contract code."
            } as INewAppStatusMessage
          });

          //add the contract code now
          applicationService
            .addApplicationContractCode(this.state.codeFile, response.id, 1)
            .then((responseCode: INewApplicationResponse): void => {
              if (responseCode && responseCode.result) {
                let contractId = responseCode.id;

                this.setState({provisioningMessage: {
                    icon: "Checkmark",
                    message: "Contract code added to application."
                  } as INewAppStatusMessage
                });

                //if all good, then need to reset state to reload applications
                //reset to no application
                this.props.setCurrentApplicationAction("", "", "");
                //reset UI
                this.props.changeUIState(uiState.applicationList);

                this.props.onSuccess();
              }
              else {
                this.setState({provisioningMessage: {
                    icon: "ErrorBadge",
                    message: "An error occcured adding the contract code: " + response.errors[0]
                  } as INewAppStatusMessage,
                  applyAvailable: false
                });
              }
          });
          //end adding contract
        }
        else {
          this.setState({provisioningMessage: {
              icon: "ErrorBadge",
              message: "An error occcured adding the application: " + response.errors[0]
            } as INewAppStatusMessage,
            applyAvailable: false
          });
        }
    });
  }

  @autobind
  private onConfigurationFileReceived(accepted: Array<IFileObject>, rejected: Array<string>) {

    //we have received a configuration file, process it.

    //reset state, only allowing for configuration file components
    this.setState({showConfigurationStatus: true,
      configurationStatusMessage: {
        icon: "Spinner",
        message: "Loading the application configuration file",
        warningList: null,
        errorList: null
      } as INewAppStatusMessage,
      requestCode: false,
      showCodeStatus: false,
      codeStatusMessage: {
        icon: "Spinner",
        message: "",
        warningList: null,
        errorList: null
      } as INewAppStatusMessage,
      configurationFile: null,
      codeFile: null
    });

    //if we have one or more rejected files, then we have to error out with messages
    if (rejected && rejected.length > 0) {
      for(var reject of rejected) {
        console.log("rejected file: " + reject);
        //TODO: loop through rejected and print out error message
        this.setState({configurationStatusMessage: {
            icon: "ErrorBadge",
            message: "Invalid file type provided"
          } as INewAppStatusMessage
        });
      }
    }
    else {
      //there are no rejected files, looking for accepted ones
      if (accepted && accepted.length > 0) {
        //only one accepted file should be returned
        for(var acceptable of accepted) {
          this.setState({configurationStatusMessage: {
              icon: "Spinner",
              message: "Validating configuration file: " + acceptable.fileName
            } as INewAppStatusMessage,
            configurationFile: acceptable
          });

          let checkerService: CheckerService = new CheckerService();

          checkerService
            .checkApplication(acceptable)
            .then((response: string): void => {
              if (response) {
                //need to manually convert the response to json
                var checkerResponse: ICheckApplicationResponse = JSON.parse(response) as ICheckApplicationResponse;

                //if valid, then we can move on
                if (checkerResponse && checkerResponse.Result) {
                  //if valid
                  this.setState({configurationStatusMessage: {
                      icon: "FabricFolder",
                      message: "Saved. Your application is ready to deploy.",
                      warningList: (checkerResponse.Warnings && checkerResponse.Warnings.length > 0) ? checkerResponse.Warnings : null
                    } as INewAppStatusMessage,
                    requestCode: true
                  });
                }
                else {
                  this.setState({configurationStatusMessage: {
                      icon: "ErrorBadge",
                      message: "An error occurred",
                      errorList: (checkerResponse.Errors && checkerResponse.Errors.length > 0) ? checkerResponse.Errors : ["An error occurred yet no error messages were return"] as Array<string>
                    } as INewAppStatusMessage,
                    requestCode: false
                  });
                }
              }
              else {
                //Invalid response, print out error message
                this.setState({configurationStatusMessage: {
                    icon: "ErrorBadge",
                    message: "An invalid response was returned",
                    errorList: ["No response returned"] as Array<string>
                  } as INewAppStatusMessage,
                  requestCode: false
                });
              }
          });
          //end checkerService request to check configuration file
        } //end looping through each acceptable file
      }
      else {
        //provide feedback on uploading configuration file
        this.setState({configurationStatusMessage: {
            icon: "ErrorBadge",
            message: "No valid file provided",
            errorList: ["Please provide a valid configuration file"] as Array<string>
          } as INewAppStatusMessage,
          requestCode: false
        });
      }
    }
  }

  @autobind
  private onCodeFileReceived(accepted: Array<IFileObject>, rejected: Array<string>) {
    //we have received a configuration file, process it.

    //reset state, only allowing for configuration file components
    this.setState({showCodeStatus: true,
      codeStatusMessage: {
        icon: "Spinner",
        message: "Loading the application code file",
        warningList: null,
        errorList: null
      } as INewAppStatusMessage,
      codeFile: null
    });

    //if we have one or more rejected files, then we have to error out with messages
    if (rejected && rejected.length > 0) {
      for(var reject of rejected) {
        console.log("rejected file: " + reject);
        //TODO: loop through rejected and print out error message
        this.setState({codeStatusMessage: {
            icon: "ErrorBadge",
            message: "Invalid file type provided"
          } as INewAppStatusMessage
        });
      }
    }
    else {
      //there are no rejected files, looking for accepted ones
      if (accepted && accepted.length > 0) {
        //only one accepted file should be returned
        for(var acceptable of accepted) {
          this.setState({codeStatusMessage: {
              icon: "Spinner",
              message: "Validating code file: " + acceptable.fileName
            } as INewAppStatusMessage,
            codeFile: acceptable
          });

          let checkerService: CheckerService = new CheckerService();

          checkerService
            .checkApplicationCode(this.state.configurationFile, acceptable)
            .then((response: string): void => {
              if (response) {
                //need to manually convert the response to json
                var checkerResponse: ICheckApplicationResponse = JSON.parse(response) as ICheckApplicationResponse;

                //if valid, then we can move on
                if (checkerResponse && checkerResponse.Result) {
                  //if valid
                  this.setState({codeStatusMessage: {
                      icon: "FabricFolder",
                      message: "Saved. Your application code is ready to deploy.",
                      warningList: (checkerResponse.Warnings && checkerResponse.Warnings.length > 0) ? checkerResponse.Warnings : null
                    } as INewAppStatusMessage
                  });

                  this.setState({applyAvailable: true});
                }
                else {
                  this.setState({codeStatusMessage: {
                      icon: "ErrorBadge",
                      message: "An error occurred",
                      errorList: (checkerResponse.Errors && checkerResponse.Errors.length > 0) ? checkerResponse.Errors : ["An error occurred yet no error messages were return"] as Array<string>
                    } as INewAppStatusMessage
                  });
                }
              }
              else {
                //Invalid response, print out error message
                this.setState({codeStatusMessage: {
                    icon: "ErrorBadge",
                    message: "An invalid response was returned",
                    errorList: ["No response returned"] as Array<string>
                  } as INewAppStatusMessage
                });
              }
          });
          //end checkerService request to check configuration file
        } //end looping through each acceptable file
      }
      else {
        //provide feedback on uploading code file
        this.setState({codeStatusMessage: {
            icon: "ErrorBadge",
            message: "No valid file provided",
            errorList: ["Please provide a valid code file"] as Array<string>
          } as INewAppStatusMessage,
          requestCode: false
        });
      }
    }

  }
}

function mapStateToProps(state: IApplicationState, passedProps: INewApplicationPanelProps): INewApplicationPanelProps{
	return {
    onDismiss: passedProps.onDismiss,
    onSuccess: passedProps.onSuccess,
    type: passedProps.type,
    headerText: passedProps.headerText
	};
}

function mapDispatchToProps(dispatch: Dispatch<INewApplicationPanelProps>, passedProps: INewApplicationPanelProps): INewApplicationPanelProps{
	return {
    onDismiss: passedProps.onDismiss,
    onSuccess: passedProps.onSuccess,
    type: passedProps.type,
    headerText: passedProps.headerText,
    changeUIState: (state:uiState) => {
      dispatch(changeUIState(state));
    },
    setCurrentApplicationAction: (applicationId:string, workflowId?:string, contractId?:string) => {
      dispatch(setCurrentApplicationAction(applicationId, workflowId, contractId));
    }
	};
}

export const NewApplicationPanel = connect(mapStateToProps, mapDispatchToProps)(NewApplicationPanel_);
