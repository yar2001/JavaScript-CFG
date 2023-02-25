import { Listbox, Transition } from '@headlessui/react';
import { Fragment, Key } from 'react';
import { HiSelector } from 'react-icons/hi';
import { IoCheckmark } from 'react-icons/io5';

interface Props<T extends Key> {
  data: { title: string; key: T }[];
  value: T;
  onChange(value: T): void;
  className?: string;
  name?: string;
}

export function Selector<T extends Key>({ name, data, value, onChange, className }: Props<T>) {
  return (
    <>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={
              'relative w-full py-1.5 pl-4 pr-10 text-left bg-gray-100 outline-none hover:bg-gray-200 rounded-md sm:text-sm ' +
              className
            }
          >
            <div className="text-gray-600 truncate">
              {name && <span className="mr-2 font-bold">{name}</span>}
              {data.find(({ key }) => key === value)?.title}
            </div>
            <span className="flex absolute inset-y-0 right-0 items-center pr-2 pointer-events-none">
              <HiSelector className="w-5 h-5 text-gray-500" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="overflow-auto absolute z-10 py-1 mt-1 w-full min-w-max max-h-60 text-base bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow focus:outline-none sm:text-sm">
              {data.map(({ title, key }) => (
                <Listbox.Option
                  key={key}
                  className={({ active }) =>
                    `relative select-none cursor-pointer py-2 pl-10 pr-4 w-full ${
                      active ? 'bg-gray-50 ' : 'text-gray-900'
                    }`
                  }
                  value={key}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{title}</span>
                      {selected ? (
                        <span className="flex absolute inset-y-0 left-0 items-center pl-3 text-blue-600">
                          <IoCheckmark className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </>
  );
}
