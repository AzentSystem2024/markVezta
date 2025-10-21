import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxFileUploaderModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxProgressBarModule, DxRadioGroupModule, DxSelectBoxModule, DxTabsModule, DxTagBoxModule, DxTemplateModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { DxoFormItemModule, DxoItemModule, DxoLookupModule } from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';
import { workerData } from 'worker_threads';

@Component({
  selector: 'app-promotion-log',
  templateUrl: './promotion-log.component.html',
  styleUrls: ['./promotion-log.component.scss']
})
export class PromotionLogComponent {
  customButtons = [
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      onClick: (e) => this.onVerifyClick(e),
      visible: (e) => !e.row.data.isVerified && !e.row.data.isApproved,
    },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e) => this.onApproveClick(e),
      visible: (e) => e.row.data.isVerified && !e.row.data.isApproved,
    },
  ];
  allButtonsEditDelete = [
    {
      name: 'edit',
      hint: 'Edit',
      icon: 'edit',
      // onClick: (e: any) => this.onEditClick(e),
      visible: true,
      // disabled: (e: any) => e.row.data.isVerified, // Disable when `isVerified` is true
    },
    // {
    //   name: 'edit',
    //   visible: true, 
    //   disabled: (rowData: any) => rowData.isVerified, 
    // },
    {
      name: 'delete',
      visible: (e) => (!e.row.data.isVerified && !e.row.data.isApproved) , 
    },
  ];
  showHeaderFilter = true;
  isVerified: boolean = false;
  isApproved: boolean = false;
  promotionLogList:any;
  selectedPromotion: { response: any; };
  AllowCommitWithSave: string;
  logStatusMap: { [key: number]: string } = {};
  status: any;

  constructor(private dataservice: DataService, private router: Router){}

  ngOnInit(){
    this.AllowCommitWithSave = sessionStorage.getItem('AllowCommitWithSave');
    console.log(this.AllowCommitWithSave,"ALLOW")
    this.getPromotionLogList();
  
  }

  getPromotionLogList(){
    this.dataservice.PromotionLogList().subscribe((response:any) => {
      this.promotionLogList = response.dataworksheet.map((item) => {
        this.logStatusMap[item.WS_NO] = item.Status; 
        return {
          ...item,
          isVerified: item.Status === 'Verified',
          isApproved: item.Status === 'Approved',
        };
      }).sort((a, b) => b.WS_NO - a.WS_NO);
      console.log(this.promotionLogList,"LOGLIST")
      this.promotionLogList.forEach((item) => {
        if (item.isVerified) {
        } else if (item.isApproved) {
          // console.log(`Record ${item.WS_NO} is Approved.`);
        } else {
          // console.log(`Record ${item.WS_NO} is Open.`);
        }
      });
      // console.log(this.logList, 'LOGLIST');
    });

  }

  

  dateCellTemplate(cellElement: any, cellInfo: any) {
    if (cellInfo.value) {
      const date = new Date(cellInfo.value);
      const dateFormat = sessionStorage.getItem('dateFormat') || 'MM/DD/YYYY';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); 
      const year = String(date.getFullYear());
      let formattedDate = dateFormat
        .replace('dd', day)
        .replace('mm', month)
        .replace('yyyy', year)
        .replace('yy', year.slice(-2));
      cellElement.innerText = formattedDate;
    } else {
      cellElement.innerText = '';
    }
  }

  selectPromotionWorksheet(worksheetId: number) {
    this.dataservice.selectPromotionWorksheet(worksheetId).subscribe((response: any) => {
      const ws = this.promotionLogList.find(worksheet => worksheet.ID == response.ID)
      this.status = ws.Status
      if(this.status == 'Approved' ){
        this.goToView(worksheetId)
        return;
      }
      if(this.status == 'Verified'){
        if(this.AllowCommitWithSave){
          console.log(this.status, "SELECT RESPONSE");
          this.selectedPromotion = response; 
          this.dataservice.setWorksheetData(response);
          this.router.navigate(['/promotion-edit']);
        }else{
          this.goToView(worksheetId)
        }
      }
      console.log(this.status, "SELECT RESPONSE");
      this.selectedPromotion = response; 
      this.dataservice.setWorksheetData(response);
      this.router.navigate(['/promotion-edit']);
    });
  }

  goToView(worksheetId:number){
    this.dataservice
    .selectPromotionWorksheet(worksheetId)
    .subscribe((response: any) => {
      const ws = this.promotionLogList.find(worksheet => worksheet.ID == response.ID)
      this.status = ws.Status
      this.selectedPromotion = { ...response, status: this.status };
      this.dataservice.setWorksheetData(this.selectedPromotion);
      console.log('Navigating to view page with:', {
        worksheetData: this.selectedPromotion,
      });
      this.router.navigate(['/promotion-view'], {
        state: { 
          worksheetData: this.selectedPromotion, 
        },
      });
      
    });
  }
  

  openEditingStart(event: any){
    event.cancel = true;
    const selectedId = event.data.ID;
    console.log('Edit row triggered for ID:', selectedId);
    if(selectedId){
      this.selectPromotionWorksheet(selectedId)
    }else{
      console.log("No valid row selected")
    }
  }

  onAddClick(){
    this.router.navigate(['/promotion'])
  }

  onVerifyClick(e: any) {
    if(this.AllowCommitWithSave){
      console.log('Verify Button clicked');
      const rowData = e.row.data; // Access the row data
      e.row.data.isVerified = true;
      const worksheetId = rowData?.ID;
      console.log('Row ID:', worksheetId);
      if (worksheetId) {
        this.verifyWorksheetById(worksheetId, e);
      } else {
        console.warn('Worksheet ID is invalid.');
      }
    }

  }

  verifyWorksheetById(worksheetId: number, e: any) {
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }
    this.dataservice.selectPromotionWorksheet(worksheetId).subscribe((response:any) => {
      this.selectedPromotion = response
      console.log(this.selectedPromotion,"SELECTEDPROMOTION-verify")
      this.dataservice.setWorksheetData(response);
      this.router.navigate(['/promotion-verify'],{
        state: { 
          worksheetData: this.selectedPromotion, 
          status: status,
        },
      })
    })

  }

  onApproveClick(e:any){
    if(this.AllowCommitWithSave){
      console.log('approve Button clicked');
      const rowData = e.row.data; // Access the row data
      e.row.data.isVerified = true;
      const worksheetId = rowData?.ID;
      console.log('Row ID:', worksheetId);
      if (worksheetId) {
        this.approveWorksheetById(worksheetId, e);
      } else {
        console.warn('Worksheet ID is invalid.');
      }
    }
  }




  approveWorksheetById(worksheetId: number, e: any){
    console.log(worksheetId,"forapprove")
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }
    this.dataservice.selectPromotionWorksheet(worksheetId).subscribe((response:any) => {
      this.selectedPromotion = response
      console.log(this.selectedPromotion,"SELECTEDPROMOTION")
      this.dataservice.setWorksheetData(response);
      this.router.navigate(['/promotion-approve'],{
        state: { 
          worksheetData: this.selectedPromotion, 
          status: status,
        },
      })
    })
  }

  onRowRemoving(event:any){
    const selectedRow = event.data; // Get the data of the selected row
    const id = selectedRow.ID;
    this.dataservice.delete(id).subscribe((response) => {
      if(response){
        notify(
          {
            message: 'Worksheet Deleted Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
      }else{
        notify(
          {
            message: 'Worksheet is not deleted',
            position: { at: 'top center', my: 'top center' },
          },
          'error'
        )
      }
    })
  }
    
}


@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    ItemsFormModule,
    DxTabsModule,
    DxTemplateModule,
    DxoFormItemModule,
    DxToolbarModule,
    DxRadioGroupModule,
    DxPopupModule,
    DxTagBoxModule,
    DxNumberBoxModule,
    DxValidationGroupModule,
    DxValidatorModule
  ],
  providers: [],
  exports: [],
  declarations: [PromotionLogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PromotionLogModule {}
