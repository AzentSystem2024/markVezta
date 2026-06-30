import { DataService } from 'src/app/services';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxFileUploaderModule,
  DxDataGridModule,
  DxButtonModule,
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import { DistrictComponent } from '../district/district.component';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-district-form',
  templateUrl: './district-form.component.html',
  styleUrls: ['./district-form.component.scss'],
})
export class DistrictFormComponent {
  @Input() districtList: any[] = [];
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Output() popupClosed = new EventEmitter<void>();
  districtFormData: any = {
    DISTRICT_NAME: '',
    COUNTRY_ID: null,
    STATE_ID: null,
  };

  countries: any[] = [];
  states: any[] = [];
  filteredStates: any[] = [];
  countryCodes: any;
  selectedCountry: any;
  constructor(private dataService: DataService) {}
  ngOnInit() {
    console.log(this.isEditing, 'ISEDITINGGGGGGGGG');
    this.getCountryCode();
  }
  getCountryCode() {
    this.dataService.getCountryWithFlags().subscribe((data) => {
      this.countryCodes = data;
      if (this.isEditing) {
        this.bindEditData();
      }
    });
  }

  bindEditData() {
    this.districtFormData = {
      ID: this.EditingResponseData.ID,
      DISTRICT_NAME: this.EditingResponseData.DISTRICT_NAME,
      COUNTRY_ID: this.EditingResponseData.COUNTRY_ID,
      STATE_ID: this.EditingResponseData.STATE_ID,
    };

    this.getStates(this.districtFormData.COUNTRY_ID);
  }
  countryDisplay(item: any) {
    if (!item) return '';
    return `${item.CODE} - ${item.COUNTRY_NAME}`;
  }
  onCountryChanged(e: any) {
    this.districtFormData.COUNTRY_ID = e.value;
    this.districtFormData.STATE_ID = null; // Clear previous state selection

    this.getStates(e.value);
  }
  getStates(countryId: number) {
    const payload = {
      NAME: 'STATE_NAME',
      COUNTRY_ID: countryId,
    };

    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.filteredStates = response;
      if (this.isEditing) {
        this.districtFormData.STATE_ID = this.EditingResponseData.STATE_ID;
      }
    });
  }

  saveDistrict() {
    if (!this.districtFormData.DISTRICT_NAME?.trim()) {
      notify('District Name is required', 'warning', 2000);
      return;
    }

    if (!this.districtFormData.COUNTRY_ID) {
      notify('Please select a country', 'warning', 2000);
      return;
    }

    if (!this.districtFormData.STATE_ID) {
      notify('Please select a state', 'warning', 2000);
      return;
    }
    const duplicate = this.districtList.some(
      (item: any) =>
        item.DISTRICT_NAME.trim().toLowerCase() ===
          this.districtFormData.DISTRICT_NAME.trim().toLowerCase() &&
        item.STATE_ID === this.districtFormData.STATE_ID &&
        item.COUNTRY_ID === this.districtFormData.COUNTRY_ID,
    );

    if (duplicate) {
      notify('District already exists.', 'warning', 2000);
      return;
    }
    const payload = {
      DISTRICT_NAME: this.districtFormData.DISTRICT_NAME.trim(),
      COUNTRY_ID: this.districtFormData.COUNTRY_ID,
      STATE_ID: this.districtFormData.STATE_ID,
    };

    if (this.isEditing) {
      this.updateDistrict(payload);
    } else {
      // this.insertDistrict(payload);
    }
  }

  insertDistrict(payload: any) {
    this.dataService.insertDistrict(payload).subscribe({
      next: (response: any) => {
        notify('District saved successfully.', 'success', 2000);

        this.popupClosed.emit();
      },
      error: (error) => {
        console.error(error);
        notify('Failed to save district.', 'error', 2000);
      },
    });
  }

  updateDistrict(payload: any) {
    const updatePayload = {
      ID: this.districtFormData.ID,
      DISTRICT_NAME: payload.DISTRICT_NAME,
      COUNTRY_ID: payload.COUNTRY_ID,
      STATE_ID: payload.STATE_ID,
    };
    this.dataService.updateDistrict(updatePayload).subscribe({
      next: (response: any) => {
        notify('District updated successfully.', 'success', 2000);

        this.popupClosed.emit();
      },
      error: (error: any) => {
        console.error(error);
        notify('Failed to update district.', 'error', 2000);
      },
    });
  }

  cancel() {
    this.popupClosed.emit();
  }
}
@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [DistrictFormComponent],
  exports: [DistrictFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DistrictFormModule {}
