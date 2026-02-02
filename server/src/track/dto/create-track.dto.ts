export class createTrackDto {
  readonly name: string;
  readonly author: string;
  readonly text: string;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
