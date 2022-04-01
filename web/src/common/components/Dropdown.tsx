import ReactDOM from 'react-dom';
import React, { useMemo, useState } from 'react';
import { Popover } from '@headlessui/react';
import { usePopper } from 'react-popper';

interface DropdownProps {
  buttons: Array<{ label: string; onClick: () => void }>;
  className?: string;
}
export function Dropdown({ className, buttons, children }: React.PropsWithChildren<DropdownProps>): JSX.Element {
  const [popoverButton, setPopoverButton] = useState<HTMLButtonElement>();
  const [popoverPanel, setPopoverPanel] = useState<HTMLDivElement>();
  const { styles, attributes } = usePopper(popoverButton, popoverPanel);

  const buttonElements = useMemo(
    () =>
      buttons.map(b => (
        <Popover.Button key={b.label} className="flex items-center w-full">
          <span onClick={b.onClick} className="px-4 py-3 whitespace-pre w-full text-left">
            {b.label}
          </span>
        </Popover.Button>
      )),
    [buttons]
  );

  return (
    <Popover className={className}>
      <Popover.Button
        className="text-white hover:text-teal-200"
        ref={(e: HTMLButtonElement) => e && setPopoverButton(e)}
      >
        {children}
      </Popover.Button>
      {ReactDOM.createPortal(
        <Popover.Panel
          ref={(e: HTMLDivElement) => e && setPopoverPanel(e)}
          style={styles.popper}
          {...attributes.popper}
        >
          <div className="rounded bg-white shadow mt-2">{buttonElements}</div>
        </Popover.Panel>,
        document.body
      )}
    </Popover>
  );
}
