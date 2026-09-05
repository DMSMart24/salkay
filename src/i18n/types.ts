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
      coreHref: string;
      items: Array<{ tag: string; title: string; body: string; href: string; cta: string }>;
      wideTag: string;
      wideTitle: string;
      wideBody: string;
      proof: Array<{ index: string; title: string; body: string }>;
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
      lead: string;
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
      intro: string;
      items: [
        { index: string; label: string; title: string; body: string },
        { index: string; label: string; title: string; body: string },
        { index: string; label: string; title: string; body: string },
      ];
      benefits: [
        { title: string; body: string },
        { title: string; body: string },
        { title: string; body: string },
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
      intro: string;
      items: [
        { index: string; label: string; title: string; body: string },
        { index: string; label: string; title: string; body: string },
        { index: string; label: string; title: string; body: string },
      ];
      benefits: [
        { title: string; body: string },
        { title: string; body: string },
        { title: string; body: string },
        { title: string; body: string },
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
      process: [
        { index: string; title: string; body: string },
        { index: string; title: string; body: string },
        { index: string; title: string; body: string },
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
    leadAccent: string;
    body: string[];
    eyebrow: string;
    index: string;
    headline: [string, string];
    studio: string;
    location: string;
    disciplines: [string, string, string, string];
    capabilities: Array<{ index: string; title: string; body: string }>;
    system: Array<{ index: string; title: string }>;
    audience: string;
    traits: [string, string, string];
    meta: [string, string];
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
      titleAccent1: string;
      titleAccent2: string;
      features: [string, string, string, string, string];
      outcome: [string, string, string];
      principles: Array<{ label: string; body: string }>;
      metrics: Array<{ value: string; label: string }>;
      showcase: {
        brand: string;
        eyebrow: string;
        title1: string;
        title2: string;
        body: string;
        primary: string;
        devices: [string, string, string];
        specs: string;
      };
    };
    platform: {
      index: string;
      label: string;
      title1: string;
      titleAccent: string;
      title2: string;
      body: string;
      features: [string, string, string, string];
      nav: [string, string, string, string, string, string];
      welcome: string;
      metrics: Array<{ value: string; label: string }>;
      activity: string;
      outcome: string;
      outcomeAccent: string;
      portal: {
        brand: string;
        search: string;
        customer: string;
        systemActive: string;
        secure: string;
        secureBody: string;
        projectKicker: string;
        projectName: string;
        projectStatus: string;
        progress: string;
        steps: Array<{ index: string; title: string; state: "done" | "active" | "next" }>;
        activityTitle: string;
        events: Array<{ title: string; time: string }>;
        messageLabel: string;
        messageName: string;
        messageBody: string;
        trust: Array<{ label: string; body: string }>;
      };
    };
    ai: {
      index: string;
      label: string;
      title1: string;
      titleAccent: string;
      title2: string;
      body: string;
      outcome: string;
      outcomeAccent: string;
      interface: {
        brand: string;
        product: string;
        live: string;
        liveShort: string;
        analysisLabel: string;
        requestTitle: string;
        sourceLabel: string;
        sourceValue: string;
        statusLabel: string;
        statusValue: string;
        confidence: string;
        confidenceValue: string;
        cards: Array<{ label: string; value: string; detail?: string }>;
        missingLabel: string;
        missingField: string;
        missingPill: string;
        suggestionLabel: string;
        suggestionBody: string;
        floatLabel: string;
        floatBody: string;
        floatPriorityLabel: string;
        floatPriority: string;
        flow: [string, string, string, string, string];
        trust: Array<{ label: string; body: string }>;
      };
    };
    automation: {
      index: string;
      label: string;
      title1: string;
      titleAccent: string;
      title2: string;
      body: string;
      flow: [string, string, string, string, string];
      nodes: [string, string, string, string, string, string];
      outcome: string;
      panel: {
        title: string;
        live: string;
        steps: Array<{ title: string; body: string; time: string }>;
        statusTitle: string;
        statusValue: string;
        statusBody: string;
        integrationsTitle: string;
        integrations: [string, string, string, string, string, string];
        metrics: Array<{ label: string; value: string }>;
      };
    };
    commerce: {
      index: string;
      label: string;
      title1: string;
      title2: string;
      titleAccent: string;
      features: [string, string, string, string];
      outcome: string;
      outcomeAccent: string;
      dashboard: {
        brand: string;
        nav: [string, string, string, string];
        overview: string;
        overviewSupport: string;
        dateRange: string;
        kpis: Array<{ label: string; value: string; trend: string }>;
        productsTitle: string;
        productsLink: string;
        products: Array<{ name: string; qty: string; value: string }>;
        channelsTitle: string;
        channelsTotal: string;
        channelsTotalLabel: string;
        channels: Array<{ label: string; value: string }>;
        insightTitle: string;
        insightBody: string;
        insightLink: string;
        productName: string;
        productPrice: string;
        productReviews: string;
        productVariant: string;
        productCta: string;
        productTrust: string;
        orderTitle: string;
        orderSubtotalLabel: string;
        orderSubtotal: string;
        orderShippingLabel: string;
        orderShipping: string;
        orderTotalLabel: string;
        orderTotal: string;
        orderCta: string;
        trust: Array<{ title: string; body: string }>;
      };
    };
    bridge: {
      title1: string;
      title2: string;
    };
    outcomes: {
      headline1: string;
      headline2: string;
      headline3: string;
      support: string;
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
    eyebrow: string;
    index: string;
    headline: [string, string];
    intro: [string, string];
    channels: Array<{
      label: string;
      value: "email" | "whatsapp" | "web";
    }>;
    availability: string;
    location: string;
    role: string;
    formKicker: string;
    formIndex: string;
    formTitle: string;
    formSub: string;
    messageHint: string;
    submitNote: string;
    trust: [string, string, string, string, string];
    form: {
      name: string;
      company: string;
      email: string;
      phone: string;
      service: string;
      servicePlaceholder: string;
      message: string;
      submit: string;
      sending: string;
      successTitle: string;
      successBody: string;
      errorTitle: string;
      errorBody: string;
      errorWhatsApp: string;
      required: string;
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
