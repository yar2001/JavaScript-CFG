import { Selector } from './Selector';
import { defaultCode } from './template';

export function TemplateSelector({ onSelect }: { onSelect(name: string): void }) {
  return (
    <Selector
      name="Template"
      data={Object.keys(defaultCode).map((name) => ({ title: name, key: name }))}
      value="foo"
      onChange={(name) => {
        onSelect(name);
      }}
      className="min-w-[192px] mb-1"
    />
  );
}
