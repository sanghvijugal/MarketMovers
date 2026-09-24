import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Field = "name" | "phone";
type Errors = Partial<Record<Field, string>>;

interface Props {
  whatsapp: string;
  categories: string[];
}

function validate(data: FormData): Errors {
  const errors: Errors = {};
  if (!String(data.get("name") ?? "").trim()) errors.name = "Enter your name.";
  const digits = String(data.get("phone") ?? "").replace(/\D/g, "");
  if (!digits) errors.phone = "Enter a phone number so we can reply.";
  else if (digits.length < 10) errors.phone = "Enter a 10-digit mobile number.";
  return errors;
}

// transitions.dev "error state shake": replay the shake on each failed submit.
function shake(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove("is-shaking");
  void el.offsetWidth;
  el.classList.add("is-shaking");
  el.addEventListener("animationend", () => el.classList.remove("is-shaking"), { once: true });
}

export default function EnquiryForm({ whatsapp, categories }: Props) {
  const [errors, setErrors] = React.useState<Errors>({});
  const formRef = React.useRef<HTMLFormElement>(null);

  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const found = validate(data);
    setErrors(found);
    const invalid = Object.keys(found) as Field[];
    if (invalid.length) {
      invalid.forEach((f) => shake(formRef.current?.querySelector<HTMLElement>(`[name="${f}"]`) ?? null));
      formRef.current?.querySelector<HTMLElement>(`[name="${invalid[0]}"]`)?.focus();
      return;
    }
    const line = (label: string, key: string) => {
      const v = String(data.get(key) ?? "").trim();
      return v ? `*${label}:* ${v}` : null;
    };
    const text = [
      "Hello Market Movers, I have an enquiry.",
      "",
      line("Name", "name"),
      line("Phone", "phone"),
      line("Product", "category"),
      line("Requirement", "message"),
    ]
      .filter((l) => l !== null)
      .join("\n");
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  function clearError(field: Field) {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldRow id="enq-name" label="Name" error={errors.name}>
          <Input
            id="enq-name"
            name="name"
            autoComplete="name"
            className="t-input"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "enq-name-error" : undefined}
            onInput={() => clearError("name")}
          />
        </FieldRow>
        <FieldRow id="enq-phone" label="Phone" error={errors.phone}>
          <Input
            id="enq-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="t-input tabular-nums"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "enq-phone-error" : undefined}
            onInput={() => clearError("phone")}
          />
        </FieldRow>
      </div>
      <FieldRow id="enq-category" label="Product" optional>
        <NativeSelect id="enq-category" name="category" defaultValue="">
          <option value="">Choose a category</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </NativeSelect>
      </FieldRow>
      <FieldRow id="enq-message" label="Requirement" optional>
        <Textarea
          id="enq-message"
          name="message"
          placeholder="Sizes, quantities, preferred brand, delivery location"
        />
      </FieldRow>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg">
          <HugeiconsIcon icon={WhatsappIcon} strokeWidth={1.5} />
          Send on WhatsApp
        </Button>
        <p className="text-sm text-muted-foreground">Opens WhatsApp with your message filled in.</p>
      </div>
    </form>
  );
}

function FieldRow({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </Label>
      {children}
      <p id={`${id}-error`} className={cn("text-sm text-destructive", !error && "sr-only")} aria-live="polite">
        {error}
      </p>
    </div>
  );
}
