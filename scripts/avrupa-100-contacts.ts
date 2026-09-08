import { normalizeLeadKey } from "../src/lib/admin/restaurant-leads";
import { AVRUPA_100_SEEDS } from "./avrupa-100-dataset";

export type AvrupaContactAction = "update" | "skip";

export type AvrupaContactSeed = {
  restaurantName: string;
  action: AvrupaContactAction;
  phone?: string;
  whatsapp?: string;
  skipReason?: string;
};

export const AVRUPA_100_CONTACTS: AvrupaContactSeed[] = [
  { restaurantName: "Kebapçı Bedri Usta", action: "update", phone: "0212 505 74 55" },
  { restaurantName: "Tarihi Cumhuriyet Meyhanesi", action: "update", phone: "0212 252 08 86" },
  { restaurantName: "Semt Ocakbaşı", action: "update", phone: "0544 303 19 03" },
  { restaurantName: "Çarşı Balık Restoran", action: "update", phone: "0212 258 55 66" },
  { restaurantName: "Shishly Cafe & Bistro", action: "update", phone: "0212 234 64 09" },
  { restaurantName: "Restohan Kebap Bomonti", action: "update", phone: "0505 224 64 12" },
  { restaurantName: "Resto Lordom Bomonti", action: "update", phone: "0530 486 56 73" },
  { restaurantName: "PEPO Restaurant and Bar", action: "update", phone: "0533 304 73 76" },
  { restaurantName: "Emek Saray Restaurant", action: "update", phone: "0212 522 06 35" },
  { restaurantName: "Galata Kitchen", action: "update", phone: "0212 252 20 22" },
  { restaurantName: "Meygüsar Ocakbaşı", action: "update", phone: "0212 671 20 20" },
  { restaurantName: "Bakırköy Aile Ocakbaşı", action: "update", phone: "0537 685 71 50" },
  { restaurantName: "Yeşilköy Balıkçısı", action: "update", phone: "0212 573 67 89" },
  { restaurantName: "Nihat Balık Restoran", action: "update", phone: "0212 580 25 24" },
  { restaurantName: "Eskiev Balık Lokantası", action: "skip", skipReason: "phone not sufficiently verified" },
  { restaurantName: "Bakırköy Balık Evi", action: "update", phone: "0535 343 84 31" },
  { restaurantName: "Gaziantep Ocakbaşı", action: "update", phone: "0212 262 50 01" },
  { restaurantName: "Urfam / Öz Urfam Ocakbaşı Rumelihisarı", action: "update", phone: "0212 287 22 36" },
  { restaurantName: "Beyoğlu Ocakbaşı", action: "update", phone: "0212 249 30 30" },
  { restaurantName: "Kevok Ocakbaşı", action: "update", phone: "0534 928 21 21" },
  { restaurantName: "Adana Ocakbaşı Nişantaşı", action: "update", phone: "0540 669 01 01" },
  { restaurantName: "Sur Ocakbaşı", action: "update", phone: "0212 533 80 88" },
  { restaurantName: "Meyhane Istanbul", action: "update", phone: "0532 288 44 76" },
  { restaurantName: "Beşiktaş Olta Balık", action: "update", phone: "0212 259 39 09" },
  { restaurantName: "Mahal Meze & Meyhane", action: "update", phone: "0536 313 15 25" },
  { restaurantName: "Bakar Ocakbaşı", action: "update", phone: "0212 287 21 38" },
  { restaurantName: "Filika Sarıyer", action: "update", phone: "0537 480 14 34" },
  { restaurantName: "By Balıkçı Büyükdere", action: "update", phone: "0212 271 60 41" },
  { restaurantName: "Mayna Balık Restoran", action: "update", phone: "0212 218 44 00" },
  { restaurantName: "Lezzet Diyarı", action: "update", phone: "0212 294 00 30" },
  { restaurantName: "Park Ocakbaşı", action: "update", phone: "0212 291 46 91" },
  { restaurantName: "URFAM KEBAP OCAKBAŞI Seyrantepe", action: "update", phone: "0212 263 21 22" },
  { restaurantName: "Erzincanlı Coşkun Balık", action: "skip", skipReason: "phone not sufficiently verified" },
  { restaurantName: "Köyüm Ocakbaşı Restaurant", action: "update", phone: "0212 541 22 54" },
  { restaurantName: "Karadeniz Balık Evi – Reyhan Cd. 106", action: "skip", skipReason: "branch conflict" },
  { restaurantName: "Suruç Ocakbaşı Kanarya", action: "update", phone: "0212 540 80 10" },
  { restaurantName: "İllaki Yeni Nesil Meyhane", action: "update", phone: "0542 100 80 10" },
  { restaurantName: "Bi Dünya Meyhane", action: "update", phone: "0532 238 42 00" },
  { restaurantName: "Biçare Meyhane", action: "update", phone: "0543 434 20 90" },
  { restaurantName: "Beybaba Ocakbaşı", action: "skip", skipReason: "phone not sufficiently verified" },
  { restaurantName: "İskele Restaurant", action: "skip", skipReason: "phone not sufficiently verified" },
  { restaurantName: "Albatros Restaurant", action: "update", phone: "0212 883 32 08" },
  { restaurantName: "Balık Osman", action: "skip", skipReason: "conflicting phone sources" },
  { restaurantName: "Kalikratya Balık Mimarsinan", action: "update", phone: "0212 883 04 55" },
  { restaurantName: "Mastika Balık Restaurant", action: "update", phone: "0212 880 86 79" },
  { restaurantName: "Lokanta Safderun Feshane", action: "update", phone: "0531 665 07 62" },
  { restaurantName: "Tarihi Meşhur Eyüp Sultan Güveççisi", action: "update", phone: "0212 581 75 01" },
  { restaurantName: "Mihmandar 1505", action: "update", phone: "0212 612 77 38" },
  { restaurantName: "Tarihi Tokat Pidecisi & Tokat Kebabı", action: "skip", skipReason: "phone not sufficiently verified" },
  { restaurantName: "Ziyade Balık", action: "skip", skipReason: "phone not sufficiently verified" },
  { restaurantName: "Avni Baba Meyhanesi", action: "update", phone: "0212 695 29 28", whatsapp: "0542 695 29 28" },
  { restaurantName: "Öz Suruç Memoli Kebap", action: "update", phone: "0212 452 59 48" },
  { restaurantName: "01 Baran Ocakbaşı", action: "update", phone: "0212 554 94 95" },
  { restaurantName: "Dergah Kebap", action: "update", phone: "0212 416 00 63" },
  { restaurantName: "KEBBABİ KEBAP", action: "update", phone: "0544 567 24 38", whatsapp: "0544 567 24 38" },
  { restaurantName: "Dürümcü Engin Usta", action: "update", phone: "0212 415 74 72" },
  { restaurantName: "Tanrıverdi Kebap", action: "update", phone: "0212 547 75 83" },
  { restaurantName: "Lider Suruç Ocakbaşı", action: "update", phone: "0212 603 95 80" },
  { restaurantName: "Basri Baba İstanbul", action: "update", phone: "0537 985 55 55" },
  { restaurantName: "Ali Haydar Usta Bahçelievler", action: "update", phone: "0212 441 21 00" },
  { restaurantName: "Sini Et Balık", action: "update", phone: "0532 332 32 51" },
  { restaurantName: "Mangalbaşı Restaurant", action: "update", phone: "0212 882 31 13" },
  { restaurantName: "İstanbul Balık 34", action: "update", phone: "0212 882 08 78" },
  { restaurantName: "Alaçatı Et & Balık", action: "update", phone: "0212 883 08 88", whatsapp: "0532 451 02 56" },
  { restaurantName: "Evita Mangalbaşı", action: "update", phone: "0507 178 18 20" },
  { restaurantName: "Cumbalım Meyhane", action: "update", phone: "0534 400 79 79" },
  { restaurantName: "Muhabbet Ocakbaşı", action: "update", phone: "0542 110 55 65" },
  { restaurantName: "Pargalı Rum Meyhanesi", action: "update", phone: "0534 718 73 70" },
  { restaurantName: "Meraki (Meze - Rakı) Restoran", action: "update", phone: "0533 601 70 41" },
  { restaurantName: "Saklı Deniz Restaurant", action: "update", phone: "0532 738 61 36" },
  { restaurantName: "Fülane Restaurant", action: "update", phone: "0534 858 27 21" },
  { restaurantName: "Seher Restaurant", action: "update", phone: "0538 580 40 70" },
  { restaurantName: "Babel Ocakbaşı Nevizade", action: "update", phone: "0212 244 64 60" },
  { restaurantName: "Bilice Kebap", action: "update", phone: "0532 172 12 07" },
  { restaurantName: "Fıccın Restoran", action: "update", phone: "0212 293 37 86" },
  { restaurantName: "Mivan Restaurant Cafe", action: "update", phone: "0212 517 99 29" },
  { restaurantName: "Urfam Sur Ocakbaşı", action: "update", phone: "0212 213 78 96" },
  { restaurantName: "Gaziantep Kardeşler Kebap Lahmacun", action: "update", phone: "0212 210 79 79" },
  { restaurantName: "Şişli Kebap Restaurant", action: "update", phone: "0533 926 54 34" },
  { restaurantName: "Ocakbaşı Zervan Restaurant", action: "update", phone: "0212 296 00 91" },
  { restaurantName: "ASTEK Restaurant / Ocakbaşı", action: "skip", skipReason: "branch ambiguity" },
  { restaurantName: "ASTEK Restaurant & Meyhane", action: "update", phone: "0212 247 25 62" },
  { restaurantName: "Hasan Ustam Ocakbaşı", action: "update", phone: "0546 278 19 41", whatsapp: "0546 278 19 41" },
  { restaurantName: "Tarsus Ocakbaşı", action: "update", phone: "0532 130 08 08" },
  { restaurantName: "Kenan Usta Ocakbaşı", action: "update", phone: "0212 293 56 11" },
  { restaurantName: "Mahir Lokantası", action: "update", phone: "0212 234 93 94" },
  { restaurantName: "Zarifçe Ocakbaşı", action: "update", phone: "0547 135 25 25" },
  { restaurantName: "Adana Ocakbaşı Şişli", action: "update", phone: "0212 247 01 43" },
  { restaurantName: "Güler Ocakbaşı Restaurant", action: "update", phone: "0212 275 44 66" },
  { restaurantName: "Çift Şiş Ocakbaşı", action: "update", phone: "0542 512 62 50" },
  { restaurantName: "Taksim Akcanlar Ocakbaşı 1975", action: "skip", skipReason: "phone not sufficiently verified" },
  { restaurantName: "ADANA FATİH KEBAP", action: "update", phone: "0552 811 83 01" },
  { restaurantName: "Palukçu", action: "update", phone: "0212 529 08 72" },
  { restaurantName: "Ortaklar Kebap Restaurant", action: "update", phone: "0212 517 61 99" },
  { restaurantName: "Old Balat Cafe & Kitchen", action: "update", phone: "0536 072 84 00" },
  { restaurantName: "Pala Ocakbaşı", action: "update", phone: "0212 249 04 70" },
  { restaurantName: "Sohbet Ocakbaşı", action: "update", phone: "0212 244 16 52" },
  { restaurantName: "Rakofoli Restaurant", action: "update", phone: "0212 249 23 04" },
  { restaurantName: "Hayri Usta Ocakbaşı Beyoğlu", action: "update", phone: "0212 249 31 41" },
  { restaurantName: "Ziya Baba Türk Mutfağı", action: "update", phone: "0538 468 57 92" },
];

export function assertAvrupaContacts(contacts = AVRUPA_100_CONTACTS) {
  const errors: string[] = [];
  if (contacts.length !== 100) errors.push(`Expected 100 contact rows, got ${contacts.length}`);
  if (AVRUPA_100_SEEDS.length !== 100) errors.push("Avrupa seed length is not 100");

  contacts.forEach((contact, index) => {
    const seed = AVRUPA_100_SEEDS[index];
    if (!seed) {
      errors.push(`Missing seed at index ${index}`);
      return;
    }
    if (normalizeLeadKey(contact.restaurantName) !== normalizeLeadKey(seed.restaurantName)) {
      errors.push(`Name mismatch at #${index + 1}: ${contact.restaurantName} vs ${seed.restaurantName}`);
    }
    if (contact.action === "skip") {
      if (contact.phone || contact.whatsapp) {
        errors.push(`${contact.restaurantName}: SKIP row must not carry phone/whatsapp`);
      }
      if (!contact.skipReason) errors.push(`${contact.restaurantName}: SKIP needs a reason`);
    } else {
      if (!contact.phone) errors.push(`${contact.restaurantName}: UPDATE row needs a verified phone`);
      if (contact.skipReason) errors.push(`${contact.restaurantName}: UPDATE row should not have skipReason`);
    }
  });

  const skips = contacts.filter((row) => row.action === "skip");
  const updates = contacts.filter((row) => row.action === "update");
  const whatsapp = updates.filter((row) => row.whatsapp);
  if (skips.length !== 10) errors.push(`Expected 10 SKIP rows, got ${skips.length}`);
  if (updates.length !== 90) errors.push(`Expected 90 UPDATE rows, got ${updates.length}`);
  if (whatsapp.length !== 4) errors.push(`Expected 4 WhatsApp rows, got ${whatsapp.length}`);

  if (errors.length) {
    throw new Error(`Avrupa contact dataset invalid:\n${errors.join("\n")}`);
  }

  return contacts;
}
