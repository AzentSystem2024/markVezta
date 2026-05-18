import {
  Component,
  NgModule,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxToolbarModule,
  DxPopupModule,
  DxValidationGroupModule,
  DxValidationGroupComponent,
  DxDataGridComponent,
  DxTextBoxModule,
  DxCheckBoxModule,
} from 'devextreme-angular';
import { ScreenService } from 'src/app/services';
import { ApplyPipeModule } from 'src/app/pipes/apply.pipe';

@Component({
  selector: 'form-popup',
  templateUrl: './form-popup.component.html',
  styleUrls: ['./form-popup.component.scss'],
})
export class FormPopupComponent {
  @Output() closeAndRefresh: EventEmitter<void> = new EventEmitter<void>();

  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('validationGroup', { static: true })
  validationGroup!: DxValidationGroupComponent;
  @Input() isEditMode: boolean = false;
  @Output() isApprovedChange = new EventEmitter<boolean>();

  @Input() showSupplierNetAmount: boolean = false;

  @Input() showNetAmount: boolean = false;

  @Input() netAmount: any;

  @Input() netSupplierAmount: any;

  @Input() netQuantity: any;
  @Input() isApproved: boolean = false;

  @Input() titleText = '';

  @Input() width: any = 480;

  @Input() height: string | number = 'auto';

  @Input() wrapperAttr: Record<string, string> = {};

  @Input() visible = false;

  @Input() isSaveDisabled: boolean = false;

  @Input() saveButtonText: any = 'Save';

  @Input() customValidate?: () => boolean;

  @Output() save = new EventEmitter();

  @Output() cancel = new EventEmitter();

  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() showApprove: boolean = true; // default: visible
  dataGrid!: DxDataGridComponent;
  constructor(protected screen: ScreenService) {}

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  onSaveClick() {
    if (!this.isValid()) {
      return;
    }
    this.save.emit();
    // this.close();
  }

  close() {
    this.validationGroup.instance.reset();
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.closeAndRefresh.emit();
    this.closePopup.emit();
    this.cancel.emit();
  }

  getWrapperAttrs = (inputWrapperAttr: any) => {
    return {
      ...inputWrapperAttr,
      class: `${inputWrapperAttr.class} form-popup`,
    };
  };
}

@NgModule({
  imports: [
    ApplyPipeModule,
    DxButtonModule,
    DxToolbarModule,
    DxPopupModule,
    DxValidationGroupModule,
    CommonModule,
    DxTextBoxModule,
    DxCheckBoxModule,
  ],
  declarations: [FormPopupComponent],
  exports: [FormPopupComponent],
})
export class FormPopupModule {}
