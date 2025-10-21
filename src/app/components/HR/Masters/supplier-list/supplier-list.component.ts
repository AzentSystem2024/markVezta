import {
  Component,
  OnInit,
  NgModule,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  Output,
  EventEmitter,
  NgZone,
  Input,
} from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxPopupModule,
} from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { DxTextBoxModule } from 'devextreme-angular';
import {
  SupplierFormComponent,
  SupplierFormModule,
} from 'src/app/components/library/supplier-form/supplier-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import {
  SupplierEditComponent,
  SupplierEditModule,
} from '../supplier-edit/supplier-edit.component';
@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.scss'],
})
export class SupplierListComponent implements OnInit {
  @ViewChild(SupplierFormComponent) supplierComponent: SupplierFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  @Output()
  editingStart = new EventEmitter<any>();
@Output() formClosed = new EventEmitter<void>();
  dataGrid: DxDataGridComponent;
  width = '100vw';
  height = '100vh';
  supplier: any;
  isAddSupplierPopupOpened = false;
  currency: any;
  CountryDropdownData: any;
  StateDropdownData: any;
  PaymentTermsDropdownData: any;
  vatrule: any;
  showFilterRow = true;
  showHeaderFilter = true;
  isCurrencyAccepted: boolean = true;
  landedcost: any[] = [];
  costFactors: any[] = [];
  selectedLandedCosts: any;
  selectedSupplier: any;
  isEditSupplierPopupOpened: boolean = false;

  allButtonsEditDelete = [
    {
      name: 'edit',
      hint: 'Edit',
      icon: 'edit',
      visible: true,
      onClick: (e: any) => {
        this.selectSupplier(e.row.data.ID); // Pass the row's `id` to the function
      },
    },
    {
      name: 'delete',
      hint: 'Delete',
      icon: 'trash',
      visible: true,
    },
  ];

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    dataservice.getCurrencyData().subscribe((data) => {
      this.currency = data;
    });
    dataservice.getDropdownData('VATRULE').subscribe((data) => {
      this.vatrule = data;
    });
  }
  onExporting(event: any) {
    this.exportService.onExporting(event, 'Supplier-list');
  }

  private loadDropdownData(): void {
    this.dataservice.getDropdownData('LANDED_COST').subscribe((data) => {
      this.landedcost = data;
      console.log(this.landedcost, 'LANDEDCOST');
    });
  }

    addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
  
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addSupplier());
    },
    
    elementAttr: { class: 'add-button' },
    
    
  };



  addSupplier() {
    this.isAddSupplierPopupOpened = true;
  }

  showSupplier() {
    this.dataservice.getSupplierData().subscribe((response) => {
      this.supplier = response;
      console.log(response, 'SUPPLIERRRRRRRRR');
    });
  }
  // onClickSaveSupplier(){

  //   const {HQID, SUPP_CODE, SUPP_NAME,CONTACT_NAME,ADDRESS1,ADDRESS2,ADDRESS3,ZIP,STATE_ID,CITY,COUNTRY_ID,PHONE,EMAIL,IS_INACTIVE,MOBILE_NO,
  //     NOTES,FAX_NO,VAT_REGNO,CURRENCY_ID,PAY_TERM_ID,VAT_RULE_ID } =this.supplierComponent.getNewSupplierData();

  //   this.dataservice.postSupplierData(HQID, SUPP_CODE, SUPP_NAME,CONTACT_NAME,ADDRESS1,ADDRESS2,ADDRESS3,ZIP,STATE_ID,
  //     CITY,COUNTRY_ID,PHONE,EMAIL,IS_INACTIVE,MOBILE_NO,NOTES,FAX_NO,VAT_REGNO,CURRENCY_ID,PAY_TERM_ID,VAT_RULE_ID).subscribe(
  //     (response)=>{
  //       if(response){
  //         this.showSupplier();
  //       }
  //     }
  //   )

  // }

  onSelectionChanged(event: any): void {
    console.log('Selection Event:', event);
    const selectedRows = event.selectedRowsData; // Get selected rows from grid
    console.log('Selected Rows:', selectedRows);

    this.selectedLandedCosts = selectedRows.map((row: any) => ({
      COST_ID: row.ID,
    })); // Format the selected costs
    console.log('Mapped Selected Costs:', this.selectedLandedCosts);
  }

  onClickSaveSupplier(): void {
    console.log('Selected Landed Costs Before Save:', this.selectedLandedCosts);

    const {
      HQID,
      SUPP_CODE,
      SUPP_NAME,
      CONTACT_NAME,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      PHONE,
      EMAIL,
      IS_INACTIVE,
      MOBILE_NO,
      NOTES,
      FAX_NO,
      VAT_REGNO,
      CURRENCY_ID,
      PAY_TERM_ID,
      VAT_RULE_ID,
      Supplier_cost,
    } = this.supplierComponent.getNewSupplierData();

     const isInactiveBoolean = IS_INACTIVE === 1 ? true : false;
     const currencyIdNumber = parseInt(CURRENCY_ID); // or use Number(CURRENCY_ID);
    const StateID = parseInt(STATE_ID);

    this.dataservice
      .postSupplierData(
        HQID,
        SUPP_CODE,
        SUPP_NAME,
        CONTACT_NAME,
        ADDRESS1,
        ADDRESS2,
        ADDRESS3,
        ZIP,
        StateID,
        CITY,
        COUNTRY_ID,
        PHONE,
        EMAIL,
        // IS_INACTIVE,
        isInactiveBoolean,
        MOBILE_NO,
        NOTES,
        FAX_NO,
        VAT_REGNO,
        // CURRENCY_ID,
        currencyIdNumber,
        PAY_TERM_ID,
        VAT_RULE_ID,
        Supplier_cost
      )
      .subscribe((response) => {
        console.log('API Response:', response);
        if (response) {
          try {
            if (response.flag == 1) {
              notify(
                {
                  message: 'Supplier added successfully',
                  position: { at: 'top right', my: 'top right' },
                },
                'success'
              );
               this.isAddSupplierPopupOpened = false
                this.formClosed.emit(); // tell parent to close
              this.showSupplier();
              this.dataGrid.instance.refresh();
             
            }
          } catch (error) {
            // notify(
            //   {
            //     message: 'Add operation failed',
            //     position: { at: 'top right', my: 'top right' },
            //   },
            //   'error'
            // );
          }
        }

        // if (response) {
        //   this.showSupplier();
        // }
      });
  }

  onRowRemoving(event) {
    const selectedRow = event.data;
    const {
      ID,
      SUPP_CODE,
      SUPP_NAME,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      PHONE,
      EMAIL,
      MOBILE_NO,
      NOTES,
      FAX_NO,
      VAT_REGNO,
      CURRENCY_ID,
      PAY_TERM_ID,
      VAT_RULE_ID,
    } = selectedRow;

    this.dataservice
      .removeSupplier(
        ID,
        SUPP_CODE,
        SUPP_NAME,
        ADDRESS1,
        ADDRESS2,
        ADDRESS3,
        ZIP,
        STATE_ID,
        CITY,
        COUNTRY_ID,
        PHONE,
        EMAIL,
        MOBILE_NO,
        NOTES,
        FAX_NO,
        VAT_REGNO,
        CURRENCY_ID,
        PAY_TERM_ID,
        VAT_RULE_ID
      )
      .subscribe(() => {
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
          this.showSupplier();
        } catch (error) {
          // notify(
          //   {
          //     message: 'Delete operation failed',
          //     position: { at: 'top right', my: 'top right' },
          //   },
          //   'error'
          // );
        }
      });
  }

  onRowUpdating(event) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };

    this.dataservice.updateSupplier(combinedData).subscribe((data: any) => {
      if (data) {
        notify(
          {
            message: 'Supplier Updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.dataGrid.instance.refresh();
        this.showSupplier();
      } else {
        notify(
          {
            message: 'Your Data Not Saved',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    });
    console.log('old data:', oldData);
    console.log('new data:', updataDate);
    console.log('modified data:', combinedData);

    event.cancel = true; // Prevent the default update operation
  }
  showCountry() {
    this.dataservice.getCountryData().subscribe((response) => {
      this.CountryDropdownData = response;
    });
  }
  showState() {
    this.dataservice.getStateData().subscribe((data: any) => {
      this.StateDropdownData = data;
    });
  }
  getPaymentTerms() {
    this.dataservice.getPaymentTermsData().subscribe((response) => {
      this.PaymentTermsDropdownData = response;
    });
  }

  openEditingStart(event: any) {
    event.cancel = true;
    this.editingStart.emit(event);

    const ID = event.data.ID;

    // Open the popup
    this.isEditSupplierPopupOpened = true;

    // Fetch the item data
    this.dataservice.selectSupplier(ID).subscribe((response: any) => {
      // console.log(response, "select!!!");
      this.selectedSupplier = response;
      this.isEditSupplierPopupOpened = true;
      this.selectSupplier(response);
    });
  }

  selectSupplier(ID: number): void {
    if (!ID) {
      console.error('Invalid ID:', ID);
      return;
    }
    this.isEditSupplierPopupOpened = true;
    this.dataservice.selectSupplier(ID).subscribe((response: any) => {
      console.log('Supplier selected successfully:', response);
      this.selectedSupplier = response;
      this.cdr.detectChanges();

      // Open the popup
    });
  }

  handleFormClosed() {
    this.isEditSupplierPopupOpened = false;
    this.isAddSupplierPopupOpened = false;
    this.showSupplier();
  }

  ngOnInit(): void {
    this.loadDropdownData();
    this.showSupplier();
    this.showCountry();
    this.showState();
    this.getPaymentTerms();
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    SupplierFormModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    SupplierEditModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [SupplierListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierListModule {}
