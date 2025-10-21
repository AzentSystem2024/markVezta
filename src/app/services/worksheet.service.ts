import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorksheetService {
  private worksheetDataSource = new BehaviorSubject<any>(null); // Create a BehaviorSubject
  currentWorksheetData = this.worksheetDataSource.asObservable();

  constructor() { }

  updateWorksheetData(data: any) {
    this.worksheetDataSource.next(data); // Update the BehaviorSubject
  }
}
