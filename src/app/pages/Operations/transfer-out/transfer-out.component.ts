import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DevexpressReportingModule, DxReportViewerModule } from 'devexpress-reporting-angular';
import { DxDataGridModule, DxButtonModule, DxTabsModule, DxPopupModule, DxTextBoxModule, DxDraggableModule, DxSortableModule, DxSelectBoxModule } from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { TransferOutNewFormComponent,TransferOutNewFormModule } from 'src/app/pop-up/operations/transfer-out-new-form/transfer-out-new-form.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { TransferOutEditFormComponent,TransferOutEditFormModule } from 'src/app/pop-up/operations/transfer-out-edit-form/transfer-out-edit-form.component';
import { TransferOutVerifyFormComponent,TransferOutVerifyFormModule } from 'src/app/pop-up/operations/transfer-out-verify-form/transfer-out-verify-form.component';
import { TransferOutApproveFormComponent,TransferOutApproveFormModule } from 'src/app/pop-up/operations/transfer-out-approve-form/transfer-out-approve-form.component';
import { TransferOutViewFormComponent,TransferOutViewFormModule } from 'src/app/pop-up/operations/transfer-out-view-form/transfer-out-view-form.component';
@Component({
  selector: 'app-transfer-out',
  templateUrl: './transfer-out.component.html',
  styleUrls: ['./transfer-out.component.scss']
})
export class TransferOutComponent implements OnInit {
  width:any= '100vw';
  height:any = '100vh';
  isTransferOutNewPopUpVisible:boolean=false;
  isTransferOutEditPopUpVisible:boolean=false;
  isTransferOutVerifyPopUpVisible:boolean=false;
  isTransferOutApprovePopUpVisible:boolean=false;
  isTransferOutViewPopUpVisible:boolean=false;
  TransferOutDataGrid:any;
  selectedRowData:any;
  
  @ViewChild(TransferOutNewFormComponent, { static: false })
  transferOutNewForm: TransferOutNewFormComponent;

  @ViewChild(TransferOutEditFormComponent, { static: false })
  transferOutEditForm: TransferOutEditFormComponent;

  @ViewChild(TransferOutVerifyFormComponent, { static: false })
  transferOutVerifyForm: TransferOutVerifyFormComponent;

  @ViewChild(TransferOutApproveFormComponent, { static: false })
  transferOutApproveForm: TransferOutApproveFormComponent;

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

  openTransferOutForm(){
    this.isTransferOutNewPopUpVisible=true;
  }

  saveTransferOutData(){
    const data = this.transferOutNewForm.getNewTransferOutData();
    console.log(data,"saved data");
    this.service.saveTransferOutData(data).subscribe(res=>{
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Saved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.getTransferOutLogList();
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

  updateTransferOutData(){
    const data=this.transferOutEditForm.getNewTransferOutData();
    console.log(data,"return updated data");

    this.service.updateTransferOutData(data).subscribe(res=>{
      console.log("data updated",res);
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.isTransferOutEditPopUpVisible=false;
        this.getTransferOutLogList();
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

  verifyTransferOutData(){
    const data=this.transferOutVerifyForm.getNewTransferOutData();
    console.log(data,"return updated data");

    this.service.verifyTransferOutData(data).subscribe(res=>{
      console.log("data verified",res);
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Verified Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.isTransferOutVerifyPopUpVisible=false;
        this.getTransferOutLogList();
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

  approveTransferOutData(){
    const data=this.transferOutApproveForm.getNewTransferOutData();
    console.log(data,"return updated data");

    this.service.approveTransferOutData(data).subscribe(res=>{
      console.log("data appproved",res);
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Approved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.isTransferOutApprovePopUpVisible=false;
        this.getTransferOutLogList();
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
    this.isTransferOutEditPopUpVisible = true;
    this.service.selectTransferOutData(Id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData,"select row data")
    });
  }

  onVerifyClick=(e)=>{
    console.log(e);
    e.cancel = true;
    const id=e.row.data.ID;
    this.isTransferOutVerifyPopUpVisible=true;
    this.change.detectChanges();
    this.service.selectTransferOutData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData,"select row data")
    });
  }

  onApproveClick=(e)=>{
    console.log(e);
    e.cancel = true;
    const id=e.row.data.ID;
    this.isTransferOutApprovePopUpVisible=true;
    this.change.detectChanges();
    this.service.selectTransferOutData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData,"select row data")
    });
  }

  onViewClick=(e)=>{
    console.log(e);
    e.cancel = true;
    const id=e.row.data.ID;
    this.isTransferOutViewPopUpVisible=true;
    this.change.detectChanges();
    this.service.selectTransferOutData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData,"select row data")
    });
  }

  getTransferOutLogList(){
    this.service.getTransferOutLogData().subscribe(res=>{
      this.TransferOutDataGrid = res.data;
    })
  }

  ngOnInit(): void {
    this.getTransferOutLogList();
  }

  formatTrOutDate(rowData: any): string { 
    const celldate = rowData.TRANSFER_DATE;
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
    TransferOutNewFormModule,
    TransferOutEditFormModule,
    TransferOutVerifyFormModule,
    TransferOutApproveFormModule,
    TransferOutViewFormModule
  ],
  providers: [],
  exports: [],
  declarations: [ TransferOutComponent],
})
export class TransferOutModule {}
