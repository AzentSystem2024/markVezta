import { Component,OnInit,NgModule, ViewChild } from '@angular/core';
import { DxButtonModule, DxPopupModule } from 'devextreme-angular';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { ReasonsFormComponent, ReasonsFormModule } from 'src/app/components/library/reasons-form/reasons-form.component';
import notify from 'devextreme/ui/notify';
import { LandedCostFormComponent } from 'src/app/components/library/landed-cost-form/landed-cost-form.component';
import { Console } from 'console';
import { ExportService } from 'src/app/services/export.service';
import { ReasonEditModule } from 'src/app/components/library/reason-edit/reason-edit/reason-edit.component';
@Component({
  selector: 'app-reasons-list',
  templateUrl: './reasons-list.component.html',
  styleUrls: ['./reasons-list.component.scss']
})
export class ReasonsListComponent {
  @ViewChild(ReasonsFormComponent) reasonComponent: ReasonsFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

   readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  customer:any;
  reasons:any;
  stores:any;
  reasontype:any;
  discounttype:any;
  isAddReasonsPopupOpened=false;
  selectedRows:any[]=[];
  showFilterRow=true;
  showHeaderFilter=true;
  isEditReasonsPopupOpened:boolean=false
  selected_Data: any;
  constructor(private dataservice:DataService,private exportService: ExportService
    ){
    this.dataservice.getDropdownData('REASONTYPES').subscribe(data => {
      this.reasontype=data;
    });
    this.dataservice.getDropdownData('DISCOUNTTYPE').subscribe(data => {
      this.discounttype=data;
    });
    dataservice.getDropdownData('STORE').subscribe(data => {
      this.stores=data;
    });
   
    
  }
  onExporting(event: any) {
    this.exportService.onExporting(event,'Reasons-list');
  }
  addReasons(){
    this.isAddReasonsPopupOpened=true;
  }
  
  showReasons(){
     this.dataservice.getReasonsData().subscribe(
      (response)=>{
            this.reasons=response;
            console.log(response);
            console.log('type',this.reasontype);
      }
     )
  }
  OnEditingStartReason(e:any){
    e.cancel=true
    const id=e.data.ID
    this.isEditReasonsPopupOpened=true
    this.dataservice.select_reason(id).subscribe((res:any)=>{
      console.log(res,'=============selected data===============================')
      this.selected_Data=res
    })
  }
  handleClose(){
    this.isEditReasonsPopupOpened=false
    this.showReasons()

  }
  onSelectionChanged(e: any) {
    e.selectedRowKeys;
  }
  onClickSaveReasons(){


    const {CODE,DESCRIPTION,ARABIC_DESCRIPTION,START_DATE,END_DATE,REASON_TYPE,DISCOUNT_TYPE,AC_HEAD_ID,COMPANY_ID,DISCOUNT_PERCENT,REASON_STORES} =this.reasonComponent.getNewReasonsData();
    console.log('inserted data',CODE,DESCRIPTION,ARABIC_DESCRIPTION,START_DATE,END_DATE,REASON_TYPE,DISCOUNT_TYPE,DISCOUNT_PERCENT,REASON_STORES,COMPANY_ID);
    
        // Check for duplicates in CategoryList
        const isCodeDuplicate = this.reasons.some(
          // (item: any) => item.CODE === commonDetails.code
            (item: any) => item.CODE.toLowerCase() ===CODE.toLowerCase()
        );
    
        const isDescriptionDuplicate = this.reasons.some(
          // (item: any) => item.DESCRIPTION === commonDetails.category
                (item: any) =>
        item.DESCRIPTION.toLowerCase() === DESCRIPTION.toLowerCase()
        );
    
        if (isCodeDuplicate && isDescriptionDuplicate) {
          notify(
            {
              message: 'Both Code and Description already exist',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'error'
          );
          return;
        } else if (isCodeDuplicate) {
          notify(
            {
              message: 'This Code already exists',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'error'
          );
          return;
        } else if (isDescriptionDuplicate) {
          notify(
            {
              message: 'This Description already exists',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'error'
          );
          return;
        }

        if(REASON_STORES)
    
    this.dataservice.postReasonData(CODE,DESCRIPTION,ARABIC_DESCRIPTION,START_DATE,END_DATE,REASON_TYPE,DISCOUNT_TYPE,AC_HEAD_ID,DISCOUNT_PERCENT,REASON_STORES,COMPANY_ID).subscribe(
      (response)=>{
        if(response){
          this.showReasons();
          this.isAddReasonsPopupOpened=false


            notify(
            {
              message: 'The Reason Inserted Successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'error'
          );
        }
      }
    )

  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE,DESCRIPTION,ARABIC_DESCRIPTION,START_DATE,END_DATE,REASON_TYPE,DISCOUNT_TYPE,DISCOUNT_PERCENT,REASON_STORES } = selectedRow;
    
    this.dataservice.removeReasons( ID, CODE,DESCRIPTION,ARABIC_DESCRIPTION,START_DATE,END_DATE,REASON_TYPE,DISCOUNT_TYPE,DISCOUNT_PERCENT,REASON_STORES).subscribe(() => {
      try {
        // Your delete logic here
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );
        this.dataGrid.instance.refresh();
        this.showReasons();
      } catch (error) {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    });
  }
  ngOnInit(): void {
    this.showReasons();
  }
  onValueChangedReason(event:any) {
    console.log('customer',event);
    if(event.value===1){
    this.customer=true;
  }else{
    this.customer=false;
  }
  }
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,ReasonsFormModule,ReasonEditModule,DxPopupModule
  ],
  providers: [],
  exports: [],
  declarations: [ReasonsListComponent],
})
export class ReasonsListModule{}