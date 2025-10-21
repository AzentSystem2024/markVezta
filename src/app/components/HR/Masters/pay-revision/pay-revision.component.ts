import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
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
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';
import { PayRevisionEditModule } from '../pay-revision-edit/pay-revision-edit.component';
import { PayRevisionAddModule } from '../pay-revision-add/pay-revision-add.component';
import { PayRevisionVerifyModule } from '../pay-revision-verify/pay-revision-verify.component';
import { PayRevisionApproveModule } from '../pay-revision-approve/pay-revision-approve.component';
import { PayRevisionViewModule } from '../pay-revision-view/pay-revision-view.component';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-pay-revision',
  templateUrl: './pay-revision.component.html',
  styleUrls: ['./pay-revision.component.scss'],
})
export class PayRevisionComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  GridSource: any;
  isLoading: boolean = false;
  employeeList: any;
  editPayRevisionPopupOpened: boolean = false;
  addPayRevisionPopupOpened: boolean = false;
  verifyPayRevisionPopupOpened: boolean = false;
  approvePayRevisionPopupOpened: boolean = false;
  viewPayRevisionPopupOpened: boolean = false;
  selectedRevisionData: any = null;


  allActionButtons = [
    {
      name: 'edit',
      hint: 'Edit',
      icon: 'edit',
      text: 'Edit',
      
    },
    {
      name: 'delete',
      hint: 'Delete',
      icon: 'trash',
      text: 'Delete',
      // onClick: (e) => this.onDeleteClick(e),
      visible: (e) => e.row.data.STATUS !== 'Approved'
    },
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      onClick: (e) => {
        setTimeout(() => this.onVerifyClick(e));
      },
      visible: (e) => e.row.data.STATUS !== 'Approved' && e.row.data.STATUS !== 'Verified'
    },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e) => {
        setTimeout(() => this.onApproveClick(e));
      },
      visible: (e) => e.row.data.STATUS === 'Verified'
    }
  ];
  
  
  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getSalaryRevisionList();
  }

  getSalaryRevisionList() {
    this.isLoading = true;
    this.dataService.getSalaryRevisionLog().subscribe((response: any) => {
      this.employeeList = response.data.reverse();
      this.isLoading = false;
    });
  }

  getStatusFlagClass(status: string): string {
    switch (status) {
      case 'Open': return 'flag-open';       // White or gray
      case 'Verified': return 'flag-verified'; // Orange
      case 'Approved': return 'flag-approved'; // Green
      default: return '';
    }
  }
  

  formatDateColumn = (rowData: any): string => {
    const value = rowData.DATE;
    if (!value) return '';

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  formatEffectFromColumn = (rowData: any): string => {
    const value = rowData.EFFECT_FROM;
    // Same formatting logic
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  applyFilter() {
    this.GridSource.filter();
  }

  addSalaryRevision() {
    this.addPayRevisionPopupOpened = true;
  }

  // onEditPyRevision(e: any) {
  //   e.cancel = true;
  //   const employeeId = e.data.ID;
  //   this.dataService
  //     .selectSalaryRevision(employeeId)
  //     .subscribe((response: any) => {
  //       this.selectedRevisionData = response; // will be passed to edit component
  //       this.editPayRevisionPopupOpened = true;
  //     });
  // }

  onEditOrViewPayRevision(e: any) {
    e.cancel = true;
    const employeeId = e.data.ID;
    const status = e.data.STATUS;
  
    this.dataService.selectSalaryRevision(employeeId).subscribe({
      next: (response: any) => {
        this.selectedRevisionData = response;
  
        if (status === 'Approved') {
          this.viewPayRevisionPopupOpened = true;
        } else {
          this.editPayRevisionPopupOpened = true;
        }
      },
      error: (err) => {
        console.error('Failed to fetch salary revision:', err);
      }
    });
  }

  
  

  onVerifyClick(e: any): void {
    // console.log('Verify clicked:', e); // <-- Add this
  
    e.cancel = true;
    const employeeId = e.row?.data?.ID;
  
    if (!employeeId) {
      console.warn('No Employee ID found in row data');
      return;
    }
  
    this.dataService.selectSalaryRevision(employeeId).subscribe({
      next: (response: any) => {
        // console.log('Salary revision fetched:', response); // <-- Add this
  
        this.selectedRevisionData = response; 
        this.verifyPayRevisionPopupOpened = true;
      },
      error: (err) => {
        console.error('Failed to fetch salary revision:', err);
      }
    });
  }
  
  

  onApproveClick(e: any): void {
    // console.log('Verify clicked:', e); // <-- Add this
  
    e.cancel = true;
    const employeeId = e.row?.data?.ID;
  
    if (!employeeId) {
      console.warn('No Employee ID found in row data');
      return;
    }
  
    this.dataService.selectSalaryRevision(employeeId).subscribe({
      next: (response: any) => {
        // console.log('Salary revision fetched:', response); // <-- Add this
  
        this.selectedRevisionData = response; 
        this.approvePayRevisionPopupOpened = true;
      },
      error: (err) => {
        console.error('Failed to fetch salary revision:', err);
      }
    });
  }
  

  handleEditClose() {
    // console.log('Parent: popupClosed triggered');
    this.addPayRevisionPopupOpened = false; // closes the popup
    this.editPayRevisionPopupOpened = false; 
    this.verifyPayRevisionPopupOpened = false; 
    this.approvePayRevisionPopupOpened = false;
    this.selectedRevisionData = null;
    this.getSalaryRevisionList();
  }

  onDeleteSalaryRevision(e: any) {
    const salaryRevisionId = e.data.ID;
// console.log("delete")
    // Optionally prevent the default delete behavior
    e.cancel = true;

    // Call your delete API
    this.dataService.deleteSalaryRevision(salaryRevisionId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Salary Revision Log Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.getSalaryRevisionList();
          // this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
        // or whatever method you use to refresh `employeeList`
      },
      (error) => {
        console.error('Error deleting employee:', error);
      }
    );
  }
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
    PayRevisionEditModule,
    PayRevisionAddModule,
    PayRevisionVerifyModule,
    PayRevisionApproveModule,
    PayRevisionViewModule
  ],
  providers: [],
  declarations: [PayRevisionComponent],
  exports: [PayRevisionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PayRevisionModule {}
