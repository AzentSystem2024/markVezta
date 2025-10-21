// import { Component } from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxFileUploaderModule,
  DxDataGridModule,
  DxButtonModule,
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxDataGridComponent,
  DxValidationGroupComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';
import { SalaryHeadAddComponent } from '../salary-head-add/salary-head-add.component'; 
import notify from 'devextreme/ui/notify';
import { SalaryHeadAddModule } from '../salary-head-add/salary-head-add.component';
import { SalaryHeadEditModule } from '../salary-head-edit/salary-head-edit.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-salary-head-list',
  templateUrl: './salary-head-list.component.html',
  styleUrls: ['./salary-head-list.component.scss']
})
export class SalaryHeadListComponent {
  @ViewChild(SalaryHeadAddComponent)
  SalaryHeadAddComponent!: SalaryHeadAddComponent;
   @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('SalaryHeadValidation', { static: false }) SalaryHeadValidation: DxValidationGroupComponent;
salaryHeadList:any = [];
 readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
addSalaryHeadPopupOpened:boolean=false
EditSalaryHeadPopupOpened:boolean=false
Selected_salaryHead_Data:any
isFilterRowVisible:boolean=false
canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

   //=================================refresh=============================
   refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };

      addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',


    

    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addSalaryHead());
    },
    elementAttr: { class: 'add-button' }
  };
    constructor(private dataservice: DataService,private ngZone: NgZone,private cdr:ChangeDetectorRef,private router: Router) {
       const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);

    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/salary-head');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    this.getSalaryHeadList();

    }


  formatDates(cellData: any): string {
  if (!cellData) return '';

  const date = cellData instanceof Date ? cellData : new Date(cellData);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

  getStatusFlagClass(IS_INACTIVE: string): string {
    // console.log('Status:', IS_INACTIVE);
    
 return IS_INACTIVE ? 'flag-red' : 'flag-green';
}
  // onFormClosed(saved: boolean) {
  //   this.addSalaryHeadPopupOpened = false;
  //   // this.getEmployeeList(); // reload the data
  // }

    handleEditClose() {
    this.EditSalaryHeadPopupOpened = false;
    // this.getEmployeeList();
       this.addSalaryHeadPopupOpened = false;
    this.Selected_salaryHead_Data = null;
    if( this.SalaryHeadAddComponent) {
      this.SalaryHeadAddComponent.resetForm();
      
    }
   
    this.getSalaryHeadList()

  }
//=======================list data=============
  // getSalaryHeadList() {
  //   this.dataservice.get_salary_head_list().subscribe((res: any) => {
  //     console.log('Salary Head List:', res);

  //     this.salaryHeadList=res.Data
  //   })
  // }


getSalaryHeadList() {
  this.dataservice.get_salary_head_list().subscribe((res: any) => {
    console.log('Salary Head List:', res);

    this.salaryHeadList = res.Data.map((item: any, index: number) => {
      return {
        ...item,
        serialNo: index + 1,
      };
    });
   
  });
}



  addSalaryHead(){
    console.log('Add Salary Head clicked');
    this.addSalaryHeadPopupOpened = true;
   if( this.SalaryHeadAddComponent) {
  this.SalaryHeadAddComponent.setDefaultValues()
  this.SalaryHeadAddComponent.setNextHeadOrder()
  // this.SalaryHeadAddComponent.resetForm()
      
    }

 
  }
OnEditSalary_Head(event: any) {
    // Logic to handle editing of salary head
    event.cancel=true
  
    console.log('Editing Salary Head:', event);


const id = event.data.ID;
    this.dataservice.select_salary_head(id).subscribe((res: any) => {
      console.log('Selected Salary Head Data:', res);
      this.Selected_salaryHead_Data = res;
      console.log('==========selected data================', this.Selected_salaryHead_Data);
    })
    this.EditSalaryHeadPopupOpened=true
  
}
OnDeleteSalaryHead(event: any) {
    // Logic to handle deletion of salary head
    console.log('Deleting Salary Head:', event);
    const id = event.data.ID;
     if (event.data.TRANS_STATUS === 5) {
          event.cancel = true;
          notify('This Salary head cannot be deleted.', 'error', 2000);
          return;
        }
    this.dataservice.delete_salary_Head(id).subscribe((res: any) => {
      console.log(' res')
            notify(
                      {
                        message: 'Salary Head Deleted successfully ',
                        position: { at: 'top center', my: 'top center' },
                      },
                      'success'
                    );

                    this.getSalaryHeadList()
    })

}


    refreshGrid(){
          if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
       // Or reload data from API if needed
       this.getSalaryHeadList()
      
    }
  }
           toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

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
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    SalaryHeadAddModule,
    SalaryHeadEditModule,
   
  ],
  providers: [],
  declarations: [SalaryHeadListComponent],
  exports: [SalaryHeadListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalaryHeadListModule {}
