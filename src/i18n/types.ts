import type { Locale } from "@/i18n/config";

export type Dictionary = {
  locale: Locale;
  ready: boolean;
  meta: {
    title: string;
    titleTemplate: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
  };
  nav: {
    skip: string;
    openMenu: string;
    closeMenu: string;
    primaryCta: string;
    items: Array<{ href: string; label: string }>;
  };
  footer: {
    tagline: string;
    services: string;
    company: string;
    insights: string;
    contact: string;
    legal: string;
    legalNote: string;
    domains: string;
    social: string;
    socialPending: string;
    rights: string;
  };
  home: {
    hero: {
      eyebrow: string;
      title: string;
      titleBefore: string;
      titleAccent: string;
      titleAfter: string;
      lead: string;
      primaryCta: string;
      secondaryCta: string;
      metaItems: [string, string, string, string];
      scrollCue: string;
    };
    marquee: string[];
    bento: {
      eyebrow: string;
      title: string;
      titleBefore: string;
      titleAccent: string;
      titleAfter: string;
      lead: string;
      coreTag: string;
      coreTitle: string;
      coreBody: string;
      coreCta: string;
      items: Array<{ tag: string; title: string; body: string }>;
      wideTag: string;
      wideTitle: string;
      wideBody: string;
    };
    kayStory: {
      ariaLabel: string;
      eyebrow: string;
      line: string;
      team: string;
      process: string;
      goal: string;
      support: string;
    };
    homeContact: {
      eyebrow: string;
      title: string;
      body: string;
      locationLabel: string;
      mailLabel: string;
    };
    intro: {
      eyebrow: string;
      statement: string;
      aside: string;
    };
    capabilities: {
      eyebrow: string;
      title: string;
      items: Array<{
        index: string;
        model: string;
        title: string;
        body: string;
        points: string[];
      }>;
    };
    webFocus: {
      eyebrow: string;
      title: string;
      body: string;
      points: Array<{ title: string; body: string }>;
      canvasLabel: string;
      canvasTitle: string;
      canvasMeta: string;
    };
    services: {
      eyebrow: string;
      title: string;
      lead: string;
      featured: Array<{
        title: string;
        body: string;
        href: string;
      }>;
      list: Array<{
        index: string;
        title: string;
        body: string;
        href: string;
      }>;
    };
    process: {
      eyebrow: string;
      title: string;
      steps: Array<{
        index: string;
        title: string;
        body: string;
      }>;
    };
    projects: {
      eyebrow: string;
      title: string;
      lead: string;
      disclaimer: string;
      cta: string;
      items: Array<{
        sector: string;
        title: string;
        summary: string;
        status: string;
      }>;
    };
    growth: {
      eyebrow: string;
      title: string;
      body: string;
      items: Array<{ title: string; body: string }>;
    };
    analytics: {
      eyebrow: string;
      title: string;
      body: string;
      disclaimer: string;
      metrics: Array<{ label: string; value: string; hint: string }>;
      sources: Array<{ label: string; share: string }>;
      points: string[];
    };
    software: {
      eyebrow: string;
      title: string;
      body: string;
      items: Array<{ title: string; body: string }>;
    };
    cta: {
      title: string;
      body: string;
      primary: string;
      secondary: string;
    };
  };
  servicesPage: {
    title: string;
    description: string;
    hero: {
      eyebrow: string;
      titleLine: string;
      titleBefore: string;
      titleAccent: string;
      lead: string;
      primaryCta: string;
      secondaryCta: string;
    };
    approach: {
      eyebrow: string;
      titleLine: string;
      titleAfter: string;
      lead: string;
      disciplines: [string, string, string, string, string];
    };
    experience: {
      eyebrow: string;
      featureIndex: string;
      featureLabel: string;
      featureTitle: string;
      featureBody: string;
      supportIndex: string;
      supportTitle: string;
      supportBody: string;
    };
    systems: {
      eyebrow: string;
      title: string;
      items: [
        { index: string; label: string; title: string; body: string },
        { index: string; label: string; title: string; body: string },
        { index: string; label: string; title: string; body: string },
      ];
    };
    statement: {
      lines: [string, string, string];
      closeBefore: string;
      closeAccent: string;
      closeAfter: string;
    };
    growth: {
      eyebrow: string;
      titleLine1: string;
      titleLine2: string;
      titleAccent: string;
      items: [
        { index: string; label: string; title: string; body: string },
        { index: string; label: string; title: string; body: string },
        { index: string; label: string; title: string; body: string },
      ];
    };
    data: {
      eyebrow: string;
      titleBefore: string;
      titleAfter: string;
      items: [
        { index: string; label: string; title: string; body: string },
        { index: string; label: string; title: string; body: string },
      ];
    };
    finale: {
      eyebrow: string;
      titleLine: string;
      titleAfter: string;
      lead: string;
      primaryCta: string;
      secondaryCta: string;
    };
  };
  projectsPage: {
    title: string;
    description: string;
    lead: string;
    architecture: string[];
  };
  aboutPage: {
    title: string;
    description: string;
    lead: string;
    body: string[];
  };
  blogPage: {
    title: string;
    description: string;
    emptyTitle: string;
    emptyBody: string;
  };
  solutionsPage: {
    title: string;
    description: string;
    breadcrumb: string;
    hero: {
      eyebrow: string;
      line1: string;
      line2: string;
      accent: string;
      support: string;
      primaryCta: string;
      secondaryCta: string;
    };
    intro: {
      eyebrow: string;
      title1: string;
      title2: string;
      body: string;
      count: string;
      countLabel: string;
    };
    web: {
      index: string;
      label: string;
      title1: string;
      title2: string;
      features: [string, string, string, string, string];
      outcome: string;
      site: {
        brand: string;
        nav: [string, string, string];
        headline: string;
        meta: string;
      };
    };
    platform: {
      index: string;
      label: string;
      title1: string;
      title2: string;
      body: string;
      features: [string, string, string, string];
      nav: [string, string, string, string, string, string];
      welcome: string;
      metrics: Array<{ value: string; label: string }>;
      activity: string;
      outcome: string;
    };
    ai: {
      index: string;
      label: string;
      title1: string;
      title2: string;
      body: string;
      heading: string;
      fields: Array<{ label: string; value: string }>;
      action: string;
      outcome: string;
    };
    automation: {
      index: string;
      label: string;
      title1: string;
      title2: string;
      body: string;
      flow: [string, string, string, string, string];
      nodes: [string, string, string, string, string, string];
      outcome: string;
    };
    commerce: {
      index: string;
      label: string;
      title1: string;
      title2: string;
      features: [string, string, string, string];
      product: string;
      plan: string;
      variants: [string, string, string];
      totalLabel: string;
      total: string;
      pay: string;
      outcome: string;
    };
    bridge: {
      title1: string;
      title2: string;
    };
    outcomes: {
      headline1: string;
      headline2: string;
      items: Array<{ index: string; title: string; body: string }>;
    };
    cta: {
      eyebrow: string;
      title1: string;
      title2: string;
      punch1: string;
      punch2: string;
      primary: string;
      secondary: string;
    };
  };
  contactPage: {
    title: string;
    description: string;
    lead: string;
    pendingChannels: string;
    form: {
      name: string;
      company: string;
      email: string;
      phone: string;
      service: string;
      servicePlaceholder: string;
      message: string;
      submit: string;
      required: string;
      unwired: string;
      services: string[];
    };
  };
  notFound: {
    title: string;
    body: string;
    cta: string;
  };
  kay: {
    name: string;
    role: string;
    placeholder: string;
    hint: string;
  };
};
