import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
    const error = useRouteError() as { statusText?: string; message?: string };

    return (
        <div
            id="error-page"
            style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%,50%)',
            }}
        >
            <h2>Oops!</h2>
            <p className="mb-3">Sorry, an unexpected error has occurred.</p>
            <p className="text-center">{error.statusText || error.message}</p>
        </div>
    );
}
