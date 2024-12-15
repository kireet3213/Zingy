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
            <p className="text-red-600 font-bold text-xs max-w-56 hyphens-auto m-0.5">
                {setValidationMessage(state)}
            </p>
        </Form.Message>
    );
};
