import {
  Component,
  OnInit,
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DxSelectBoxModule,
  DxCheckBoxModule,
  DxDateBoxModule,
  DxDataGridModule,
  DxTextAreaModule,
  DxButtonModule,
  DxPopupModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { DxLoadPanelModule } from 'devextreme-angular';

export interface SizeConfig {
  id: string;
  name: string;
  packQty: number; // the (30) in red
  description: string;
}
export interface CartItem {
  id: number;
  orderId?: number;
  categoryId: number | null;
  artNoId: any;
  colorId: string | null;
  imageUrl?: string;
  packingType: string;
  sizes: any[];
}
@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss'],
})
export class NewOrderComponent implements OnInit, OnChanges {
  @Input() editDealerId: number | null = null;
  @Input() editParentDealerId: number | null = null;
  @Input() editOrderId: number | null = null;
  @Input() initialTab: 'dealer' | 'subdealer' = 'dealer';
  @Output() closePopup = new EventEmitter<void>();

  // Navigation tabs
  activeTab: 'dealer' | 'subdealer' = 'dealer';
  searchQuery: string = '';

  isProcessing: boolean = false;

  // Form State
  isEditMode = false;
  isSettingEditData = false;

  isLoadingDealers = false;
  isLoadingSubDealers = false;
  isLoadingCategories = false;
  isLoadingArtNos = false;
  isLoadingSizes = false;

  allArtNos: string[] = [];
  cartItems: CartItem[] = [];
  addresses: any[] = [];
  selectedAddressId: any = null;
  isLoadingAddresses = false;

  // Current Editing Item (for modal)
  currentEditingItem!: CartItem;

  // Cut Size Popup State
  isCutSizePopupVisible = false;
  currentCutSize: any = null;
  currentCutSizeQuantities: { [key: string]: number } = {};

  colors: any[] = [];
  categories: any[] = [];
  artNos: any[] = [];
  artNosDataSource: any = null;
  sizeConfigurations: SizeConfig[] = [];

  warehouses: any[] = [];
  selectedWarehouseId: any = null;
  distributorsCache: { [key: string]: any[] } = {};
  currentDistributors: any[] = [];
  itemsList: any[] = [];

  selectedDealerId: any = null;

  constructor(private dataService: DataService) {
    this.currentEditingItem = this.getEmptyCartItem();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialTab'] && changes['initialTab'].currentValue) {
      this.activeTab = changes['initialTab'].currentValue;
    }
    if (changes['editDealerId'] || changes['editOrderId']) {
      if (this.editDealerId && this.editOrderId) {
        this.selectedDealerId = this.editDealerId;
        this.onDealerChange({ value: this.editDealerId });
        this.currentEditingItem.orderId = this.editOrderId;
      } else {
        // Reset state for new
        this.selectedDealerId = null;
        this.cartItems = [];
        this.currentEditingItem = this.getEmptyCartItem();
        this.isEditMode = false;
        this.isSettingEditData = false;
        this.selectedWarehouseId = null;
      }
    }
  }

  ngOnInit(): void {
    this.loadDealers();
    this.loadCategories();
    this.loadWarehouses();
  }

  loadCategories() {
    this.dataService.Get_GropDown('ARTICLECATEGORY').subscribe(
      (res: any) => {
        this.categories = (Array.isArray(res) ? res : res || []).map(
          (item: any) => ({
            id: item.ID || item.id,
            name: item.DESCRIPTION || item.description,
          }),
        );
      },
      (error) => console.error('Error fetching ARTICLECATEGORY', error),
    );
  }

  loadWarehouses() {
    this.dataService.Get_GropDown('WAREHOUSE').subscribe(
      (res: any) => {
        this.warehouses = (Array.isArray(res) ? res : res || []).map(
          (item: any) => ({
            id: item.ID || item.id,
            name: item.DESCRIPTION || item.description,
          }),
        );
      },
      (error) => console.error('Error fetching WAREHOUSE', error),
    );
  }

  loadDealers() {
    this.loadDealerDataForTab(this.activeTab);
  }

  loadDealerDataForTab(tab: 'dealer' | 'subdealer') {
    if (this.distributorsCache[tab]) {
      this.currentDistributors = this.distributorsCache[tab];
      return;
    }

    this.isLoadingDealers = true;
    this.currentDistributors = [];
    const apiName = tab === 'dealer' ? 'DEALER' : 'SUB_DEALER';

    const apiCall =
      tab === 'dealer'
        ? this.dataService.getNewOrderDealerList({})
        : this.dataService.getNewOrderSubDealerList({});

    apiCall.subscribe(
      (res: any) => {
        const rawData = res.Data || res;
        const data = (Array.isArray(rawData) ? rawData : []).map(
          (item: any) => ({
            ...item,
            NAME:
              apiName === 'SUB_DEALER' && item.DEALER_NAME
                ? `${item.DESCRIPTION || item.description} (${item.DEALER_NAME})`
                : item.DESCRIPTION || item.description,
            TYPE: apiName,
            WAREHOUSE_ID: item.WAREHOUSE_ID,
            DEALER_ID: item.DEALER_ID,
            DEALER_NAME: item.DEALER_NAME,
          }),
        );

        this.distributorsCache[tab] = data;
        this.currentDistributors = data;
        this.isLoadingDealers = false;

        if (this.selectedDealerId) {
          const selectedDealer = this.currentDistributors.find(
            (d: any) => d.ID === this.selectedDealerId,
          );
          if (selectedDealer && selectedDealer.WAREHOUSE_ID) {
            this.selectedWarehouseId = selectedDealer.WAREHOUSE_ID;
          }
        }
      },
      (error) => {
        console.error(`Error fetching ${apiName}`, error);
        this.isLoadingDealers = false;
      },
    );
  }

  processItemsList() {
    // Extract unique artNos, colors, and size configurations from itemsList
    const uniqueArtNos = new Map();
    const uniqueColors = new Map();
    const uniqueSizes = new Map();

    this.itemsList.forEach((item) => {
      // ArtNo
      if (item.ART_NO) {
        uniqueArtNos.set(item.ART_NO, {
          id: item.ART_NO,
          categoryId: item.TYPE_ID,
          name: item.ART_NO,
          image: item.IMAGE,
        });
      }
      // Color
      if (item.COLOR_ID) {
        uniqueColors.set(item.COLOR_ID, {
          id: item.COLOR_ID,
          name: item.COLOR_NAME,
          hex: item.COLOR_CODE,
        });
      }
      // SizeRun
      if (item.SIZERUN_ID) {
        uniqueSizes.set(item.SIZERUN_ID, {
          id: item.SIZERUN_ID.toString(),
          name: item.SIZERUN_NAME,
          packQty: item.QTY || 30, // Fallback to 30 if QTY not present
          description: '',
        });
      }
    });

    this.artNos = Array.from(uniqueArtNos.values());
    this.colors = Array.from(uniqueColors.values());

    // If API provided sizes, replace the dummy ones
    if (uniqueSizes.size > 0) {
      this.sizeConfigurations = Array.from(uniqueSizes.values());
    }
  }

  getEmptyCartItem(): CartItem {
    return {
      id: 0,
      orderId: 0,
      categoryId: null,
      artNoId: null,
      colorId: null,
      packingType: 'Case',
      sizes: [],
      imageUrl: '',
    };
  }

  getActualDealerId(): number {
    if (this.activeTab === 'subdealer' && this.selectedDealerId) {
      if (this.editParentDealerId) {
        return this.editParentDealerId;
      }
      const selectedSubDealer = this.currentDistributors.find(
        (d: any) => d.ID === this.selectedDealerId,
      );
      if (selectedSubDealer && selectedSubDealer.DEALER_ID) {
        return selectedSubDealer.DEALER_ID;
      }
    }
    return this.activeTab === 'dealer' ? this.selectedDealerId || 0 : 0;
  }

  getDealerName(): string {
    if (this.selectedDealerId) {
      const d = this.currentDistributors.find(
        (x: any) => x.ID === this.selectedDealerId,
      );
      if (d) {
        if (this.activeTab === 'dealer') {
          return d.DESCRIPTION || d.description || '';
        } else if (this.activeTab === 'subdealer') {
          return d.DEALER_NAME || '';
        }
      }
    }
    return '';
  }

  getSubDealerName(): string {
    if (this.activeTab === 'subdealer' && this.selectedDealerId) {
      const sd = this.currentDistributors.find(
        (x: any) => x.ID === this.selectedDealerId,
      );
      return sd ? sd.DESCRIPTION || sd.description || '' : '';
    }
    return '';
  }

  // --- Left Side Actions ---
  setActiveTab(tab: 'dealer' | 'subdealer') {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.selectedDealerId = null;
      this.isEditMode = false;
      this.currentEditingItem = this.getEmptyCartItem();
      this.artNos = [];
      this.colors = [];
      this.loadDealerDataForTab(tab);
    }
  }

  onDealerChange(e: any) {
    // Only reset dependent fields if this is an actual user change (not initial binding)
    if (e.previousValue !== undefined && e.previousValue !== e.value) {
      this.isEditMode = false;
      this.currentEditingItem = this.getEmptyCartItem();
      this.artNos = [];
      this.colors = [];
      this.selectedAddressId = null;
    }

    if (e.value) {
      this.loadAddresses(e.value);
      // Auto-load warehouse based on selected dealer
      const selectedDealer = this.currentDistributors.find(
        (d: any) => d.ID === e.value,
      );
      if (selectedDealer && selectedDealer.WAREHOUSE_ID) {
        this.selectedWarehouseId = selectedDealer.WAREHOUSE_ID;
      }
      this.loadCartData();
    } else {
      this.addresses = [];
      this.selectedWarehouseId = null;
      this.cartItems = [];
    }
  }

  loadAddresses(dealerId: any) {
    this.isLoadingAddresses = true;
    this.dataService
      .getCustomerDeliveryAddresses({ DEALER_ID: dealerId })
      .subscribe(
        (res: any) => {
          if (res && Array.isArray(res) && res.length > 0) {
            this.addresses = res.map((a: any) => ({
              id: a.ID,
              name: a.DESCRIPTION,
            }));
            // If the response has only one data then load it otherwise select first one
            this.selectedAddressId = this.addresses[0].id;
          } else {
            this.addresses = [];
            this.selectedAddressId = null;
          }
          this.isLoadingAddresses = false;
        },
        (error) => {
          console.error('Error fetching addresses', error);
          this.isLoadingAddresses = false;
          this.addresses = [];
          this.selectedAddressId = null;
        },
      );
  }

  onCategoryChange(e: any) {
    if (this.isSettingEditData) return;
    // Only reset dependent fields if this is an actual user change (not initial binding)
    if (e.previousValue !== undefined && e.previousValue !== e.value) {
      if (this.currentEditingItem) {
        this.currentEditingItem.artNoId = null;
        this.currentEditingItem.colorId = null;
      }
    }

    if (e.value) {
      this.loadArtNos(e.value);
    } else {
      this.artNos = [];
    }
  }

  loadArtNos(categoryId: any, onComplete?: () => void) {
    this.isLoadingArtNos = true;
    this.allArtNos = [];
    this.artNos = [];
    this.dataService
      .getNewOrderArtNo({ CategoryID: categoryId.toString() })
      .subscribe(
        (res: any) => {
          this.isLoadingArtNos = false;
          if (Array.isArray(res)) {
            this.allArtNos = res.map(String);
          } else if (typeof res === 'string') {
            try {
              const parsed = JSON.parse(res);
              this.allArtNos = Array.isArray(parsed) ? parsed.map(String) : [];
            } catch (e) {
              this.allArtNos = res.split(',').filter((s) => s.trim() !== '');
            }
          }
          // Use DevExtreme DataSource for native searching and pagination
          this.artNosDataSource = new DataSource({
            store: this.allArtNos,
            paginate: true,
            pageSize: 50,
          });
          if (onComplete) onComplete();
        },
        (error) => {
          this.isLoadingArtNos = false;
          console.error('Error fetching Art Nos', error);
          if (onComplete) onComplete();
        },
      );
  }

  onArtNoChange(e: any) {
    if (this.isSettingEditData) return;
    if (e.previousValue !== undefined && e.previousValue !== e.value) {
      if (this.currentEditingItem) {
        this.currentEditingItem.colorId = null;
        this.currentEditingItem.sizes = [];
        this.currentEditingItem.imageUrl = '';
      }
    }

    if (e.value && this.currentEditingItem?.categoryId) {
      this.fetchColors(e.value, this.currentEditingItem.categoryId);
    } else {
      this.colors = [];
    }
  }

  fetchColors(artNo: string, categoryId: any, onComplete?: () => void) {
    const payload = { ArtNo: artNo, CategoryID: categoryId.toString() };
    this.dataService.getNewOrderArtColor(payload).subscribe(
      (res: any) => {
        if (res && res.flag === '1' && Array.isArray(res.Colors)) {
          this.colors = res.Colors.map((c: any) => ({
            id: c.Color,
            name: c.Color,
            hex: this.getHexForColor(c.Color),
          }));

          if (this.colors.length > 0) {
            // Auto select the first one if none is selected
            if (!this.currentEditingItem.colorId) {
              this.selectColor(this.colors[0].id);
            }
          }
          if (onComplete) onComplete();
        } else {
          this.colors = [];
          if (onComplete) onComplete();
        }
      },
      (err) => {
        console.error('Error fetching colors', err);
        if (onComplete) onComplete();
      },
    );
  }

  getHexForColor(colorName: string): string {
    const name = colorName ? colorName.toUpperCase().trim() : '';
    const map: any = {
      // Base Colors
      BLACK: '#000000',
      BLUE: '#0000FF',
      RED: '#FF0000',
      WHITE: '#FFFFFF',
      GREEN: '#008000',
      GREY: '#808080',
      BROWN: '#A52A2A',
      NAVY: '#000080',
      TAN: '#D2B48C',
      YELLOW: '#FFFF00',
      ORANGE: '#FFA500',
      PURPLE: '#800080',
      PINK: '#FFC0CB',
      MAROON: '#800000',
      OLIVE: '#808000',
      CYAN: '#00FFFF',
      MAGENTA: '#FF00FF',
      TEAL: '#008080',
      SILVER: '#C0C0C0',
      GOLD: '#FFD700',

      // Extended/Compound Colors
      'SKY BLUE': '#87CEEB',
      'LIGHT BLUE': '#ADD8E6',
      'DARK BLUE': '#00008B',
      MOUSE: '#8c543c',
      BEIGE: '#F5F5DC',
      KHAKI: '#C3B091',
      CAMEL: '#C19A6B',
      MUSTARD: '#FFDB58',
      'OLIVE GREEN': '#556B2F',
      CHARCOAL: '#36454F',
      RUST: '#B7410E',
      BURGUNDY: '#800020',
      PEACH: '#FFE5B4',
      LILAC: '#C8A2C8',
      MINT: '#98FF98',
      CORAL: '#FF7F50',
      CHERRY: '#D2042D',
    };

    // Check exact match
    if (map[name]) return map[name];

    const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
      if (name.includes(key)) {
        return map[key];
      }
    }

    return '#cccccc'; // Default fallback color
  }

  cancelForm() {
    this.isEditMode = false;
    this.currentEditingItem = this.getEmptyCartItem();
    this.artNos = [];
    this.allArtNos = [];
    this.artNosDataSource = null;
    this.colors = [];
  }

  async selectColor(colorId: string) {
    if (this.isSettingEditData) return;
    if (this.currentEditingItem.colorId === colorId) return;

    if (
      !this.isEditMode &&
      this.currentEditingItem.categoryId &&
      this.currentEditingItem.artNoId
    ) {
      const existingCartItem = this.cartItems.find(
        (item) =>
          item.categoryId === this.currentEditingItem.categoryId &&
          item.artNoId === this.currentEditingItem.artNoId &&
          item.colorId === colorId,
      );

      if (existingCartItem) {
        const dialogResult = await confirm(
          'This item is already available in the cart. Only edit is available. Do you want to edit it?',
          'Already in Cart',
        );
        if (dialogResult) {
          this.editCartItem(existingCartItem);
        }
        return;
      }
    }

    this.currentEditingItem.colorId = colorId;
    this.onColorChange(colorId);
  }

  onColorChange(color: string) {
    if (this.isSettingEditData) return;
    if (
      !this.currentEditingItem?.artNoId ||
      !this.currentEditingItem?.categoryId
    )
      return;

    this.isLoadingSizes = true;
    const payload = {
      ArtNo: this.currentEditingItem.artNoId,
      CategoryID: this.currentEditingItem.categoryId.toString(),
      Color: color,
    };

    this.dataService.getNewOrderArtNoDetails(payload).subscribe(
      (res: any) => {
        this.isLoadingSizes = false;
        if (res && res.flag === '1') {
          this.currentEditingItem.imageUrl = res.IMAGE_NAME
            ? `https://mmarkonline.com/artimages/${res.IMAGE_NAME}`
            : '';

          if (Array.isArray(res.Case)) {
            this.currentEditingItem.sizes = res.Case.map((c: any) => ({
              sizeId: c.PackingID,
              description: c.Description,
              isCutSize: c.IsCutSize,
              availableSizes:
                c.IsCutSize && c.Sizes
                  ? c.Sizes.replace(/"/g, '')
                      .split(',')
                      .map((s: string) => s.trim())
                  : [],
              cutSizeQuantities: {},
              combination: (c.Combination || '').replace(/,\s*/g, ', '),
              isAnyComb: c.IsAnyComb || c.IsCutSize || false,
              pairQty: c.PairQty,
              qty: 0,
            }));
          } else {
            this.currentEditingItem.sizes = [];
          }
        }
      },
      (err) => {
        this.isLoadingSizes = false;
        console.error('Error fetching details', err);
      },
    );
  }

  getSizeRange(description: string): { start: number, end: number } | null {
    if (!description) return null;
    // Match ranges like "6X10", "6 TO 10", "6*10", "6-10"
    const match = description.match(/(\d+)\s*(?:X|TO|\*|-)\s*(\d+)/i);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);
      return { start: Math.min(start, end), end: Math.max(start, end) };
    }
    
    // Match single numbers like "8"
    const singleMatch = description.match(/\b(\d+)\b/);
    if (singleMatch) {
       const val = parseInt(singleMatch[1], 10);
       return { start: val, end: val };
    }
    return null;
  }

  isSizeDisabled(size: any): boolean {
    if (!this.currentEditingItem || !this.currentEditingItem.sizes)
      return false;

    // Rule: Cannot select overlapping sizes
    const currentRange = this.getSizeRange(size.description);
    if (currentRange && size.qty === 0) {
      const hasOverlappingSize = this.currentEditingItem.sizes.some(s => {
        if (s.sizeId === size.sizeId || s.qty === 0) return false;
        
        const sRange = this.getSizeRange(s.description);
        if (sRange) {
          return currentRange.start <= sRange.end && currentRange.end >= sRange.start;
        }
        return false;
      });
      if (hasOverlappingSize) return true;
    }

    return false;
  }

  incrementSize(sizeId: any) {
    const size = this.currentEditingItem.sizes.find((s) => s.sizeId === sizeId);
    if (size) {
      if (this.isSizeDisabled(size)) {
        notify('Cannot select this size due to overlapping or mixed size rules.', 'warning', 3000);
        return;
      }
      if (size.isCutSize && size.qty === 0) {
        this.openCutSizePopup(size);
      } else {
        size.qty++;
      }
    }
  }

  decrementSize(sizeId: any) {
    const size = this.currentEditingItem.sizes.find((s) => s.sizeId === sizeId);
    if (size && size.qty > 0) {
      size.qty--;
      if (size.isCutSize && size.qty === 0) {
        size.cutSizeQuantities = {};
        size.combination = '';
      }
    }
  }

  onMainQtyInput(size: any, event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (this.isSizeDisabled(size) && size.qty === 0) {
      inputElement.value = '0';
      notify('Cannot select this size due to overlapping or mixed size rules.', 'warning', 3000);
      return;
    }

    let value = inputElement.value.replace(/\D/g, '');

    if (value === '') {
      size.qty = 0;
      return;
    }

    let parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      parsed = 0;
      inputElement.value = '0';
    } else {
      inputElement.value = parsed.toString();
    }

    size.qty = parsed;

    if (size.isCutSize) {
      if (size.qty === 0) {
        size.cutSizeQuantities = {};
        size.combination = '';
      } else if (Object.keys(size.cutSizeQuantities || {}).length === 0) {
        this.openCutSizePopup(size);
      }
    }
  }

  onMainQtyBlur(size: any, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value === '') {
      inputElement.value = '0';
    }
  }

  // --- Cut Size Popup Methods ---
  openCutSizePopup(size: any) {
    this.currentCutSize = size;
    // Clone to allow cancelling
    this.currentCutSizeQuantities = { ...(size.cutSizeQuantities || {}) };
    this.isCutSizePopupVisible = true;
  }

  closeCutSizePopup() {
    if (this.currentCutSize) {
      if (
        Object.keys(this.currentCutSize.cutSizeQuantities || {}).length === 0
      ) {
        this.currentCutSize.qty = 0;
      }
    }
    this.isCutSizePopupVisible = false;
    this.currentCutSize = null;
  }

  getCutSizeTotal(): number {
    if (!this.currentCutSizeQuantities) return 0;
    return Object.values(this.currentCutSizeQuantities).reduce(
      (a, b) => a + b,
      0,
    );
  }

  incrementCutSizeQty(s: string) {
    if (this.getCutSizeTotal() >= this.currentCutSize.pairQty) return;
    if (!this.currentCutSizeQuantities[s]) {
      this.currentCutSizeQuantities[s] = 0;
    }
    this.currentCutSizeQuantities[s]++;
  }

  decrementCutSizeQty(s: string) {
    if (this.currentCutSizeQuantities[s] > 0) {
      this.currentCutSizeQuantities[s]--;
    }
  }

  onCutSizeQtyInput(s: string, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');

    if (value === '') {
      this.currentCutSizeQuantities[s] = 0;
      return;
    }

    let parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      parsed = 0;
    }

    // Ensure they can't type a value that exceeds the total allowed
    const currentTotalWithoutThis =
      this.getCutSizeTotal() - (this.currentCutSizeQuantities[s] || 0);
    if (currentTotalWithoutThis + parsed > this.currentCutSize.pairQty) {
      parsed = this.currentCutSize.pairQty - currentTotalWithoutThis;
    }

    inputElement.value = parsed.toString();
    this.currentCutSizeQuantities[s] = parsed;
  }

  onCutSizeQtyBlur(s: string, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value === '') {
      inputElement.value = '0';
    }
  }

  saveCutSize() {
    const total = this.getCutSizeTotal();
    if (total !== this.currentCutSize.pairQty) {
      notify(
        `Total quantity must be exactly ${this.currentCutSize.pairQty}. Currently it is ${total}.`,
        'warning',
        3000,
      );
      return;
    }

    // Save configurations back to the size object
    this.currentCutSize.cutSizeQuantities = {
      ...this.currentCutSizeQuantities,
    };

    // Generate combination string for display
    const comboParts = [];
    for (const size of this.currentCutSize.availableSizes) {
      const q = this.currentCutSize.cutSizeQuantities[size];
      if (q > 0) {
        comboParts.push(`${size}"x${q}`);
      }
    }
    this.currentCutSize.combination = comboParts.join(', ');

    if (this.currentCutSize.qty === 0) {
      this.currentCutSize.qty = 1;
    }
    this.closeCutSizePopup();
  }

  getCurrentItemTotalQty(): number {
    return this.currentEditingItem.sizes.reduce(
      (sum, size) => sum + size.qty,
      0,
    );
  }

  saveToCart() {
    if (this.getCurrentItemTotalQty() === 0) {
      notify('Please enter a quantity before saving to cart.', 'warning', 3000);
      return;
    }

    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userId = sessionData.USER_ID || sessionData.ID || 0;

    const cartArray: any[] = [];
    const comboArray: any[] = [];

    this.currentEditingItem.sizes.forEach((s: any) => {
      if (s.qty > 0) {
        cartArray.push({
          CART_ID: this.isEditMode ? s.cartId || 0 : 0,
          PACKING_ID: s.sizeId,
          QUANTITY: s.qty,
          COMBINATION: s.description || '',
          IS_ANY_COMB: s.isAnyComb || false,
        });

        if (s.isCutSize && s.cutSizeQuantities) {
          Object.keys(s.cutSizeQuantities).forEach((sizeKey) => {
            const sqty = s.cutSizeQuantities[sizeKey];
            if (sqty > 0) {
              comboArray.push({
                PACKING_ID: s.sizeId,
                SIZE: sizeKey,
                QUANTITY: sqty,
              });
            }
          });
        }
      }
    });

    const existingOrderId =
      this.cartItems.length > 0 ? this.cartItems[0].orderId || 0 : 0;
    const finalOrderId =
      this.currentEditingItem.orderId || existingOrderId || 0;

    const payload = {
      USER_ID: userId,
      ORDER_ID: finalOrderId,
      IS_UPDATE: this.isEditMode,
      DEALER_ID: this.getActualDealerId(),
      DEALER_NAME: this.getDealerName(),
      SUBDEALER_ID:
        this.activeTab === 'subdealer' ? this.selectedDealerId || 0 : 0,
      SUBDEALER_NAME: this.getSubDealerName(),
      WAREHOUSE_ID: this.selectedWarehouseId || 0,
      LOCATION_ID: this.selectedAddressId || 0,
      CART: cartArray,
      COMBO: comboArray,
    };

    console.log('add to card : ', payload);
    this.isProcessing = true;

    this.dataService.postNewOrderAddToCart(payload).subscribe(
      (res: any) => {
        this.isProcessing = false;
        if (res.Flag === 1) {
          notify('Cart updated successfully!', 'success', 3000);
          this.cancelForm();
          this.loadCartData(); // Reload cart from API after successful save
        } else {
          const errMsg = res.Message || 'Failed to add to cart';
          console.error('Failed to add to cart:', errMsg);
          notify(errMsg, 'error', 3000);
        }
      },
      (error) => {
        this.isProcessing = false;
        console.error('Error adding to cart', error);
        notify('Error adding to cart', 'error', 3000);
      },
    );
  }

  loadCartData() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userId = sessionData.USER_ID || sessionData.ID || 0;
    const dealerId = this.getActualDealerId();
    const subDealerId =
      this.activeTab === 'subdealer' ? this.selectedDealerId || 0 : 0;

    if (!this.selectedDealerId) {
      this.cartItems = [];
      return;
    }

    const payload = {
      USER_ID: userId,
      DEALER_ID: dealerId,
      DEALER_NAME: this.getDealerName(),
      SUBDEALER_ID: subDealerId,
      SUBDEALER_NAME: this.getSubDealerName(),
    };

    this.isProcessing = true;
    this.dataService.getNewOrderCart(payload).subscribe(
      (res: any) => {
        this.isProcessing = false;
        if (
          res.Flag === 1 &&
          res.Data &&
          Array.isArray(res.Data) &&
          res.Data.length > 0
        ) {
          const groupedEntries = new Map<string, any[]>();

          res.Data.forEach((apiCart: any) => {
            if (apiCart.ENTRIES && Array.isArray(apiCart.ENTRIES)) {
              apiCart.ENTRIES.forEach((entry: any) => {
                const key = `${entry.CART_ID}_${entry.PRODUCT_ID}`;
                if (!groupedEntries.has(key)) {
                  groupedEntries.set(key, []);
                }
                groupedEntries.get(key)!.push(entry);
              });
            }
          });

          this.cartItems = [];
          groupedEntries.forEach((entries, key) => {
            const sizes = entries.map((e: any) => ({
              sizeId: e.PACKING_ID,
              qty: e.QUANTITY,
              combination: e.COMBINATION || '',
              description: e.COMBINATION || '', // Assuming COMBINATION holds the description string from the backend
              isCutSize: e.COMBINATIONS && e.COMBINATIONS.length > 0,
              isAnyComb: e.COMBINATIONS && e.COMBINATIONS.length > 0,
              cutSizeQuantities: e.COMBINATIONS
                ? e.COMBINATIONS.reduce((acc: any, combo: any) => {
                    acc[combo.SIZE] = combo.QUANTITY;
                    return acc;
                  }, {})
                : {},
              cartEntryId: e.CART_ENTRY_ID,
              cartId: e.CART_ID,
            }));

            this.cartItems.push({
              id: entries[0].CART_ID, // Use backend Cart ID
              orderId: entries[0].ORDER_ID, // ADDED: Extract ORDER_ID from the cart data
              categoryId: entries[0].CATEGORY_ID,
              artNoId: entries[0].ART_NO,
              colorId: entries[0].COLOR,
              imageUrl: entries[0].IMAGE_NAME
                ? `https://mmarkonline.com/artimages/${entries[0].IMAGE_NAME}`
                : '',
              packingType: 'Case',
              sizes: sizes,
            });
          });

          if (this.cartItems.length === 1 && this.editOrderId) {
            this.editCartItem(this.cartItems[0]);
          }
        } else {
          this.cartItems = [];
        }
      },
      (error) => {
        this.isProcessing = false;
        console.error('Error fetching cart data', error);
        notify('Error fetching cart data', 'error', 3000);
        this.cartItems = [];
      },
    );
  }

  editCartItem(item: CartItem) {
    this.isEditMode = true;
    this.isProcessing = true; // Turn on global loader when editing starts
    this.isSettingEditData = true; // Suppress UI change handlers

    const targetCategoryId = item.categoryId;
    const targetArtNoId = item.artNoId;
    const targetColorId = item.colorId;

    const finalizeEditMode = (fullSizes: any[], imageUrl: string) => {
      const clonedItem = JSON.parse(JSON.stringify(item));
      clonedItem.sizes = fullSizes;
      if (imageUrl) clonedItem.imageUrl = imageUrl;

      this.currentEditingItem = clonedItem;

      // Allow bindings to update before re-enabling event handlers
      setTimeout(() => {
        this.isSettingEditData = false;
        this.isProcessing = false;
      }, 100);
    };

    const loadSizesApi = () => {
      if (targetArtNoId && targetCategoryId && targetColorId) {
        this.isLoadingSizes = true;
        const payload = {
          ArtNo: targetArtNoId,
          CategoryID: targetCategoryId.toString(),
          Color: targetColorId,
        };

        this.dataService.getNewOrderArtNoDetails(payload).subscribe(
          (res: any) => {
            this.isLoadingSizes = false;
            let fullSizes = [];
            let imageUrl = '';
            if (res && res.flag === '1') {
              imageUrl = res.IMAGE_NAME
                ? `https://mmarkonline.com/artimages/${res.IMAGE_NAME}`
                : '';

              if (Array.isArray(res.Case)) {
                fullSizes = res.Case.map((c: any) => ({
                  sizeId: c.PackingID,
                  description: c.Description,
                  isCutSize: c.IsCutSize,
                  availableSizes:
                    c.IsCutSize && c.Sizes
                      ? c.Sizes.replace(/"/g, '')
                          .split(',')
                          .map((s: string) => s.trim())
                      : [],
                  cutSizeQuantities: {},
                  combination: (c.Combination || '').replace(/,\s*/g, ', '),
                  isAnyComb: c.IsAnyComb || c.IsCutSize || false,
                  pairQty: c.PairQty,
                  qty: 0,
                }));

                // Merge quantities from cart
                fullSizes.forEach((fs: any) => {
                  const cartSize = item.sizes.find(
                    (s) => s.sizeId === fs.sizeId,
                  );
                  if (cartSize) {
                    fs.qty = cartSize.qty;
                    fs.cartId = cartSize.cartId;
                    fs.cartEntryId = cartSize.cartEntryId;
                    if (fs.isCutSize && cartSize.cutSizeQuantities) {
                      fs.cutSizeQuantities = { ...cartSize.cutSizeQuantities };
                      const comboParts = [];
                      for (const size of fs.availableSizes) {
                        const q = fs.cutSizeQuantities[size];
                        if (q > 0) {
                          comboParts.push(`${size}x${q}`);
                        }
                      }
                      fs.combination = comboParts.join(', ');
                    }
                  }
                });
              }
            }
            finalizeEditMode(fullSizes, imageUrl);
          },
          (err) => {
            this.isLoadingSizes = false;
            console.error('Error fetching details', err);
            finalizeEditMode([], '');
          },
        );
      } else {
        finalizeEditMode([], '');
      }
    };

    if (targetCategoryId) {
      this.loadArtNos(targetCategoryId, () => {
        if (targetArtNoId) {
          this.fetchColors(targetArtNoId, targetCategoryId, () => {
            loadSizesApi();
          });
        } else {
          loadSizesApi();
        }
      });
    } else {
      loadSizesApi();
    }
  }

  async removeCartItem(id: number) {
    const result = await confirm(
      'Are you sure you want to remove this item?',
      'Confirm Deletion',
    );
    if (!result) return;

    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userId = sessionData.USER_ID || sessionData.ID || 0;

    const payload = {
      // USER_ID: userId,
      // DEALER_ID: this.getActualDealerId(),
      // DEALER_NAME: this.getDealerName(),
      // SUBDEALER_ID:
      //   this.activeTab === 'subdealer' ? this.selectedDealerId || 0 : 0,
      // SUBDEALER_NAME: this.getSubDealerName(),
      CART_ID: id,
    };

    this.isProcessing = true;
    this.dataService.clearNewOrderCart(payload).subscribe(
      (res: any) => {
        this.isProcessing = false;
        if (res.Flag === 1) {
          notify('Item removed from cart!', 'success', 2000);
          this.loadCartData();
        } else {
          const errMsg = res.Message || 'Failed to clear cart';
          console.error('Failed to clear cart:', errMsg);
          notify(errMsg, 'error', 3000);
        }
      },
      (error) => {
        this.isProcessing = false;
        console.error('Error clearing cart', error);
        notify('Error clearing cart', 'error', 3000);
      },
    );
  }

  getItemTotalPairs(item: CartItem): number {
    let total = 0;
    for (const size of item.sizes) {
      if (size.qty > 0) {
        total += size.qty * (size.pairQty || 1);
      }
    }
    return total;
  }

  getCartTotalPairs(): number {
    let total = 0;
    for (const item of this.cartItems) {
      total += this.getItemTotalPairs(item);
    }
    return total;
  }

  getCartActiveSizes(item: CartItem) {
    return item.sizes.filter((s) => s.qty > 0);
  }

  // Helpers for display
  getCategoryName(id: number | null): string {
    return this.categories.find((c) => c.id === id)?.name || '';
  }

  getArtNoName(id: any): string {
    return id || '';
  }

  getArtNoImage(id: any): string {
    return this.currentEditingItem?.imageUrl || '';
  }

  getColor(id: string | null): any {
    if (!id) return null;
    const found = this.colors.find((c) => c.id === id);
    return found || { id: id, name: id, hex: this.getHexForColor(id) };
  }

  getSizeName(sizeId: string): string {
    return this.sizeConfigurations.find((c) => c.id === sizeId)?.name || '';
  }

  getSizePackQty(sizeId: string): number | null {
    return (
      this.sizeConfigurations.find((c) => c.id === sizeId)?.packQty || null
    );
  }

  getSizeDescription(sizeId: string): string {
    return (
      this.sizeConfigurations.find((c) => c.id === sizeId)?.description || ''
    );
  }

  async submitOrder() {
    const result = await confirm(
      'Are you sure you want to submit this order?',
      'Confirm Order',
    );
    if (!result) return;

    this.isProcessing = true;

    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userId = sessionData.USER_ID || sessionData.ID || 0;
    const orderId =
      this.cartItems.length > 0 ? this.cartItems[0].orderId || 0 : 0;
    const orderDate = new Date().toISOString();

    const payload = {
      USER_ID: userId,
      ORDER_ID: orderId,
      DEALER_ID: this.getActualDealerId(),
      SUBDEALER_ID:
        this.activeTab === 'subdealer' ? this.selectedDealerId || 0 : 0,
      ORDER_STATUS: 0,
      ORDER_DATE: orderDate,
      REMARKS: '',
      EXPECTED_DELIVERY: orderDate,
      STATUS_DESCRIPTION: 'Open',
      IS_FROM_WEB: true,
      LOCATION_ID: this.selectedAddressId || 0,
      BRAND_ID: null,
      WAREHOUSE_ID: this.selectedWarehouseId || 0,
    };

    this.dataService.saveNewOrderCartToOrder(payload).subscribe(
      (res: any) => {
        this.isProcessing = false;
        if (res.Flag === 1) {
          notify('Order Submitted Successfully!', 'success', 3000);
          this.loadCartData();
          this.closePopup.emit();
        } else {
          const errMsg = res.Message || 'Failed to submit order';
          console.error('Failed to submit order:', errMsg);
          notify(errMsg, 'error', 3000);
        }
      },
      (error) => {
        this.isProcessing = false;
        console.error('Error submitting order', error);
        notify('Error submitting order', 'error', 3000);
      },
    );
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxDataGridModule,
    DxTextAreaModule,
    DxButtonModule,
    DxPopupModule,
    DxTextBoxModule,
    DxLoadPanelModule,
  ],
  declarations: [NewOrderComponent],
  exports: [NewOrderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NewOrderModule {}
