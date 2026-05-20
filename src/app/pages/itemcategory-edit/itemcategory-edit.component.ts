import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  OnChanges,
} from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
// import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
// import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DxButtonModule,
  DxSelectBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
// import { EventEmitter } from 'node:stream';

@Component({
  selector: 'app-itemcategory-edit',
  templateUrl: './itemcategory-edit.component.html',
  styleUrls: ['./itemcategory-edit.component.scss'],
})
export class ItemcategoryEditComponent implements OnInit, OnChanges {
  @Input() selectedData: any;

  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild('departmentValidationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;
  formCategoryData = {
    ID: '',
    CODE: '',
    CAT_NAME: '',
    LOYALTY_POINT: 0,
    COST_HEAD_ID: null,
    DEPT_ID: '',
    COMPANY_ID: '',
  };
  DepartmentDropdownData: any;
  item_Ledger_DropdownData: any;
  newCategory: any;
  category: any = [];
  selected_Company_id: any;
  IsLedgerEnabled: any;

  constructor(private service: DataService) {}

  getNewCategoryData = () => ({ ...this.newCategory });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedData'] && changes['selectedData'].currentValue) {
      // Merge selectedData into formCategoryData
      this.formCategoryData = {
        ...this.formCategoryData, // keep defaults
        ...changes['selectedData'].currentValue, // override with incoming
      };
    }
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
      const configuration = sessionData?.GeneralSettings || {};
    this.IsLedgerEnabled = configuration?.ENABLE_ITEM_CATEGORY_ACCOUNTS || true;
  }

  showCategory() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getCategoryData(payload).subscribe((response) => {
      this.category = response;
    });
  }

  getDepartmentDropDown() {
    const dropdowndepartment = 'DEPARTMENT';
    const payload = {
      NAME: dropdowndepartment,
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((data: any) => {
      this.DepartmentDropdownData = data;
    });

    this.service
      .getDropdownData({ name: 'CATEGORY_LEDGER' })
      .subscribe((data: any) => {
        this.item_Ledger_DropdownData = data;
      });
  }

  ngOnInit(): void {
    this.sesstion_Details();
    this.getDepartmentDropDown();
    this.showItemCategory();
  }

  closePopup() {
    this.popupClosed.emit();
  }

  UpdateData() {
    const result = this.validationGroup.instance.validate();

    if (!result.isValid) {
      return;
    }

    const requestPayload = {
      COMPANY_ID: this.selected_Company_id,
    };

    this.service.getCategoryData(requestPayload).subscribe((response) => {
      this.category = response || [];

      const payload = {
        ...this.formCategoryData,
      };

      const currentId = payload.ID;

      const codeValue = payload.CODE?.trim().toLowerCase();
      const categoryNameValue = payload.CAT_NAME?.trim().toLowerCase();
      const departmentId = payload.DEPT_ID;

      // Duplicate check: CODE + DEPARTMENT_ID combination
      const isCodeDuplicate = this.category.some(
        (item: any) =>
          item.ID !== currentId &&
          item.CODE?.trim().toLowerCase() === codeValue &&
          item.DEPT_ID === departmentId,
      );

      // Duplicate check: Category Name only
      const isDescriptionDuplicate = this.category.some(
        (item: any) =>
          item.ID !== currentId &&
          item.CAT_NAME?.trim().toLowerCase() === categoryNameValue,
      );

      if (isCodeDuplicate && isDescriptionDuplicate) {
        notify(
          {
            message:
              'Both Code + Department combination and Category already exist',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'error',
        );
        return;
      }

      if (isCodeDuplicate) {
        notify(
          {
            message: 'This Code already exists for the selected Department',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'error',
        );
        return;
      }

      if (isDescriptionDuplicate) {
        notify(
          {
            message: 'This Item Category already exists',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'error',
        );
        return;
      }

      this.service.updateCategory(payload).subscribe((res: any) => {
        if (res?.flag === '1') {
          this.popupClosed.emit();

          notify(
            {
              message: 'Item Category Updated successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'success',
          );
        } else {
          notify(
            {
              message: res?.message || 'Update failed',
              position: { at: 'top right', my: 'top right' },
              displayTime: 2000,
            },
            'error',
          );
        }
      });
    });
  }

  showItemCategory() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      // COMPANY_ID: 0,
    };

    this.service.getCategoryData(payload).subscribe((response) => {
      this.category = response;
    });
  }

  validateCategoryCode = (e: any): boolean => {
  const value = (e.value || '').trim().toLowerCase();

  if (!value || !this.category?.length) return true;

  const currentId = this.formCategoryData?.ID; // current editing row

  return !this.category.some((item: any) => {
    const code = (item.CODE || '').trim().toLowerCase();

    return code === value && item.ID !== currentId; // ignore same record
  });
};

validateCategoryName = (e: any): boolean => {
  const value = (e.value || '').trim().toLowerCase();

  if (!value || !this.category?.length) return true;

  const currentId = this.formCategoryData?.ID; // current editing row

  return !this.category.some((item: any) => {
    const code = (item.CAT_NAME || '').trim().toLowerCase();

    return code === value && item.ID !== currentId; // ignore same record
  });
};

}

@NgModule({
  imports: [
    DxTextBoxModule,
    DxFormModule,
    DxValidatorModule,
    DxButtonModule,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxValidationGroupModule,
  ],
  declarations: [ItemcategoryEditComponent],
  exports: [ItemcategoryEditComponent],
})
export class ItemcategoryEditModule {}
