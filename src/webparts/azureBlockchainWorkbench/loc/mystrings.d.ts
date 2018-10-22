declare interface IAzureBlockchainWorkbenchWebPartStrings {
  //property pane
  Property_BasicGroupName: string;
  Property_HeightLabel:string;
  Property_AppsPerPageLabel:string;
  Property_WorkbenchGroupName: string;
  Property_WorkbenchApiUrl: string;
  Property_WorkbenchAADAppId: string;
}

declare module 'AzureBlockchainWorkbenchWebPartStrings' {
  const strings: IAzureBlockchainWorkbenchWebPartStrings;
  export = strings;
}
