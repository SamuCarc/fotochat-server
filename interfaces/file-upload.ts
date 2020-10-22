
export interface FileUpload {
    name:string;
    data:any;
    encoding:string;
    tempFilePath:string;
    truncated:string;
    mimetype:string;

    mv:Function;
}