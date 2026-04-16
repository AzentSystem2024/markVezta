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

  formTenderData :any = {
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
  };
  constructor(private service: DataService) {}
  newTender = this.formTenderData;

  getNewTenderData = () => ({ ...this.newTender });

  getVATRuleDropDown() {
    const dropdowncurrency = {
      name:'CURRENCY'
    }
    this.service.getDropdownData(dropdowncurrency).subscribe((data: any) => {
      this.VATRuleDropdownData = data;
    });
  }
  getTenderTypeDropDown() {
    const dropdowntender = {
      name:'TENDERTYPE'
    }
    this.service.getDropdownData(dropdowntender).subscribe((data: any) => {
      this.TenderTypeDropdownData = data;
    });
  }
  ngOnInit(): void {
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
export class TendersFormModule {}
