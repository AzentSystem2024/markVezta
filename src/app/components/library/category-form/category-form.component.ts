import {
  Component,
  EventEmitter,
  NgModule,
  OnInit,
  Output,
} from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
})
export class CategoryFormComponent implements OnInit {
  @Output() popupClosed = new EventEmitter<void>();

  DepartmentDropdownData: any;
  item_Ledger_DropdownData:any
  formCategoryData = {
    CODE: '',
    CAT_NAME: '',
    LOYALTY_POINT: 0,
    COST_HEAD_ID: null,
    DEPT_ID: '',
    COMPANY_ID: 0,
  };
  COMPANY_ID: string= '';
  newCategory = this.formCategoryData;
  category:any;
  IsLedgerEnabled: any;

  constructor(private service: DataService) {}

  ngOnInit(): void {
    this.session_Details();
    this.getDepartmentDropDown();
    this.showItemCategory();
  }

  getNewCategoryData = () => ({ ...this.newCategory });

  session_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData')||'{}');
    this.COMPANY_ID = String(sessionData.SELECTED_COMPANY.COMPANY_ID);
    const configuration = sessionData?.GeneralSettings || {};
    this.IsLedgerEnabled = configuration?.ENABLE_ITEM_CATEGORY_ACCOUNTS || true;
  }

  getDepartmentDropDown() {
    const dropdowndepartment = 'DEPARTMENT';
    const payload = {
      NAME: dropdowndepartment,
      COMPANY_ID: this.COMPANY_ID,
    };

    this.service.getDropdownData(payload).subscribe((data: any) => {
      this.DepartmentDropdownData = data;
      this.popupClosed.emit();
    });

     this.service
      .getDropdownData({ name: 'CATEGORY_LEDGER' })
      .subscribe((data: any) => {
        this.item_Ledger_DropdownData = data;
      });
  }

  showItemCategory() {
    const payload = {
      COMPANY_ID: this.COMPANY_ID,
      // COMPANY_ID: 0,
    };

    this.service.getCategoryData(payload).subscribe((response) => {
      this.category = response;
    });
  }

  validateCategoryCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();
    if (!value || !this.category?.length) return true;
    return !this.category.some((item: any) => {
      const code = (item.CODE || '').trim().toLowerCase();
      return code === value;
    });
  };  

  validateCategoryName  = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.category?.length) return true;


    return !this.category.some((item: any) => {
      const code = (item.CAT_NAME || '').trim().toLowerCase();

      return code === value;
    });
  };  

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
  ],
  declarations: [CategoryFormComponent],
  exports: [CategoryFormComponent],
})
export class CategoryFormModule {}
