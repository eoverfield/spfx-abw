import * as React from 'react';

import styles from '../AzureBlockchainWorkbench.module.scss';
//import * as strings from '../AzureBlockchainWorkbenchWebPartStrings';

import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';

import DropZone from 'react-dropzone';

import { IFileObject } from '../../models/IFile';

export interface IFileUploaderProps {
  accept: string;
  dropAreaMessage?: string;
	onFileLoaded: (accepted: Array<any>, rejected: Array<string>) => void;
}

export interface IFileUploaderState {
	isReceiverOpen: boolean;
	uploadError: string;
}

export class FileUploader extends React.Component<IFileUploaderProps, IFileUploaderState> {
  private _uploadPanel: any;
  private cleanedAccepted:Array<IFileObject> = null;
  private cleanedRejected:Array<string> = null;

	constructor(props:IFileUploaderProps) {
		super(props);

		this.state = {
			isReceiverOpen: false,
			uploadError:''
		};
	}

	public render(): React.ReactElement<IFileUploaderProps> {
		return (
		  <div className={styles.fileUploader}>
				<DropZone
         ref={(container) => this._uploadPanel = container!}
				 accept={this.props.accept}
				 multiple={false}
				 onDrop={this.onFileDrop}
				 className={styles.dropZone}
				 activeClassName={styles.dropZoneActive}
				 rejectClassName={styles.dropZoneRejected}>
          {this.props.dropAreaMessage && (
            <p className={styles.dropZoneMessage}>{this.props.dropAreaMessage}</p>
          )}
					<p className={styles.dropZoneMessage}>Drop file here</p>
          <p className={styles.dropZoneSub}>Or</p>

          <div className={styles.dropZoneButton}>
            <PrimaryButton text="Browse" onClick={() => null} iconProps={ {iconName: "DocumentSearch" }}/>
          </div>
				</DropZone>
		  </div>
		);
  }

  /*
	@autobind
	private onChooseFileClick(): void {
    //we do not need anything to happen here, DropZone will auto open file explorer if clicked
		if(this._uploadPanel !== undefined) {
			//this._uploadPanel.open();
		}
  }
  */

	@autobind
	private onFileDrop(accepted:Array<any>, rejected:Array<any>): void {
    this.cleanedAccepted = new Array<IFileObject>();
    this.cleanedRejected = new Array<string>(); //just the file names of those rejected

		try {
      //process any rejected file(s)
			if(rejected.length > 0) {
				for(var reject of rejected) {
          //remove reference to the rejected file.
					if(reject.preview !== undefined) {
						window.URL.revokeObjectURL(reject.preview);
          }

          this.cleanedRejected.push(reject.name);
        }

        this.props.onFileLoaded(null, this.cleanedRejected);
      }
      else {
				//Grab the accepted file
				if(accepted.length > 0) {
          var promises: Array<any> = new Array<any>();

          for(var acceptable of accepted) {
            promises.push(this.handleFile(acceptable));
          }

          Promise.all(promises).then(() => {
            this.props.onFileLoaded(this.cleanedAccepted, null);
          });
				}
			}
		}
		catch(ex) {
      console.log("Exception loading file(s): " + ex.message);
			this.props.onFileLoaded(null, null);
		}
  }

  @autobind
	private handleFile(file: any): Promise<any> {
    return new Promise((resolve:any, reject:any) => {
      //remove reference to the rejected file.
      if(file.preview !== undefined) {
        window.URL.revokeObjectURL(file.preview);
      }

      let reader:FileReader = new FileReader();

      reader.onload = () => {
        let fileContents:ArrayBuffer = reader.result as ArrayBuffer;

        if(fileContents && fileContents.byteLength > 0) {
          let thisFile:IFileObject = {} as IFileObject;
          thisFile.file = file;
          thisFile.fileBuffer = fileContents;
          thisFile.fileName = file.name;
          thisFile.fileType = file.type;
          thisFile.fileSize = file.size;

          this.cleanedAccepted.push(thisFile);

          resolve(thisFile);
        }
        else {
          console.log("empty file");
          resolve();
        }
      };

      //actually read the file in question
      reader.readAsArrayBuffer(file);
    });
  }
}
