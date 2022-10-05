import { AbstractControl } from "@angular/forms";

export function AccountNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const accountNumber = control.get('accountNumber');
    const confmAccountNumber = control.get('confmAccountNumber');
    if(accountNumber.pristine || confmAccountNumber.pristine){
        return null;
    }
    return accountNumber && confmAccountNumber && accountNumber.value!=confmAccountNumber.value?
    {'misMatch': true} :
    null;
}

export function ConfirmPasswordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPasword = control.get('newpw');
    const confirmNewPassword = control.get('cnewpw');
    if(newPasword.pristine || confirmNewPassword.pristine){
        return null;
    }
    return newPasword && confirmNewPassword && newPasword.value!=confirmNewPassword.value?
    {'misMatch': true} :
    null;
}
