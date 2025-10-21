import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxFormModule, DxPopupModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { FormTextboxModule } from 'src/app/components';
import { SupplierFormModule } from 'src/app/components/library/supplier-form/supplier-form.component';

@Component({
  selector: 'app-landed-cost-edit',
  templateUrl: './landed-cost-edit.component.html',
  styleUrls: ['./landed-cost-edit.component.scss']
})
export class LandedCostEditComponent {

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
    DxDataGridModule,
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    SupplierFormModule,
  ],
  providers: [],
  exports: [LandedCostEditComponent],
  declarations: [LandedCostEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandedCostEditModule {}