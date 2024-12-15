import { setValidationMessage } from '../utils/validationMessage.ts';
import * as Form from '@radix-ui/react-form';
import { Maybe } from '../types/utility.ts';

export const FormErrorValidation = ({
    state,
}: {
    state: Maybe<ValidityState>;
}) => {
    return (
        <Form.Message>
            <p className="text-red-600 text-xs font-light max-w-36">
                {setValidationMessage(state)}
            </p>
        </Form.Message>
    );
};
