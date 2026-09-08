"use client";

import { useActionState } from "react";
import type { RestaurantLead } from "@prisma/client";
import {
  createRestaurantLeadAction,
  updateRestaurantLeadAction,
} from "@/app/admin/actions/restaurant-leads";
import { ActionMessage } from "@/components/admin/ActionMessage";
import {
  restaurantContactStatusLabels,
  restaurantContactStatusOrder,
  restaurantLeadPriorityLabels,
  restaurantRegionLabels,
  restaurantWebsiteStatusLabels,
} from "@/lib/admin/labels";
import { allowsWebsiteScore } from "@/lib/admin/restaurant-leads";
import type { FormState } from "@/lib/admin/validation";

type RestaurantLeadFormProps = {
  mode: "create" | "edit";
  lead?: RestaurantLead;
};

function dateInputValue(value?: Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function RestaurantLeadForm({ mode, lead }: RestaurantLeadFormProps) {
  const action = mode === "create" ? createRestaurantLeadAction : updateRestaurantLeadAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const websiteStatus = lead?.websiteStatus ?? "NOT_VERIFIED";

  return (
    <form action={formAction} className="admin-form" id={mode === "edit" ? "edit" : undefined}>
      {lead ? <input type="hidden" name="leadId" value={lead.id} /> : null}
      <ActionMessage state={state} />
      <div className="admin-grid-2">
        <label>
          Restoran
          <input name="restaurantName" required defaultValue={lead?.restaurantName} />
        </label>
        <label>
          İlçe
          <input name="district" required defaultValue={lead?.district} />
        </label>
        <label>
          Bölge
          <select name="region" defaultValue={lead?.region ?? "ANADOLU"}>
            {Object.entries(restaurantRegionLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mahalle
          <input name="neighborhood" defaultValue={lead?.neighborhood ?? ""} />
        </label>
        <label>
          Adres
          <input name="address" defaultValue={lead?.address ?? ""} />
        </label>
        <label>
          Website
          <input name="website" defaultValue={lead?.website ?? ""} />
        </label>
        <label>
          Domain
          <input name="websiteDomain" defaultValue={lead?.websiteDomain ?? ""} />
        </label>
        <label>
          Website Status
          <select name="websiteStatus" defaultValue={websiteStatus}>
            {Object.entries(restaurantWebsiteStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Website Score
          <input
            name="websiteScore"
            type="number"
            min="0"
            max="10"
            step="0.1"
            defaultValue={allowsWebsiteScore(websiteStatus) ? (lead?.websiteScore ?? "") : ""}
            placeholder={allowsWebsiteScore(websiteStatus) ? "0–10" : "NO_WEBSITE / NOT_VERIFIED için boş"}
          />
        </label>
        <label>
          Lead Score
          <input
            name="leadScore"
            type="number"
            min="0"
            max="10"
            step="0.1"
            defaultValue={lead?.leadScore ?? ""}
            placeholder="Araştırma tamamlanınca"
          />
        </label>
        <label>
          Priority
          <select name="priority" defaultValue={lead?.priority ?? "PENDING"}>
            {Object.entries(restaurantLeadPriorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Public Email
          <input name="publicEmail" type="email" defaultValue={lead?.publicEmail ?? ""} />
        </label>
        <label>
          Telefon
          <input name="phone" defaultValue={lead?.phone ?? ""} />
        </label>
        <label>
          WhatsApp
          <input name="whatsapp" defaultValue={lead?.whatsapp ?? ""} />
        </label>
        <label>
          Instagram
          <input name="instagram" defaultValue={lead?.instagram ?? ""} />
        </label>
        <label>
          Google Maps
          <input name="googleMapsUrl" defaultValue={lead?.googleMapsUrl ?? ""} />
        </label>
        <label>
          Google Rating
          <input
            name="googleRating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            defaultValue={lead?.googleRating ?? ""}
          />
        </label>
        <label>
          Google Review Count
          <input
            name="googleReviewCount"
            type="number"
            min="0"
            step="1"
            defaultValue={lead?.googleReviewCount ?? ""}
          />
        </label>
        <label>
          Kategori
          <input name="category" defaultValue={lead?.category ?? ""} />
        </label>
        <label>
          Contact Status
          <select name="contactStatus" defaultValue={lead?.contactStatus ?? "NOT_CONTACTED"}>
            {restaurantContactStatusOrder.map((value) => (
              <option key={value} value={value}>
                {restaurantContactStatusLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kaynak
          <input name="source" defaultValue={lead?.source ?? ""} />
        </label>
        <label>
          Date Checked
          <input name="dateChecked" type="date" defaultValue={dateInputValue(lead?.dateChecked)} />
        </label>
      </div>
      <label>
        Problem 1
        <input name="problem1" defaultValue={lead?.problem1 ?? ""} />
      </label>
      <label>
        Problem 2
        <input name="problem2" defaultValue={lead?.problem2 ?? ""} />
      </label>
      <label>
        Problem 3
        <input name="problem3" defaultValue={lead?.problem3 ?? ""} />
      </label>
      <label>
        Website Analysis
        <textarea name="websiteAnalysis" rows={4} defaultValue={lead?.websiteAnalysis ?? ""} />
      </label>
      <label>
        Opportunities
        <textarea name="opportunities" rows={3} defaultValue={lead?.opportunities ?? ""} />
      </label>
      <label>
        Recommended SALKAY Pitch
        <textarea name="salkayPitch" rows={4} defaultValue={lead?.salkayPitch ?? ""} />
      </label>
      <label>
        Outreach Notes
        <textarea name="outreachNotes" rows={4} defaultValue={lead?.outreachNotes ?? ""} />
      </label>
      <button className="admin-btn" disabled={pending}>
        {mode === "create" ? "Lead oluştur" : "Değişiklikleri kaydet"}
      </button>
    </form>
  );
}
