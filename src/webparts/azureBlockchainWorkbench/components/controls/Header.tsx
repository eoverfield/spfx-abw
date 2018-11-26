/*
Within the primary diplay pane, under the breadcrumb, the header that includes
the header title and the facepile of current users that have access to what is being shwon
*/
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Facepile, IFacepilePersona, OverflowButtonType } from 'office-ui-fabric-react/lib/Facepile';
import { Persona, PersonaSize, IPersonaSharedProps } from 'office-ui-fabric-react/lib/Persona';
import { Button, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { List } from 'office-ui-fabric-react/lib/List';
import { Dropdown, IDropdownOption, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';
import { NormalPeoplePicker } from 'office-ui-fabric-react/lib/Pickers';
import { IPersonaProps } from "office-ui-fabric-react/lib/components/Persona/Persona.types";
import { ValidationState } from 'office-ui-fabric-react/lib/components/pickers/BasePicker.types';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { AadClient } from '../../services/AadClient';
import { MSGraph } from '../../services/MSGraph';

import { IApplicationState, IApplicationContext } from '../../state/State';
import { setCurrentRoleAssignmentsAction } from '../../state/Actions';
import { IApplicationRole, IRoleAssignment, IApplicationRoleAssignmentResponse } from '../../models/IApplication';
import { IGraphUserResponse, IGraphUser, IUserResponse } from '../../models/IUser';
import { UserService, } from '../../services/users/UserService';
import { ApplicationService } from '../../services/applications/ApplicationService';



export interface IHeaderProps {
  headerTitle?: string;
  facepilePersonas?: any[];
  personas?: any[];
  personaPanelButton?: string;
  personaPanelButtonAction?: any;
  application?: IApplicationContext;
  allowUpdateRoleAssignments?: boolean; //if true, then will provide options to set role assignments
  setCurrentRoleAssignmentsAction?: (roleAssignments:Array<IRoleAssignment>) => void;
}

export interface IHeaderState {
  peoplePanelVisible: boolean;
  addPersonPanelVisible: boolean;
  peoplePersonaMenu: IPersonaProps[];
  personaList: any[];
  applicationRoles: IDropdownOption[];
  currentGraphUserList: Array<IGraphUser>;
  selectedPerson: IPersonaProps;
  selectedRoleId: string;
  selectedRoleAssignmentId: number;
}

export class Header_ extends React.Component<IHeaderProps, IHeaderState> {
  constructor(props:IHeaderProps) {
    super(props);

    let personaList: IPersonaProps[] = [];

    this.state = {
      peoplePanelVisible: false,
      addPersonPanelVisible: false,
      peoplePersonaMenu: personaList,
      personaList: this.props.personas ? this.props.personas : [],
      applicationRoles: [],
      currentGraphUserList: [],
      selectedPerson: {},
      selectedRoleId: "",
      selectedRoleAssignmentId: -1
    };
  }

  public render(): React.ReactElement<IHeaderProps> {
    var personaCount: number = this.props.facepilePersonas.length;

    return (
      <div className={styles.header}>
        <div className="ms-Grid" dir="ltr">
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm6 ms-md7 ms-lg8"><h1 className="ms-font-xxl">{this.props.headerTitle}</h1></div>
            <div className={styles.facepileHeader + " ms-Grid-col ms-sm6 ms-md5 ms-lg4"}>
              <div className={styles.facepile}>
                <Facepile
                  className = {styles.facepileRoot}
                  personaSize = {PersonaSize.size32}
                  maxDisplayablePersonas = {5}
                  personas = {this.props.facepilePersonas.slice(0, 3)}
                  overflowPersonas = {this.props.facepilePersonas.slice(3)}
                  overflowButtonType = {OverflowButtonType.descriptive}
                  overflowButtonProps = {{
                    ariaLabel: 'More people'
                  }}
                  getPersonaProps = {(persona: IFacepilePersona) => {
                    return {
                      imageShouldFadeIn: true
                    };
                  }}
                  ariaDescription = 'To move through the items use left and right arrow keys.'
                />
                <Button text={personaCount + " members"} className={styles.facepileButton} onClick={this.onMembersClick} iconProps={ {iconName: "Contact" }}/>

                <Panel
                  className={styles.panelPeople}
                  isOpen={this.state.peoplePanelVisible}
                  onDismiss={this.closePeoplePanel}
                  type={PanelType.medium}
                  headerText={this.state.addPersonPanelVisible ? "Add a member" : "Membership"}
                >
                  {this.state.addPersonPanelVisible && (
                    <div>
                      <div className={styles.addMemberOptions}>
                        <NormalPeoplePicker
                          onResolveSuggestions={this._onPersonFilterChanged}
                          getTextFromItem={(peoplePersonaMenu: IPersonaProps) => peoplePersonaMenu.text}
                          className={styles.addMemberPicker}
                          key={'normal'}
                          onValidateInput={this._validateInputPeople}
                          removeButtonAriaLabel={'Remove'}
                          inputProps={{
                            'aria-label': 'People Picker'
                          }}
                          itemLimit={1}
                          onChange={this._onPersonItemsChange}
                          resolveDelay={300}
                        />

                        <Dropdown
                          placeHolder="Select Role"
                          className={styles.addMemberRole}
                          options={this.state.applicationRoles}
                          onChanged={this._roleSelected}
                        />
                      </div>

                      <div className={styles.addMemberActions}>
                        <PrimaryButton
                          className={styles.buttonPrimary}
                          text={"Add"}
                          onClick={this.addPerson}
                        />
                        <Button
                          text={"Cancel"}
                          onClick={this.addPersonCancel}
                        />
                      </div>
                    </div>
                  )}
                  {!this.state.addPersonPanelVisible && (
                    <div>
                      {this.props.personaPanelButton && (
                        <Button
                          text={this.props.personaPanelButton}
                          className={styles.facepileButton}
                          iconProps={ {iconName: "Add" }}
                          onClick={this.showAddPersonPanel}
                          />
                      )}

                      <List
                        className="ms-ListGridExample"
                        items={this.state.personaList}
                        onRenderCell={this._onRenderPersonaCell}
                      />
                    </div>
                  )}
                </Panel>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  @autobind
  private onMembersClick(): void {
		this.setState({
      peoplePanelVisible: true
    });
  }

  @autobind
  private closePeoplePanel(): void {
    this.setState({
      peoplePanelVisible: false
    });
  }

  @autobind
  private showAddPersonPanel(): void {
    //load up roles from contract
    let appRoles: IDropdownOption[] = [];

    this.props.application.currentApplication.applicationRoles.forEach((item: IApplicationRole, index: number) => {
      appRoles.push({key: item.id, text: item.name} as IDropdownOption);
    });

    this.setState({
      addPersonPanelVisible: true,
      applicationRoles: appRoles
    });
  }

  @autobind
  private addPerson(): void {
    //we must have a selected role
    if (!this.state.selectedRoleId || (this.state.selectedRoleId.length < 1)) {
      return;
    }

    //we must have a person
    if (!this.state.selectedPerson || (this.state.selectedPerson.id.length < 1)) {
      return;
    }

    //attempt to get the workbench user id based on the extenal id
    let userService: UserService = new UserService();
    let applicationService: ApplicationService = new ApplicationService();

    //always go and get the user again to restart primary process
    userService
      .getWorkbenchUserByExternalId(this.state.selectedPerson.id)
      .then((response: IUserResponse): void => {
        if (response && response.users && response.users.length > 0) {
          applicationService
            .addApplicationDetailRoleAssignments(this.props.application.applicationId, response.users[0].userID.toString(), this.state.selectedRoleId)
            .then((addRoleResponse: any): void => {
              //the user was successfully added to the role, so execute callback
              this.props.personaPanelButtonAction();
            })
            .catch();
        }
        else {
          //the external user is not found, thus it needs to be added
          userService.addExternalUser(this.getSelectedGraphUser())
            .then((addResponse: any): void => {
              applicationService
                .addApplicationDetailRoleAssignments(this.props.application.applicationId, addResponse, this.state.selectedRoleId)
                .then((addRoleResponse: any): void => {
                  //the user was successfully added to the role, so execute callback
                  this.props.personaPanelButtonAction();
                })
                .catch();
            })
            .catch();
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  @autobind
  private getSelectedGraphUser(): IGraphUser {
    var returnUser: IGraphUser = {} as IGraphUser;

    //look for the correct graph based user based on the selected user Id
    this.state.currentGraphUserList.forEach((item: IGraphUser) => {
      if (item.id == this.state.selectedPerson.id) {
        returnUser = item;
        return false;
      }
    });

    return returnUser;
  }

  @autobind
  private addPersonCancel(): void {
    this.setState({
      addPersonPanelVisible: false
    });
  }

  @autobind
  private _roleSelected(option: IDropdownOption, index: number): void {
    this.setState({selectedRoleId: option.key.toString()});
  }

  private _onPersonItemsChange = (items: IPersonaProps[]) => {
    if (items && items.length > 0) {
      this.setState({selectedPerson: items[0]});
    }
    else {
      this.setState({selectedPerson: {}});
    }
  }

  private _onPersonFilterChanged = (filterText: string, currentPersonas: IPersonaProps[], limitResults?: number): IPersonaProps[] | Promise<IPersonaProps[]> => {
    //let's ensure we have at least three characters of name
    if (filterText && filterText.length >= 3) {
      let graphUrl = `/users`;
      let selectProperties:string[] = ['id','displayName','mail','givenName','surname','userPrincipalName'];
      let filter:string = `startswith(givenName,'${filterText}') or startswith(surname,'${filterText}') or  startswith(mail,'${filterText}') or startswith(userPrincipalName,'${filterText}') or startswith(displayName,'${filterText}')`;

      return new Promise<IPersonaProps[]>((resolve, reject) => {
          MSGraph.Get(graphUrl, 'v1.0', selectProperties, filter).then((response: IGraphUserResponse): void => {
            let filteredPersonas: IPersonaProps[] = [] as IPersonaProps[];

            if (response && response.value) {
              //store the current graph user list to state
              this.setState({currentGraphUserList: response.value});

              //now loop through results and create list of people to show
              response.value.forEach((item: IGraphUser, index: number) => {
                let currentPersona: IPersonaProps = {} as IPersonaProps;
                currentPersona.id = item.id;
                currentPersona.text = item.displayName;
                currentPersona.secondaryText = item.mail;

                filteredPersonas.push(currentPersona);
              });

              resolve(filteredPersonas);
            }
          })
          .catch(error => {
            console.error(error);
            reject([]);
          });
        }
      );

    }
    else {
      return [];
    }
  }
  private _validateInputPeople = (input: string) => {
    if (input.indexOf('@') !== -1) {
      return ValidationState.valid;
    } else if (input.length > 1) {
      return ValidationState.warning;
    } else {
      return ValidationState.invalid;
    }
  }

  private _onRenderPersonaCell = (item: any, index: number | undefined): JSX.Element => {
    return (
      <Persona
          imageUrl = {item.imageUrl}
          imageInitials = {item.imageInitials}
          text = {item.text}
          secondaryText =  {item.secondaryText}
          onRenderTertiaryText = {(this.props.allowUpdateRoleAssignments) ? this._onRenderPersonaRole : null}
          size={PersonaSize.size72}
          className={styles.personaCell}
        />
    );
  }

  private _onRenderPersonaRole = (props: IPersonaProps): JSX.Element => {
    let appRoles: IDropdownOption[] = [];
    let selectedKey: number = -1;
    let selectedRoleAssignmentId: number = -1;

    this.props.application.currentApplication.applicationRoles.forEach((item: IApplicationRole, index: number) => {
      appRoles.push({key: item.id, text: item.name} as IDropdownOption);
    });

    //add divider and remove
    appRoles.push({ key: 'divider', text: '-', itemType: DropdownMenuItemType.Divider } as IDropdownOption);
    appRoles.push({key: 'remove', text: "Remove"} as IDropdownOption);

    //determine the selected role for this particular user found in props.secondaryText
    if (this.props.application.currentRoleAssignments && this.props.application.currentRoleAssignments.length > 0) {
      this.props.application.currentRoleAssignments.forEach((roleItem: IRoleAssignment, index: number) => {
        if (roleItem.user.emailAddress.toLowerCase() == props.secondaryText.toLowerCase()) {
          //console.log("selected role");
          //console.log(roleItem);
          selectedKey = roleItem.applicationRoleId;
          selectedRoleAssignmentId = roleItem.id;
        }
      });
    }

    return (
        <Dropdown
          placeHolder="Select Role"
          id={'roleAssignmentId-' + selectedRoleAssignmentId}
          className={styles.addMemberRole}
          defaultSelectedKey={selectedKey}
          options={appRoles}
          onChanged={this._onPersonaRoleChange}
          onFocus={this._onPersonaRoleFocus}
          onBlur={this._onPersonaRoleBlur}
        />
    );
  }

  private _onPersonaRoleChange = (option: IDropdownOption): void => {
    let roleAssignmentId: number = this.state.selectedRoleAssignmentId;
    let roleId: number = Number(option.key);
    let applicationId: string = this.props.application.applicationId;

    if (option.key == "remove") {
      //console.log("remove role assignment: "+ roleAssignmentId);

      let applicationService: ApplicationService = new ApplicationService();

      //https://pmdev1azw01-lbt5oa-api.azurewebsites.net/api/v1/applications/1/roleAssignments/10
      //DELETE
      applicationService
        .deleteApplicationDetailRoleAssignment(applicationId, roleAssignmentId.toString())
        .then((deleteRoleResponse: any): void => {
          //role assignment deletion was successfully completed
          this.loadApplicationDetailRoleAssignments()
            .then((): void => {
              //should reload header list panel with new list
              var aPersonas: Array<IPersonaSharedProps> = new Array<IPersonaSharedProps>();

              if (this.props.application.currentRoleAssignments && this.props.application.currentRoleAssignments.length > 0) {
                //map the role assignments to personas
                this.props.application.currentRoleAssignments.map((item: IRoleAssignment) => {
                  aPersonas.push( {
                    imageUrl: '',
                    imageInitials: '',
                    text: item.user.firstName + " " + item.user.lastName,
                    secondaryText: item.user.emailAddress
                  });
                });
              }

              this.setState({personaList: aPersonas});

              //TODO: also update ApplicationDetails or other listeners to roleassignments with new list
            })
            .catch();
        })
        .catch();

    }
    else {
      let userId: number;

      //get the user id based on the role id
      if (this.props.application.currentRoleAssignments && this.props.application.currentRoleAssignments.length > 0) {
        this.props.application.currentRoleAssignments.forEach((roleItem: IRoleAssignment, index: number) => {
          if (roleItem.id == roleAssignmentId) {
            userId = roleItem.user.userID;
          }
        });
      }

      /*
      console.log("look to update role assignment");
      console.log("App id: " + applicationId);
      console.log("role assignment id: " + roleAssignmentId);
      console.log("role id: " + roleId);
      console.log("user id: " + userId);
      */

      //TODO: set state to loading, update process should resolve to update state to redisplay people
      let applicationService: ApplicationService = new ApplicationService();

      //https://pmdev1azw01-lbt5oa-api.azurewebsites.net/api/v1/applications/1/roleAssignments/10
      //PUT: {"userId":6,"applicationRoleId":2}
      applicationService
        .updateApplicationDetailRoleAssignment(applicationId, roleAssignmentId.toString(), userId.toString(), roleId.toString())
        .then((updateRoleResponse: any): void => {
          //role assignment was successfully completed
          this.loadApplicationDetailRoleAssignments()
            .then((): void => {
              //set the state to reload list of roles
            })
            .catch();
        })
        .catch();
    }
  }

  //when a particular dropdown is focuses, grab the role assignment id from dropdown id
  private _onPersonaRoleFocus = (event:React.FocusEvent<HTMLDivElement>): void => {
    let targetId: number = Number(event.currentTarget.id.split("-")[1]);

    this.setState({selectedRoleAssignmentId: targetId});
  }
  //when the dropdown loses focus, reset the state of selected role assignment
  private _onPersonaRoleBlur = (event:React.FocusEvent<HTMLDivElement>): void => {
    this.setState({selectedRoleAssignmentId: -1});
  }

  //TODO: this should be abstracted to its own class, return a promise that resolves when complete - needs to be able to communiate to global state to record there
  private loadApplicationDetailRoleAssignments(): Promise<any> {
    var p = new Promise<string>(async (resolve, reject) => {

      let applicationService: ApplicationService = new ApplicationService();

      applicationService
        .getApplicationDetailRoleAssignments(this.props.application.applicationId)
        .then((response: IApplicationRoleAssignmentResponse): void => {
          if (response && response.roleAssignments && response.roleAssignments.length > 0) {
            var roleAssignments: Array<IRoleAssignment>;

            roleAssignments = response.roleAssignments;

            //store the current workflow properties
            this.props.setCurrentRoleAssignmentsAction(roleAssignments);

            resolve();
          }
          else {
            reject("notFound");
          }
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });

    return p;
  }
}

function mapStateToProps(state: IApplicationState, passedProps: IHeaderProps): IHeaderProps{
	return {
    application: state.context.application
	};
}

function mapDispatchToProps(dispatch: Dispatch<IHeaderProps>, passedProps: IHeaderProps): IHeaderProps{
	return {
    setCurrentRoleAssignmentsAction: (roleAssignments:Array<IRoleAssignment>) => {
      dispatch(setCurrentRoleAssignmentsAction(roleAssignments));
    }
	};
}

export const Header = connect(mapStateToProps, mapDispatchToProps)(Header_);

