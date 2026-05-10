import TemplateModal from "@shared/components/TemplateModal";

type Props = { open?: boolean; onOpenChange?: (open: boolean) => void };

export default function CreateEducatorTemplate({ open = false, onOpenChange = () => {} }: Props) {
  return <TemplateModal role="educator" open={open} onOpenChange={onOpenChange} />;
}
