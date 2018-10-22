/*
Within the primary diplay pane, under the breadcrumb, the header that includes
the header title and the facepile of current users that have access to what is being shwon
*/
import * as React from 'react';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Facepile, IFacepilePersona, OverflowButtonType } from 'office-ui-fabric-react/lib/Facepile';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { List } from 'office-ui-fabric-react/lib/List';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export interface IHeaderProps {
  headerTitle?: string;
  facepilePersonas?: any[];
  personas?: any[];
  personaPanelButton?: string;
  personaPanelButtonAction?: any;
}

export interface IHeaderState {
  peoplePanelVisible: boolean;
}

export class Header extends React.Component<IHeaderProps, IHeaderState> {

  constructor(props:IHeaderProps) {
    super(props);

    this.state = {
      peoplePanelVisible: false
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
                <Button text={personaCount + "members"} className={styles.facepileButton} onClick={this.onMembersClick} iconProps={ {iconName: "Contact" }}/>

                <Panel
                  isOpen={this.state.peoplePanelVisible}
                  onDismiss={this.closePeoplePanel}
                  type={PanelType.medium}
                  headerText="Membership"
                >
                  {this.props.personaPanelButton && (
                    <Button
                      text={this.props.personaPanelButton}
                      className={styles.facepileButton}
                      iconProps={ {iconName: "Add" }}
                      onClick={this.props.personaPanelButtonAction}
                      />
                  )}

                  <List
                    className="ms-ListGridExample"
                    items={this.props.personas}
                    onRenderCell={this._onRenderCell}
                  />
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

  private _onRenderCell = (item: any, index: number | undefined): JSX.Element => {
    return (
      <Persona
          imageUrl = {item.imageUrl}
          imageInitials = {item.imageInitials}
          text = {item.text}
          secondaryText =  {item.secondaryText}
          size={PersonaSize.size72}
          className={styles.personaCell}
        />
    );
  }
}
