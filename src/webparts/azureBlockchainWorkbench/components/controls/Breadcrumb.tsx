/*
The primary breadcrumb at the top of the application
displays where we are in the application along with the current user
*/
import * as React from 'react';
import { connect } from 'react-redux';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import { Facepile, IFacepilePersona, OverflowButtonType } from 'office-ui-fabric-react/lib/Facepile';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';

import { IApplicationState, IUserContext } from '../../state/State';

export default interface IBreadcrumbProps {
  breadcrumbs?: IBreadcrumbItem[];
  user?: IUserContext;
}

export interface IBreadcrumbState {
  userCalloutVisible?: boolean;
  facepilePersonas?: IFacepilePersona[];
}

class Breadcrumb_ extends React.Component<IBreadcrumbProps, IBreadcrumbState> {
  private _menuButtonElement: HTMLElement | null;

  constructor(props:IBreadcrumbProps) {
    super(props);

    this.state = {
      userCalloutVisible: false,
      facepilePersonas: this.loadCurrentUserFromState()
    };
  }

  public render(): React.ReactElement<IBreadcrumbProps> {
    return (
      <div className={styles.azureBlockchainWorkbenchHeader}>
        <div className="ms-Grid" dir="ltr">
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm6 ms-md8 ms-lg10">
              {this.props.breadcrumbs && this.props.breadcrumbs.length > 0 ? (
                <Breadcrumb
                  items={this.props.breadcrumbs}
                  ariaLabel={'Azure Blockchain Workbench breadcrumb'}
                />
              ) : null}
            </div>
            <div className={styles.facepileHeader + " ms-Grid-col ms-sm6 ms-md4 ms-lg2"}>
              <div className={styles.facepile} ref={ (menuButton) => this._menuButtonElement = menuButton }>
                <Facepile
                  className = {styles.facepileRoot}
                  personaSize = {PersonaSize.size32}
                  maxDisplayablePersonas = {2}
                  overflowButtonType = {OverflowButtonType.none}
                  overflowPersonas = {[]}
                  personas = {this.state.facepilePersonas}
                  getPersonaProps = {(persona: IFacepilePersona) => {
                    return {
                      imageShouldFadeIn: true
                    };
                  }}
                  ariaDescription = 'Current user'
                />

              {this.state.userCalloutVisible ? (
                <Callout
                    className="abw-breadcrumb-persona-callout"
                    gapSpace={0}
                    target={this._menuButtonElement}
                    onDismiss={this.hideCurrentUser}
                    isBeakVisible={false}
                    directionalHint={DirectionalHint.bottomRightEdge}
                  >
                    <Persona
                      text={this.props.user.currentUser.firstName + " " + this.props.user.currentUser.lastName}
                      secondaryText={this.props.user.currentUser.emailAddress}
                      size={PersonaSize.size72}
                      hidePersonaDetails={false}
                    />
                </Callout>
              ) : null}
              </div>
            </div>
          </div>
        </div>

        <hr aria-hidden="true" role="presentation" className={styles.divider}/>
      </div>
    );
  }

  private loadCurrentUserFromState(): Array<IFacepilePersona> {
    var aFacepilePersonas: Array<IFacepilePersona> = new Array<IFacepilePersona>();

    if (this.props.user && this.props.user.currentUser && this.props.user.capabilities) {
      aFacepilePersonas.push( {
        personaName: this.props.user.currentUser.firstName + " " + this.props.user.currentUser.lastName,
        onClick: (ev: React.MouseEvent<HTMLButtonElement>) =>
          this.showCurrentUser(),
      });
    }

    return aFacepilePersonas;
  }

  @autobind
  private showCurrentUser(): void {
    this.setState({userCalloutVisible: true});
  }

  @autobind
  private hideCurrentUser(): void {
    this.setState({userCalloutVisible: false});
  }
}

//map redux state properties that we want to this particular React Component properties
function mapStateToProps(state: IApplicationState): IBreadcrumbProps{
  return {
    breadcrumbs: state.context.breadcrumb,
    user: state.context.user
	};
}

export const BlockchainBreadcrumb = connect(mapStateToProps, null)(Breadcrumb_);
