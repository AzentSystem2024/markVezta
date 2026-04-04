import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DataService } from 'src/app/services';
import { NgModule, enableProdMode, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxValidationGroupComponent,
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
import notify from 'devextreme/ui/notify';
@Component({
  selector: 'app-reason-edit',
  templateUrl: './reason-edit.component.html',
  styleUrls: ['./reason-edit.component.scss'],
})
export class ReasonEditComponent {
  @Input() selectedData: any = {};
  @Output() formClosed = new EventEmitter<void>();
  @ViewChild('validationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;
  stores: any;
  customer: any;
  now: Date = new Date();
  selectedRows: any[] = [];

  isInactive: boolean = false;
  VATRuleDropdownData: any[] = [];
  ReasonTypeDropdownData: any[] = [];
  DiscountTypeDropdownData: any[] = [];
  Inv_man_Adj: boolean = false;
  formReasonsData = {
    ID: '',
    CODE: '',
    DESCRIPTION: '',
    ARABIC_DESCRIPTION: '',
    START_DATE: this.now,
    END_DATE: this.now,
    REASON_TYPE: '',
    DISCOUNT_TYPE: 0,
    AC_HEAD_ID: 0,
    DISCOUNT_PERCENT: '',
    reason_stores: {
      ID: 0,
      STORE_ID: '',
    },
  };
  reasons: any = [];
  selected_storeDate: any = [];
  ac_ledger_Data: any;
  selected_Company_id: any;
  constructor(private service: DataService) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedData'] && changes['selectedData'].currentValue) {
      const data = changes['selectedData'].currentValue;
      this.formReasonsData = data;

      this.selected_storeDate = this.formReasonsData.reason_stores;
    }
    this.showStores();
    this.ledger_Data_Drp();
  }
  // newReasons=this.formReasonsData;

  // getNewReasonsData = () => ({ ...this.newReasons });

  //   showStores(){
  //     this.service.getStoresData().subscribe(
  //      (response)=>{
  //            this.stores=response;
  //      }
  //     )
  //  }
  showReasons() {
    this.service.getReasonsData().subscribe((response) => {
      this.reasons = response;
    });
  }

  UpdateData() {
    const result = this.validationGroup.instance.validate();

    if (!result.isValid) {
      notify('Please fill all required fields correctly', 'error', 3000);
      return; // ❌ STOP SAVE
    }
    this.showReasons();

    // Exclude the current record (by ID) from duplicate check
    const isCodeDuplicate = this.reasons.some(
      (item: any) =>
        item.ID !== this.formReasonsData.ID &&
        item.CODE?.toLowerCase().trim() ===
          this.formReasonsData.CODE?.toLowerCase().trim(),
    );

    const isDescriptionDuplicate = this.reasons.some(
      (item: any) =>
        item.ID !== this.formReasonsData.ID &&
        item.DESCRIPTION?.toLowerCase().trim() ===
          this.formReasonsData.DESCRIPTION?.toLowerCase().trim(),
    );

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and Department already exist',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    } else if (isCodeDuplicate) {
      notify(
        {
          message: 'This Code already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    } else if (isDescriptionDuplicate) {
      notify(
        {
          message: 'This Description already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    this.service.Update_reason(this.formReasonsData).subscribe((res: any) => {
      this.formClosed.emit();
      notify(
        {
          message: 'Data Update sucessfully',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'Success',
      );
      return;
    });
  }
  closePopup() {
    this.formClosed.emit();
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
  // onSelectionChanged(e: any) {
  //   this.formReasonsData.reason_stores.STORE_ID=e.selectedRowKeys;
  // }

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

      setTimeout(() => {
        this.selectedRows = this.selected_storeDate.map((x) =>
          Number(x.STORE_ID),
        );
      });
    });
  }

  onSelectionChanged(e: any) {
    const selected_row = e.selectedRowKeys;
    const selected_valued = e.selectedRowsData;

    const restored_Data = selected_valued.map((item) => ({
      ID: item.ID,
      STORE_ID: item.STORE_NO, // 👈 taking STORE_NO as STORE_ID
    }));

    this.formReasonsData.reason_stores = restored_Data;
  }
  onValueChangedSDate(event: any) {
    this.formReasonsData.START_DATE = event.value;
  }
  onValueChangedEDate(event: any) {
    this.formReasonsData.END_DATE = event.value;
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
    DxCheckBoxModule,
    DxDataGridModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxButtonModule,
  ],
  declarations: [ReasonEditComponent],
  exports: [ReasonEditComponent],
})
export class ReasonEditModule {}
