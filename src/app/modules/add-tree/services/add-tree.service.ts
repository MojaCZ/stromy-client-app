import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { share } from 'rxjs/operators';
// import { AddTreeModule } from '../add-tree.module';
import { TreeI, Tree, ClassificationSchema, ClassificationInterface} from '../../../lib';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable()

export class AddTreeService implements OnDestroy {

  /** class keeping all informations about tree user is editing */
  public T: TreeI = new Tree();

  /** matrix of classification elements user filled in */
  public kData: number[][] = [];

  /** structure of object holding texts in configuration file */
  public ConfKData: ClassificationInterface[];

  /** message returned from server */
  public message: any;

  /** stored image files apploaded by user */
  public imageFiles: File[] = [];

  /** maximum number of images */
  public maxImageN = 3;

  /** stored text files apploaded by user */
  public textFiles: File[] = [];

  constructor(private http: HttpClient) {
    this.ConfKData = ClassificationSchema;
    for (let k = 0; k < ClassificationSchema.length; k++) {
      const kRow = [];
      for (let subK = 0; subK < ClassificationSchema[k].I; subK++) {
        kRow.push(0);
      }
      this.kData.push(kRow);
    }
  }

  /** send form to backend and return observable of response */
  send(): Observable<any> {
    this.prepareData();
    const body = this.allTogether();
    console.log('SENDING BODY:', body);
    const request = this.http
      .post(
        `${environment.server}/tree/addTreeUser`,
        body,
        {
          headers: new HttpHeaders().set('Content-Type', 'application/json'),
        });
    request.pipe(
      map(val => this.message = val)
    );
    return request;
  }

  /** form body before sending request to backend */
  allTogether(): string {
    const jsonBody = `
    {
      "strom":${JSON.stringify(this.T.S)},
      "lokal":${JSON.stringify(this.T.L)},
      "pisemneD":${JSON.stringify(this.T.PD)},
      "obrazoveD":${JSON.stringify(this.T.OD)},
      "kateg":${JSON.stringify(this.T.K)},
      "comment":${JSON.stringify(this.T.C)},
      "ohro":${JSON.stringify(this.T.O)}
    }`;
    return jsonBody;
  }

  /** prepare data before forming body
   * classification matrix on strings and some hardcoded fields for now 
   */
  prepareData = () => {
    for (let i = 0; i < this.kData.length; i++) {
      let row = `${this.kData[i][0]}`;

      for (let j = 1; j < this.kData[i].length; j++) {
        row += `,${this.kData[i][j]}`;
      }
      this.T.K[`KATEG${i + 1}`] = row;
    }
    if (this.T.S.DATIN instanceof Date) {
      this.T.S.DATIN = `${this.T.S.DATIN.getDate()}.${this.T.S.DATIN.getMonth()}.${this.T.S.DATIN.getFullYear()}`;
    }

    // TODO this should be filled by form
    this.T.S.VLAST = 'APPVS';
    this.T.OD.URL[0] = 'someURL';
    this.T.PD.URL[0] = 'someURL';
  }

  ngOnDestroy() { }
}
