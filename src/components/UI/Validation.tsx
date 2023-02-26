import { ContainsLowercase, ContainsNumeric, ContainsUppercase, ContainsSpecialCharacter, emailReg } from './../../utils/Regex';

interface IParams {
    checks: any[];
    push: (key: any, context: string) => (checkType: any[], validate: (s: boolean) => boolean, value?: string | number, minLength?: number, equalsTo?: string | number) => void;
    validate: (context: string) => boolean;
    delete:(key: string) => void;
}

export const required = 'required';
export const email = 'email';
export const hasUpper = 'hasUpper';
export const hasLower = 'hasLower';
export const hasNumeric = 'hasNumeric';
export const hasSpecial = 'hasSpecial';
export const checked = 'checked';
export const hasWrongSimbol = 'hasWrongSimbol';

const Validation: IParams = {
    checks: [],
    delete: (key: string) => {
        let T = Validation.checks.filter(c => {
            return c._c != key
        });

        Validation.checks = [...T];
    },
    push: (key: any, context: string) => {
        return (checkType: any[], validate: (s: boolean) => boolean, value?: string | number, minLength?: number, equalsTo?: string | number, hasWrongSimbol?: boolean) => {
            
            let T = Validation.checks.filter(c => {
                return c._c != key
            });
          
            Validation.checks = [...T, {
                _c: key, context: context, value: value, minLength: minLength, equalsTo: equalsTo, types: checkType, hasWrongSimbol: hasWrongSimbol, callback: validate
            }];

            
        }
    },
    validate: function (context: string) {
        const errors: boolean[] = [];
        const filteredChecks = context ? this.checks.filter((el: { context: string; }) => el.context === context) : this.checks;
 
        filteredChecks.map((el: { minLength: number; value: string; equalsTo: any; types: string[]; callback: (arg0: boolean) => void; }) => { 
            let hasError = false;
            if(el.minLength) {
                if(el?.value?.length < el?.minLength) {
                    hasError = true; 
                    errors.push(true)
                }
            }
            if(el.equalsTo) {
                if(el.value !== el.equalsTo) {
                    hasError = true; 
                    errors.push(true)
                }
            }
            el.types.map((r: string) => {
                switch (r) { 
                    case required:
                        if (!el.value || (el.value &&  !el.value.trim())) {
                            hasError = true; 
                            errors.push(true)
                        }
                        break;
                    case email:
                        if (!emailReg.test(el.value)) {
                            hasError = true; 
                            errors.push(true)
                        }
                        break;
                    case hasUpper:
                        if(!ContainsUppercase.test(el.value)) {
                            hasError = true; 
                            errors.push(true)
                        }
                        break;
                    case hasLower:
                        if(!ContainsLowercase.test(el.value)) {
                            hasError = true; 
                            errors.push(true)
                        }
                        break;
                    case hasNumeric:
                        if(!ContainsNumeric.test(el.value)) {
                            hasError = true; 
                            errors.push(true)
                        }
                        break;
                    case hasSpecial:
                        if(!ContainsSpecialCharacter.test(el.value)) {
                            hasError = true; 
                            errors.push(true)
                        }
                        break;
                    case checked:
                        if(Number(el.value) !== 1) {
                            hasError = true; 
                            errors.push(true)
                        }
                        break;
                        case hasWrongSimbol:
                            if(el?.value && (el?.value.indexOf('.') >= 0 || el?.value.indexOf('@') >= 0) || !ContainsSpecialCharacter.test(el?.value)) {
                                hasError = true; 
                                errors.push(true)
                            }
                            break;
                }
                
            })
            el.callback(!hasError)
        });
        return errors.some(e => e === true);
    }
}

export default Validation;