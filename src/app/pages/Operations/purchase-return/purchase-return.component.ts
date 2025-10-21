import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DevexpressReportingModule, DxReportViewerModule } from 'devexpress-reporting-angular';
import { DxDataGridModule, DxButtonModule, DxTabsModule, DxPopupModule, DxTextBoxModule, DxDraggableModule, DxSortableModule, DxSelectBoxModule } from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { PurchaseReturnNewFormComponent,PurchaseReturnNewFormModule } from 'src/app/pop-up/operations/purchase-return-new-form/purchase-return-new-form.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { PurchaseReturnEditFormComponent,PurchaseReturnEditFormModule } from 'src/app/pop-up/operations/purchase-return-edit-form/purchase-return-edit-form.component';
import { PurchaseReturnVerifyFormComponent,PurchaseReturnVerifyFormModule } from 'src/app/pop-up/operations/purchase-return-verify-form/purchase-return-verify-form.component';
import { PurchaseReturnApproveFormComponent,PurchaseReturnApproveFormModule } from 'src/app/pop-up/operations/purchase-return-approve-form/purchase-return-approve-form.component';
import { PurchaseReturnViewFormComponent,PurchaseReturnViewFormModule } from 'src/app/pop-up/operations/purchase-return-view-form/purchase-return-view-form.component';
@Component({
  selector: 'app-purchase-return',
  templateUrl: './purchase-return.component.html',
  styleUrls: ['./purchase-return.component.scss']
})
export class PurchaseReturnComponent implements OnInit {
  width:any= '100vw';
  height:any = '100vh';
  grnDataSource:any;
  selectedRowData:any;
  isReturnVerifyPopupVisible:boolean=false;
  isReturnPopupVisible:boolean=false;
  isReturnEditPopupVisible:boolean=false;
  isReturnApprovePopupVisible:boolean=false;
  isReturnViewPopupVisible:boolean=false;

  @ViewChild(PurchaseReturnNewFormComponent, { static: false })
  returnNewForm: PurchaseReturnNewFormComponent;
  @ViewChild(PurchaseReturnEditFormComponent, { static: false })
  returnEditForm: PurchaseReturnEditFormComponent;
  @ViewChild(PurchaseReturnVerifyFormComponent, { static: false })
  returnVerifyForm: PurchaseReturnVerifyFormComponent;
  @ViewChild(PurchaseReturnApproveFormComponent, { static: false })
  returnApproveForm: PurchaseReturnApproveFormComponent;
  @ViewChild(PurchaseReturnViewFormComponent, { static: false })
  returnViewForm: PurchaseReturnViewFormComponent;

  customButtons = [
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      onClick: (e) => this.onVerifyClick(e),
      visible: (e) => e.row.data.STATUS!=='Verified' && e.row.data.STATUS!=='Approved',
    },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e) => this.onApproveClick(e),
      visible: (e) => e.row.data.STATUS=='Verified' && e.row.data.STATUS!=='Approved',
    },
    {
      hint: 'View',
      icon: 'detailslayout',// You can change this to an appropriate icon
      text: 'View',
      onClick: (e) => this.onViewClick(e),
      visible: (e) => e.row.data.STATUS === 'Approved',
    },
  ];

  allButtonsEditDelete = [
    {
      name: 'edit',
      visible: (e) => e.row.data.STATUS!=='Approved' ,
    },
    {
      name: 'delete',
      visible: (e) => e.row.data.STATUS!=='Approved'&&e.row.data.STATUS!=='Verified' , 
    },
  ];

  constructor(private service:DataService,private change:ChangeDetectorRef){}

  openReturnForm(){
    this.isReturnPopupVisible=true;
  }

  onClickSaveData(){
    const data=this.returnNewForm.getNewReturnData();
    console.log(data,"saveData");

    this.service.saveReturnData(data).subscribe(res=>{
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Saved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.getReturnLogData();
      }
      else {
        notify(
          {
            message: 'Your Data Not Saved',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    })
  }

  updateReturnData(){
    const data=this.returnEditForm.getNewReturnData();
    console.log(data,"return updated data");

    this.service.updateReturnData(data).subscribe(res=>{
      console.log("data updated",res);
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.isReturnEditPopupVisible=false;
        this.getReturnLogData();
      }
      else {
        notify(
          {
            message: 'Your Data Not Updated',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    })
  }

  verifyReturnData(){
    const data=this.returnVerifyForm.getNewReturnData();
    console.log(data,"return updated data");

    this.service.verifyReturnData(data).subscribe(res=>{
      console.log("data verified",res);
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Verified Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.isReturnVerifyPopupVisible=false;
        this.getReturnLogData();
      }
      else {
        notify(
          {
            message: 'Your Data Not Verified',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    })
  }

  approveReturnData(){
    const data=this.returnApproveForm.getNewReturnData();
    console.log(data,"return updated data");

    this.service.approveReturnData(data).subscribe(res=>{
      console.log("data appproved",res);
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Approved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.isReturnApprovePopupVisible=false;
        this.getReturnLogData();
      }
      else {
        notify(
          {
            message: 'Your Data Not Approved',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    })
  }

  onEditingRow(event): void {
    console.log(event, 'event');
    event.cancel = true;
    // this.grnId = event.data.ID;
    const Id = event.data.ID;
    console.log(Id, 'id');
    this.isReturnEditPopupVisible = true;
    this.service.selectReturnData(Id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData,"select row data")
    });
  }

  onVerifyClick=(e)=>{
    console.log(e);
    e.cancel = true;
    const id=e.row.data.ID;
    this.isReturnVerifyPopupVisible=true;
    this.change.detectChanges();
    this.service.selectReturnData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData,"select row data")
    });
  }

  onApproveClick=(e)=>{
    console.log(e);
    e.cancel = true;
    const id=e.row.data.ID;
    this.isReturnApprovePopupVisible=true;
    this.change.detectChanges();
    this.service.selectReturnData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData,"select row data")
    });
  }

  onViewClick=(e)=>{
    console.log(e);
    e.cancel = true;
    const id=e.row.data.ID;
    this.isReturnViewPopupVisible=true;
    this.change.detectChanges();
    this.service.selectReturnData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData,"select row data")
    });
  }

  getReturnLogData(){
    this.service.getReturnLogData().subscribe(res=>{
      this.grnDataSource=res.data;
    })
  }

  ngOnInit(): void {
    this.getReturnLogData();
  }

  ClearFormData(){
    this.returnNewForm.clearForm();
  }

  formatRetDate(rowData: any): string { 
    const celldate = rowData.RET_DATE;
    if (!celldate) return '';
  
    const date = new Date(celldate);
  
    // Format the date using the user's system locale
    const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format
  
    return formattedDate; // Return only the date part
  }
  
}

@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    ItemsFormModule,
    DxTabsModule,
    CommonModule,
    DxPopupModule,
    DxTextBoxModule,
    DxDraggableModule,
    DxSortableModule,
    DevexpressReportingModule,
    DxReportViewerModule,
    DxSelectBoxModule,
    PurchaseReturnNewFormModule,
    PurchaseReturnEditFormModule,
    PurchaseReturnVerifyFormModule,
    PurchaseReturnApproveFormModule,
    PurchaseReturnViewFormModule
  ],
  providers: [],
  exports: [],
  declarations: [ PurchaseReturnComponent],
})
export class PurchaseReturnModule {}