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
import { DataService } from '../services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-state-edit',
  templateUrl: './state-edit.component.html',
  styleUrls: ['./state-edit.component.scss'],
})
export class StateEditComponent {
  @Input() selectState: any;
  @Output() formClosed = new EventEmitter<void>();

  CountryDropdownData: any;

  formStateData = {
    STATE_CODE: '',
    STATE_NAME: '',
    COUNTRY_ID: '',
    ID: '',
  };
  dataGrid: any;
  state: any;

  constructor(private service: DataService) {}

  showState() {
    this.service.getStateData().subscribe((response) => {
      this.state = response;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectState'] && changes['selectState'].currentValue) {
      const data = changes['selectState'].currentValue;
      console.log(data, 'dataaaaaaaaaaaaaaaaaaaaaaaaaa');
      this.formStateData = data;
      console.log(this.formStateData);
    }
  }

  getCountryDropDown() {
    this.service.getCountryData().subscribe((data: any) => {
      this.CountryDropdownData = data;
      console.log('dropdown', this.CountryDropdownData);
    });
  }
  ngOnInit(): void {
    this.getCountryDropDown();
    this.showState();
  }

  onRowUpdating() {
    //  const updataDate = event.newData;
    //  const oldData = event.oldData;
    //  const combinedData = { ...oldData, ...updataDate };
    //  let id = combinedData.ID;
    //  let stateCode = combinedData.STATE_CODE;
    //  let statename = combinedData.STATE_NAME;
    //  let country_id = combinedData.COUNTRY_ID;
    const payload = {
      ID: this.formStateData.ID,
      STATE_CODE: this.formStateData.STATE_CODE,
      STATE_NAME: this.formStateData.STATE_NAME,
      COUNTRY_ID: this.formStateData.COUNTRY_ID,
    };
    console.log(payload, 'payload');
    this.service.UpdateState(payload).subscribe((data: any) => {
      if (data) {
        notify(
          {
            message: 'State updated Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        //  this.dataGrid.instance.refresh();
        this.formClosed.emit();
        this.showState();
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

  cancel() {
    this.formClosed.emit();
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
  declarations: [StateEditComponent],
  exports: [StateEditComponent],
})
export class StateEditModule {}
