import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DxValidationGroupComponent,
  DxTextBoxModule,
  DxFormModule,
  DxValidatorModule,
  DxButtonModule,
  DxSelectBoxModule,
  DxValidationGroupModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-sub-department-edit-form',
  templateUrl: './sub-department-edit-form.component.html',
  styleUrls: ['./sub-department-edit-form.component.scss'],
})
export class SubDepartmentEditFormComponent implements OnInit, OnChanges {
  @Input() selectedData: any;

  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild('departmentValidationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;
  formCategoryData = {
    ID: '',
    CODE: '',
    CAT_NAME: '',
    LOYALTY_POINT: 0,
    COST_HEAD_ID: '5',
    DEPT_ID: '',
    COMPANY_ID: '1',
  };
  DepartmentDropdownData: any;
  newCategory: any;
  category: any = [];
  selected_Company_id: any;

  constructor(private service: DataService) {}

  getNewCategoryData = () => ({ ...this.newCategory });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedData'] && changes['selectedData'].currentValue) {
      console.log(
        'Received selectedData:',
        changes['selectedData'].currentValue,
      );

      // Merge selectedData into formCategoryData
      this.formCategoryData = {
        ...this.formCategoryData, // keep defaults
        ...changes['selectedData'].currentValue, // override with incoming
      };
    }
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id==============',
    );
  }

  showCategory() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getCategoryData(payload).subscribe((response) => {
      this.category = response;
      console.log(response);
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
  }
  ngOnInit(): void {
    this.sesstion_Details();
    this.getDepartmentDropDown();
  }

  closePopup() {
    this.popupClosed.emit();
  }
  UpdateData() {
    const result = this.validationGroup.instance.validate();
    if (!result.isValid) {
      return;
    }
    console.log('edit category');
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getCategoryData(payload).subscribe((response) => {
      this.category = response;
      console.log(response);

      const payload = {
        ...this.formCategoryData,
      };

      // Exclude the current record (by ID) from duplicate check
      const isCodeDuplicate = this.category.some(
        (item: any) =>
          item.ID !== payload.ID &&
          item.CODE?.toLowerCase().trim() ===
            payload.CODE?.toLowerCase().trim(),
      );

      const isDescriptionDuplicate = this.category.some(
        (item: any) =>
          item.ID !== payload.ID &&
          item.CAT_NAME?.toLowerCase().trim() ===
            payload.CAT_NAME?.toLowerCase().trim(),
      );

      if (isCodeDuplicate && isDescriptionDuplicate) {
        notify(
          {
            message: 'Both Code and Category already exist',
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
            message: 'This Category already exists',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'error',
        );
        return;
      }

      this.service.updateCategory(payload).subscribe((res: any) => {
        console.log(res);
        this.popupClosed.emit();
        notify(
          {
            message: 'This Item Category Updated successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'success',
        );
        return;
      });
    });
  }
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
  declarations: [SubDepartmentEditFormComponent],
  exports: [SubDepartmentEditFormComponent],
})
export class SubDepartmentEditFormModule {}
