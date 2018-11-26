import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Button, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { IPersonaSharedProps } from 'office-ui-fabric-react/lib/Persona';
import { IFacepilePersona } from 'office-ui-fabric-react/lib/Facepile';
import { IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, IColumn, IDetailsList, IDetailsRowProps, DetailsRow } from 'office-ui-fabric-react/lib/DetailsList';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';

import { Header } from '../controls/Header';

import { IApplication, IApplicationRoleAssignmentResponse, IRoleAssignment, IApplicationWorkflowsResponse, IWorkflow, IWorkflowProperty, IWorkflowState, IContractCodeQuery } from '../../models/IApplication';

import { ApplicationService } from '../../services/applications/ApplicationService';
import { ContractService } from '../../services/contracts/ContractService';

import { IApplicationState, uiState, IApplicationContext } from '../../state/State';
import { changeUIState, setCurrentApplicationAction, setCurrentApplicationAppAction, setCurrentWorkflowAction, setCurrentRoleAssignmentsAction, addCurrentBreadcrumbAction } from '../../state/Actions';
import { Breadcrumb, IBreadcrumb } from '../../../../../node_modules/office-ui-fabric-react/lib/Breadcrumb';
import { IContractResponse, IContract, IContractProperty, INewContract, IParameter, IContractConstructor } from '../../models/IContract';
import { IContractCodeResponse } from '../../models/IApplication';

import { HelperFunctions } from '../../helpers/HelperFunctions';

import times = require('lodash/times');
import { Icon } from 'office-ui-fabric-react/lib/Icon';

export enum applicationStage {
  loading,
  applicationLoaded
}

export interface IApplicationDetailProps {
  application?: IApplicationContext;
  uiHeight?: number;
  changeUIState?: (state:uiState) => void;
  setCurrentApplicationAction?: (applicationId:string, workflowId?:string, contractId?:string) => void;
  setCurrentApplicationAppAction?: (application:IApplication) => void;
  setCurrentWorkflowAction?: (workflow:IWorkflow) => void;
  setCurrentRoleAssignmentsAction?: (roleAssignments:Array<IRoleAssignment>) => void;
  addCurrentBreadcrumbAction?: (breadcrumb:IBreadcrumbItem) => void;
}

export interface IApplicationDetailState {
  stage: applicationStage;
  stageMessage: string;
  newContractPanelVisible: boolean;
  peoplePanelVisible: boolean;
  facepilePersonas?: any[];
  personas?: any[];
  application?: IApplication;
  roleAssignments: Array<IRoleAssignment>;
  workflows?: Array<IWorkflow>;
  currentWorkflow?: IWorkflow;
  contracts?: Array<IContract>;
  contractColumns?: Array<IColumn>;
  contractRows?: Array<any>;
  newContract?: INewContract;
}

class ApplicationDetail_ extends React.Component<IApplicationDetailProps, IApplicationDetailState> {
  private appId: string;
  private breadcrumbs: IBreadcrumbItem[];

  constructor(props:IApplicationDetailProps) {
    super(props);

    this.state = {
      stage: applicationStage.loading,
      stageMessage: 'Loading',
      newContractPanelVisible:false,
      peoplePanelVisible: false,
      facepilePersonas: new Array<IFacepilePersona>(),
      personas: new Array<IPersonaSharedProps>(),
      application: undefined,
      roleAssignments: undefined,
      workflows: undefined,
      currentWorkflow: undefined,
      contracts: undefined,
      contractColumns: undefined,
      contractRows: undefined,
      newContract: undefined
    };

    this.appId = this.props.application.applicationId;

    //need to do this first to ensure this.breadcrumbs has been initialized
    this.initApplicationBreadcrumb();

    this.loadApplicationDetailRoleAssignments();

    this.loadApplicationDetail();
  }

  public render(): React.ReactElement<IApplicationDetailProps> {
    return (
      <div className={styles.applicationList} style={{height: this.props.uiHeight + 'px'}}>
        {this.state.stage == applicationStage.loading && (
          <Spinner size={SpinnerSize.large} label={this.state.stageMessage}/>
        )}

        {this.state.stage != applicationStage.loading && (
          <div>
            <hr aria-hidden="true" role="presentation" className={styles.divider}/>

            <Header
              headerTitle = "Applications detail"
              facepilePersonas = {this.state.facepilePersonas}
              personas = {this.state.personas}
              personaPanelButton = "Add a Member"
              personaPanelButtonAction = {this.onAddNewMember}
              allowUpdateRoleAssignments = {true}
            />

            <CommandBar
              items={this.getCommandBarItems()}
            />

            <Panel
              className={styles.panelContract}
              isOpen={this.state.newContractPanelVisible}
              onDismiss={this.onCloseNewContractClick}
              type={PanelType.medium}
              headerText="New Contract"
            >
              {this.props.application.currentWorkflow && this.props.application.currentWorkflow.constructor && (
                <div>
                  <div className={styles.createContractOptions}>
                    {this.props.application.currentWorkflow.constructor.parameters.map((item, index) => (
                      <div>
                        <Label required={true}>{item.displayName}</Label>

                        {item.type.name == "string" && (
                          <div>
                            <TextField
                              id={item.name}
                              onChanged={(newValue: any) => {this._newContractValueChanged(item.name, newValue);}}
                            />
                          </div>

                        )}
                      </div>
                    ))}
                  </div>

                  <div className={styles.createContractActions}>
                    <PrimaryButton
                      className={styles.buttonPrimary}
                      text={"Create"}
                      onClick={this.createContract}
                    />
                    <Button
                      text={"Cancel"}
                      onClick={this.createContractCancel}
                    />
                  </div>
                </div>

              )}

            </Panel>

            <DetailsList
              className={styles.contractList}
              items={this.state.contractRows}
              columns={this.state.contractColumns}
              layoutMode={DetailsListLayoutMode.fixedColumns}
              selectionMode={SelectionMode.none}
              onActiveItemChanged={this.onContractClick}
              onRenderRow={this.onContractRenderRow}
            />
          </div>
        )}
      </div>
    );
  }

  private loadApplicationDetailRoleAssignments(): void {
    let applicationService: ApplicationService = new ApplicationService();

    this.setState({stage: applicationStage.loading, stageMessage: "Loading Application Roles"});

    applicationService
      .getApplicationDetailRoleAssignments(this.appId)
      .then((response: IApplicationRoleAssignmentResponse): void => {
        if (response && response.roleAssignments && response.roleAssignments.length > 0) {
          var roleAssignments: Array<IRoleAssignment>;
          var aFacepilePersonas: Array<IFacepilePersona> = new Array<IFacepilePersona>();
          var aPersonas: Array<IPersonaSharedProps> = new Array<IPersonaSharedProps>();

          roleAssignments = response.roleAssignments;

          //map the role assignments to personas
          roleAssignments.map((item: IRoleAssignment) => {
            aFacepilePersonas.push( {
              personaName: item.user.firstName + " " + item.user.lastName,
              //imageUrl: ''
            });

            aPersonas.push( {
              imageUrl: '',
              imageInitials: '',
              text: item.user.firstName + " " + item.user.lastName,
              secondaryText: item.user.emailAddress
            });
          });

          //store the current workflow properties
          this.props.setCurrentRoleAssignmentsAction(roleAssignments);

          this.setState({
            roleAssignments: roleAssignments,
            facepilePersonas: aFacepilePersonas,
            personas: aPersonas
          });



        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  private loadApplicationDetail(): void {
    let applicationService: ApplicationService = new ApplicationService();

    //reset workflows, contracts, and contract columns

    this.setState({
      stage: applicationStage.loading,
      stageMessage: "Loading Application",
      workflows: undefined,
      currentWorkflow: undefined,
      contracts: undefined,
      contractColumns: undefined,
      contractRows: undefined
    });

    applicationService
      .getApplicationDetail(this.appId)
      .then((response: IApplication): void => {
        if (response) {
          //set the application state
          this.setState({application: response}, () => {
            this.props.setCurrentApplicationAppAction(this.state.application);

            //load up all workflow for this application
            this.loadApplicationWorkflows();
          });

          //update breadcrumb
          var breadcrumbItem: IBreadcrumbItem = {} as IBreadcrumbItem;

          breadcrumbItem.key = response.name;
          breadcrumbItem.text = response.displayName;
          breadcrumbItem.isCurrentItem = true;

          this.props.addCurrentBreadcrumbAction(breadcrumbItem);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  private loadApplicationWorkflows(): void {
    let applicationService: ApplicationService = new ApplicationService();

    this.setState({stageMessage: "Loading Workflow"});

    applicationService
      .getApplicationWorkflows(this.appId)
      .then((response: IApplicationWorkflowsResponse): void => {
        if (response && response.workflows && response.workflows.length > 0) {
          this.setState({
            workflows: response.workflows
          }, () => {
              //store this application's workflows to the current application
              this.props.application.currentApplication.workflows = response.workflows;
              this.props.setCurrentApplicationAppAction(this.props.application.currentApplication);

              //set the current application workflow to the first one in the array
              this.props.setCurrentApplicationAction(this.state.application.id.toString(), response.workflows[0].id.toString(), "");

              //go and load current contracts based on current workflow
              this.loadOneApplicationWorkflow(response.workflows[0].id);
            }
          );
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  private loadOneApplicationWorkflow(workflowId: number): void {
    let applicationService: ApplicationService = new ApplicationService();

    applicationService
      .getApplicationWorkflow(workflowId.toString())
      .then((response: IWorkflow): void => {
        if (response) {
          this.setState({
            currentWorkflow: response}, () => {

              //store the current workflow properties
              this.props.setCurrentWorkflowAction(response);

              //go and load current contracts based on current workflow
              this.loadContracts();
            }
          );

          //set the app workflow
          this.props.setCurrentApplicationAction(this.appId, response.id.toString(), "");
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  private loadContracts(): void {
    let contractService: ContractService = new ContractService();

    this.setState({stageMessage: "Loading Contracts"});

    contractService
      .getContracts(this.appId, this.state.currentWorkflow.id.toString())
      .then((response: IContractResponse): void => {
        if (response) {
          //store this application's contracts to the current application
          this.props.application.currentApplication.contracts = response.contracts;
          this.props.setCurrentApplicationAppAction(this.props.application.currentApplication);

          this.setState({
            contracts: response.contracts,
            contractColumns: this.getContractColumns(),
            contractRows: this.getContractRows(response.contracts),
            stage: applicationStage.applicationLoaded,
            stageMessage: "Application loaded"
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  private initApplicationBreadcrumb(): void {
    var breadcrumbItem: IBreadcrumbItem = {} as IBreadcrumbItem;

    breadcrumbItem.key = "Applications";
    breadcrumbItem.text = "Applications";
    breadcrumbItem.onClick = this.loadApplicationPane;

    this.props.addCurrentBreadcrumbAction(breadcrumbItem);
  }

  private getCommandBarItems(): Array<IContextualMenuItem> {
    let items:Array<IContextualMenuItem> = [
      {
        key: 'new',
        //name: strings.Command_New,
        name: "New Contract",
        iconProps: {iconName: 'Add'},
        onClick: this.onNewContractClick
      }
    ];

    return items;
  }


  private getContractColumns(): Array<IColumn> {
    var columns: IColumn[] = new Array<IColumn>();

    columns.push({
      key: 'id',
      name: 'ID',
      fieldName: 'id',
      minWidth: 50,
      maxWidth: 75,
      isResizable: true,
      ariaLabel: 'Contract Id'
    });
    columns.push({
      key: 'state',
      name: 'State',
      fieldName: 'state',
      minWidth: 50,
      maxWidth: 75,
      isResizable: true,
      ariaLabel: 'State'
    });
    columns.push({
      key: 'modifiedBy',
      name: 'Modified By',
      fieldName: 'modifiedBy',
      minWidth: 50,
      maxWidth: 75,
      isResizable: true,
      ariaLabel: 'Modified By'
    });
    columns.push({
      key: 'timestamp',
      name: 'Modified',
      fieldName: 'timestamp',
      minWidth: 50,
      maxWidth: 75,
      isResizable: true,
      ariaLabel: 'Modified'
    });

    this.state.currentWorkflow.properties.forEach((item: IWorkflowProperty, index: number) => {
      if (item.type.name != "state") {
        columns.push({
          key: item.name,
          name: item.displayName,
          fieldName: item.name,
          minWidth: 50,
          maxWidth: 75,
          isResizable: true,
          ariaLabel: item.displayName
        });
      }
    });
    //
    //id, state, moditifiedBy, Modified, Requestor, Responder, Request Message, Response Message

    return columns;
  }

  private getContractRows(contracts:Array<IContract>): Array<any> {
    var aReturn: Array<any> = [] as Array<any>;

    if (typeof contracts == "undefined" || !contracts || contracts.length < 1) {
      return undefined;
    }

    contracts.forEach((item: IContract, index: number) => {
      var row: any = {};

      /*
      provisioningStatus
      0: {displayName: 'Contract is being created.', actionDisplayName: 'Action is being created'}
      1: {displayName: 'Working on contract. It may take a few minutes.', actionDisplayName: 'Working on Action'}
      2: {displayName: 'success', actionDisplayName: 'success'}
      3: {displayText: 'This is taking longer than expected. Contact your administration for help resolving the problem.'}
      */

      //if the item is invalid or did not provision correctly, skip
      if (!item || item.provisioningStatus < 0) {
        return;
      }

      //console.log("Setting up contract row");
      //console.log(item);

      var modifiedUser: IRoleAssignment = HelperFunctions.getUserFromRoleAssignments(this.state.roleAssignments, item.deployedByUserId);

      row.id = item.id;
      row.provisioningStatus = item.provisioningStatus;
      row.state = "";
      row.modifiedBy = modifiedUser ? modifiedUser.user.firstName + " " + modifiedUser.user.lastName : "Unknown: " + item.deployedByUserId;
      row.timestamp = (new Date(item.timestamp).toLocaleDateString());
      row.timestampFull = item.timestamp;

      //if provisioned, we can get more information
      if (item.provisioningStatus == 2) {
        var workflowState: IWorkflowState = HelperFunctions.getWorkflowStateById(this.state.currentWorkflow.states, item.contractActions[item.contractActions.length - 1].workflowStateId.toString());
        row.state = workflowState.name;

        //now need to go through all workflow properties and get values
        this.state.currentWorkflow.properties.forEach((propertyItem: IWorkflowProperty, propertyIndex: number) => {
          if (propertyItem.type.name != "state") {
            row[propertyItem.name] = this.getWorkflowPropertyValueById(this.state.currentWorkflow, item, this.state.roleAssignments, propertyItem.id);
          }
        });
      }

      aReturn.push(row);
    });

    return aReturn;
  }

  //TODO: refactor to helper as a part of ContractDetail as well
  private getWorkflowPropertyValueById(workflow: IWorkflow, contract: IContract, roleAssignments: Array<IRoleAssignment>, propertyId: number) : string {

    //get this particular workflow property
    var propertyObject: IWorkflowProperty = HelperFunctions.getWorkflowProperyById(workflow.properties, propertyId);
    //get the contract value for this workflow property
    var valueObject: IContractProperty = HelperFunctions.getValueFromProperties(contract.contractProperties, propertyId);

    if (propertyObject && valueObject) {
      //primitive types = ['money', 'state', 'string', 'int', 'bool', 'enum'];
      if (propertyObject.type.name == 'string') {
        return valueObject.value;
      }
      else if (propertyObject.type.name == 'money') {
        return HelperFunctions.formatCurrency(Number(valueObject.value));
      }
      else if (propertyObject.type.name == 'state') {
        //currently does not appear to be using the id, rather the array location for state
        //var stateObject: IWorkflowState = HelperFunctions.getWorkflowStateById(this.state.workflow.states, valueObject.value);
        var arrayIndex:number = Number(valueObject.value);
        if (workflow.states.length >= arrayIndex + 1) {
          var stateObject: IWorkflowState = workflow.states[Number(valueObject.value)];

          if (stateObject && stateObject.displayName) {
            return stateObject.displayName;
          }
        }

        return "unknown state: " + valueObject.value;
      }
      else if (propertyObject.type.name == 'int') {
        return valueObject.value;
      }
      else if (propertyObject.type.name == 'bool') {
        return valueObject.value;
      }
      else if (propertyObject.type.name == 'enum') {
        return valueObject.value;
      }

      //at this point, not a primitive type thus must be a user
      //check to see if user mapping to userChainMapping
      var userChainMapped: IRoleAssignment = HelperFunctions.getUserFromUserChainMappingIdentifer(roleAssignments, valueObject.value);

      if (userChainMapped) {
        return userChainMapped.user.firstName + " " + userChainMapped.user.lastName;
      }
      else {
        //must be something else, return value
        return "-";
      }

    }
    else {
      return "Unknown property: " + propertyId;
    }
  }

  //UI event handlers
  @autobind
  private onAddNewMember(): void {
    //reload this application if a new role was successfully added
    this.loadApplicationDetailRoleAssignments();

    this.loadApplicationDetail();
  }

  @autobind
  private loadApplicationPane(ev: React.MouseEvent<HTMLElement>, item: IBreadcrumbItem): void {
    //reset to no application
    this.props.setCurrentApplicationAction("", "", "");
    //reset UI
    this.props.changeUIState(uiState.applicationList);
  }

  @autobind
  private onContractClick(item: any): void {
    //only allow successful contracts to load
    if (item.provisioningStatus != 2) {
      return;
    }

    //set the app workflow
    this.props.setCurrentApplicationAction(this.appId, this.state.currentWorkflow.id.toString(), item.id);

    //change ui
    this.props.changeUIState(uiState.contractDetail);
  }

  private onContractRenderRow = (props: IDetailsRowProps): JSX.Element => {
    //console.log("Details props");
    //console.log(props);

    //TODO: get timestamp difference, if over a minute delay, something is likely wrong
    let timestamp:Date = new Date(props.item.timestampFull);
    let nowDate: Date = new Date(Date.now());
    let nowUTC:number = new Date(
      nowDate.getUTCFullYear(),
      nowDate.getUTCMonth(),
      nowDate.getUTCDate(),
      nowDate.getUTCHours(),
      nowDate.getUTCMinutes(),
      nowDate.getUTCSeconds()
    ).getTime();

    //get number of minutes that have past
    let minsPassed:number = Math.floor((nowUTC - timestamp.getTime()) / 60000);

    //set up possible custom columns
    var columns: IColumn[] = new Array<IColumn>();

    columns.push({
      key: 'space',
      name: 'space',
      fieldName: 'space',
      minWidth: (50),
      maxWidth: (75),
      isResizable: true,
      ariaLabel: 'ID'
    });
    columns.push({
      key: 'message',
      name: 'Message',
      fieldName: 'message',
      minWidth: (50*3),
      isResizable: true,
      ariaLabel: 'Status Message',
      onRender: (item: any) => {
        if (item.icon) {
          if (item.icon == "spinner") {
            return <Spinner className={styles.msSpinner} size={SpinnerSize.small} label={item.message}/>;
          }
          else {
            return <div>
              <Icon
                iconName={item.icon}
                className={styles.icon}
              />
              <Label className={styles.message}>{item.message}</Label>
            </div>;
          }
        }
      }
    });

    //appears to be provisioning so create on column
    //starting
    if (props.item.provisioningStatus == 0) {
      props.columns = columns;

      if (minsPassed < 1) {
        props.item.message = "Contract " + props.item.id + " is being created.";
        props.item.icon = "spinner";
      }
      else {
        props.item.message = "It looks like something went wrong with creating contract " + props.item.id + ". Contact your administrator for help resolving the problem.";
        props.item.icon = "Info";
        props.className = styles.warning;
      }
    }
    //in process
    else if (props.item.provisioningStatus == 1) {
      props.columns = columns;

      if (minsPassed < 5) {
        props.item.message = "Working on contract " + props.item.id + ". It may take a few minutes.";
        props.item.icon = "spinner";
      }
      else {
        props.item.message = "It looks like something went wrong while working on creating contract " + props.item.id + ". Contact your administrator for help resolving the problem.";
        props.item.icon = "Info";
        props.className = styles.warning;
      }
    }

    return <DetailsRow {...props} />;
  }



  @autobind
  private onNewContractClick(ev?:React.MouseEvent<HTMLElement>, item?:IContextualMenuItem): void {
    console.log(this.props.application);

    //go and get all contracts codeblocks for this application
    let applicationService: ApplicationService = new ApplicationService();
    let query: IContractCodeQuery = ApplicationService.initializeContractCodeQuery();

    applicationService.getContractCodesByApplication(this.props.application.applicationId, query)
      .then((response: IContractCodeResponse): void => {
        //spin up new contract
        let newContract: INewContract = {} as INewContract;
        newContract.workflowId = this.props.application.currentWorkflow.id;
        newContract.connectionId = 1;
        newContract.contractCodeId = response.contractCodes[0].contractCodeID;

        newContract.constructor = {} as IContractConstructor;
        newContract.constructor.workflowFunctionId = this.props.application.currentWorkflow.constructor.id;
        newContract.constructor.workflowActionParameters = [] as IParameter[];

        //set up the list of parameters for this specific contract
        this.props.application.currentWorkflow.constructor.parameters.forEach((parameterItem: IWorkflowProperty) => {
          let newParameter: IParameter = {} as IParameter;
          newParameter.name = parameterItem.name;
          newParameter.workflowFunctionParameterId = parameterItem.id;
          newParameter.value = "";

          newContract.constructor.workflowActionParameters.push(newParameter);
        });

        this.setState({
          newContractPanelVisible: true,
          newContract: newContract
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
  @autobind
  private onCloseNewContractClick(): void {
    this.setState({
      newContractPanelVisible: false
    });
  }
  @autobind
  private _newContractValueChanged(parameterKey: string, newValue: any):void {
    let newContract: INewContract = this.state.newContract;

    //we have to find the key of what was updated, and update state
    newContract.constructor.workflowActionParameters.forEach((item: IParameter) => {
      if (item.name == parameterKey) {
        item.value = newValue;
      }
    });

    //update state with new value of contract
    this.setState({
      newContract: newContract
    });

  }

  @autobind
  private createContract(): void {
    //ensure that we have the correct new contract value state
    //TODO: ensure we have all parameters provided
    console.log(this.state.newContract);

    let contractService: ContractService = new ContractService();

    //will post to:
    ///api/v1/contracts?workflowId=1&contractCodeId=1&connectionId=1
    //{"workflowFunctionId":1,"workflowActionParameters":[{"name":"message","value":"hello again"}]}
    contractService.addContract(this.state.newContract)
      .then((response: any): void => {
        console.log("Looks like contract added");
        console.log(response);

        //close panel and reload.
        this.setState({
          newContractPanelVisible: false
        });
        //reload this application if a new role was successfully added
        this.loadApplicationDetailRoleAssignments();

        this.loadApplicationDetail();

      })
      .catch(error => {
        console.error(error);
      });
  }

  @autobind
  private createContractCancel(): void {
    this.setState({
      newContractPanelVisible: false
    });
  }
}

function mapStateToProps(state: IApplicationState): IApplicationDetailProps{
	return {
    application: state.context.application,
    uiHeight: state.ui.height
	};
}

function mapDispatchToProps(dispatch: Dispatch<IApplicationDetailProps>): IApplicationDetailProps{
	return {
    changeUIState: (state:uiState) => {
      dispatch(changeUIState(state));
    },
    setCurrentApplicationAction: (applicationId:string, workflowId?:string, contractId?:string) => {
      dispatch(setCurrentApplicationAction(applicationId, workflowId, contractId));
    },
    setCurrentApplicationAppAction: (application:IApplication) => {
      dispatch(setCurrentApplicationAppAction(application));
    },
    setCurrentWorkflowAction: (workflow:IWorkflow) => {
      dispatch(setCurrentWorkflowAction(workflow));
    },
    setCurrentRoleAssignmentsAction: (roleAssignments:Array<IRoleAssignment>) => {
      dispatch(setCurrentRoleAssignmentsAction(roleAssignments));
    },
    addCurrentBreadcrumbAction: (breadcrumb: IBreadcrumbItem) => {
      dispatch(addCurrentBreadcrumbAction(breadcrumb));
    }
	};
}

export const ApplicationDetail = connect(mapStateToProps, mapDispatchToProps)(ApplicationDetail_);
