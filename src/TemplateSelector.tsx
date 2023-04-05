import { useState } from 'react';
import { Selector } from './Selector';
import { defaultJavaScript } from './template';

export function TemplateSelector({ onSelect }: { onSelect(name: string): void }) {
  const [value, setValue] = useState(Object.keys(defaultJavaScript)[0]);
  return (
    <Selector
      name="Template"
      value={value}
      data={Object.keys(defaultJavaScript).map((name) => ({ title: name, key: name }))}
      onChange={(name) => {
        onSelect(name);
        setValue(name);
      }}
      className="min-w-[192px] mb-1"
    />
  );
}
