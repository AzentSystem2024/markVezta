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

  onClickSaveNewClinician = () => {
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
    } = this.clinicianComponent.getnewClinicianData();

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
      .subscribe((response: any) => {
        if (response) {
          notify(
            {
              message: `New Clinician saved Successfully`,
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.isAddClinicianPopupOpened = false;
          this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: `Your Data Not Saved`,
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });
  };

  onClickUpdateNewClinician = () => {
    const data = this.clinicianEditComponent.getnewClinicianData();
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
    } = this.clinicianEditComponent.getnewClinicianData();

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
      .subscribe((response: any) => {
        if (response) {
          notify(
            {
              message: `Clinician updated Successfully`,
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.isEditClinicianPopupOpened = false;
          this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: `Your Data Not Saved`,
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });
  };

  onRowRemoving(event: any) {
    event.cancel = true;
    let SelectedRow = event.key;
    this.dataService.Remove_Clinician_Row_Data(SelectedRow.ID).subscribe(() => {
      try {
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
      } catch (error) {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'error',
        );
      }
      event.component.refresh();
      this.dataGrid.instance.refresh();
    });
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
