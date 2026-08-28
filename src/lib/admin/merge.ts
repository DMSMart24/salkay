const ALLOWED_VARS = new Set(["companyName", "firstName", "website", "city", "industry"]);

export type MergeVars = {
  companyName?: string;
  firstName?: string;
  website?: string;
  city?: string;
  industry?: string;
};

export function mergeTemplate(source: string, vars: MergeVars) {
  return source.replace(/\{\{\s*([a-zA-Z]+)\s*\}\}/g, (full, key: string) => {
    if (!ALLOWED_VARS.has(key)) {
      return full;
    }

    switch (key) {
      case "companyName":
        return vars.companyName ?? "";
      case "firstName":
        return vars.firstName ?? "";
      case "website":
        return vars.website ?? "";
      case "city":
        return vars.city ?? "";
      case "industry":
        return vars.industry ?? "";
      default: {
        const exhaustive: never = key as never;
        void exhaustive;
        return full;
      }
    }
  });
}
