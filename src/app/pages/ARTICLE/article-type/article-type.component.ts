import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, NgZone, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DxButtonModule, DxCheckBoxModule, DxFormModule, DxPopupModule, DxTextBoxModule, DxValidationGroupComponent, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { DepartmentFormModule } from 'src/app/components/library/department-form/department-form.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-article-type',
  templateUrl: './article-type.component.html',
  styleUrls: ['./article-type.component.scss']
})
export class ArticleTypeComponent {
  
  @ViewChild(DxDataGridComponent, { static: true })
    dataGrid: DxDataGridComponent;
    @ViewChild('formValidationGroup') formValidationGroup: DxValidationGroupComponent;
  
    readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
    Datasource: any[];
    showFilterRow: boolean = true;
    currentFilter: string = 'auto';
    AddArticleTypePopup = false;
    UpdateArticleTypePopup = false;
     isFilterRowVisible: boolean = false;
 isFilterOpened = false;
    editingRowData: any = {}; 
  formsource: any;
  selectedData: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

    constructor(private fb:FormBuilder,private dataservice : DataService,private router : Router,private cdr: ChangeDetectorRef,private ngZone: NgZone ){
        this.formsource = this.fb.group({
          Description : ['',Validators.required]  
        })
        this.get_ArticleType_List();
      }
    refresh = () => {
    this.dataGrid.instance.refresh();
    };

        toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

     //=================================refresh=============================
   refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };

      refreshGrid(){
          if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
       // Or reload data from API if needed
       this.get_ArticleType_List()
      
    }
       
    }

        addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
  
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addArticleType());
    },
    
    elementAttr: { class: 'add-button' },    
  };
    
     ngOnInit(){
const currentUrl = this.router.url;
  console.log('Current URL:', currentUrl);
   const menuResponse = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
  console.log('Parsed ObjectData:', menuResponse);

  const menuGroups = menuResponse.MenuGroups || [];
  console.log('MenuGroups:', menuGroups);
const packingRights = menuGroups
  .flatMap(group => group.Menus)
  .find(menu => menu.Path === '/article-type');

if (packingRights) {
  this.canAdd = packingRights.CanAdd;
  this.canEdit = packingRights.CanEdit;
  this.canDelete = packingRights.CanDelete;
    this.canPrint = packingRights.CanEdit;
  this.canView = packingRights.canView;
   this.canApprove = packingRights.canApprove;
}

console.log('packingRights',packingRights);
console.log(  this.canAdd ,  this.canEdit ,  this.canDelete );

  }

    onEditingStart(event: any) {
      event.cancel = true;
  this.editingRowData = { ...event.data }; // Store the selected row data
  this.UpdateArticleTypePopup=true;

  this.Select_ArticleType(event)
    }

    closePop(){}
  
    addArticleType() {
      this.AddArticleTypePopup = true
       setTimeout(() => {
    this.formValidationGroup?.instance?.reset();
  });
    }
    editArticleType(){
      this.UpdateArticleTypePopup = true
    }

    //===================get data list========================
 get_ArticleType_List() {
  // this.isLoading = true;
  this.dataservice.get_ArticleType_Api().subscribe((res: any) => {
    if (res) {
      this.Datasource = res.Data.map((item: any, index: any) => ({
        ...item,
        SlNo: index + 1, // Assign serial number
      }));
    }
    console.log(res,"response")
  });
}

      addData() {
        const validationResult = this.formValidationGroup?.instance?.validate();
        const Description = this.formsource.get('Description')?.value;
        console.log(Description);
        
        const payload ={
          DESCRIPTION : Description
        }
    
// Optional: Check for duplicate login name
    const isDuplicate = this.Datasource?.some((data: any) => {
      return data.DESCRIPTION?.trim().toLowerCase() === Description.toLowerCase();
    });

    if (isDuplicate) {
      notify(
        {
          message: 'Article Type already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    }


         if(Description){
          this.dataservice.Insert_ArticleType_Api(payload).subscribe((res:any)=>{
                notify(
              {
                message: 'Data succesfully added',
                position: { at: 'top right', my: 'top right' },
                displayTime: 500,
              },
              'success'
            );
               this.AddArticleTypePopup = false
               this.formsource.reset()
               this.get_ArticleType_List()
               this.UpdateArticleTypePopup = false
          })
         }
      }

 //============select data========================
Select_ArticleType(event:any){
  const ID = event.data.ID

  this.dataservice.Select_ArticleType_Api(ID).subscribe((response:any)=>{
    console.log(response,"select Api");
    this.selectedData = response
  })
}

      editData(){
    const validationResult = this.formValidationGroup?.instance?.validate();
    const Id = this.editingRowData.ID
    const Description = this.editingRowData.DESCRIPTION;
    console.log(Id,Description);
    

     // Optional: Check for duplicate login name
    const isDuplicate = this.Datasource?.some((data: any) => {
      return (
        data.DESCRIPTION?.trim().toLowerCase() === Description.toLowerCase() &&
        data.ID !== Id
      );
    });

    if (isDuplicate) {
      notify(
        {
          message: 'Article Type already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    }

     if(Description){
      this.dataservice.Update_ArticleType_Api(Id,Description).subscribe((res:any)=>{
            notify(
          {
            message: 'Data succesfully updated',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success'
        );
        
           this.formsource.reset()
           this.get_ArticleType_List()
           this.UpdateArticleTypePopup = false
      })
     }
  }
  
    delete_Data(event: any) {
    const Id = event.data.ID
  this.dataservice.Delete_ArticleType_Api(Id).subscribe((response:any)=>{
     notify(
              {
                message: 'Data succesfully deleted',
                position: { at: 'top right', my: 'top right' },
                displayTime: 500,
              },
              'success'
            );
    console.log(response,"deleted")
  })
  }
    

}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DepartmentFormModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxValidationGroupModule
  ],
  providers: [],
  exports: [],
  declarations: [ArticleTypeComponent],
})
export class ArticleTypeModule {}
