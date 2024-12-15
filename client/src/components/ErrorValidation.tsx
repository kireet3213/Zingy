export const ErrorValidation = ({ error }: { error: string }) => {
    return (
        <p className="text-red-600 text-xs text-center font-light max-w-36">
            {error}
        </p>
    );
};
