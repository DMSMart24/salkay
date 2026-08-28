"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordActivity } from "@/lib/admin/activity";
import { slugify } from "@/lib/admin/normalize";
import { DEFAULT_GROUPS } from "@/lib/admin/outreach";
import { getPrisma } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { groupSchema, type FormState } from "@/lib/admin/validation";

function touchGroups(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  revalidatePath("/admin/companies");
  revalidatePath("/admin/emails");
  if (id) revalidatePath(`/admin/groups/${id}`);
}

async function uniqueSlug(base: string, excludeId?: string) {
  const prisma = getPrisma();
  let slug = slugify(base);
  let n = 2;
  while (
    await prisma.leadGroup.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${slugify(base)}-${n}`;
    n += 1;
  }
  return slug;
}

export async function createGroupAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = groupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    industry: formData.get("industry") || undefined,
    city: formData.get("city") || undefined,
    country: formData.get("country") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Grup geçersiz." };
  }

  const group = await getPrisma().$transaction(async (tx) => {
    const created = await tx.leadGroup.create({
      data: {
        ...parsed.data,
        slug: await uniqueSlug(parsed.data.name),
      },
    });
    await recordActivity(tx, {
      type: "GROUP_CREATED",
      message: `Grup: ${created.name}`,
      userId: session.userId,
    });
    return created;
  });

  touchGroups(group.id);
  redirect(`/admin/groups/${group.id}`);
}

export async function updateGroupAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("groupId") ?? "");
  const parsed = groupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    industry: formData.get("industry") || undefined,
    city: formData.get("city") || undefined,
    country: formData.get("country") || undefined,
  });
  if (!id || !parsed.success) {
    return { error: parsed.success ? "Grup bulunamadı." : parsed.error.issues[0]?.message };
  }

  await getPrisma().leadGroup.update({
    where: { id },
    data: parsed.data,
  });
  touchGroups(id);
  return { success: "Grup güncellendi." };
}

export async function seedDefaultGroupsForm(formData: FormData) {
  void formData;
  await seedDefaultGroupsAction();
}

export async function seedDefaultGroupsAction(): Promise<FormState> {
  const session = await requireAdmin();
  const prisma = getPrisma();
  let created = 0;
  for (const item of DEFAULT_GROUPS) {
    const slug = slugify(item.name);
    const exists = await prisma.leadGroup.findUnique({ where: { slug } });
    if (exists) continue;
    await prisma.leadGroup.create({
      data: {
        name: item.name,
        slug,
        industry: item.industry,
        country: "Türkiye",
      },
    });
    created += 1;
  }
  if (created > 0) {
    await recordActivity(prisma, {
      type: "GROUP_CREATED",
      message: `${created} varsayılan grup eklendi.`,
      userId: session.userId,
    });
  }
  touchGroups();
  return { success: created > 0 ? `${created} grup eklendi.` : "Varsayılan gruplar zaten var." };
}
