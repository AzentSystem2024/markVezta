import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DxButtonModule,
  DxFormModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormPhotoUploaderModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-vat-calss-finance-edit',
  templateUrl: './vat-calss-finance-edit.component.html',
  styleUrls: ['./vat-calss-finance-edit.component.scss'],
})
export class VatCalssFinanceEditComponent {
  @ViewChild('departmentValidationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;

  @Input() selectedData: any = {};
  @Output() formClosed = new EventEmitter<void>();

  formVatclassData = {
    ID: 0,
    CODE: '',
    VAT_NAME: '',
    VAT_PERC: '',
    VAT_INPUT_HEAD_ID: '',
    VAT_OUTPUT_HEAD_ID: '',
  };

  selected_Company_id: any;
  ledgerList: any[] = [];

  newVatclass = this.formVatclassData;

  constructor(private dataservice: DataService) {
    this.sessionDetails();
    this.getLedgerCodeDropdown()
  }
  getNewVatclassData = () => ({ ...this.newVatclass });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedData'] && changes['selectedData'].currentValue) {
      const data = changes['selectedData'].currentValue;
      this.formVatclassData = data;
    }
  }

   getLedgerCodeDropdown() {
    this.dataservice.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;
    });
  }

  keyPressCode(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow alphanumeric characters (A-Z, a-z, 0-9)
    if (
      (charCode >= 65 && charCode <= 90) || // A-Z
      (charCode >= 97 && charCode <= 122) || // a-z
      (charCode >= 48 && charCode <= 57)
    ) {
      // 0-9
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

  keyPressVatname(event: any) {
    console.log('key pressed');
    var charCode = event.which ? event.which : event.keyCode;
    var inputValue = event.target.value;

    // Disallow white space at the start
    if (inputValue.length === 0 && charCode === 32) {
      event.preventDefault();
      return false;
    }
    // Disallow Numbers 0-9 and Special Characters
    if (
      (charCode >= 48 && charCode <= 57) ||
      (charCode >= 33 && charCode <= 47) ||
      (charCode >= 58 && charCode <= 64) ||
      (charCode >= 91 && charCode <= 96) ||
      (charCode >= 123 && charCode <= 126)
    ) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  sessionDetails() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  UpdateData() {
    const { ID, CODE, VAT_NAME, VAT_PERC ,VAT_INPUT_HEAD_ID, VAT_OUTPUT_HEAD_ID} = this.formVatclassData;
    this.dataservice
      .updateVatclass_Finance(
        ID,
        CODE,
        VAT_NAME,
        VAT_PERC,
        VAT_INPUT_HEAD_ID,
        VAT_OUTPUT_HEAD_ID,
        this.selected_Company_id,
      )
      .subscribe((response) => {
        console.log(response);
        this.formClosed.emit();
      });
  }

  closePopup() {
    this.formClosed.emit();
  }
}
@NgModule({
  imports: [
    DxTextBoxModule,
    DxFormModule,
    DxValidatorModule,
    FormTextboxModule,
    FormPhotoUploaderModule,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxButtonModule,
  ],
  declarations: [VatCalssFinanceEditComponent],
  exports: [VatCalssFinanceEditComponent],
})
export class VatCalssFinanceEditModule {}
