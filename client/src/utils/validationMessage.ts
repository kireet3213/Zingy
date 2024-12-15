import { Maybe } from '../types/utility.ts';

export const setValidationMessage = (state: Maybe<ValidityState>): string => {
    if (state?.valueMissing) {
        return 'This field is required.';
    } else if (state?.typeMismatch) {
        return 'The value entered does not match the expected type.';
    } else if (state?.patternMismatch) {
        return 'The value does not match the required pattern.';
    } else if (state?.tooShort) {
        return 'The value is too short.';
    } else if (state?.tooLong) {
        return 'The value is too long.';
    } else if (state?.rangeUnderflow) {
        return 'The value is too small.';
    } else if (state?.rangeOverflow) {
        return 'The value is too large.';
    } else if (state?.stepMismatch) {
        return 'The value does not match the required step.';
    } else if (state?.badInput) {
        return 'The input is invalid.';
    } else {
        return '';
    }
};
