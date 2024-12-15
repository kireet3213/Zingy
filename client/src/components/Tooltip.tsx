import * as Tooltip from '@radix-ui/react-tooltip';

const ToolTip = ({
    children,
    content,
}: React.PropsWithChildren<{ content: string }>) => {
    return (
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        className="bg-black text-white p-1 rounded"
                        sideOffset={5}
                    >
                        {content}
                        <Tooltip.Arrow className="" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};

export default ToolTip;
