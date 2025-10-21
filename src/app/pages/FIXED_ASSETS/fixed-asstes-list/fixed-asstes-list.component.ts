// import { Component } from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import notify from 'devextreme/ui/notify';

// Later in your code:

import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { FixedAsstesEditModule } from '../fixed-asstes-edit/fixed-asstes-edit.component';
import { FixedAsstesAddModule } from '../fixed-asstes-add/fixed-asstes-add.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-fixed-asstes-list',
  templateUrl: './fixed-asstes-list.component.html',
  styleUrls: ['./fixed-asstes-list.component.scss']
})
export class FixedAsstesListComponent {
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
FixedAssets:any
readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
EditFixedAssetsPopupVisible:boolean=false
AddFixedAssetsPopupVisible:boolean=false
Selected_fixedAssets_data:any
canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  gridButtons = [
  'edit',
  {
    name: 'delete',
   visible: (e: any) => !e.row?.data?.NET_DEPRECIATION
  }
];

refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };
   addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addFixedAssets());
    },
    elementAttr: { class: 'add-button' }
  };

    constructor(private dataService: DataService,private ngZone: NgZone,private cdr:ChangeDetectorRef,private router: Router){
      const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/fixed-assets');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
      this.list_fixed_assets()

    }

  //==========insert open popup=============
  addFixedAssets(){
    this.AddFixedAssetsPopupVisible=true

  }
  handleClose(){
this.AddFixedAssetsPopupVisible=false
this.EditFixedAssetsPopupVisible=false


this.list_fixed_assets()
  }

  list_fixed_assets(){
  
    this.dataService.list_Fixed_Asset_api().subscribe((res:any)=>{
      console.log(res)
this.FixedAssets=res.Data
      
    })
  }
//=============onedit start==========================
onEditFixedAssets(event:any){
  event.cancel=true
  this.EditFixedAssetsPopupVisible=true
console.log(event)
  const id=event.data.ID

  this.dataService.select_Fixed_Asset(id).subscribe((res:any)=>{
    console.log(res)
    this.Selected_fixedAssets_data=res.Data
  })

}

//========================Delete functionality========
delete_FixedAssets_Data(event:any){
  const id=event.data.ID
  this.dataService.Delete_FixedAsset_Api(id).subscribe((res:any)=>{
       notify(
            {
              message: 'This Fixed Asset date deleted successfully .',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );

  })

}

  getStatusFlagClass(Status: string): string {
    // console.log('Status:', Status);
    
 return Status ? 'flag-red' : 'flag-green';
}


refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
       // Or reload data from API if needed
       this.list_fixed_assets()
    }
  }
    toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };



}


@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxFormModule,
    DxRadioGroupModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    ReactiveFormsModule,
    CommonModule,
    FixedAsstesEditModule,
    FixedAsstesAddModule
    
  ],
  providers: [],
  exports: [FixedAsstesListComponent],
  declarations: [FixedAsstesListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FixedAsstesListModule {}
