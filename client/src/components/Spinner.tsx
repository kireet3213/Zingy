import clsx from 'clsx';

export default function Spinner({
    size = 'small',
    fill = ' #e2e8f0',
    className,
}: {
    size?: 'small' | 'medium' | 'large';
    fill?: string;
    className?: string;
}) {
    const dimensions = () => {
        switch (size) {
            case 'small':
                return {
                    height: 40,
                    width: 40,
                };
            case 'medium':
                return {
                    height: 80,
                    width: 80,
                };
            case 'large':
                return {
                    height: 160,
                    width: 160,
                };
        }
    };
    return (
        <div className={clsx('animate-spin', className)}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid"
                width="217"
                height="217"
                style={{
                    shapeRendering: 'auto',
                    display: 'block',
                    backgroundPositionX: '0%',
                    backgroundPositionY: '0%',
                    backgroundSize: 'auto',
                    backgroundOrigin: 'padding-box',
                    backgroundClip: 'border-box',
                    backgroundAttachment: 'scroll',
                    backgroundColor: 'rgb(210, 211, 212)',
                    backgroundRepeat: 'no-repeat',
                    animation: 'none',
                    ...dimensions(),
                }}
            >
                <rect x="0" y="0" width="100" height="100" fill={fill} />
                <g>
                    <circle
                        strokeDasharray="98.96016858807849 34.98672286269283"
                        r="21"
                        strokeWidth="3"
                        stroke="black"
                        fill="none"
                        cy="50"
                        cx="50"
                        transform="matrix(1,0,0,1,0,0)"
                    />
                    <g></g>
                </g>
            </svg>
        </div>
    );
}

//style="shape-rendering:auto;display:block;background-position-x:0%;
// background-position-y:0%;background-size:auto;background-origin:padding-box;
// background-clip:border-box;background:scroll rgb(210, 211, 212) none  repeat;
// width:217px;height:217px;;animation:none"
