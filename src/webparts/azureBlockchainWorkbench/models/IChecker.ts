//Root Responses
export interface ICheckApplicationResponse {
  Result: boolean;
  Errors: Array<string>;
  Warnings: Array<string>;
  Application: string;
}
