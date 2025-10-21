import { Component,OnInit,NgModule,ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { DxButtonModule, DxPopupModule } from 'devextreme-angular';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { VatClassFormModule } from 'src/app/components/library/vat-class-form/vat-class-form.component';
import { VatClassFormComponent } from 'src/app/components/library/vat-class-form/vat-class-form.component'; 
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';
import { VatClassEditModule } from '../vat-class-edit/vat-class-edit.component';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-vat-class-list',
  templateUrl: './vat-class-list.component.html',
  styleUrls: ['./vat-class-list.component.scss']
})
export class VatClassListComponent {
  @ViewChild(VatClassFormComponent) vatclassComponent: VatClassFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

   readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  vatclass:any;
  isAddVatclassPopupOpened=false;
     isFilterRowVisible: boolean = false;
  showFilterRow=true;
  showHeaderFilter=true;
  select_Data: Object;
  isEditVatclassPopupOpened: boolean;
  selected_data: Object;
  constructor(private dataservice:DataService,private exportService: ExportService,private ngZone: NgZone,private cdr: ChangeDetectorRef
    ){}
  onExporting(event: any) {
    this.exportService.onExporting(event,'VAT_class-list');
  }
  addVatclass(){
    this.isAddVatclassPopupOpened=true;
  }
  
  showVatclass(){
     this.dataservice.getVatclassData().subscribe(
      (response)=>{
            this.vatclass=response;
            console.log(response);
      }
     )
  }

            toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

    addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
  
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addVatclass());
    },
    
    elementAttr: { class: 'add-button' },    
  };

  onClickSaveVatclass(){
    const { CODE,VAT_NAME,VAT_PERC } =this.vatclassComponent.getNewVatclassData();
    console.log('inserted data',CODE, VAT_NAME,VAT_PERC);
    this.dataservice.postVatclassData(CODE,VAT_NAME,VAT_PERC).subscribe(
      (response)=>{
        if(response){
          this.showVatclass();
        }
      }
    )

  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, VAT_NAME,VAT_PERC } = selectedRow;
    
    this.dataservice.removeVatclass(ID, CODE, VAT_NAME,VAT_PERC ).subscribe(() => {
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
        this.showVatclass();
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
  OnEditingStartVatReturn(event:any){
event.cancel = true; // Prevent the default editing behavior
    const id=event.data.ID;
this.dataservice.select_Vatclass_Data(id).subscribe(
  (response)=>{
    console.log(response,"selected data")
this.selected_data=response
    this.isEditVatclassPopupOpened=true;
  }
)

  }
    refresh(){
      this.dataGrid.instance.refresh();
      this.showVatclass();

  }
  handleClose(){
    this.isAddVatclassPopupOpened=false;
    this.isEditVatclassPopupOpened=false;
    this.vatclassComponent.formVatclassData = {
      CODE: '',
      VAT_NAME: '',
      VAT_PERC: ''
    };
    this.dataGrid.instance.refresh();
    this.showVatclass();
  }
  // onRowUpdating(event) {
  //   const updataDate = event.newData;
  //   const oldData = event.oldData;
  //   const combinedData = { ...oldData, ...updataDate };
  //   let id = combinedData.ID;
  //   let code = combinedData.CODE;
  //   let vatname = combinedData.VAT_NAME;
  //   let vatclass = combinedData.CAT_ID;
   

  //   this.dataservice
  //     .updateVatclass(id, code, vatname,vatclass)
  //     .subscribe((data: any) => {
  //       if (data) {
  //         notify(
  //           {
  //             message: 'Vat Class Updated Successfully',
  //             position: { at: 'top center', my: 'top center' },
  //           },
  //           'success'
  //         );
  //         this.dataGrid.instance.refresh();
  //         this.showVatclass();
  //       } else {
  //         notify(
  //           {
  //             message: 'Your Data Not Saved',
  //             position: { at: 'top right', my: 'top right' },
  //           },
  //           'error'
  //         );
  //       }
  //     });
  //   console.log('old data:', oldData);
  //   console.log('new data:', updataDate);
  //   console.log('modified data:', combinedData);

  //   event.cancel = true; // Prevent the default update operation
  // }

  ngOnInit(): void {
    this.showVatclass();
  }
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,VatClassFormModule,VatClassEditModule,CommonModule,DxPopupModule
  ],
  providers: [],
  exports: [],
  declarations: [VatClassListComponent],
})
export class VatClassListModule{}

