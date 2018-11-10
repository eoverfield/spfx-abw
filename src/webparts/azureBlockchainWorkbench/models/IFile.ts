export interface IFileObject {
  file: Blob;
  fileBuffer: ArrayBuffer;
  fileName: string;
  fileType: string;
  fileSize: number;
}
