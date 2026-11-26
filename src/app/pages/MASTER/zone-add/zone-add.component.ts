import { Component, EventEmitter, Input, Output, ViewChild, } from '@angular/core';
import { DataService, notify } from 'src/app/services';

@Component({
  selector: 'app-zone-add',
  templateUrl: './zone-add.component.html',
  styleUrls: ['./zone-add.component.scss']
})
export class ZoneAddComponent {
  @ViewChild('validationGroup', { static: false })
  validationGroup: any;

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

    const isDuplicate = this.zoneArray.some(
      (zone: any) =>
        zone.ZONE?.trim().toLowerCase() === zoneName
    );

    if (isDuplicate) {
      notify('Zone name already exists', 'warning', 2000);
      return;
    }

    const payload = {
      ...this.zoneData,
      CREATED_USER: this.user_id,
    };

    this.dataservice.InsertZone(payload).subscribe({
      next: (res: any) => {

        this.isConfirmPopupVisible = false;

        if (res.Flag === 1) {
          this.saveZoneData.emit(res);
        }

      },
      error: (err: any) => {

        console.error('Zone Insert Error:', err);

        notify('Unable to save zone', 'error', 2000);

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
