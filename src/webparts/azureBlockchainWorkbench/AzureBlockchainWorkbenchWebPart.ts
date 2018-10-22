/*
Major influences by, and thanks to, the following proejcts:
https://github.com/SharePoint/sp-dev-solutions/tree/master/solutions/ColumnFormatter
https://github.com/SharePoint/sp-dev-solutions/tree/master/solutions/SiteDesignsStudio
*/
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Provider, ProviderProps } from 'react-redux';
import { createStore, Store } from 'redux';
import { Environment, EnvironmentType, Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { PropertyFieldSpinButton } from '@pnp/spfx-property-controls/lib/PropertyFieldSpinButton';

import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';
import { AzureBlockchainWorkbench } from './components/AzureBlockchainWorkbench';

import { AadClient } from './services/AadClient';

import { setContext, setHeight, setAppsPerPage, setWorkbenchApiUrl, setWorkbenchAADAppId, changeUIState } from './state/Actions';
import { abwReducer } from './state/Reducers';
import { IApplicationState, uiState } from './state/State';

export interface IAzureBlockchainWorkbenchWebPartProps {
  workbenchApiUrl: string;
  workbenchAADAppId: string;
  height: number; //Controls the height of the webpart
  appsPerPage: number; //applications to show per page
}

export default class AzureBlockchainWorkbenchWebPart extends BaseClientSideWebPart<IAzureBlockchainWorkbenchWebPartProps> {
  private store: Store<IApplicationState>;

  public onInit(): Promise<void> {

    //Initialize a redux store that uses our custom Reducer & state
    this.store = createStore(abwReducer);

    //Set context properties on the store
    this.store.dispatch(
      setContext(
        Environment.type !== EnvironmentType.Local,
        this.context.pageContext.web.absoluteUrl,
        this.context.pageContext.user.displayName,
        this.context.pageContext.user.email,
        this.context.serviceScope,
        this.properties,
        this.context.propertyPane,
        this.context.statusRenderer
      )
    );

    //set up workbench aad client
    this.setWorkbenchAadClient();

    return super.onInit().then();
  }

  //attempt to set up workbench AAD http client and set to state if available
  private setWorkbenchAadClient(): void {
    //assume reset client
    //this.store.dispatch(setWorkbenchAadHttpClient(undefined));
    AadClient.reset();

    if (this.properties.workbenchAADAppId && this.properties.workbenchApiUrl) {
      //set up aad client we will use to authenticate to Workbench Api
      AadClient.init(this.context.serviceScope, this.properties.workbenchAADAppId, this.properties.workbenchApiUrl);

      //since we have an aad app id and api url, then we can attempt to load the user
      this.store.dispatch(changeUIState(uiState.loadingCurrentUser));
    }
  }

  public render(): void {
    //Wrapping our primary element in a react-redux Provider
    // this enables the injection of the store as needed
    // properties are not passed since they are contained in the store
    const element: React.ReactElement<ProviderProps > = React.createElement(
      Provider,
      {
        store: this.store,
        children: React.createElement(
          AzureBlockchainWorkbench, {}
        )
      }
    );

    ReactDom.render(element, this.domElement);

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  public onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    if(oldValue !== newValue) {
      switch(propertyPath) {
        case 'height':
          this.store.dispatch(setHeight(Math.max(480, newValue)));
          break;
        case 'appsPerPage':
          this.store.dispatch(setAppsPerPage(Math.max(10, newValue)));
          break;
        case 'workbenchApiUrl':
          this.store.dispatch(setWorkbenchApiUrl(newValue));
          this.setWorkbenchAadClient();
          break;
        case 'workbenchAADAppId':
          this.store.dispatch(setWorkbenchAADAppId(newValue));
          this.setWorkbenchAadClient();
          break;
      }
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          groups: [
            {
              groupName: strings.Property_WorkbenchGroupName,
              groupFields: [
                PropertyPaneTextField('workbenchApiUrl', {
                  label: strings.Property_WorkbenchApiUrl
                }),
                PropertyPaneTextField('workbenchAADAppId', {
                  label: strings.Property_WorkbenchAADAppId
                })
              ]
            },
            {
              groupName: strings.Property_BasicGroupName,
              groupFields: [
                PropertyFieldSpinButton('appsPerPage', {
                  label: strings.Property_AppsPerPageLabel,
                  initialValue: this.properties.appsPerPage,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  suffix: '',
                  min: 10,
                  step: 1,
                  decimalPlaces: 0,
                  key: 'appsPerPage'
                }),
                PropertyFieldSpinButton('height', {
                  label: strings.Property_HeightLabel,
                  initialValue: this.properties.height,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  suffix: ' px',
                  min: 480,
                  step: 10,
                  decimalPlaces: 0,
                  key: 'height'
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
