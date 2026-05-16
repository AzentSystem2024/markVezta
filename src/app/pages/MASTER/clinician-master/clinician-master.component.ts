import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDropDownButtonModule,
  DxLookupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxPopupModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';
import DataSource from 'devextreme/data/data_source';
import { ActivatedRoute } from '@angular/router';
import {
  ClinicianEditFormComponent,
  ClinicianEditFormModule,
} from '../POPUP PAGES/clinician-edit-form/clinician-edit-form.component';
import {
  ClinicianNewFormComponent,
  ClinicianNewFormModule,
} from '../POPUP PAGES/clinician-new-form/clinician-new-form.component';

@Component({
  selector: 'app-clinician-master',
  templateUrl: './clinician-master.component.html',
  styleUrls: ['./clinician-master.component.scss'],
  providers: [DataService],
})
export class ClinicianMasterComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  @ViewChild(ClinicianNewFormComponent, { static: false })
  clinicianComponent!: ClinicianNewFormComponent;

  @ViewChild(ClinicianEditFormComponent, { static: false })
  clinicianEditComponent!: ClinicianEditFormComponent;

  isAddClinicianPopupOpened: any = false;
  isEditClinicianPopupOpened: any = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;

  facilityGroupDatasource: any;
  specialityDatasource: any;
  clinicianMajorDatasource: any;
  clinicianProfessionDatasource: any;
  clinicianCategoryDatasource: any;
  genderDatasource: any;
  auto: string = 'auto';

  showSearchBar: boolean = false;

  dataSource = new DataSource<any>({
    load: () =>
      new Promise((resolve, reject) => {
        this.dataService.get_Clinian_Table_Data().subscribe({
          next: (response: any) => resolve(response.data), // Resolve with the data
          error: (error: any) => reject(error.message), // Reject with the error message
        });
      }),
  });

  toolbarItems: any = [
    {
      widget: 'dxButton',
      options: {
        text: 'Cancel',
        stylingMode: 'outlined',
        type: 'normal',
        onClick: () => {
          // this.clinicianComponent.reset_newClinicianFormData();
          this.isAddClinicianPopupOpened = false;
          // this.popupStateService.setPopupState('clinicianPopup', false);
        },
      },
      toolbar: 'bottom',
      location: 'after',
    },
    {
      widget: 'dxButton',
      options: {
        text: 'Save',
        type: 'default',
        stylingMode: 'contained',
        onClick: () => this.onClickSaveNewClinician(),
      },
      toolbar: 'bottom',
      location: 'after',
    },
  ];

  toolbarEditItems: any = [
    {
      widget: 'dxButton',
      options: {
        text: 'Cancel',
        stylingMode: 'outlined',
        type: 'normal',
        onClick: () => {
          // this.clinicianComponent.reset_newClinicianFormData();
          this.isEditClinicianPopupOpened = false;
          // this.popupStateService.setPopupState('clinicianPopup', false);
        },
      },
      toolbar: 'bottom',
      location: 'after',
    },
    {
      widget: 'dxButton',
      options: {
        text: 'Save',
        type: 'default',
        stylingMode: 'contained',
        onClick: () => this.onClickUpdateNewClinician(),
      },
      toolbar: 'bottom',
      location: 'after',
    },
  ];

  addButtonOptions: any;

  isFilterRowVisible: boolean = false;
  selectedClinician: any;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
  ) {
    this.addButtonOptions = {
      text: 'New',
      icon: 'bi bi-plus-circle',
      type: 'default',
      stylingMode: 'contained',
      hint: 'Add new entry',
      // disabled: !this.menuPrevilage.CanAdd,
      onClick: () => this.show_new__Form(),
      elementAttr: { class: 'add-button' },
    };
  }

  openEditingStart(event: any) {
    event.cancel = true;
    // this.editingStart.emit(event);

    const ID = event.data.ID;

    this.dataService.selectClinician(ID).subscribe((response: any) => {
      this.selectedClinician = response.data[0];
      this.isEditClinicianPopupOpened = true;
    });
  }

  ngOnInit(): void {
    this.get_DropDown_Data();
  }

  show_new__Form() {
    this.isAddClinicianPopupOpened = true;
  }

  closePopup() {
    this.isAddClinicianPopupOpened = false;
  }

  get_DropDown_Data() {
    this.dataService.Get_GropDown('SPECIALITY').subscribe((response: any) => {
      this.specialityDatasource = response;
    });

    this.dataService
      .Get_GropDown('CLINICIANMAJOR')
      .subscribe((response: any) => {
        this.clinicianMajorDatasource = response;
      });

    this.dataService
      .Get_GropDown('CLINICIANPROFESSION')
      .subscribe((response: any) => {
        this.clinicianProfessionDatasource = response;
      });

    this.dataService
      .Get_GropDown('CLINICIANCATEGORY')
      .subscribe((response: any) => {
        this.clinicianCategoryDatasource = response;
      });

    this.dataService.Get_GropDown('GENDER').subscribe((res: any) => {
      this.genderDatasource = res;
    });
  }

  // ================= Common Notification Method =================
  showNotification(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success',
    displayTime: number = 3000,
  ) {
    notify(
      {
        message,
        position: { at: 'top right', my: 'top right' },
        displayTime,
      },
      type,
    );
  }

  // ================= Save New Clinician =================
  onClickSaveNewClinician = () => {
    try {
      const clinicianData = this.clinicianComponent?.getnewClinicianData?.();

      if (!clinicianData) {
        this.showNotification('Invalid clinician data', 'error');
        return;
      }

      const {
        ClinicianLicense,
        ClinicianName,
        ClinicianShortName,
        SpecialityID,
        MajorID,
        ProfessionID,
        CategoryID,
        Gender,
        DepartmentID,
      } = clinicianData;

      // ===== Basic Validation =====
      if (!ClinicianName?.trim()) {
        this.showNotification('Clinician Name is required', 'warning');
        return;
      }

      if (!ClinicianLicense?.trim()) {
        this.showNotification('Clinician License is required', 'warning');
        return;
      }

      this.dataService
        .Insert_Clinician_Data(
          ClinicianLicense,
          ClinicianName,
          ClinicianShortName,
          SpecialityID,
          MajorID,
          ProfessionID,
          CategoryID,
          Gender,
          DepartmentID,
        )
        .subscribe({
          next: (response: any) => {
            if (response?.flag === '1') {
              this.showNotification(
                'New Clinician saved successfully',
                'success',
              );

              this.clinicianComponent.reset_newClinicianFormData();
              this.isAddClinicianPopupOpened = false;

              this.dataGrid?.instance?.refresh();
            } else {
              this.showNotification(
                response?.message || 'Failed to save clinician',
                'error',
              );
            }
          },

          error: (error: any) => {
            console.error('Insert Clinician Error:', error);

            this.showNotification(
              error?.error?.message || 'Server error while saving clinician',
              'error',
            );
          },
        });
    } catch (error) {
      console.error('Save Clinician Exception:', error);

      this.showNotification(
        'Unexpected error occurred while saving clinician',
        'error',
      );
    }
  };

  // ================= Update Clinician =================
  onClickUpdateNewClinician = () => {
    try {
      const clinicianData =
        this.clinicianEditComponent?.getnewClinicianData?.();

      if (!clinicianData) {
        this.showNotification('Invalid clinician data', 'error');
        return;
      }

      const {
        ID,
        ClinicianLicense,
        ClinicianName,
        ClinicianShortName,
        SpecialityID,
        MajorID,
        ProfessionID,
        CategoryID,
        Gender,
        DepartmentID,
      } = clinicianData;

      // ===== Validation =====
      if (!ID) {
        this.showNotification('Invalid Clinician ID', 'warning');
        return;
      }

      if (!ClinicianName?.trim()) {
        this.showNotification('Clinician Name is required', 'warning');
        return;
      }

      this.dataService
        .update_Clinician_data(
          ID,
          ClinicianLicense,
          ClinicianName,
          ClinicianShortName,
          SpecialityID,
          MajorID,
          ProfessionID,
          CategoryID,
          Gender,
          DepartmentID,
        )
        .subscribe({
          next: (response: any) => {
            if (response?.flag === '1') {
              this.showNotification(
                'Clinician updated successfully',
                'success',
              );

              this.isEditClinicianPopupOpened = false;

              this.dataGrid?.instance?.refresh();
            } else {
              this.showNotification(
                response?.message || 'Failed to update clinician',
                'error',
              );
            }
          },

          error: (error: any) => {
            console.error('Update Clinician Error:', error);

            this.showNotification(
              error?.error?.message || 'Server error while updating clinician',
              'error',
            );
          },
        });
    } catch (error) {
      console.error('Update Clinician Exception:', error);

      this.showNotification(
        'Unexpected error occurred while updating clinician',
        'error',
      );
    }
  };

  // ================= Delete Clinician =================
  onRowRemoving(event: any) {
    event.cancel = true;

    try {
      const selectedRow = event?.key;

      if (!selectedRow?.ID) {
        this.showNotification('Invalid clinician selected', 'warning');
        return;
      }

      this.dataService.Remove_Clinician_Row_Data(selectedRow.ID).subscribe({
        next: (response: any) => {
          if (response?.flag === '1' || response) {
            this.showNotification(
              'Delete operation successful',
              'success',
              2000,
            );

            event.component?.refresh();
            this.dataGrid?.instance?.refresh();
          } else {
            this.showNotification(
              response?.message || 'Delete operation failed',
              'error',
            );
          }
        },

        error: (error: any) => {
          console.error('Delete Clinician Error:', error);

          this.showNotification(
            error?.error?.message || 'Server error while deleting clinician',
            'error',
          );
        },
      });
    } catch (error) {
      console.error('Delete Clinician Exception:', error);

      this.showNotification(
        'Unexpected error occurred while deleting clinician',
        'error',
      );
    }
  }

  onExporting(event: any) {
    const fileName = 'clinician';
    this.dataService.exportDataGrid(event, fileName);
  }

  refresh = () => {
    this.dataGrid.instance.refresh();
  };

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  };

  onHideSearchBar() {
    this.showSearchBar = false;
  }

  onSearchQueryChanged(event: any) {
    const query = event.value;
    this.dataGrid.instance.searchByText(query);
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxLookupModule,
    DxPopupModule,
    FormPopupModule,
    ClinicianNewFormModule,
    ClinicianEditFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [ClinicianMasterComponent],
})
export class ClinicianMasterModule {}
