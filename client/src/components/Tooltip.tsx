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
                        className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 shadow-xl"
                        sideOffset={5}
                    >
                        {content}
                        <Tooltip.Arrow className="fill-slate-800" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};

export default ToolTip;
