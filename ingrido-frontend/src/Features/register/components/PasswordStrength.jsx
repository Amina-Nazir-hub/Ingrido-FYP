import { CheckCircle2, XCircle } from "lucide-react";
import { PASSWORD_VALIDATIONS } from "../constants";

const PasswordStrength = ({ password, isFocused }) => {
  const validations = PASSWORD_VALIDATIONS.map(v => ({
    label: v.label,
    met: v.test(password)
  }));

  if (!isFocused) return null;

  return (
    <div className="absolute z-20 left-0 -bottom-48 w-full sm:w-80 p-4 bg-white shadow-2xl border border-border rounded-lg animate-in fade-in zoom-in duration-200">
      <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t border-l border-border rotate-45"></div>
      <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-widest opacity-70">
        Security Checklist
      </p>
      <ul className="space-y-2">
        {validations.map((v, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 text-[13px] ${
              v.met ? "text-green-600 font-medium" : "text-muted-foreground opacity-60"
            }`}
          >
            {v.met ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {v.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;