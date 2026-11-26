import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, } from '@angular/core';
import { DataService, notify } from 'src/app/services';
@Component({
  selector: 'app-zone-edit',
  templateUrl: './zone-edit.component.html',
  styleUrls: ['./zone-edit.component.scss']
})
export class ZoneEditComponent implements OnChanges {
  @ViewChild('validationGroup', { static: false })
  validationGroup: any;
  @Input() selectedZone: any;

  @Output() saveZoneData = new EventEmitter<any>();
  @Output() formClosed = new EventEmitter<void>();
  @Input() zoneArray: any[] = [];

  zoneData: any = {
    ZONE: '',
    SALES_HEAD: '',
    EMAIL: ''
  };

  isConfirmPopupVisible = false;
  user_id: any;

  constructor(
    private dataservice: DataService
  ) { }

  ngOnInit() {
    this.sesstion_Details();
  }


  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '');
    this.user_id = sessionData.USER_ID;
    //
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedZone'] && this.selectedZone) {

      // Handle API response: Data array
      const record = this.selectedZone?.Data?.[0] ?? this.selectedZone;

      if (record) {
        this.zoneData = {
          ID: record.ID,
          ZONE: record.ZONE || '',
          SALES_HEAD: record.SALES_HEAD || '',
          EMAIL: record.EMAIL || ''
        };
      }
    }
  }

  validateMultipleEmails = (e: any): boolean => {
    const emailValue = e.value || '';

    const emails = emailValue
      .split(',')
      .map((email: string) => email.trim());

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emails.every((email: string) => emailRegex.test(email));
  };

  saveZone() {
    const result = this.validationGroup.instance.validate();

    if (result.isValid) {
      this.isConfirmPopupVisible = true;
    }
  }

  // When clicking Save in confirmation popup
  confirmSaveZone() {
    const zoneName = this.zoneData.ZONE?.trim().toLowerCase();

    // Check duplicate Zone Name, excluding the current record
    const isDuplicate = this.zoneArray.some(
      (zone: any) =>
        zone.ID !== this.zoneData.ID &&
        zone.ZONE?.trim().toLowerCase() === zoneName
    );

    if (isDuplicate) {
      notify('Zone name already exists', 'warning', 2000);
      return;
    }
    const payload = {
      ...this.zoneData,
      MODIFIED_USER: this.user_id,
    };

    this.dataservice.UpdateZone(payload).subscribe({
      next: (res: any) => {
        if (res.Flag === 1) {
          this.isConfirmPopupVisible = false;
          this.saveZoneData.emit(res);
        } else {
          notify(res.Message || 'Unable to update zone', 'error', 2000);
        }
      },
      error: (err: any) => {
        console.error('Zone Update Error:', err);
        notify('Unable to update zone', 'error', 2000);
      }
    });
  }

  // When clicking Cancel in confirmation popup
  cancelConfirmation() {
    this.isConfirmPopupVisible = false;
  }


  cancelZone() {
    this.resetForm();
    this.formClosed.emit();
  }

  resetForm() {
    this.zoneData = {
      ZONE: '',
      SALES_HEAD: '',
      EMAIL: ''
    };
  }
}
