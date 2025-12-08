import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss']
})
export class SettingsListComponent {
    @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
    isReadOnly: boolean = false;
DOcList:any[]=[]
displayMode
isFilterRowVisible:boolean=false
showPageSizeSelector
allowedPageSizes
itemproperty3
sessionData: any;
selectedCompany: any;
finId: any;
user_id: any;
refreshButtonOptions = {
icon: 'refresh',
hint: 'Refresh',
onClick: () => this.refreshGrid(),
text: '',
  };
   addButtonOptions = {
    text: 'Save',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Save',
    onClick: () => this.Savedata(),
    elementAttr: { class: 'add-button' }
  };
  trans_id: any;
constructor(private service:DataService,private cdr:ChangeDetectorRef){

 
this.sessionData_tax()

}
//=================session data================
sessionData_tax() {
     console.log('working')
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
     this.selectedCompany = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
 console.log(this.selectedCompany)
 this.finId=this.sessionData.FINANCIAL_YEARS[0].FIN_ID
 this.user_id=this.sessionData.USER_ID
this.getlist()



  }



  //================api for Serial number validation=================

Doc_serial_no(){
  const payload={
    COMPANY_ID:this.selectedCompany,
  TRANS_TYPE: this.trans_id

  }
  this.service.Doc_Last_SNo(payload).subscribe((res:any)=>{
    console.log(res)
  })
}

//========================list for doc settings========================
  getlist(){
  const payload={
  COMPANY_ID:this.selectedCompany,
  }

  this.service.List_setting(payload).subscribe((res:any)=>{
    console.log(res)
    this.DOcList=res.Data

  })

  }
  //=========================grid refresh with call list==========================

    refreshGrid(){
          if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
       // Or reload data from API if needed
       this.getlist()
      
    }
  }
// ====================================hide and shwo filter=====================
    toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };


  // /===============

onEditorPreparing(e: any) {
  if (e.parentType === "dataRow" && e.dataField === "START") {

    const row = e.row?.data;

    if (row.LAST_NO == "0") {
      e.editorOptions.readOnly = false;   // Editable
    } else {
      e.editorOptions.readOnly = true;    // Not editable
    }
  }
}




//=====================Save function======================================
Savedata(){
  console.log(this.DOcList)
  const docValues = this.DOcList.map(item => ({
  TRANS_TYPE: item.ID,
  GROUP_CODE: item.CODE,
  PREFIX: item.PREFIX,
  START: item.START,
  WIDTH: item.WIDTH,
  VERIFY_REQUIRED: item.VERIFY_REQUIRED??false
}));
const payload={
COMPANY_ID: this.selectedCompany,
  FIN_ID: this.finId,
  USER_ID: this.user_id,
  DOC_SETTINGS: docValues

}
  this.service.Add_setting(payload).subscribe((res:any)=>{
    console.log(res)

    this.getlist()

     notify(
            {
              message: 'Inserted successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
  })
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
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
 
  ],
  providers: [],
  declarations: [SettingsListComponent],
  exports: [SettingsListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsListModule {}

