import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DevexpressReportingModule, DxReportViewerModule } from 'devexpress-reporting-angular';
import { DxDataGridModule, DxButtonModule, DxTabsModule, DxPopupModule, DxTextBoxModule, DxDraggableModule, DxSortableModule, DxSelectBoxModule } from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { TransferInNewFormComponent,TransferInNewFormModule } from 'src/app/pop-up/operations/transfer-in-new-form/transfer-in-new-form.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { TransferInEditFormComponent, TransferInEditFormModule } from 'src/app/pop-up/operations/transfer-in-edit-form/transfer-in-edit-form.component';
import { TransferInVerifyFormComponent,TransferInVerifyFormModule } from 'src/app/pop-up/operations/transfer-in-verify-form/transfer-in-verify-form.component';
import { TransferInApproveFormComponent,TransferInApproveFormModule } from 'src/app/pop-up/operations/transfer-in-approve-form/transfer-in-approve-form.component';
import { TransferInViewFormComponent, TransferInViewFormModule } from 'src/app/pop-up/operations/transfer-in-view-form/transfer-in-view-form.component';
@Component({
  selector: 'app-transfer-in',
  templateUrl: './transfer-in.component.html',
  styleUrls: ['./transfer-in.component.scss']
})
export class TransferInComponent implements OnInit {
  width:any= '100vw';
  height : any ='100vh';
  isTransferInNewFormVisible:boolean=false;
  isTransferInEditPopUpVisible:boolean=false;
  isTransferInVerifyPopUpVisible:boolean=false;
  isTransferInApprovePopUpVisible:boolean=false;
  isTransferInViewPopUpVisible:boolean=false;
  storeId=3;
  transferInLogDataGrid:any;
  selectedRowData:any;

  @ViewChild(TransferInNewFormComponent, { static: false })
  transferInNewForm: TransferInNewFormComponent;
  @ViewChild(TransferInEditFormComponent, { static: false })
  transferInEditForm: TransferInEditFormComponent;
  @ViewChild(TransferInVerifyFormComponent, { static: false })
  transferInVerifyForm: TransferInVerifyFormComponent;
  @ViewChild(TransferInApproveFormComponent, { static: false })
  transferInApproveForm: TransferInApproveFormComponent;
  @ViewChild(TransferInViewFormComponent, { static: false })
  transferInViewForm: TransferInViewFormComponent;

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

  openTranserInNewForm(){
    this.isTransferInNewFormVisible=true;
  }

  saveTransferInData(){
    const data=this.transferInNewForm.getNewTransferInData();
    console.log(data);
    this.service.saveTransferInData(data).subscribe(res=>{
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Saved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.getTransferInLogList();
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

  updateTransferInData(){
    const data=this.transferInEditForm.getNewTransferInData();
    console.log(data,"data updated");

    this.service.updateTransferInData(data).subscribe(res=>{
      console.log("data updated",res);
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.isTransferInEditPopUpVisible=false;
        this.getTransferInLogList();
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

  verifyTransferInData(){
    const data=this.transferInVerifyForm.getNewTransferInData();
    console.log(data,"return updated data");

    this.service.verifyTransferInData(data).subscribe(res=>{
      console.log("data verified",res);
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Verified Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.isTransferInVerifyPopUpVisible=false;
        this.getTransferInLogList();
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

  approveTransferInData(){
    const data=this.transferInApproveForm.getNewTransferInData();
    console.log(data,"return updated data");

    this.service.approveTransferInData(data).subscribe(res=>{
      console.log("data appproved",res);
      if(res.Message="Success"){
        notify(
          {
            message: 'Data Approved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.isTransferInApprovePopUpVisible=false;
        this.getTransferInLogList();
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

  getTransferInLogList(){
    this.service.getTransferInLogList(this.storeId,'','').subscribe(res=>{
      this.transferInLogDataGrid = res.data;
    })
  }

  onEditingRow(event): void {
    console.log(event, 'event');
    event.cancel = true;
    // this.grnId = event.data.ID;
    const Id = event.data.ID;
    console.log(Id, 'id');
    this.isTransferInEditPopUpVisible = true;
    this.service.selectTransferInData(Id,this.storeId).subscribe((res) => {
      this.selectedRowData = res.data[0];
      console.log(this.selectedRowData,"select row data")
    });
  }

  onVerifyClick=(e)=>{
    console.log(e);
    e.cancel = true;
    const id=e.row.data.ID;
    this.isTransferInVerifyPopUpVisible=true;
    this.change.detectChanges();
    this.service.selectTransferInData(id,this.storeId).subscribe((res) => {
      this.selectedRowData = res.data[0];
      console.log(this.selectedRowData,"select row data")
    });
  }

  onApproveClick=(e)=>{
    console.log(e);
    e.cancel = true;
    const id=e.row.data.ID;
    this.isTransferInApprovePopUpVisible=true;
    this.change.detectChanges();
    this.service.selectTransferInData(id,this.storeId).subscribe((res) => {
      this.selectedRowData = res.data[0];
      console.log(this.selectedRowData,"select row data")
    });
  }

  onViewClick=(e)=>{
    console.log(e);
    e.cancel = true;
    const id=e.row.data.ID;
    this.isTransferInViewPopUpVisible=true;
    this.change.detectChanges();
    this.service.selectTransferInData(id,this.storeId).subscribe((res) => {
      this.selectedRowData =  res.data[0];
      console.log(this.selectedRowData,"select row data")
    });
  }


  formatTrInDate(rowData: any): string { 
    const celldate = rowData.TRIN_DATE;
    if (!celldate) return '';
  
    const date = new Date(celldate);
  
    // Format the date using the user's system locale
    const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format
  
    return formattedDate; // Return only the date part
  }
  ngOnInit(): void {
    this.getTransferInLogList();
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
    TransferInNewFormModule,
    TransferInEditFormModule,
    TransferInVerifyFormModule,
    TransferInApproveFormModule,
    TransferInViewFormModule
  ],
  providers: [],
  exports: [],
  declarations: [ TransferInComponent],
})
export class TransferInModule {}
