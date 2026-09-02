import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxPopupModule, DxDropDownBoxModule, DxToolbarModule, DxTabPanelModule, DxTabsModule, DxNumberBoxModule } from 'devextreme-angular';
import { DxoItemModule, DxoFormItemModule, DxoLookupModule, DxiItemModule, DxiGroupModule, DxoSummaryModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from '../components';
import { AddInvoiceRetailComponent } from '../pages/INVOICE/add-invoice-retail/add-invoice-retail.component';
import { DataService } from '../services';

import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-email-setting-form',
  templateUrl: './email-setting-form.component.html',
  styleUrls: ['./email-setting-form.component.scss']
})
export class EmailSettingFormComponent implements OnInit {
  @Input() isEditing: boolean = false;
  @Input() canApprove: boolean = false;
  @Input() EditingResponseData: any;
  @Output() popupClosed = new EventEmitter<void>();

  emailTypeList: any[] = [];
  emailType: any = null;
  senderId: string = '';
  enableSsl: boolean = false;
  senderName: string = '';
  password: string = '';
  confirmPassword: string = '';
  smtpHost: string = '';
  smtpPort: string = '';
  subject: string = '';
  receiverId: string = '';
  messageBody: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getEmailTypeDropdown();
    this.isEditDataAvailable();
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;
    const data = this.EditingResponseData;
    this.emailType = data.EMAIL_TYPE ?? null;
    this.senderId = data.SENDER_ID ?? '';
    this.enableSsl = Boolean(data.ENABLE_SSL);
    this.senderName = data.SENDER_NAME ?? '';
    this.password = data.SENDER_PASSWORD || data.PASSWORD || '';
    this.confirmPassword = this.password;
    this.smtpHost = data.SMTP_HOST ?? '';
    this.smtpPort = data.SMTP_PORT ? String(data.SMTP_PORT) : '';
    this.subject = data.EMAIL_SUBJECT || data.SUBJECT || '';
    this.receiverId = data.RECEIVER_ID ?? '';
    this.messageBody = data.EMAIL_CONTENT || data.MESSAGE_BODY || '';
  }

  getEmailTypeDropdown(){
    const payload = {
      NAME: 'Trans_Types'
    }
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.emailTypeList = response
      console.log(response)
    })
  }

  onSave() {
    if (!this.emailType) {
      notify('Please select an Email Type', 'warning', 2000);
      return;
    }

    if (this.password && this.confirmPassword && this.password !== this.confirmPassword) {
      notify('Password and Confirm Password do not match', 'error', 2000);
      return;
    }

    const payload: any = {
      EMAIL_TYPE: this.emailType,
      SENDER_ID: this.senderId,
      SENDER_NAME: this.senderName,
      SENDER_PASSWORD: this.password,
      RECEIVER_ID: this.receiverId,
      EMAIL_SUBJECT: this.subject,
      EMAIL_CONTENT: this.messageBody,
      SMTP_PORT: Number(this.smtpPort) || 0,
      SMTP_HOST: this.smtpHost,
      ENABLE_SSL: this.enableSsl ? true : false,
    };

    if (this.isEditing) {
      console.log('Email Settings Update Payload:', payload);
      this.dataService.updateEmailSettings(payload).subscribe({
        next: (response: any) => {
          notify('Email settings updated successfully', 'success', 2000);
          this.popupClosed.emit();
        },
        error: (error: any) => {
          console.error('Error updating email settings:', error);
          notify(error?.error?.message || 'Failed to update email settings', 'error', 2000);
        }
      });
    } else {
      console.log('Email Settings Insert Payload:', payload);
      this.dataService.insertEmailSettings(payload).subscribe({
        next: (response: any) => {
          notify('Email settings saved successfully', 'success', 2000);
          this.popupClosed.emit();
        },
        error: (error: any) => {
          console.error('Error inserting email settings:', error);
          notify(error?.error?.message || 'Failed to save email settings', 'error', 2000);
        }
      });
    }
  }

  onCancel() {
    this.popupClosed.emit();
  }
}
@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
  ],
  providers: [],
  declarations: [EmailSettingFormComponent],
  exports: [EmailSettingFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmailSettingFormModule {}