import { Component,NgModule,ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { AuthService, DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import notify from 'devextreme/ui/notify';
import { DxPopupModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { ItemProperty1FormComponent, ItemProperty1FormModule } from 'src/app/components/library/item-property1-form/item-property1-form.component';
import { ExportService } from 'src/app/services/export.service';
import { ItemProperty1EditModule } from 'src/app/components/library/item-property1-edit/item-property1-edit.component';

@Component({
  selector: 'app-item-property1-list',
  templateUrl: './item-property1-list.component.html',
  styleUrls: ['./item-property1-list.component.scss']
})
export class ItemProperty1ListComponent {
  @ViewChild(ItemProperty1FormComponent) itemproperty1Component: ItemProperty1FormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

   readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  itemproperty1:any=[]
  isItemProperty1PopupOpened=false;
  itemlabel:any;
  showFilterRow=true;
  isReadOnly:boolean=false
  showHeaderFilter=true;
  isFilterRowVisible: boolean = false;
  isEditItemProperty1PopupOpened:boolean=false
  selected_data: any=[]
    sessionData : any;
  ITEM_PROPERTY1 : any;
  ITEM_PROPERTY2 : any;
  ITEM_PROPERTY3 : any;
  ITEM_PROPERTY4 : any;
  ITEM_PROPERTY5 : any;
  constructor(private dataservice:DataService,authservice:AuthService,private exportService: ExportService,private ngZone: NgZone,private cdr: ChangeDetectorRef){
     this.itemlabel=authservice.getsettingsData().ITEM_PROPERTY1;
     this.sesstion_Details()
  }
  
  addItemProperty1(){
    this.isItemProperty1PopupOpened=true;
  }
  onExporting(event: any) {
    this.exportService.onExporting(event,`${this.itemlabel}-list`);
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
      this.ngZone.run(() => this.addItemProperty1());
    },
    
    elementAttr: { class: 'add-button' },    
  };
  
  showItemProperty1(){
     this.dataservice.getItemProperty1Data().subscribe(
      (response)=>{
            this.itemproperty1=response;
            console.log(response);
            console.log('item label',this.itemlabel);
      }
     )
  }
  onClickSaveItemProperty1(){
    const { CODE, DESCRIPTION, COMPANY_ID } =this.itemproperty1Component.getNewItemProperty1Data();
    console.log('inserted data',CODE, DESCRIPTION, COMPANY_ID);
    
 // Check for duplicates in CategoryList
 
    const isCodeDuplicate = this.itemproperty1.some(
      // (item: any) => item.CODE === commonDetails.code
        (item: any) => item.CODE.toLowerCase() ===CODE.toLowerCase()
    );

    const isDescriptionDuplicate = this.itemproperty1.some(
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
    this.dataservice.postItemProperty1Data(CODE,DESCRIPTION,COMPANY_ID).subscribe(
      (response)=>{
        if(response){
          this.showItemProperty1();
          this.isItemProperty1PopupOpened=false
          notify(
          {
            message: 'Insert operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );
        }
      }
    )

  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, DESCRIPTION, COMPANY_ID } = selectedRow;
    
    this.dataservice.removeItemProperty1(ID, CODE, DESCRIPTION, COMPANY_ID).subscribe(() => {
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
        this.showItemProperty1();
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
  refresh(){
      this.dataGrid.instance.refresh();
      this.showItemProperty1();

  }
    handleClose(){
    this.isEditItemProperty1PopupOpened=false
    this.isItemProperty1PopupOpened=false
    this.showItemProperty1()
  }

  ngOnInit(): void {
    this.showItemProperty1();
  }
  OnEditingStartItem1(event:any){
    event.cancel=true
    this.isEditItemProperty1PopupOpened=true
    const id=event.data.ID
    this.dataservice.select_item_property1(id).subscribe((res:any)=>{
      this.selected_data=res
    })
  }
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,ItemProperty1FormModule,DxPopupModule,CommonModule,ItemProperty1EditModule,DxPopupModule
  ],
  providers: [],
  exports: [],
  declarations: [ItemProperty1ListComponent],
})
export class ItemProperty1ListModule{}
