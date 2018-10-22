import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { IPersonaSharedProps } from 'office-ui-fabric-react/lib/Persona';
import { IFacepilePersona } from 'office-ui-fabric-react/lib/Facepile';
import { IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, IColumn, IDetailsList } from 'office-ui-fabric-react/lib/DetailsList';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';

import { Header } from '../controls/Header';
import { ContractActivity } from '../controls/ContractActivity';
import { ContractActions } from '../controls/ContractActions';

import { IApplication, IApplicationRoleAssignmentResponse, IRoleAssignment, IApplicationWorkflowsResponse, IWorkflow } from '../../models/IApplication';

import { ApplicationService } from '../../services/applications/ApplicationService';
import { ContractService } from '../../services/contracts/ContractService';

import { IApplicationState, uiState, IApplicationContext } from '../../state/State';
import { changeUIState, setCurrentApplicationAction, addCurrentBreadcrumbAction } from '../../state/Actions';
import { Breadcrumb, IBreadcrumb } from '../../../../../node_modules/office-ui-fabric-react/lib/Breadcrumb';
import { IContractResponse, IContract, IContractProperty, IContractAction, ITransaction } from '../../models/IContract';
import { IWorkflowProperty, IWorkflowState } from '../../models/IApplication';
import { IUser } from '../../models/IUser';

import { HelperFunctions } from '../../helpers/HelperFunctions';
import { StatusArc } from '../../helpers/StatusArc';
import { ThemeSettingName } from '../../../../../node_modules/@uifabric/styling/lib';
import { TokenAcquisitionEventArgs } from '../../../../../node_modules/@microsoft/sp-http';

export enum contractStage {
  loading,
  contractLoaded
}

export interface IContractDetailProps {
  application?: IApplicationContext;
  uiHeight?: number;
  changeUIState?: (state:uiState) => void;
  setCurrentApplicationAction?: (applicationId:string, workflowId?:string, contractId?:string) => void;
  addCurrentBreadcrumbAction?: (breadcrumb:IBreadcrumbItem) => void;
}

export interface IContractDetailState {
  stage: contractStage;
  stageMessage: string;
  peoplePanelVisible: boolean;
  facepilePersonas?: any[];
  personas?: any[];
  application?: IApplication;
  roleAssignments: Array<IRoleAssignment>;
  workflow?: IWorkflow;
  contract?: IContract;
  contractActions?: Array<IContractAction>;
  activities?: Array<any>;
  activityRoleAssignments: Array<IRoleAssignment>;
}

class ContractDetail_ extends React.Component<IContractDetailProps, IContractDetailState> {

  private appId: string;
  private workflowId: string;
  private contractId: string;
  private breadcrumbs: IBreadcrumbItem[];

  constructor(props:IContractDetailProps) {
    super(props);

    this.state = {
      stage: contractStage.loading,
      stageMessage: 'Loading',
      peoplePanelVisible: false,
      facepilePersonas: new Array<IFacepilePersona>(),
      personas: new Array<IPersonaSharedProps>(),
      application: undefined,
      roleAssignments: undefined,
      workflow: undefined,
      contract: undefined,
      activities: undefined,
      activityRoleAssignments: undefined
    };

    this.appId = this.props.application.applicationId;
    this.workflowId = this.props.application.workflowId;
    this.contractId = this.props.application.contractId;

    this.initBreadcrumb();

    //go and preload the list of roles assigned to this app
    this.loadApplicationDetailRoleAssignments();

    //load this particular contract, workflow, and application
    this.loadContractDetail();
  }

  public render(): React.ReactElement<IContractDetailProps> {
    return (
      <div className={styles.contractDetail} style={{height: this.props.uiHeight + 'px'}}>
        {this.state.stage == contractStage.loading && (
          <Spinner size={SpinnerSize.large} label={this.state.stageMessage}/>
        )}
        {this.state.stage != contractStage.loading && (
          <div>
            <hr aria-hidden="true" role="presentation" className={styles.divider}/>

            {this.state.application && this.state.roleAssignments && this.state.workflow && this.state.contract && (
              <div>
                <Header
                  headerTitle = {this.getContractTitle()}
                  facepilePersonas = {this.state.facepilePersonas}
                  personas = {this.state.personas}
                />

                <div className={styles.contractDashboard}>
                  <div className="ms-Grid" dir="ltr">
                    <div className="ms-Grid-row">
                      <div className="ms-Grid-col ms-sm12 ms-md6">

                        <div className={styles.contractCard}>
                          <div className={styles.header}>
                            <h2>Status</h2>
                          </div>
                          <div className={styles.content}>
                            <div className={"ms-Grid "} dir="ltr">
                              <div className={"ms-Grid-row"} tabIndex={0}>
                                <div className={"ms-Grid-col ms-sm12 ms-md6"}>
                                  {this.state.contract.contractActions && this.state.contract.contractActions.length > 0 && (
                                    <div>
                                      <StatusArc
                                        height={175}
                                        width={175}
                                        radius={40}
                                        id="d3-arc"
                                        percentComplete={this.getContractCurrentActionPercentageComplete()}
                                        duration={2000}
                                        styleDonut={this.getContractCurrentActionStatus()}
                                      />
                                      <h2 className={styles.stateNumber}>{this.getContractCurrentActionStateNumber()}</h2>
                                    </div>
                                  )}
                                </div>
                                <div className={"ms-Grid-col ms-sm12 ms-md6"}>
                                  <div className={styles.statusList}>
                                    <div className={styles.content + " ms-Grid "} dir="ltr">

                                      {[...this.state.contract.contractActions].splice(0).reverse().map((item, index) => (
                                        <div className={styles.rowContainer + " ms-Grid-row" + (index == 0 ? " " + styles.selected : "")} tabIndex={0}>
                                          <div className={styles.rowColumnLeft + " ms-Grid-col ms-sm12 ms-md4"}>{(index+1) + ". " + this.getStateNameById(item.workflowStateId)}</div>
                                          <div className={styles.rowColumnLeft + " ms-Grid-col ms-sm12 ms-md4"}>{new Date(item.timestamp).toLocaleDateString()}</div>
                                          <div className={styles.rowColumnLeft + " ms-Grid-col ms-sm12 ms-md4"}>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={styles.contractCard}>
                          <div className={styles.header}>
                            <h2>Details</h2>
                          </div>

                          <div className={styles.content + " ms-Grid "} dir="ltr">
                            <div className={styles.rowContainer + " ms-Grid-row"} tabIndex={0}>
                                <div className={styles.rowColumnLeft + " ms-Grid-col ms-sm12 ms-md4 ms-lg4"}>Created By</div>
                                <div className={styles.rowColumnRight + " ms-Grid-col ms-sm12 ms-md8 ms-lg8"}>{this.getContractCreatedBy()}</div>
                            </div>
                            <div className={styles.rowContainer + " ms-Grid-row"} tabIndex={0}>
                                <div className={styles.rowColumnLeft + " ms-Grid-col ms-sm12 ms-md4 ms-lg4"}>Created Date</div>
                                <div className={styles.rowColumnRight + " ms-Grid-col ms-sm12 ms-md8 ms-lg8"}>{new Date(this.state.contract.timestamp).toLocaleDateString()}</div>
                            </div>
                            <div className={styles.rowContainer + " ms-Grid-row"} tabIndex={0}>
                                <div className={styles.rowColumnLeft + " ms-Grid-col ms-sm12 ms-md4 ms-lg4"}>Contract Id</div>
                                <div className={styles.rowColumnRight + " ms-Grid-col ms-sm12 ms-md8 ms-lg8"}>{this.state.contract.id}</div>
                            </div>
                            <div className={styles.rowContainer + " ms-Grid-row"} tabIndex={0}>
                                <div className={styles.rowColumnLeft + " ms-Grid-col ms-sm12 ms-md4 ms-lg4"}>Contract Address</div>
                                <div className={styles.rowColumnRight + " ms-Grid-col ms-sm12 ms-md8 ms-lg8"}>{this.state.contract.ledgerIdentifier}</div>
                            </div>

                            {this.state.workflow.properties.map((item, index) => (
                              <div className={styles.rowContainer + " ms-Grid-row"} tabIndex={0}>
                                  <div className={styles.rowColumnLeft + " ms-Grid-col ms-sm12 ms-md4 ms-lg4"}>{item.displayName}</div>
                                  <div className={styles.rowColumnRight + " ms-Grid-col ms-sm12 ms-md8 ms-lg8"}>{this.getWorkflowPropertyValueById(item.id)}</div>
                              </div>
                            ))}

                          </div>
                        </div>

                      </div>

                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className={styles.contractCard}>
                          <ContractActions
                          />
                        </div>

                        <div className={styles.contractCard}>
                          <div className={styles.header}>
                            <h2>Activity</h2>
                          </div>
                          <div className={styles.content}>
                            {this.state.activities && (this.state.activities.map((item, index) => (
                              <div className={styles.timecard}>
                                <p className={styles.timelineDate}>{item.date}</p>

                                {item.rows.map((rowItem, rowIndex) => (
                                  <ContractActivity
                                    activity = {rowItem}
                                  />
                                ))}
                              </div>
                            )))}

                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }


  private loadApplicationDetailRoleAssignments(): void {
    let applicationService: ApplicationService = new ApplicationService();

    this.setState({
      stage: contractStage.loading,
      stageMessage: "Loading Application Roles"
    });

    applicationService
      .getApplicationDetailRoleAssignments(this.appId)
      .then((response: IApplicationRoleAssignmentResponse): void => {
        if (response && response.roleAssignments && response.roleAssignments.length > 0) {
          var roleAssignments: Array<IRoleAssignment>;

          roleAssignments = response.roleAssignments;

          this.setState({
            roleAssignments: roleAssignments
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  private loadContractDetail(): void {
    let applicationService: ApplicationService = new ApplicationService();
    let contractService: ContractService = new ContractService();

    //reset workflows, contracts, and contract columns
    this.setState({
      stage: contractStage.loading,
      stageMessage: "Loading Application",
      application: undefined,
      workflow: undefined,
      contract: undefined
    });

    //in order, load up application, workflow, then contract
    applicationService
      .getApplicationDetail(this.appId)
      .then((response: IApplication): void => {
        if (response) {
          //set the application state
          this.setState({application: response}, () => {
              //load up all workflow for this application
              this.loadApplicationWorkflow();
            }
          );

          //update breadcrumb
          var breadcrumbItem: IBreadcrumbItem = {} as IBreadcrumbItem;

          breadcrumbItem.key = response.name;
          breadcrumbItem.text = response.displayName;
          breadcrumbItem.onClick = this.changeApplication;

          this.props.addCurrentBreadcrumbAction(breadcrumbItem);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  private loadApplicationWorkflow(): void {
    let applicationService: ApplicationService = new ApplicationService();

    this.setState({stageMessage: "Loading Workflow"});

    applicationService
      .getApplicationWorkflow(this.workflowId)
      .then((response: IWorkflow): void => {
        if (response) {
          this.setState({workflow: response}, () => {
            //go and load current contracts based on current workflow
            this.loadContract();
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  private loadContract(): void {
    let contractService: ContractService = new ContractService();

    this.setState({stageMessage: "Loading Contract"});

    contractService
      .getContractDetail(this.contractId)
      .then((response: IContract): void => {
        if (response) {
          this.setState({
            contract: response,
            activities: this.getActivitiyRows(response),
            activityRoleAssignments: this.getRoleAssignmentsByActivities(this.state.roleAssignments, response)
          });

          //update breadcrumb
          var breadcrumbItem: IBreadcrumbItem = {} as IBreadcrumbItem;

          breadcrumbItem.key = "details";
          breadcrumbItem.text = "Details";
          breadcrumbItem.isCurrentItem = true;

          this.props.addCurrentBreadcrumbAction(breadcrumbItem);

          this.setState({
            stage: contractStage.contractLoaded,
            stageMessage: "Contract Loaded"
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  private initBreadcrumb(): void {
    var breadcrumbItem: IBreadcrumbItem = {} as IBreadcrumbItem;

    breadcrumbItem.key = "Applications";
    breadcrumbItem.text = "Applications";
    breadcrumbItem.onClick = this.loadApplicationPane;

    this.props.addCurrentBreadcrumbAction(breadcrumbItem);
  }

  private getActivitiyRows(contract: IContract): Array<any> {
    var aReturn: Array<any> = [] as Array<any>;
    var currentDate: string = ""; //the current date
    var currentIndex: number = -1; //the current index for the date, starting with nothing
    var actionLength: number;

    if (typeof contract == "undefined" || !contract) {
      return undefined;
    }

    if (!contract.contractActions || contract.contractActions.length < 1){
      return [];
    }

    actionLength = contract.contractActions.length;
    [...contract.contractActions].reverse().forEach((item: IContractAction, index: number) => {
      var row: any = {};

      //if the item is invalid or did not provision correctly, skip
      if (!item) {
        return;
      }

      var workflowState: IWorkflowState = HelperFunctions.getWorkflowStateById(this.state.workflow.states, item.workflowStateId.toString());
      var activityUser: IRoleAssignment = HelperFunctions.getUserFromRoleAssignments(this.state.roleAssignments, item.userId);
      var transaction: ITransaction = HelperFunctions.getTransactionById(contract.transactions, item.transactionId.toString());

      var activityDate: string = new Date(item.timestamp).toLocaleDateString();
      var activityTime: string = new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      var displayName: string = (activityUser) ? activityUser.user.firstName + " " + activityUser.user.lastName : "Unknown user: " + item.userId;
      var action: string = (workflowState) ? ((index < (actionLength-1)) ? workflowState.displayName : "Create") : "unknown: " + item.workflowStateId;

      row.id = item.id;
      row.timestamp = item.timestamp;
      row.activityDate = activityDate;
      row.activityTime = activityTime;
      row.userId = item.userId;
      row.displayName = displayName;
      row.action = action;

      //additional fields required by activity Panel
      row.activityParameters = item.parameters;
      row.block = transaction.blockID;
      row.blockFromAddress = transaction.from;
      row.blockTxHash = transaction.transactionHash;

      //if this date has already been added, then we can add to current index
      if (currentDate == activityDate) {
        aReturn[currentIndex].rows.push(row);
      }
      else {
        //set the next current Index
        currentIndex++;

        aReturn[currentIndex] = {};
        aReturn[currentIndex].date = activityDate;
        aReturn[currentIndex].rows = [];
        aReturn[currentIndex].rows.push(row);

        //record the current date for the current index
        currentDate = activityDate;
      }
    });

    return aReturn;
  }

  private getRoleAssignmentsByActivities(roleAssignments: Array<IRoleAssignment>, contract: IContract): Array<IRoleAssignment> {
    var activityRoles: Array<IRoleAssignment> = [] as Array<IRoleAssignment>;

    if (!roleAssignments || roleAssignments.length < 1 || !contract || !contract.contractActions || contract.contractActions.length < 1) {
      return undefined;
    }

    contract.contractActions.forEach((item: IContractAction, index: number) => {
      var role: IRoleAssignment = HelperFunctions.getUserFromRoleAssignments(roleAssignments, item.userId);

      if (role) {
        activityRoles.push(role);
      }
    });

    //push roles to facepile as well?
    if (activityRoles.length > 0) {
      var aFacepilePersonas: Array<IFacepilePersona> = new Array<IFacepilePersona>();
      var aPersonas: Array<IPersonaSharedProps> = new Array<IPersonaSharedProps>();

      //map the role assignments to personas
      activityRoles.map((item: IRoleAssignment) => {
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

      this.setState({
        facepilePersonas: aFacepilePersonas,
        personas: aPersonas
      });
    }

    return activityRoles;
  }

  @autobind
  private loadApplicationPane(ev: React.MouseEvent<HTMLElement>, item: IBreadcrumbItem): void {
    //reset to no application
    this.props.setCurrentApplicationAction("", "", "");
    //reset UI
    this.props.changeUIState(uiState.applicationList);
  }

  @autobind
  private changeApplication(ev: React.MouseEvent<HTMLElement>, item: IBreadcrumbItem): void {
    //reset to no application
    this.props.setCurrentApplicationAction(this.appId, "", "");
    //reset UI
    this.props.changeUIState(uiState.applicationDetail);
  }

  //helper display functions
  private getContractTitle(): string {
    return this.state.application.displayName + " Contract " + this.state.contract.id;
  }
  private getContractCreatedBy(): string {
    var createdById: number = this.state.contract.deployedByUserId;

    //look for this id in role assignments
    var userObject: IRoleAssignment = HelperFunctions.getUserFromRoleAssignments(this.state.roleAssignments, createdById);

    if (userObject) {
      return userObject.user.firstName + " " + userObject.user.lastName;
    }
    else {
      return "Unknown user: " + createdById;
    }
  }
  private getWorkflowPropertyValueById(propertyId: number) : string {

    //get this particular workflow property
    var propertyObject: IWorkflowProperty = HelperFunctions.getWorkflowProperyById(this.state.workflow.properties, propertyId);
    //get the contract value for this workflow property
    var valueObject: IContractProperty = HelperFunctions.getValueFromProperties(this.state.contract.contractProperties, propertyId);

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
        if (this.state.workflow.states.length >= arrayIndex + 1) {
          var stateObject: IWorkflowState = this.state.workflow.states[Number(valueObject.value)];

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
      var userChainMapped: IRoleAssignment = HelperFunctions.getUserFromUserChainMappingIdentifer(this.state.roleAssignments, valueObject.value);

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

  private getStateNameById(stateId: number): string {
    var workflowState: IWorkflowState = HelperFunctions.getWorkflowStateById(this.state.workflow.states, stateId.toString());

    if (workflowState) {
      return workflowState.displayName;
    }

    return "Invalid id: " + stateId;
  }

  //based on the last action workflow state, get the percentage as fraction of 1
  private getContractCurrentActionPercentageComplete(): number {
    //we need the last action that occurred
    var lastAction: IContractAction = this.state.contract.contractActions[this.state.contract.contractActions.length-1];

    //need to get workflow state based on lastAction.workflowStateId
    var workflowState: IWorkflowState = HelperFunctions.getWorkflowStateById(this.state.workflow.states, lastAction.workflowStateId.toString());

    if (workflowState) {
      return (workflowState.percentComplete / 100);
    }

    return 0;
  }

  //needs to return either Success or Failure
  private getContractCurrentActionStatus(): string {
    //we need the last action that occurred
    var lastAction: IContractAction = this.state.contract.contractActions[this.state.contract.contractActions.length-1];

    var workflowState: IWorkflowState = HelperFunctions.getWorkflowStateById(this.state.workflow.states, lastAction.workflowStateId.toString());

    if (workflowState) {
      return workflowState.style;
    }

    return "Failure";
  }
  //return the start number 0+
  private getContractCurrentActionStateNumber(): string {
    //we need the last action that occurred
    var lastAction: IContractAction = this.state.contract.contractActions[this.state.contract.contractActions.length-1];

    return lastAction.workflowStateId.toString();
  }
}

function mapStateToProps(state: IApplicationState): IContractDetailProps{
	return {
    application: state.context.application,
    uiHeight: state.ui.height
	};
}

function mapDispatchToProps(dispatch: Dispatch<IContractDetailProps>): IContractDetailProps{
	return {
    changeUIState: (state:uiState) => {
      dispatch(changeUIState(state));
    },
    setCurrentApplicationAction: (applicationId:string, workflowId?:string, contractId?:string) => {
      dispatch(setCurrentApplicationAction(applicationId, workflowId, contractId));
    },
    addCurrentBreadcrumbAction: (breadcrumb: IBreadcrumbItem) => {
      dispatch(addCurrentBreadcrumbAction(breadcrumb));
    }
	};
}

export const ContractDetail = connect(mapStateToProps, mapDispatchToProps)(ContractDetail_);
