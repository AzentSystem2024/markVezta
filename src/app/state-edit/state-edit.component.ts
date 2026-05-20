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
  @Input() stateDataList: any;
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
      this.formStateData = data;
    }
  }

  getCountryDropDown() {
    this.service.getCountryData().subscribe((data: any) => {
      this.CountryDropdownData = data;
    });
  }
  ngOnInit(): void {
    this.getCountryDropDown();
    this.showState();
  }

  onRowUpdating(validationGroup: any) {
    const result = validationGroup.instance.validate();

  if (!result.isValid) {
    return;
  }

    const payload = {
      ID: this.formStateData.ID,
      STATE_CODE: this.formStateData.STATE_CODE,
      STATE_NAME: this.formStateData.STATE_NAME,
      COUNTRY_ID: this.formStateData.COUNTRY_ID,
    };
    // SAFETY CHECK
    if (!this.stateDataList || this.stateDataList.length === 0) {
      notify(
        {
          message: 'State list not loaded. Please try again.',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
      );
      return;
    }

    const STATE_CODE = payload.STATE_CODE;
    const STATE_NAME = payload.STATE_NAME;
    const currentId = payload.ID;

    // DUPLICATE CHECK (IGNORE CURRENT ID)
    const isDuplicateCode = this.stateDataList.some(
      (x: any) =>
        x.ID !== currentId &&
        x.STATE_CODE?.toLowerCase().trim() === STATE_CODE?.toLowerCase().trim(),
    );

    const isDuplicateName = this.stateDataList.some(
      (x: any) =>
        x.ID !== currentId &&
        x.STATE_NAME?.toLowerCase().trim() === STATE_NAME?.toLowerCase().trim(),
    );

    if (isDuplicateCode || isDuplicateName) {
      notify(
        {
          message: `${
            isDuplicateCode ? 'State Code already exists. ' : ''
          }${isDuplicateName ? 'State Name already exists.' : ''}`,
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
      );
      return;
    }

    // API CALL
    this.service.UpdateState(payload).subscribe((data: any) => {
      if (data) {
        notify(
          {
            message: 'State updated Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );

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
