import {
  Component,
  NgModule,
  enableProdMode,
  OnInit,
  ViewChild,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import {
  DxCheckBoxModule,
  DxNumberBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-tenders-form',
  templateUrl: './tenders-form.component.html',
  styleUrls: ['./tenders-form.component.scss'],
})
export class TendersFormComponent implements OnInit, OnChanges {
  @Input() formData: any;
  @ViewChild(DxValidationGroupComponent)
  validationGroup: DxValidationGroupComponent;
  additionalInformationRequired: boolean = false;
  allowOpening: boolean = false;
  allowDeclaration: boolean = false;
  isInactive: boolean = false;
  VATRuleDropdownData: any[] = [];
  TenderTypeDropdownData: any[] = [];
  tenders: any;
  IsHQApp: boolean = true
  Ledger_list: any = []
  formTenderData: any = {
    ID: 0,
    CODE: '',
    IS_INACTIVE: this.isInactive,
    DESCRIPTION: '',
    ARABIC_DESCRIPTION: '',
    TENDER_TYPE: '',
    CURRENCY_ID: '',
    DISPLAY_ORDER: '',
    ALLOW_OPENING: false,
    ALLOW_DECLARATION: false,
    ADDITIONAL_INFO_REQUIRED: false,
    AC_HEAD_ID: null,
  };
  constructor(private service: DataService) {
    this.get_Session_details()
    this.get_Ledger_drop()
  }
  newTender = this.formTenderData;

  get_Session_details() {
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.IsHQApp = menuResponse.GeneralSettings.IS_HQ_APP
  }

  getNewTenderData = () => ({
    ...this.newTender,
    ADDITIONAL_INFO_REQUIRED: this.additionalInformationRequired,
    ALLOW_DECLARATION: this.allowDeclaration,
    ALLOW_OPENING: this.allowOpening,
    CURRENCY_ID: this.newTender.CURRENCY_ID === ''
      ? 0
      : this.newTender.CURRENCY_ID
  });


  get_Ledger_drop() {
    this.service.get_ac_ledger_drp().subscribe((res: any) => {
      console.log(res)
      this.Ledger_list = res

    })
  }

  getVATRuleDropDown() {
    const dropdowncurrency = {
      name: 'CURRENCY'
    }
    this.service.getDropdownData(dropdowncurrency).subscribe((data: any) => {
      this.VATRuleDropdownData = data;
    });
  }
  getTenderTypeDropDown() {
    const dropdowntender = {
      name: 'TENDERTYPE'
    }
    this.service.getDropdownData(dropdowntender).subscribe((data: any) => {
      this.TenderTypeDropdownData = data;
    });
  }
  ngOnInit(): void {
    this.showTenders();
    this.getTenderTypeDropDown();
    this.getVATRuleDropDown();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formData'] && this.formData) {
      this.newTender = this.formData;
      this.allowOpening = this.formData.ALLOW_OPENING;
      this.allowDeclaration = this.formData.ALLOW_DECLARATION;
      this.additionalInformationRequired = this.formData.ADDITIONAL_INFO_REQUIRED;

      console.log(this.formData, 'formData received in child');
    }
  }

  onValueChangedOpening(value: boolean) {
    this.formTenderData.ALLOW_OPENING = value;
  }
  onValueChangedDeclaration(value: boolean) {
    this.formTenderData.ALLOW_DECLARATION = value;
  }
  onValueChangedInformation(value: boolean) {
    this.formTenderData.ADDITIONAL_INFO_REQUIRED = value;
  }

  showTenders() {
    this.service.getTendersData().subscribe((response) => {
      this.tenders = response;
    });
  }

  validateTenderCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.tenders?.length) return true;

    const currentId = this.newTender?.ID || 0;

    return !this.tenders.some((item: any) => {
      const code = (item.CODE || '').trim().toLowerCase();

      return code === value && item.ID !== currentId;
    });
  };
  validateTenderDescription = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.tenders?.length) return true;

    const currentId = this.newTender?.ID || 0;

    return !this.tenders.some((item: any) => {
      const code = (item.DESCRIPTION || '').trim().toLowerCase();

      return code === value && item.ID !== currentId;
    });
  };
  //======================reset function

  ResetFuction() {
    console.log("=============close thus function==========================")

    // this.newTender.DISPLAY_ORDER = 0;
    this.allowOpening = false;
    this.allowDeclaration = false;
    this.formTenderData.ADDITIONAL_INFO_REQUIRED = false;
    this.additionalInformationRequired = false
  }
  //===================== Ledger validaiton--------============================
  validateLedger = (e: any) => {
    return e.value !== 0 && e.value !== null && e.value !== undefined;
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
    DxValidationGroupModule,
    DxValidatorModule,
    DxNumberBoxModule
  ],
  declarations: [TendersFormComponent],
  exports: [TendersFormComponent],
})
export class TendersFormModule { }
