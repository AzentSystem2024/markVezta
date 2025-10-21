import { Component,OnInit,NgModule,ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { AuthService, DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import notify from 'devextreme/ui/notify';
import { DxPopupModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { ItemProperty1FormModule,ItemProperty1FormComponent } from 'src/app/components/library/item-property1-form/item-property1-form.component';
import { ExportService } from 'src/app/services/export.service';
import { ItemProperty2EditModule } from 'src/app/components/library/item-property2-edit/item-property2-edit.component';
@Component({
  selector: 'app-item-property2-list',
  templateUrl: './item-property2-list.component.html',
  styleUrls: ['./item-property2-list.component.scss']
})
export class ItemProperty2ListComponent {
  @ViewChild(ItemProperty1FormComponent) itemproperty1Component: ItemProperty1FormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

   readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  itemproperty2:any;
  isItemProperty2PopupOpened=false;
  itemlabel:any;
  showFilterRow=true;
  showHeaderFilter=true;
  isEditItemProperty2PopupOpened:boolean=false
  isFilterRowVisible: boolean = false;
  selected_data: any=[];
     sessionData : any;
  ITEM_PROPERTY1 : any;
  ITEM_PROPERTY2 : any;
  ITEM_PROPERTY3 : any;
  ITEM_PROPERTY4 : any;
  ITEM_PROPERTY5 : any;
  constructor(private dataservice:DataService,authservice:AuthService,private exportService: ExportService,private ngZone: NgZone,private cdr: ChangeDetectorRef){
    this.itemlabel=authservice.getsettingsData().ITEM_PROPERTY2;
    this.sesstion_Details()
  }
      sesstion_Details(){
     this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(this.sessionData,'=================session data==========')

    this.ITEM_PROPERTY1=this.sessionData.GeneralSettings.ITEM_PROPERTY1
    console.log(this.ITEM_PROPERTY1,'============ITEM_PROPERTY1==============')

    this.ITEM_PROPERTY2=this.sessionData.GeneralSettings.ITEM_PROPERTY2
    console.log(this.ITEM_PROPERTY2,'============ITEM_PROPERTY2==============')

    this.ITEM_PROPERTY3=this.sessionData.GeneralSettings.ITEM_PROPERTY3
    console.log(this.ITEM_PROPERTY3,'============ITEM_PROPERTY3==============')

    this.ITEM_PROPERTY4=this.sessionData.GeneralSettings.ITEM_PROPERTY4
    console.log(this.ITEM_PROPERTY4,'============ITEM_PROPERTY4==============')

    this.ITEM_PROPERTY5=this.sessionData.GeneralSettings.ITEM_PROPERTY5
    console.log(this.ITEM_PROPERTY5,'============ITEM_PROPERTY5==============')


}

  onExporting(event: any) {
    this.exportService.onExporting(event,`${this.itemlabel}-list`);
  }
  
  addItemProperty2(){
    this.isItemProperty2PopupOpened=true;
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
      this.ngZone.run(() => this.addItemProperty2());
    },
    
    elementAttr: { class: 'add-button' },    
  };
  
  showItemProperty2(){
     this.dataservice.getItemProperty2Data().subscribe(
      (response)=>{
            this.itemproperty2=response;
            console.log(response);
      }
     )
  }
  onClickSaveItemProperty2(){
    const { CODE, DESCRIPTION, COMPANY_ID } =this.itemproperty1Component.getNewItemProperty1Data();
    console.log('inserted data',CODE, DESCRIPTION, COMPANY_ID);
       
 // Check for duplicates in CategoryList
    const isCodeDuplicate = this.itemproperty2.some(
      // (item: any) => item.CODE === commonDetails.code
        (item: any) => item.CODE.toLowerCase() ===CODE.toLowerCase()
    );

    const isDescriptionDuplicate = this.itemproperty2.some(
      // (item: any) => item.DESCRIPTION === commonDetails.category
            (item: any) =>
    item.DESCRIPTION.toLowerCase() === DESCRIPTION.toLowerCase()
    );

    

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and category already exist',
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
    this.dataservice.postItemProperty2Data(CODE,DESCRIPTION,COMPANY_ID).subscribe(
      (response)=>{
        if(response){
          this.showItemProperty2();
           this.isItemProperty2PopupOpened=false
           notify(
        {
          message: ' Insert operation successfull',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'success'
      );
        }
      }
    )

  }
    refresh(){
      this.dataGrid.instance.refresh();
      this.showItemProperty2();

  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, DESCRIPTION, COMPANY_ID } = selectedRow;
    
    this.dataservice.removeItemProperty2(ID, CODE, DESCRIPTION, COMPANY_ID).subscribe(() => {
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
        this.showItemProperty2();
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
onEditingStartproperty2(event:any){
  event.cancel=true
  this.isEditItemProperty2PopupOpened=true
  const id= event.data.ID
  this.dataservice.select_item_property2(id).subscribe((res:any)=>{
    console.log(res)
    this.selected_data=res
  })
}
  ngOnInit(): void {
    this.showItemProperty2();
  }
  handleClose(){
    this.isItemProperty2PopupOpened=false
    this.isEditItemProperty2PopupOpened=false
    this.showItemProperty2()
  }
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,ItemProperty1FormModule,DxPopupModule,CommonModule,ItemProperty2EditModule
  ],
  providers: [],
  exports: [],
  declarations: [ItemProperty2ListComponent],
})
export class ItemProperty2ListModule{}

