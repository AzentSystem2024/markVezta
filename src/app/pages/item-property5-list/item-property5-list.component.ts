import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, NgZone, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxPopupModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { ItemProperty5EditModule } from 'src/app/components/library/item-property5-edit/item-property5-edit.component';
import { ItemProperty5FormComponent, ItemProperty5FormModule } from 'src/app/components/library/item-property5-form/item-property5-form.component';
import { AuthService, DataService } from 'src/app/services';

@Component({
  selector: 'app-item-property5-list',
  templateUrl: './item-property5-list.component.html',
  styleUrls: ['./item-property5-list.component.scss']
})
export class ItemProperty5ListComponent {

  @ViewChild(ItemProperty5FormComponent) ItemProperty5FormComponent: ItemProperty5FormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  itemproperty5:any;
  isItemProperty5PopupOpened=false;
  itemlabel:any;
   isFilterRowVisible: boolean = false;
    readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
isEditItemProperty5PopupOpened:boolean=false
  selected_data: any;
  constructor(private dataservice:DataService,authservice:AuthService,private ngZone: NgZone,private cdr: ChangeDetectorRef){
    this.itemlabel=authservice.getsettingsData().ITEM_PROPERTY5;
  }

  ngOnInit(){
    this.listItemProperty5()
  }
OnEditingStartItem(e:any){

  e.cancel=true
 this.isEditItemProperty5PopupOpened=true
const id=e.data.ID
     this.dataservice
      .select_item_property5(id)
      .subscribe((response: any) => {
        this.selected_data = response;
        console.log(this.selected_data, 'SELECTEDTROUT');
        
      });
}
   toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };
handleClose(){
  this.isEditItemProperty5PopupOpened=false
  this.listItemProperty5()
}
          addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
  
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addItemProperty5());
    },
    
    elementAttr: { class: 'add-button' },    
  };

  listItemProperty5(){
    this.dataservice.getItemProperty5Data().subscribe(
     (response)=>{
           this.itemproperty5=response;
           console.log(this.itemproperty5,"itemprop")
     }
    )
 }
 onClickSaveItemProperty5(){
  const { CODE, DESCRIPTION, COMPANY_ID } =this.ItemProperty5FormComponent.getNewItemProperty5Data();
   const isCodeDuplicate = this.itemproperty5.some(
        // (item: any) => item.CODE === commonDetails.code
          (item: any) => item.CODE.toLowerCase() ===CODE.toLowerCase()
      );

      const isDescriptionDuplicate = this.itemproperty5.some(
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
  this.dataservice.insertItemProperty5Data(CODE,DESCRIPTION,COMPANY_ID).subscribe(
    (response)=>{
      if (response) {
        notify(
          {
            message: 'Data added Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.dataGrid.instance.refresh();
        this.listItemProperty5();
        this.isItemProperty5PopupOpened=false
      } else {
        notify(
          {
            message: 'Your Data Not Saved',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    }
  )
 }

 addItemProperty5(){
  this.isItemProperty5PopupOpened=true;
 }

  refresh(){
      this.dataGrid.instance.refresh();
      this.listItemProperty5();

  }

 onRowRemoving(event){
  const selectedRow = event.data;
  const { ID, CODE, DESCRIPTION, COMPANY_ID } = selectedRow;
  
  this.dataservice.removeItemProperty5(ID, CODE, DESCRIPTION, COMPANY_ID).subscribe(() => {
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
      this.listItemProperty5();
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



}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,DxPopupModule,CommonModule,ItemProperty5FormModule,ItemProperty5EditModule
  ],
  providers: [],
  exports: [],
  declarations: [ItemProperty5ListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemProperty5ListModule{}