import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, NgZone, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxPopupModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { ItemProperty4EditModule } from 'src/app/components/library/item-property4-edit/item-property4-edit.component';
import { ItemProperty4FormComponent, ItemProperty4FormModule } from 'src/app/components/library/item-property4-form/item-property4-form.component';
import { AuthService, DataService } from 'src/app/services';

@Component({
  selector: 'app-item-property4-list',
  templateUrl: './item-property4-list.component.html',
  styleUrls: ['./item-property4-list.component.scss']
})
export class ItemProperty4ListComponent {

  @ViewChild(ItemProperty4FormComponent) ItemProperty4FormComponent: ItemProperty4FormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  itemproperty4:any=[]
  isItemProperty4PopupOpened=false;
  itemlabel:any;
    isFilterRowVisible: boolean = false;
     readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  isEditItemProperty4PopupOpened:boolean=false
  showPageSizeSelector = true;
  selected_data:any=[]
  constructor(private dataservice:DataService,authservice:AuthService,private ngZone: NgZone,private cdr: ChangeDetectorRef){
    this.itemlabel=authservice.getsettingsData().ITEM_PROPERTY4;
  }

  

  ngOnInit(){
    this.listItemProperty4()
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
      this.ngZone.run(() => this.addItemProperty4());
    },
    
    elementAttr: { class: 'add-button' },    
  };


  listItemProperty4(){
    this.dataservice.getItemProperty4Data().subscribe(
     (response)=>{
           this.itemproperty4=response;
     }
    )
 }
 

 onClickSaveItemProperty4(){
  const { CODE, DESCRIPTION, COMPANY_ID } =this.ItemProperty4FormComponent.getNewItemProperty4Data();
  
      const isCodeDuplicate = this.itemproperty4.some(
        // (item: any) => item.CODE === commonDetails.code
          (item: any) => item.CODE.toLowerCase() ===CODE.toLowerCase()
      );
  
      const isDescriptionDuplicate = this.itemproperty4.some(
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
  this.dataservice.insertItemProperty4Data(CODE,DESCRIPTION,COMPANY_ID).subscribe(
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
        this.listItemProperty4();
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

 addItemProperty4(){
  this.isItemProperty4PopupOpened=true;
 }

handleClose(){
  this.isEditItemProperty4PopupOpened=false
  this.listItemProperty4()

}
  refresh(){
      this.dataGrid.instance.refresh();
      this.listItemProperty4();

  }
OnEditingStartItem(e:any){

e.cancel=true
this.isEditItemProperty4PopupOpened=true
const id=e.data.ID
     this.dataservice
      .select_item_property4(id)
      .subscribe((response: any) => {
        this.selected_data = response;
        console.log(this.selected_data, 'SELECTEDTROUT');
        
      });
}
 onRowRemoving(event){
  const selectedRow = event.data;
  const { ID, CODE, DESCRIPTION, COMPANY_ID } = selectedRow;
  
  this.dataservice.removeItemProperty4(ID, CODE, DESCRIPTION, COMPANY_ID).subscribe(() => {
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
      this.listItemProperty4();
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
    DxDataGridModule,DxButtonModule,FormPopupModule,DxPopupModule,CommonModule,ItemProperty4FormModule,ItemProperty4EditModule
  ],
  providers: [],
  exports: [],
  declarations: [ItemProperty4ListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemProperty4ListModule{}