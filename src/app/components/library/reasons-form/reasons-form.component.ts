import { Component, NgModule, enableProdMode, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import {
  DxCheckBoxModule,
  DxNumberBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxDataGridModule,
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DataService } from 'src/app/services';
import { DxSelectBoxTypes } from 'devextreme-angular/ui/select-box';
@Component({
  selector: 'app-reasons-form',
  templateUrl: './reasons-form.component.html',
  styleUrls: ['./reasons-form.component.scss'],
})
export class ReasonsFormComponent implements OnChanges {
  @Input() formData: any;
  stores: any;
  customer: boolean = false;
  Inv_man_Adj: boolean = false;
  now: Date = new Date();
  selectedRows: any[] = [];

  isInactive: boolean = false;
  VATRuleDropdownData: any[] = [];
  ReasonTypeDropdownData: any[] = [];
  DiscountTypeDropdownData: any[] = [];

  formReasonsData = {
    COMPANY_ID: '',
    CODE: '',
    DESCRIPTION: '',
    ARABIC_DESCRIPTION: '',
    START_DATE: this.now,
    END_DATE: this.now,
    REASON_TYPE: '',
    DISCOUNT_TYPE: 0,
    AC_HEAD_ID: 0,
    DISCOUNT_PERCENT: 0,
    REASON_STORES: [],
  };
  ac_ledger_Data: any;
  finID: any;
  userID: any;
  companyID: any;
  selected_Company_id: any;
  constructor(private service: DataService) { }
  newReasons = this.formReasonsData;

  getNewReasonsData = () => ({
    ...this.newReasons,
    COMPANY_ID: this.companyID,
    DISCOUNT_TYPE: this.newReasons.DISCOUNT_TYPE ?? 0,
    DISCOUNT_PERCENT: this.newReasons.DISCOUNT_PERCENT ?? 0,
    REASON_STORES:
      this.formData.REASON_STORES ||
      this.formData.reason_stores ||
      [],

  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formData'] && this.formData) {
      this.newReasons = this.formData;

      console.log(this.formData, 'formData received in child');

      //  Convert reason_stores → selectedRows (for grid selection)
      if (this.formData.reason_stores && Array.isArray(this.formData.reason_stores)) {
        this.selectedRows = this.formData.reason_stores.map(
          (x: any) => Number(x.STORE_ID)
        );
      } else {
        this.selectedRows = [];
      }
    }
  }


  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  showStores() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getStoresData(payload).subscribe((response) => {
      this.stores = response;
      console.log('Stores data:', this.stores);
    });
  }

  getVATRuleDropDown() {
    this.service.getCurrencyData().subscribe((data: any) => {
      this.VATRuleDropdownData = data;
    });
  }
  getReasonTypeDropDown() {
    const payload = {
      NAME: 'REASONTYPES',
    };
    this.service.getDropdownData(payload).subscribe((data: any) => {
      this.ReasonTypeDropdownData = data;
    });
  }
  getDiscountTypeDropDown() {
    const payload = {
      NAME: 'DISCOUNTTYPE',
    };
    this.service.getDropdownData(payload).subscribe((data: any) => {
      this.DiscountTypeDropdownData = data;
    });
  }
  ngOnInit(): void {
    this.sesstion_Details();
    this.showStores();
    this.getReasonTypeDropDown();
    this.getVATRuleDropDown();
    this.getDiscountTypeDropDown();
    this.ledger_Data_Drp();
    this.session_Data();
  }
  onValueChangedReason(event: any) {
    if (event.value === 1) {
      this.customer = true;
      this.Inv_man_Adj = false;
    } else if (event.value === 2 || event.value === 4) {
      this.Inv_man_Adj = true;
      this.customer = false;
    } else {
      this.customer = false;
      this.Inv_man_Adj = false;
    }
  }

  ledger_Data_Drp() {
    this.service.get_ac_ledger_drp().subscribe((res: any) => {
      this.ac_ledger_Data = res;
    });
  }

  onSelectionChanged(e: any) {
    const selected_valued = e.selectedRowsData;

    const restored_Data = selected_valued.map((item) => ({
      ID: item.ID,
      STORE_ID: item.STORE_NO ?? 0,
    }));

    this.newReasons.REASON_STORES = restored_Data; // ✅ FIX
  }

  onValueChangedSDate(event: any) {
    this.formReasonsData.START_DATE = event.value;
  }
  onValueChangedEDate(event: any) {
    this.formReasonsData.END_DATE = event.value;
  }
  session_Data() {
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
  }

  resetForm() {
    this.selectedRows = [];
  }
  validateDiscountType = (e: any) => {
    return e.value !== 0 && e.value !== null && e.value !== undefined;
  };
  validateAcHead = (e: any) => {
    return e.value !== 0 && e.value !== null && e.value !== undefined;
  };
  validateDiscountpercentrage = (e: any) => {
    const value = Number(e.value);

    return !isNaN(value) && value > 0;
  };
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
    DxDataGridModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxNumberBoxModule,
  ],
  declarations: [ReasonsFormComponent],
  exports: [ReasonsFormComponent],
})
export class ReasonsFormModule { }
