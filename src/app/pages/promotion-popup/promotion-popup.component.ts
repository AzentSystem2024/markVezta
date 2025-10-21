import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxFileUploaderModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxProgressBarModule, DxRadioGroupModule, DxSelectBoxModule, DxTabsModule, DxTagBoxModule, DxTemplateModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { DxoFormItemModule, DxoItemModule, DxoLookupModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';


@Component({
  selector: 'app-promotion-popup',
  templateUrl: './promotion-popup.component.html',
  styleUrls: ['./promotion-popup.component.scss']
})
export class PromotionPopupComponent {
  @Input() isVisible: boolean = false;  // Controls visibility of the popup
  @Output() closePopup = new EventEmitter<void>();  // Emits when the popup is closed
  @Output() applyPromotion = new EventEmitter<void>();

  constructor(private dataservice:DataService){}

  ngOnInit(){}

  close() {
    this.closePopup.emit();  // Emit close event
  }

  apply() {
    this.applyPromotion.emit();  // Emit apply promotion event
    this.close();  // Close the popup
  }

}


@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    ItemsFormModule,
    DxTabsModule,
    DxTemplateModule,
    DxoFormItemModule,
    DxToolbarModule,
    DxRadioGroupModule,
    DxPopupModule,
    DxTagBoxModule,
    DxNumberBoxModule,
    DxValidationGroupModule,
    DxValidatorModule
  ],
  providers: [],
  exports: [PromotionPopupComponent],
  declarations: [PromotionPopupComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PromotionPopupModule {}