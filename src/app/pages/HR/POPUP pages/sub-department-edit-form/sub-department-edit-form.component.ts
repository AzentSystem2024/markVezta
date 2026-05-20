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

  formSubDepartmentData = {
    ID: '',
    CODE: '',
    DESCRIPTION: '',
    DEPARTMENT_ID: '',
  };

  subDepartment:any;

  DepartmentDropdownData: any;
  newSubDepartment: any;
  SubDepartment: any = [];
  selected_Company_id: any;

  constructor(private service: DataService) {}

  ngOnInit(): void {
    this.getDepartmentDropDown();
    this.show_subdepartment();
  }

  getNewSubDepartmentData = () => ({ ...this.newSubDepartment });

  getDepartmentDropDown() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_Company_id = String(sessionData.SELECTED_COMPANY.COMPANY_ID);
    const dept_payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.selected_Company_id,
    };

    this.service.getDropdownData(dept_payload).subscribe((data: any) => {
      this.DepartmentDropdownData = data;
      this.popupClosed.emit();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedData'] && changes['selectedData'].currentValue) {
      // Merge selectedData into formSubDepartmentData
      this.formSubDepartmentData = {
        ...this.formSubDepartmentData,
        ...changes['selectedData'].currentValue,
      };
    }
  }

  closePopup() {
    this.popupClosed.emit();
  }

  UpdateData() {
    const result = this.validationGroup.instance.validate();
    if (!result.isValid) {
      return;
    }
    this.service.get_SubDepartment_Data().subscribe((response) => {
      this.SubDepartment = response.datas;
      const payload = {
        ...this.formSubDepartmentData,
      };
      // Exclude the current record (by ID) from duplicate check
      const isCodeDuplicate = this.SubDepartment.some(
        (item: any) =>
          item.ID !== payload.ID &&
          item.CODE?.toLowerCase().trim() ===
            payload.CODE?.toLowerCase().trim(),
      );

      const isDescriptionDuplicate = this.SubDepartment.some(
        (item: any) =>
          item.ID !== payload.ID &&
          item.DESCRIPTION?.toLowerCase().trim() ===
            payload.DESCRIPTION?.toLowerCase().trim(),
      );

      if (isCodeDuplicate && isDescriptionDuplicate) {
        notify(
          {
            message: 'Both Code and description already exist',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'error',
        );
        return;
      } 
      // else if (isCodeDuplicate) {
      //   notify(
      //     {
      //       message: 'This Code already exists',
      //       position: { at: 'top right', my: 'top right' },
      //       displayTime: 1000,
      //     },
      //     'error',
      //   );
      //   return;
      // } else if (isDescriptionDuplicate) {
      //   notify(
      //     {
      //       message: 'This Description already exists',
      //       position: { at: 'top right', my: 'top right' },
      //       displayTime: 1000,
      //     },
      //     'error',
      //   );
      //   return;
      // }

      this.service.Update_SubDepartment_Data(payload).subscribe((res: any) => {
        this.popupClosed.emit();
        notify(
          {
            message: 'This Sub department Updated successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'success',
        );
        return;
      });
    });
  }

  show_subdepartment() {
    this.service.get_SubDepartment_Data().subscribe((res: any) => {
        this.subDepartment = res.datas;
        console.log(this.subDepartment,"subdepartment")
    });
  }

  validateSubDepartmentCode = (e: any): boolean => {
  const value = (e.value || '').trim().toLowerCase();

  if (!value || !this.subDepartment?.length) return true;

  return !this.subDepartment.some((item: any) => {
    const code = (item.CODE || '').trim().toLowerCase();

    return (
      item.ID !== this.formSubDepartmentData.ID && //  exclude current record
      code === value
    );
  });
};
validateSubDepartmentName = (e: any): boolean => {
  const value = (e.value || '').trim().toLowerCase();

  if (!value || !this.subDepartment?.length) return true;

  return !this.subDepartment.some((item: any) => {
    const name = (item.DESCRIPTION || '').trim().toLowerCase();

    return (
      item.ID !== this.formSubDepartmentData.ID && //  exclude current record
      name === value
    );
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
  declarations: [SubDepartmentEditFormComponent],
  exports: [SubDepartmentEditFormComponent],
})
export class SubDepartmentEditFormModule {}
