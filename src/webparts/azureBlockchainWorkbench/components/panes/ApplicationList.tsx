import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Persona, PersonaSize, IPersonaSharedProps } from 'office-ui-fabric-react/lib/Persona';
import { IFacepilePersona } from 'office-ui-fabric-react/lib/Facepile';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { Label } from 'office-ui-fabric-react/lib/Label';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { createRef } from 'office-ui-fabric-react/lib/Utilities';

import { Header } from '../controls/Header';
import { ApplicationTile } from '../controls/ApplicationTile';
import { ApplicationTileNew } from '../controls/ApplicationTileNew';
import { NewApplicationPanel } from '../controls/NewApplicationPanel';


import { IUserResponse, IUser } from '../../models/IUser';
import { IApplicationResponse, IApplication, IApplicationQuery } from '../../models/IApplication';

import { UserService } from '../../services/users/UserService';
import { ApplicationService } from '../../services/applications/ApplicationService';

import { IApplicationState, uiState, IContext, IHashTable } from '../../state/State';
import { changeUIState, setCurrentApplicationAction, setSelectedApplicationsAction } from '../../state/Actions';
import { HelperFunctions } from '../../helpers/HelperFunctions';

export enum applicationsStage {
  loading,
  applicationsLoaded
}

export interface IApplicationListProps {
  context?: IContext;
  uiHeight?: number;
  selectedApplications?: IHashTable<number>;
  changeUIState?: (state:uiState) => void;
  setCurrentApplicationAction?: (applicationId:string, workflowId?:string, contractId?:string) => void;
  setSelectedApplicationsAction?: (selectedApplications: IHashTable<number>) => void;
}

export interface IApplicationListState {
  stage: applicationsStage;
  stageMessage: string;
  newApplicationPanelVisible: boolean;
  calloutMessage: string;
  calloutMessageVisible: boolean;
  applicationQuery: IApplicationQuery;
  peoplePanelVisible: boolean;
  facepilePersonas?: any[];
  personas?: any[];
  applications?: any[];
}

class ApplicationList_ extends React.Component<IApplicationListProps, IApplicationListState> {
  private _menuButtonElement = createRef<HTMLElement>();

  constructor(props:IApplicationListProps) {
    super(props);

    this.state = {
      stage: applicationsStage.loading,
      stageMessage: "Loading",
      newApplicationPanelVisible:false,
      calloutMessage: "",
      calloutMessageVisible: false,
      applicationQuery: ApplicationService.initializeApplicationQuery(),
      peoplePanelVisible: false,
      facepilePersonas: new Array<IFacepilePersona>(),
      personas: new Array<IPersonaSharedProps>(),
      applications: new Array<IApplication>()
    };

    this.loadApplicationPeople();

    this.loadApplications();
  }

  public render(): React.ReactElement<IApplicationListProps> {
    var commandBarItemsLeft: Array<IContextualMenuItem> = this.getCommandBarItems();

    return (
      <div className={styles.applicationList} style={{height: this.props.uiHeight + 'px'}}>
        {this.state.stage == applicationsStage.loading && (
          <Spinner size={SpinnerSize.large} label={this.state.stageMessage}/>
        )}

        {this.state.stage != applicationsStage.loading && (
          <div>
            <hr aria-hidden="true" role="presentation" className={styles.divider}/>

            <Header
              headerTitle = "Applications"
              facepilePersonas = {this.state.facepilePersonas}
              personas = {this.state.personas}
            />

            <div>
              <CommandBar
                items={commandBarItemsLeft}
                farItems={this.getCommandBarFarItems()}
              />
            </div>

            {this.state.calloutMessageVisible && this.state.calloutMessage && this.state.calloutMessage.length > 0 && (
              <Callout
                target={this._menuButtonElement.current}
              >
                <Label>{this.state.calloutMessage}</Label>
              </Callout>
            )}

            {this.state.newApplicationPanelVisible && (
              <NewApplicationPanel
                onDismiss={this.closeNewPanel}
                onSuccess={this.successNewPanel}
                type={PanelType.medium}
                headerText="New Application"
              />
            )}

            <div className={styles.tileWrapper} ref={this._menuButtonElement}>
            {(this.state.applications && this.state.applications.length > 0) ? (

                this.state.applications.map((item, index) => (
                  <ApplicationTile
                    displayIndex={index}
                    application={item}
                    onClick={this.changeApplication}
                    onSelect={this.selectApplication}
                    />
                ))
            ) : (
              (this.state.applicationQuery.enabled && this.props.context.user.capabilities.canUploadApplication && (
                <ApplicationTileNew
                  onClick={this.newApplication}
                  />
              ))
            )}
            </div>
          </div>
        )}
      </div>
    );

    //
  }

  private loadApplicationPeople(): void {
    let userService: UserService = new UserService();

    this.setState({stage: applicationsStage.loading, stageMessage: "Loading Application Roles"});

    userService
      .getWorkbenchUsers()
      .then((response: IUserResponse): void => {
        if (response && response.users && response.users.length > 0) {
          var aFacepilePersonas: Array<IFacepilePersona> = new Array<IFacepilePersona>();
          var aPersonas: Array<IPersonaSharedProps> = new Array<IPersonaSharedProps>();

          response.users.map((item: IUser) => {
            aFacepilePersonas.push( {
              personaName: item.firstName + " " + item.lastName,
              //imageUrl: ''
            });

            aPersonas.push( {
              imageUrl: '',
              imageInitials: '',
              text: item.firstName + " " + item.lastName,
              secondaryText: item.emailAddress
            });
          });

          this.setState({
            facepilePersonas: aFacepilePersonas,
            personas: aPersonas
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  private loadApplications(): void {
    let applicationService: ApplicationService = new ApplicationService();

    this.setState({stage: applicationsStage.loading, stageMessage: "Loading Applications"});
    applicationService
      .getMyApplications(this.state.applicationQuery)
      .then((response: IApplicationResponse): void => {
        if (response && response.applications && response.applications.length > 0) {
          var aApplications: Array<IApplication> = new Array<IApplication>();

          response.applications.map((item: IApplication) => {
            aApplications.push(item);
          });

          this.setState({
            applications: aApplications,
          });

        }
        else {
          //empty response so clear
          this.setState({
            applications: [] as Array<IApplication>
          });
        }

        //reset what has been selected
        this.props.setSelectedApplicationsAction({} as IHashTable<number>);

        this.setState({stage: applicationsStage.applicationsLoaded, stageMessage: "Applications Loaded"});
      })
      .catch(error => {
        console.error(error);
      });
  }

  private getCommandBarItems(): Array<IContextualMenuItem> {
    let items:Array<IContextualMenuItem> = [
      {
        key: 'new',
        name: "New",
        //name: strings.Command_New,
        iconProps: {iconName: 'Add'},
        //only enable new action if user has permission, and showing enabled applications
        disabled: ((this.props.context.user.capabilities.canUploadApplication && this.state.applicationQuery.enabled) ? false : true),
        onClick: this.onNewClick
      },
      {
        key: (this.state.applicationQuery.enabled ? 'disable' : 'enable'),
        name: (this.state.applicationQuery.enabled ? 'Disable' : 'Enable'),
        iconProps: {iconName: (this.state.applicationQuery.enabled ? 'Blocked' : 'Completed') },
        disabled: (HelperFunctions.hashTableEmpty(this.props.selectedApplications) ? true : false),
        className: (HelperFunctions.hashTableEmpty(this.props.selectedApplications) ? styles.disabledCommandBar : ""),
        onClick: this.onDisableEnableClick
      }
    ];

    return items;
  }

  private getCommandBarFarItems(): Array<IContextualMenuItem> {
    let items:Array<IContextualMenuItem> = [];
    items.push(
        {
          key: 'filter',
          //name: strings.Command_SaveAs,
          name: (this.state.applicationQuery.enabled ? "Enabled applications" : "Disabled applications"),
          iconProps: {iconName: 'Filter'},
          subMenuProps: {
            items: [
              {
                key: 'enabled',
                name: "Enabled applications",
                iconProps: { iconName: (this.state.applicationQuery.enabled ? "CheckMark" : "") },
                onClick: this.onFilterEnabled
              },
              {
                key: 'disabled',
                name: "Disabled applications",
                iconProps: { iconName: (!this.state.applicationQuery.enabled ? "CheckMark" : "") },
                onClick: this.onFilterDisabled
              }
            ]
          }
        }
    );

    //consider looking here to determine which to check
    return items;
  }

  @autobind
  private changeApplication(appId: string): void {
    this.props.setCurrentApplicationAction(appId, "", "");
    this.props.changeUIState(uiState.applicationDetail);
  }

  @autobind
  private selectApplication(appId: number): void {
    var selectedApps: IHashTable<number> = this.props.selectedApplications;

    //ensure that we have a valid hashtable for selected applications
    if (!selectedApps) {
      selectedApps = {} as IHashTable<number>;
    }

    if (!selectedApps[appId]) {
      //the app is not considered selected, so make it selected
      selectedApps[appId] = appId;
    }
    else {
      //is selected, so must want to not select, so remove
      delete selectedApps[appId];
    }

    //save the updated selected application list to global state
    this.props.setSelectedApplicationsAction(selectedApps);

    //the command bar needs to be updated
    this.setState(this.state);
  }

  @autobind
  private newApplication(): void {
    this.setState({
      newApplicationPanelVisible: true
    });
  }

  @autobind
  private onNewClick(ev?:React.MouseEvent<HTMLElement>, item?:IContextualMenuItem): void {
    this.setState({
      newApplicationPanelVisible: true
    });
  }
  @autobind
  private closeNewPanel(): void {
    this.setState({
      newApplicationPanelVisible: false
    });
  }

  @autobind
  private successNewPanel(): void {
    this.setState({
      newApplicationPanelVisible: false
    });

    this.loadApplications();
  }

  @autobind
  private onDisableEnableClick(ev?:React.MouseEvent<HTMLElement>, item?:IContextualMenuItem): void {
    //determine if we are enabling or disabling
    //this.state.applicationQuery.enabled

    //set processing state
    this.setState({stage: applicationsStage.loading, stageMessage: (this.state.applicationQuery.enabled ? "Disabiling" : "Enabling") + " Applications"});

    //call async function that will enable/disable all selected apps based on ID Hashtable, then reload loadApplications()
    this.awaitChangeApplicationStatus();
  }

  @autobind
  private onFilterEnabled(ev?:React.MouseEvent<HTMLElement>, item?:IContextualMenuItem): void {
    if (!this.state.applicationQuery.enabled) {
      var applicationQuery: IApplicationQuery = this.state.applicationQuery;
      applicationQuery.enabled = true;
      applicationQuery.skip = 0;

      this.setState({
        applicationQuery: applicationQuery
      }, () => {
        this.loadApplications();
      });
    }
  }

  @autobind
  private onFilterDisabled(ev?:React.MouseEvent<HTMLElement>, item?:IContextualMenuItem): void {
    if (this.state.applicationQuery.enabled) {
      var applicationQuery: IApplicationQuery = this.state.applicationQuery;
      applicationQuery.enabled = false;
      applicationQuery.skip = 0;

      this.setState({
        applicationQuery: applicationQuery
      }, () => {
        this.loadApplications();
      });
    }
  }

  @autobind
  private hideCalloutMessage(): void {
    this.setState({calloutMessageVisible: false, calloutMessage: ""});
  }

  private async awaitChangeApplicationStatus(): Promise<void> {
    let applicationService: ApplicationService = new ApplicationService();
    let enable: boolean = !this.state.applicationQuery.enabled;

    for(var i in this.props.selectedApplications) {
      var appId = this.props.selectedApplications[i];

      await applicationService
        .setApplicationStatus(appId, enable)
        .then((response: IApplication): void => {
          if (response) {
            //TODO: the callout target element is rebuilt when applications are loaded. Need to adjust how applications are loaded to keep commandbar / target element entact
            //this.setState({calloutMessageVisible: false, calloutMessage: "Application(s) " + (enable ? "enabled" : "disabled")});
          }
          else {
          }
        })
        .catch(error => {
          console.error(error);
        });
    }

    //once complete, need to reload applications
    this.loadApplications();
  }
}

function mapStateToProps(state: IApplicationState): IApplicationListProps{
  return {
    context: state.context,
    uiHeight: state.ui.height,
    selectedApplications: state.context.application.selectedApplications
	};
}

function mapDispatchToProps(dispatch: Dispatch<IApplicationListProps>): IApplicationListProps{
	return {
    changeUIState: (state:uiState) => {
      dispatch(changeUIState(state));
    },
    setCurrentApplicationAction: (applicationId:string, workflowId?:string, contractId?:string) => {
      dispatch(setCurrentApplicationAction(applicationId, workflowId, contractId));
    },
    setSelectedApplicationsAction: (selectedApplications: IHashTable<number>) => {
      dispatch(setSelectedApplicationsAction(selectedApplications));
    }
	};
}

export const ApplicationList = connect(mapStateToProps, mapDispatchToProps)(ApplicationList_);
