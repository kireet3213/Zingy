export const ErrorValidation = ({ error }: { error: string }) => {
    return (
        <p className="text-red-600 font-bold text-xs text-center max-w-56">
            {error}
        </p>
    );
};
