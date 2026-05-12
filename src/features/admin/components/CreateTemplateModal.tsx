import TemplateModal, { type TemplateModalProps } from "@shared/components/TemplateModal";

type Props = Omit<TemplateModalProps, "role">;

export default function CreateTemplateModal({ open, onOpenChange, templateToEdit }: Props) {
  return (
    <TemplateModal
      role="admin"
      open={open}
      onOpenChange={onOpenChange}
      templateToEdit={templateToEdit}
    />
  );
}
