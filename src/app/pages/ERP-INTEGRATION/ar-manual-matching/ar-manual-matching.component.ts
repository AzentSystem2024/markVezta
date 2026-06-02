import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  NgModule,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxLoadPanelModule,
  DxPopupModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { DepartmentFormModule } from 'src/app/components/library/department-form/department-form.component';
import { DataService } from 'src/app/services/data.service';
import * as XLSX from 'xlsx';
import notify from 'devextreme/ui/notify';
@Component({
  selector: 'app-ar-manual-matching',
  templateUrl: './ar-manual-matching.component.html',
  styleUrls: ['./ar-manual-matching.component.scss']
})
export class ARManualMatchingComponent {
  RAGridData: any[] = [];
  RAProcessPopUpColumns: any[] = [];

  isHisSelected: boolean = false;
  distributeRA: boolean = false;

  onRADataRowSelected(e: any) {
    console.log('Selected Row Data:', e.data);
    // You can perform
  }
}


@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DepartmentFormModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxLoadPanelModule,
  ],
  providers: [],
  declarations: [ARManualMatchingComponent],
  exports: [ARManualMatchingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ARManualMatchingModule { }
