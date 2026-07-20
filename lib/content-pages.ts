import { siteConfig } from "@/lib/site";

export type ContentPage = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: { title: string; paragraphs: string[] }[];
};

export const contentPages: Record<string, ContentPage> = {
  about: {
    slug: "about",
    title: "About BrainrotKit",
    description: "How BrainrotKit helps you turn source material into editable short-form videos, voices and original characters.",
    intro:
      "BrainrotKit is built around one result: helping people turn an idea or source into a publishable short video without learning a full editing suite.",
    sections: [
      {
        title: "Create without a full editing suite",
        paragraphs: [
          "Start with text, a PDF, a character idea or a voice line, then review the script, visuals, generated voice and credit estimate in one place.",
          "Each generator opens the same account and project workspace, so you can switch inputs without learning a different editor or losing previous work.",
        ],
      },
      {
        title: "Stay in control of the result",
        paragraphs: [
          "BrainrotKit does not provide unlicensed character packs, impersonation tools or hidden billing. You can review the result and expected credit cost before the final generation begins.",
        ],
      },
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact",
    description: "Contact BrainrotKit about product support, billing, safety or copyright.",
    intro: "Choose the subject that best matches your request so it reaches the right review queue.",
    sections: [
      {
        title: "Product and billing support",
        paragraphs: [
          `Email ${siteConfig.supportEmail}. Include the project or order ID when available. The response target is two business days.`,
        ],
      },
      {
        title: "Safety and copyright",
        paragraphs: [
          "For abuse or copyright reports, include the public URL, a description of the concern and proof that you are authorized to submit the request.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    description: "How BrainrotKit collects, uses, retains and deletes account, billing, uploaded source and generated project data.",
    intro: "This policy explains what BrainrotKit processes, why it is needed and how you can request deletion.",
    sections: [
      {
        title: "Data we process",
        paragraphs: [
          "BrainrotKit processes your Google account identity, credit balance, plan and billing records to provide your account and purchases. Uploaded sources and generated files are processed only when you ask the product to create something.",
          "Analytics do not receive full private prompts, PDF contents or payment card details.",
        ],
      },
      {
        title: "PDF retention",
        paragraphs: [
          "Original PDF uploads are deleted within 24 hours. Generated outputs follow the retention controls shown in your project, and deleting a project starts removal of its source and generated files.",
        ],
      },
      {
        title: "Training and providers",
        paragraphs: [
          "Private uploads are not used to train BrainrotKit models. Google provides sign-in, Cloudflare stores account and billing state, Creem processes payments, and the Privacy Policy lists the AI and media providers that process a generation request.",
        ],
      },
      {
        title: "Analytics",
        paragraphs: [
          "Google Analytics and Microsoft Clarity may receive the page URL, browser and device information, approximate region and interaction signals such as page views, scrolls, clicks and session recordings. BrainrotKit does not send private prompts, extracted PDF text or payment card details to analytics.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    description: "Terms for using BrainrotKit accounts, credits, billing, uploaded source material and generated media.",
    intro: "These terms explain the rules for using your BrainrotKit account, credits, uploads and generated results.",
    sections: [
      {
        title: "Account and acceptable use",
        paragraphs: [
          "Users are responsible for their prompts, uploads and publishing decisions. Content that exploits minors, impersonates real people or violates applicable law is prohibited.",
        ],
      },
      {
        title: "Credits and service availability",
        paragraphs: [
          "Credits represent service usage and are not currency. If BrainrotKit cannot deliver a usable result, the credits reserved for that failed generation are returned automatically.",
        ],
      },
      {
        title: "Generated content",
        paragraphs: [
          "Users must have the rights needed for uploaded material and remain responsible for checking whether a generated result is suitable to publish.",
        ],
      },
    ],
  },
  "refund-policy": {
    slug: "refund-policy",
    title: "Refund Policy",
    description: "How BrainrotKit handles subscription cancellation, credit packs, duplicate charges and failed generation requests.",
    intro: "Creem processes live checkout. Billing errors and duplicate charges are reviewed by BrainrotKit support, subject to applicable consumer law.",
    sections: [
      {
        title: "Generation failures",
        paragraphs: [
          "If BrainrotKit fails before delivering a usable output, the credits reserved for that generation are returned to your balance. A result you reject only because of personal preference is not treated as a technical failure.",
        ],
      },
      {
        title: "Subscriptions and credit packs",
        paragraphs: [
          "Subscriptions can be managed through the billing portal. Refund eligibility depends on usage, purchase date and applicable consumer law; duplicate charges and verified billing errors will be corrected.",
        ],
      },
    ],
  },
  copyright: {
    slug: "copyright",
    title: "Copyright and Takedowns",
    description: "Report copyrighted material or misuse of protected creative work on BrainrotKit.",
    intro: "BrainrotKit does not provide unlicensed official character or media templates.",
    sections: [
      {
        title: "Submit a notice",
        paragraphs: [
          "Send the work being claimed, the location of the reported material, your contact information and a statement that you are authorized to act.",
        ],
      },
      {
        title: "Review process",
        paragraphs: [
          "Reports are reviewed for completeness. Content may be restricted while ownership and authorization are evaluated.",
        ],
      },
    ],
  },
  "data-deletion": {
    slug: "data-deletion",
    title: "Data Deletion",
    description: "Learn how to delete BrainrotKit projects, uploads, generated files and account data, including records that may require retention.",
    intro: "Delete individual projects from your workspace or email support to request deletion of your full account.",
    sections: [
      {
        title: "Project deletion",
        paragraphs: [
          "Deleting a project places source files, intermediate assets and final outputs into the deletion queue. Signed download links stop working after deletion completes.",
        ],
      },
      {
        title: "Account deletion",
        paragraphs: [
          "Account deletion removes projects and profile data except records that must be retained for billing, fraud prevention or legal compliance.",
        ],
      },
    ],
  },
  status: {
    slug: "status",
    title: "System Status",
    description: "Check the current status of BrainrotKit website, authentication, account database, generation and billing services.",
    intro: "Check whether BrainrotKit sign-in, billing and creation tools are available before you start a project.",
    sections: [
      {
        title: "Website",
        paragraphs: ["The website, Google sign-in, account access and credit balances are available."],
      },
      {
        title: "Creation and billing",
        paragraphs: ["Checkout, subscriptions and credit packs are available. Video, voice, image and PDF creation status is shown in the workspace before a request can use credits."],
      },
    ],
  },
};
