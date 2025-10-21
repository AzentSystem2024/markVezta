import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgModule, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DxDataGridModule, DxButtonModule, DxToolbarModule, DxSelectBoxModule, DxPopupModule, DxCheckBoxModule } from 'devextreme-angular';
import { DxReportDesignerComponent, DxReportDesignerModule,DxReportViewerModule } from 'devexpress-reporting-angular';
import { ActionId } from 'devexpress-reporting/dx-reportdesigner'
import * as ko from 'knockout';
import { DataService } from 'src/app/services';
import { ChangeDetectorRef } from '@angular/core';
import notify from 'devextreme/ui/notify';
import { PreviewElements } from "devexpress-reporting/dx-webdocumentviewer"
import { troubleshootingPageWrapper } from '@devexpress/analytics-core/analytics-internal';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-document-templates-list',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './document-templates-list.component.html',
  styleUrls: ['./document-templates-list.component.scss',
  "../../../../../node_modules/ace-builds/css/ace.css",
  "../../../../../node_modules/ace-builds/css/theme/dreamweaver.css",
  "../../../../../node_modules/ace-builds/css/theme/ambiance.css",
  "../../../../../node_modules/devexpress-richedit/dist/dx.richedit.css",
  "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.common.css",
  "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.light.css",
  "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-querybuilder.css",
  "../../../../../node_modules/devexpress-reporting/dist/css/dx-webdocumentviewer.css",
  "../../../../../node_modules/devexpress-reporting/dist/css/dx-reportdesigner.css"]
})

export class DocumentTemplatesListComponent implements OnInit{
  @ViewChild(DxReportDesignerComponent, {static:false}) design !: DxReportDesignerComponent;
  @ViewChild('paramValue',{static :false})
  public paramValue!:ElementRef;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons: boolean = true;
  showReportDesigner:boolean = false;
  showDocumentDropdown:boolean = false;
  selectedRowData: any = null;
  isDefaultPopupVisible:boolean = false;
  editPopupTemplate:boolean=false;

  title = 'DXReportDesignerSample';
  id:any;
  companyId=1;
  doc_type_id=1;
  user_id:any;
  selectedDocument:any=null;
  doc_id:any;
  list_id:any;
  DocumentList:any;
  gridFilter: any = null;
  
 
    getDesignerModelAction :any;
    getEditDesignerModelAction:any;
    getViewModelAction = "WebDocumentViewer/Invoke"
    poId=2;
    poDetails:any;
    


    reportName = "Report";
    flag:boolean=false;
    editflag:boolean=false;
    editreportName ="Report";
    // The backend application URL.
    host = 'http://localhost:49834/';
    documentOptions = ['Purchase Order', 'Purchase Invoice', 'Purchase Return'];
    DataSource:any;
    filteredDataSource:any;

    allButtonsEditDelete = [
      {
        name: 'edit',
        visible: true, 
        onClick: (e) => this.onViewClick(e),
      },
      {
        name: 'delete',
        visible: true, 
      },
    ];

    constructor(private service:DataService,private changeDetectorRef: ChangeDetectorRef,private http: HttpClient){}

    getDocumentDropDownList(){
      this.service.getDropdownData('TEMPLATE_TYPE').subscribe(res=>{
        this.DocumentList = res.sort((a: any, b: any) => 
        a.DESCRIPTION.localeCompare(b.DESCRIPTION) 
    );
    // Pre-select the first item in the sorted list
    if (this.DocumentList.length > 0) {
      this.selectedDocument = this.DocumentList[0].ID;
    }
      })
    }

    onDocumentSelected(event: any): void {
      this.selectedDocument=null;
      this.flag=false;
      this.selectedDocument = event.value; // Update the selected document
      console.log(this.selectedDocument,"selectedDocument")
      if(this.selectedDocument){
        this.filteredDataSource = this.DataSource.filter(
          (item) => item.DOC_TYPE_ID === this.selectedDocument
        );
        this.getDesignerModelAction = `ReportDesigner/GetReportDesignerModel?companyId=${this.companyId}&doc_type_id=${this.selectedDocument}&user_id=${this.user_id}`;        setTimeout(() => {
          this.flag = true;
          this.changeDetectorRef.detectChanges();
        }, 0);
      }
      else{
        this.filteredDataSource = [...this.DataSource];
      }
    
    }

    openPopUp() {
      if (this.selectedDocument) {
        this.showReportDesigner = true;
      } else {
        // Show notification message if no document is selected
        notify(
          {
            message: 'Please Select a Document',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    }

    applyDocument(){
      if (this.selectedDocument) {
        console.log('Selected Document:', this.selectedDocument);
        this.showDocumentDropdown = false; // Close the popup after applying
        this.showReportDesigner=true;
      } else {
        alert('Please select a document');
      }
    }

    onDesignerContentReady(event: any): void {
      console.log(event, "content ready");
  
      const data=event.sender?._designerModel?.().tabPanel.collapsed;
      console.log(data,"data")

  }

  ReportSaving(event) {
    console.log(event, "saving");

    // // Retrieve the doc_type_id value
    // const doc_type_id = this.doc_type_id; // Replace with your actual source of doc_type_id

    // // Create a custom options object
    // const customSaveOptions = {
    //   doc_type_id: doc_type_id,
    //     userID:this.user_id
    // };

    // console.log(customSaveOptions,"customSaveOptions")

    // // Convert the object to a JSON string
    // const saveOptionsString = JSON.stringify(customSaveOptions);

    // console.log(saveOptionsString,"saveOption");

    // // Call the SaveNewReport method with the stringified options
    // this.design.bindingSender.SaveNewReport(saveOptionsString);

    // Perform additional actions after saving
    this.showReportDesigner = false;
    this.flag=false;
    this.editflag=false;
    this.getDocumentTemplateList();
}

    CustomizeMenuActions(event) {
      console.log(event,"event menu")
      // event.args.Actions.push({
      //   text: "Custom dropdown toolbar item",
      //   disabled: false,
      //   visible: true,
      // //  clickAction: function () {
  
      // //   },  
      //   templateName: "custom-toolbarItem-template",
      //   items: ["item1", "item2", "item3"],
      //   //currentValue: "item2"
      // });
      // console.log(event.args.Actions)

      
      // Hide the "NewReport" and "OpenReport" actions. 
      // var newreportAction = event.args.GetById(ActionId.NewReport);
      // if (newreportAction)
      //     newreportAction.visible = false;
      var openAction = event.args.GetById(ActionId.OpenReport);
      if (openAction)
          openAction.visible = false;  
  }

  CustomizeSaveDialog(event){
    console.log(event,"customize save dialog");
  }
  
  CustomizeElements(event){
    console.log(event,"event customize element")
    // var rightPanel = event.args.GetById(PreviewElements.RightPanel);
    //     var index = event.args.Elements.indexOf(rightPanel);
    //     event.args.Elements.splice(index, 1);

  }
  OnCustomizeSaveDialog(event) {
    console.log(event,"save event")
    event.args.Popup.width("500px");
    event.args.Popup.height("200px");
    event.args.Popup.title = "Save";
    var koUrl = ko.observable("");
    var model = {
        setUrl: function (url) {
            koUrl(url);
        },
        getUrl: function () {
            return koUrl();
        },
        onShow: function (tab) { },
        popupButtons: [
            {
                toolbar: 'bottom', location: 'after', widget: 'dxButton', options: {
                    text: 'Yes', onClick: function () {
                        event.args.Popup.save(koUrl());
                    }
                }
            },
            {
                toolbar: 'bottom', location: 'after', widget: 'dxButton', options: {
                    text: 'No', onClick: function () {
                        event.args.Popup.cancel(koUrl());
                    }
                }
            },
        ]
    }
    event.args.Customize("save-this", model)
}

getFullDocumentTemplateList(){
  this.service.geDocumentTemplateList().subscribe((res:any)=>{
    this.filteredDataSource=res.data;
    console.log(this.DataSource,"Document log list");
  })
}

getDocumentTemplateList(){
  this.service.geDocumentTemplateList().subscribe((res:any)=>{
    this.DataSource=res.data;
    console.log(this.DataSource,"Document log list");
    this.filteredDataSource = this.DataSource.filter(
      (item) => item.DOC_TYPE_ID === this.selectedDocument
    );
  })
}
onCellValueChanged(event) {
  console.log(event,"event")
  const newData = event.newData as any;  
  
  console.log(newData)
  if (event.newData.IS_DEFAULT == true) {
    this.doc_id=event.key.DOC_TYPE_ID;
    this.list_id=event.key.ID;
    this.selectedRowData = event.data; // Store the selected row data
    this.isDefaultPopupVisible = true; // Show the popup
  }
  else{
    this.isDefaultPopupVisible = false;
    console.log('false');
  }
}

SaveDefault(){
  const data={
    DOC_TYPE_ID:this.doc_id,
    ID:this.list_id
  }
  this.service.saveDocumentDefaultTemplate(data).subscribe(res=>{
    if(res.flag==1){
      this.isDefaultPopupVisible=false;
      
      this.getDocumentTemplateList();
    }  
  })
}

CancelDefault(){
  this.isDefaultPopupVisible=false;
  this.getDocumentTemplateList();
}

ngOnInit(): void {
  this.getDocumentTemplateList();
  this.getDocumentDropDownList();
  this.user_id = sessionStorage.getItem('UserId');
}

formatTime(rowData: any): string { 
  const celldate = rowData.LOG_TIME;

  if (!celldate) return '';

  // Parse the UTC date string
  const date = new Date(celldate + 'Z'); // Add 'Z' to indicate UTC

  // Format the date using the user's system locale
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }); // e.g., 12/24/2024

  // Format the time using the user's system locale
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // Ensures 12-hour format with AM/PM
  }); // e.g., 11:49:38 AM

  return `${formattedDate} ${formattedTime}`; // Combine time and date
}

onViewClick = (e) => {
  this.getEditDesignerModelAction = '';
  this.editflag = false;

  
  console.log(e);

  // Extract row data
  const id = e.row.key.ID;
  console.log(id,"id")
  const DOC_TYPE_ID = e.row.key.DOC_TYPE_ID;
  const IS_DEFAULT = e.row.key.IS_DEFAULT;

  // Update properties with the current row's data
  this.editreportName = e.row.key.TEMPLATE_NAME;
  this.editflag = true;

  // Update the action URL with the current row's data
  const timestamp = new Date().getTime();
  this.getEditDesignerModelAction = `ReportDesigner/GetEditReportDesignerModel?id=${id}&companyId=${this.companyId}&doc_type_id=${DOC_TYPE_ID}&user_id=${this.user_id}&is_default=${IS_DEFAULT}&_=${timestamp}`;

  console.log('Updated Action:', this.getEditDesignerModelAction);

  // Forcefully close the popup if it's open
  this.editPopupTemplate = false;

  // Use a short delay to ensure Angular's change detection picks up the update
  setTimeout(() => {
    this.editPopupTemplate = true;
    this.changeDetectorRef.detectChanges(); // Trigger change detection explicitly
  }, 0); // Use a slight delay to allow state reset
}

handlePopupClose(){
  console.log("popupclosed")
//   this.http.post<any>('http://localhost:49834/ReportDesigner/DeleteId' , {
//     headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*'
//     })
// })
//   .subscribe(
//     response => {
//      console.log(response)
//     },
//     error => {
//       console.error('Error while calling DeleteId:', error);
//     }
//   );
this.editflag = false;
console.log(this.selectedDocument,"selectedDocument")
this.getDocumentTemplateList();
console.log(this.DataSource,"datasource");

} 
}

@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,DxToolbarModule,DxSelectBoxModule,CommonModule,
    DxPopupModule,DxReportDesignerModule,DxReportViewerModule,DxSelectBoxModule,DxCheckBoxModule
  ],
  providers: [],
  exports: [],
  declarations: [DocumentTemplatesListComponent],
})
export class DocumentTemplatesListModule {}