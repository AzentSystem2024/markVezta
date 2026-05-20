import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';

import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-uom-edit',
  templateUrl: './uom-edit.component.html',
  styleUrls: ['./uom-edit.component.scss'],
})
export class UomEditComponent {
  @Input() selectedData: any;
  @Output() formClosed = new EventEmitter<void>();

  formUomData = {
    UOM: '',
    ID: '',
  };
  uomList: any;
  selected_Company_id: any;

  constructor(private service: DataService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedData'] && changes['selectedData'].currentValue) {
      const data = changes['selectedData'].currentValue;
      console.log(data, 'dataaaaaaaaaaaaaaaaaaaaaaaaaa');
      this.formUomData = data;
      console.log(this.formUomData);
    }
  }

  ngOnInit(): void {
    this.sesstion_Details();
    this.listUom();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  listUom() {
    const payload = {
      // COMPANY_ID : this.selected_Company_id
    };
    this.service.getUomList(payload).subscribe(
      (data) => {
        this.uomList = data;
        console.log(this.uomList, 'UOM');
      },
      (error) => {
        console.error('Error in fetching UOM', error);
      },
    );
  }

  cancel() {
    this.formClosed.emit();
  }

  onRowUpdating() {
    //  const updataDate = event.newData;
    //  const oldData = event.oldData;
    //  const combinedData = { ...oldData, ...updataDate };
    //  let id = combinedData.ID;
    //  let stateCode = combinedData.STATE_CODE;
    //  let statename = combinedData.STATE_NAME;
    //  let country_id = combinedData.COUNTRY_ID;
    const id = this.formUomData.ID;
    const uom = this.formUomData.UOM;
    // const company_id = this.selected_Company_id

    // DUPLICATION CHECK (ignore same ID)
    console.log(this.uomList, '==========uomList============')
    const isDuplicate = this.uomList?.some(
      (item: any) =>
        item.UOM?.trim().toLowerCase() === uom?.toLowerCase() && item.ID !== id,
    );

    if (isDuplicate) {
      notify(
        {
          message: 'UOM already exists',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
      );
      return; //  STOP UPDATE
    }

    console.log(id, uom, 'payload');
    this.service.updateUom(id, uom).subscribe((data: any) => {
      if (data) {
        notify(
          {
            message: 'State updated Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.listUom();
        this.formClosed.emit();
      } else {
        notify(
          {
            message: 'Your Data Not Saved',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      }
    });
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxButtonModule,
    DxDataGridModule,
    DxValidatorModule,
    BrowserModule,
    ReactiveFormsModule,
    DxValidationGroupModule,
    DxNumberBoxModule,
    DxPopupModule,
    DxFormModule,
  ],
  providers: [],
  declarations: [UomEditComponent],
  exports: [UomEditComponent],
})
export class UomEditModule { }
