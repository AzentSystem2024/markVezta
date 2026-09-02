import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxValidationGroupModule, DxProgressBarModule, DxPopupModule, DxDropDownBoxModule, DxToolbarModule, DxTabPanelModule, DxTabsModule, DxNumberBoxModule } from 'devextreme-angular';
import { DxoItemModule, DxoFormItemModule, DxoLookupModule, DxiItemModule, DxiGroupModule, DxoSummaryModule, DxiButtonModule } from 'devextreme-angular/ui/nested';
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
  @Input() existingSettings: any[] = [];
  @Output() popupClosed = new EventEmitter<void>();

  existingSettingsList: any[] = [];
  originalEmailType: any = null;

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
  isTestingEmail: boolean = false;

  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  passwordButtonOptions: any = {
    icon: 'eyeopen',
    stylingMode: 'text',
    hint: 'Toggle password visibility',
    onClick: () => {
      this.isPasswordVisible = !this.isPasswordVisible;
      this.passwordButtonOptions = {
        ...this.passwordButtonOptions,
        icon: this.isPasswordVisible ? 'eyeclose' : 'eyeopen',
      };
    },
  };

  confirmPasswordButtonOptions: any = {
    icon: 'eyeopen',
    stylingMode: 'text',
    hint: 'Toggle password visibility',
    onClick: () => {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
      this.confirmPasswordButtonOptions = {
        ...this.confirmPasswordButtonOptions,
        icon: this.isConfirmPasswordVisible ? 'eyeclose' : 'eyeopen',
      };
    },
  };

  constructor(private dataService: DataService) {}

  passwordComparison = () => {
    return this.password;
  };

  get isPasswordMatching(): boolean {
    return Boolean(this.password && this.confirmPassword && this.password === this.confirmPassword);
  }

  validateEmailTypeNotDuplicate = (e: any) => {
    const selectedTypeId = e.value;
    if (!selectedTypeId) return true;

    if (this.isEditing && this.originalEmailType != null && String(this.originalEmailType) === String(selectedTypeId)) {
      return true;
    }

    const duplicate = (this.existingSettingsList || []).find((item: any) => {
      const itemTypeId = item.EMAIL_TYPE ?? item.TYPE_ID ?? item.ID;
      return itemTypeId != null && String(itemTypeId) === String(selectedTypeId);
    });

    if (duplicate) {
      const typeObj = (this.emailTypeList || []).find((t: any) => String(t.ID) === String(selectedTypeId));
      const typeName = typeObj?.DESCRIPTION || duplicate.TYPE_NAME || typeObj?.NAME || 'selected type';
      e.rule.message = `already created settings for '${typeName}'`;
      return false;
    }

    return true;
  };

  validateReceiverEmails = (e: any) => {
    const rawValue = (e.value || '').trim();
    if (!rawValue) return true;

    const emails = rawValue.split(',').map((email: string) => email.trim());

    for (const email of emails) {
      if (!email) {
        e.rule.message = 'Please remove extra or trailing commas between email addresses';
        return false;
      }
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        e.rule.message = `'${email}' is not a valid email address`;
        return false;
      }
    }

    return true;
  };

  ngOnInit() {
    this.getEmailTypeDropdown();
    this.loadExistingSettings();
    this.isEditDataAvailable();
  }

  loadExistingSettings() {
    if (this.existingSettings && this.existingSettings.length > 0) {
      this.existingSettingsList = this.existingSettings;
    } else {
      this.dataService.getEmailSettings().subscribe({
        next: (response: any) => {
          const list = response?.DataList || response?.Data || response?.data || (Array.isArray(response) ? response : []);
          this.existingSettingsList = list;
        },
        error: (err) => console.error('Error loading existing email settings:', err)
      });
    }
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;
    const data = this.EditingResponseData;
    this.emailType = data.EMAIL_TYPE ?? null;
    this.originalEmailType = this.emailType;
    this.senderId = data.SENDER_ID ?? '';
    this.enableSsl = Boolean(data.ENABLE_SSL);
    this.senderName = data.SENDER_NAME ?? '';
    this.password = data.SENDER_PASSWORD || data.PASSWORD || '';
    this.confirmPassword = '';
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

  onSave(validationGroup?: any) {
    if (validationGroup) {
      const result = validationGroup.instance.validate();
      if (!result.isValid) {
        return;
      }
    }

    const cleanReceiverId = this.receiverId
      ? this.receiverId
          .split(',')
          .map((email: string) => email.trim())
          .filter(Boolean)
          .join(',')
      : '';

    const payload: any = {
      EMAIL_TYPE: this.emailType,
      SENDER_ID: this.senderId,
      SENDER_NAME: this.senderName,
      SENDER_PASSWORD: this.password,
      RECEIVER_ID: cleanReceiverId,
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

  onTestEmail(validationGroup?: any) {
    if (validationGroup) {
      const result = validationGroup.instance.validate();
      if (!result.isValid) {
        return;
      }
    }

    if (!this.enableSsl) {
      notify('Please enable SSL to test email', 'warning', 2000);
      return;
    }

    const cleanReceiverId = this.receiverId
      ? this.receiverId
          .split(',')
          .map((email: string) => email.trim())
          .filter(Boolean)
          .join(',')
      : '';

    const payload: any = {
      EMAIL_TYPE: this.emailType,
      SENDER_ID: this.senderId,
      SENDER_NAME: this.senderName,
      SENDER_PASSWORD: this.password,
      RECEIVER_ID: cleanReceiverId,
      EMAIL_SUBJECT: this.subject,
      EMAIL_CONTENT: this.messageBody,
      SMTP_PORT: Number(this.smtpPort) || 0,
      SMTP_HOST: this.smtpHost,
      ENABLE_SSL: true,
    };

    console.log('Test Email Payload:', payload);
    this.isTestingEmail = true;
    this.dataService.testEmail(payload).subscribe({
      next: (response: any) => {
        this.isTestingEmail = false;
        notify(
          response?.Message || response?.message || 'Test email sent successfully',
          'success',
          2000,
        );
      },
      error: (error: any) => {
        this.isTestingEmail = false;
        console.error('Error sending test email:', error);
        notify(
          error?.error?.Message || error?.error?.message || 'Failed to send test email',
          'error',
          2000,
        );
      },
    });
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
    DxValidationGroupModule,
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
    DxiButtonModule,
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